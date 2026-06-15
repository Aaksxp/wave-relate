import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Person, PersonCategory } from '../api.service';
import { computeRelationPaths, getRelationshipLabel, GraphEdge } from './relationship-label.util';

interface Relationship {
  id: number;
  personId: number;
  relatedPersonId: number;
  relationshipType: number;
  createdAt: string;
  person?: Person;
  relatedPerson?: Person;
}

interface RelatedPerson {
  relationshipId: number;
  person: Person;
  label: string;
}

interface FamilyTreeNode {
  id: number;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  label?: string;
}

@Component({
  selector: 'app-person-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.scss']
})
export class PersonDetailsComponent {
  person: Person | null = null;
  relationships: Relationship[] = [];
  allPeople: Person[] = [];
  newRelatedId: number | null = null;
  newType = 1;
  newSiblingOrder: 'unknown' | 'elder' | 'younger' = 'unknown';
  loading = true;
  savingRelationship = false;
  relationshipError: string | null = null;
  extendedExpanded = false;

  parents: RelatedPerson[] = [];
  children: RelatedPerson[] = [];
  spouses: RelatedPerson[] = [];
  siblings: RelatedPerson[] = [];
  extended: FamilyTreeNode[] = [];

  constructor(private route: ActivatedRoute, private api: ApiService, public router: Router) {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.load(id);
    });
  }

  load(id: number) {
    this.loading = true;
    this.api.getPerson(id).subscribe({
      next: p => {
        this.person = p;
        this.loadRelationships(id);
        this.loadAllPeople(id);
        this.loadExtendedFamily(id);
      },
      error: () => this.loading = false
    });
  }

  private loadExtendedFamily(id: number) {
    this.api.getFamilyTree(id).subscribe({
      next: graph => {
        const nodes: FamilyTreeNode[] = graph.nodes || [];
        const edges: GraphEdge[] = (graph.edges || []).map((edge: any) => ({
          sourceId: edge.sourceId,
          targetId: edge.targetId,
          relationshipType: Number(edge.relationshipType)
        }));

        const directIds = new Set<number>();
        for (const edge of edges) {
          if (edge.sourceId === id) directIds.add(edge.targetId);
          if (edge.targetId === id) directIds.add(edge.sourceId);
        }

        const relationPaths = computeRelationPaths(edges, id);
        this.extended = nodes
          .filter(node => node.id !== id && !directIds.has(node.id))
          .map(node => {
            const path = relationPaths.get(node.id);
            return { ...node, label: path ? getRelationshipLabel(path, node.gender) : 'Extended family' };
          });
      },
      error: e => console.error(e)
    });
  }

  loadRelationships(id: number) {
    this.api.getRelationshipsForPerson(id).subscribe({
      next: r => {
        this.relationships = r;
        this.mapRelationshipCategories(r, id);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadAllPeople(currentPersonId: number) {
    this.api.getPeople().subscribe({ next: p => { this.allPeople = p.filter(person => person.id !== currentPersonId); } });
  }

  private mapRelationshipCategories(rels: Relationship[], currentPersonId: number) {
    this.parents = [];
    this.children = [];
    this.spouses = [];
    this.siblings = [];

    for (const r of rels) {
      const isSource = r.personId === currentPersonId;
      const other = isSource ? r.relatedPerson : r.person;
      if (!other) continue;

      switch (r.relationshipType) {
        case 1:
          // relationshipType 1 (Parent): the related person is the parent of the source person.
          if (isSource) {
            this.parents.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['parent'] }, other.gender) });
          } else {
            this.children.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['child'] }, other.gender) });
          }
          break;
        case 2:
          // relationshipType 2 (Child): the related person is the child of the source person.
          if (isSource) {
            this.children.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['child'] }, other.gender) });
          } else {
            this.parents.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['parent'] }, other.gender) });
          }
          break;
        case 3:
          this.spouses.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['spouse'] }, other.gender) });
          break;
        case 4:
          this.siblings.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['sibling'], siblingOrder: this.inferSiblingOrder(other) }, other.gender) });
          break;
        case 5: {
          // ElderSibling: the person (source) is the elder sibling of the related person (target).
          const siblingOrder = isSource ? 'younger' : 'elder';
          this.siblings.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['sibling'], siblingOrder }, other.gender) });
          break;
        }
        case 6: {
          // YoungerSibling: the person (source) is the younger sibling of the related person (target).
          const siblingOrder = isSource ? 'elder' : 'younger';
          this.siblings.push({ relationshipId: r.id, person: other, label: getRelationshipLabel({ steps: ['sibling'], siblingOrder }, other.gender) });
          break;
        }
      }
    }
  }

  private inferSiblingOrder(other: Person): 'elder' | 'younger' | undefined {
    if (!this.person?.dateOfBirth || !other.dateOfBirth) return undefined;
    return new Date(other.dateOfBirth) < new Date(this.person.dateOfBirth) ? 'elder' : 'younger';
  }

  addRelationship() {
    if (!this.person || !this.newRelatedId) {
      this.relationshipError = 'Please select a person to relate.';
      return;
    }

    if (this.newRelatedId === this.person.id) {
      this.relationshipError = 'A person cannot be related to themselves.';
      return;
    }

    this.relationshipError = null;
    this.savingRelationship = true;

    let relationshipType = this.newType;
    if (this.newType === 4) {
      if (this.newSiblingOrder === 'elder') relationshipType = 5;
      else if (this.newSiblingOrder === 'younger') relationshipType = 6;
    }

    const payload = { personId: this.person.id, relatedPersonId: this.newRelatedId, relationshipType };

    this.api.createRelationship(payload).subscribe({
      next: () => {
        this.loadRelationships(this.person!.id);
        this.newRelatedId = null;
        this.newType = 1;
        this.newSiblingOrder = 'unknown';
        this.savingRelationship = false;
      },
      error: e => {
        console.error(e);
        this.relationshipError = e?.error ?? 'Unable to add relationship.';
        this.savingRelationship = false;
      }
    });
  }

  deleteRelationship(id: number) {
    if (!confirm('Remove this relationship?')) return;
    this.api.deleteRelationship(id).subscribe({ next: () => { if (this.person) this.loadRelationships(this.person.id); }, error: e => console.error(e) });
  }

  navigateToPerson(id: number) {
    this.router.navigate(['/persons', id, 'details']);
  }

  goCreate() {
    this.router.navigate(['/persons/new'], { queryParams: { category: this.person?.category ?? PersonCategory.Relative } });
  }

  goBack() {
    this.router.navigate([this.person?.category === PersonCategory.Friend ? '/friends' : '/family']);
  }

  getInitials(person: Person): string {
    const first = person.firstName?.charAt(0) ?? '';
    const last = person.lastName?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
  }

  selectedPersonName(): string {
    const p = this.allPeople.find(p => p.id === this.newRelatedId);
    return p ? `${p.firstName} ${p.lastName}` : 'the selected person';
  }
}

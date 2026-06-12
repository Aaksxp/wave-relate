import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Person } from '../api.service';

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
  loading = true;
  savingRelationship = false;
  relationshipError: string | null = null;

  parents: RelatedPerson[] = [];
  children: RelatedPerson[] = [];
  spouses: RelatedPerson[] = [];
  siblings: RelatedPerson[] = [];

  relationshipTypeLabels: Record<number, string> = {
    1: 'Parent',
    2: 'Child',
    3: 'Spouse',
    4: 'Sibling'
  };

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
      },
      error: () => this.loading = false
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
      const entry: RelatedPerson = { relationshipId: r.id, person: other };

      switch (r.relationshipType) {
        case 1:
          // relationshipType 1 (Parent): the related person is the parent of the source person.
          if (isSource) {
            this.parents.push(entry);
          } else {
            this.children.push(entry);
          }
          break;
        case 2:
          // relationshipType 2 (Child): the related person is the child of the source person.
          if (isSource) {
            this.children.push(entry);
          } else {
            this.parents.push(entry);
          }
          break;
        case 3:
          this.spouses.push(entry);
          break;
        case 4:
          this.siblings.push(entry);
          break;
      }
    }
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
    const payload = { personId: this.person.id, relatedPersonId: this.newRelatedId, relationshipType: this.newType };

    this.api.createRelationship(payload).subscribe({
      next: () => {
        this.loadRelationships(this.person!.id);
        this.newRelatedId = null;
        this.newType = 1;
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

  getInitials(person: Person): string {
    const first = person.firstName?.charAt(0) ?? '';
    const last = person.lastName?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
  }

  siblingLabel(person: Person): string {
    const gender = person.gender?.toLowerCase();
    if (gender === 'male') return 'Brother';
    if (gender === 'female') return 'Sister';
    return 'Sibling';
  }
}

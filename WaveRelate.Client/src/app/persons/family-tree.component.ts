import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Person } from '../api.service';

interface FamilyTreeNode {
  id: number;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
}

interface FamilyTreeEdge {
  sourceId: number;
  targetId: number;
  relationshipType: number;
  relationshipLabel: string;
}

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.scss']
})
export class FamilyTreeComponent {
  person: Person | null = null;
  nodes: FamilyTreeNode[] = [];
  edges: FamilyTreeEdge[] = [];
  loading = true;
  error = '';

  parents: FamilyTreeNode[] = [];
  children: FamilyTreeNode[] = [];
  spouses: FamilyTreeNode[] = [];
  siblings: FamilyTreeNode[] = [];
  extended: FamilyTreeNode[] = [];

  private readonly relationshipTypeLabels: Record<number, string> = {
    1: 'Parent',
    2: 'Child',
    3: 'Spouse',
    4: 'Sibling'
  };

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService, public readonly router: Router) {
    this.load();
  }

  load() {
    this.loading = true;
    const personId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getPerson(personId).subscribe({
      next: person => {
        this.person = person;
        this.api.getFamilyTree(personId).subscribe({
          next: graph => {
            this.nodes = graph.nodes || [];
            this.edges = (graph.edges || []).map((edge: any) => ({
              sourceId: edge.sourceId,
              targetId: edge.targetId,
              relationshipType: Number(edge.relationshipType),
              relationshipLabel: edge.relationshipLabel || this.relationshipTypeLabels[Number(edge.relationshipType)] || String(edge.relationshipType)
            }));
            this.buildLayout(personId);
            this.loading = false;
          },
          error: err => {
            console.error(err);
            this.error = 'Unable to load family tree.';
            this.loading = false;
          }
        });
      },
      error: err => {
        console.error(err);
        this.error = 'Unable to load person profile.';
        this.loading = false;
      }
    });
  }

  private buildLayout(rootId: number) {
    const nodeById = new Map(this.nodes.map(node => [node.id, node]));
    const directIds = new Set<number>();
    this.parents = [];
    this.children = [];
    this.spouses = [];
    this.siblings = [];
    this.extended = [];

    for (const edge of this.edges) {
      const isRootSource = edge.sourceId === rootId;
      const isRootTarget = edge.targetId === rootId;
      const otherId = isRootSource ? edge.targetId : edge.sourceId;
      const other = nodeById.get(otherId);
      if (!other) {
        continue;
      }

      if (isRootSource || isRootTarget) {
        directIds.add(otherId);

        if (edge.relationshipType === 3) {
          this.spouses.push(other);
        } else if (edge.relationshipType === 4) {
          this.siblings.push(other);
        } else if (isRootSource && edge.relationshipType === 1) {
          // relationshipType 1 (Parent): the related person (target) is the parent of the source.
          this.parents.push(other);
        } else if (isRootTarget && edge.relationshipType === 1) {
          this.children.push(other);
        } else if (isRootSource && edge.relationshipType === 2) {
          // relationshipType 2 (Child): the related person (target) is the child of the source.
          this.children.push(other);
        } else if (isRootTarget && edge.relationshipType === 2) {
          this.parents.push(other);
        }
      }
    }

    for (const node of this.nodes) {
      if (node.id === rootId || directIds.has(node.id)) {
        continue;
      }
      this.extended.push(node);
    }
  }

  getNodeName(nodeId: number) {
    const node = this.nodes.find(n => n.id === nodeId);
    return node ? `${node.firstName} ${node.lastName}` : 'Unknown';
  }

  navigateToPerson(id: number) {
    this.router.navigate(['/persons', id, 'details']);
  }

  siblingLabel(node: FamilyTreeNode): string {
    const gender = node.gender?.toLowerCase();
    if (gender === 'male') return 'Brother';
    if (gender === 'female') return 'Sister';
    return 'Sibling';
  }
}

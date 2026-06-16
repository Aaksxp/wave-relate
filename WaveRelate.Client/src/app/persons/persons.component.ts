import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Person, PersonCategory } from '../api.service';

@Component({
  selector: 'app-persons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent {
  people: Person[] = [];
  loading = true;
  q = '';
  category: PersonCategory = PersonCategory.Relative;
  title = 'Family';

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService, public router: Router) {
    this.category = this.route.snapshot.data['category'] ?? PersonCategory.Relative;
    this.title = this.category === PersonCategory.Friend ? 'Friends' : 'Family';
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getPeople(this.category).subscribe({ next: (r) => { this.people = this.sortAlpha(r); this.loading = false; }, error: () => this.loading = false });
  }

  search() {
    if (!this.q) { this.load(); return; }
    this.loading = true;
    this.api.getPeopleByQuery(this.q, this.category).subscribe({ next: (r) => { this.people = this.sortAlpha(r); this.loading = false; }, error: () => this.loading = false });
  }

  private sortAlpha(people: any[]) {
    return people.slice().sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }

  goCreate() {
    this.router.navigate(['/persons', 'new'], { queryParams: { category: this.category } });
  }

  edit(p: Person) {
    this.router.navigate(['/persons', p.id]);
  }

  delete(p: Person) {
    if (!confirm(`Delete ${p.firstName} ${p.lastName}?`)) return;
    this.api.deletePerson(p.id).subscribe({ next: () => this.load(), error: (e) => console.error(e) });
  }

  getInitials(person: Person): string {
    const first = person.firstName?.charAt(0) ?? '';
    const last = person.lastName?.charAt(0) ?? '';
    return `${first}${last}`.toUpperCase();
  }
}

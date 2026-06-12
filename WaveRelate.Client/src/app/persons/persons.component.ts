import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Person } from '../api.service';

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

  constructor(private readonly api: ApiService, public router: Router) {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getPeople().subscribe({ next: (r) => { this.people = r; this.loading = false; }, error: () => this.loading = false });
  }

  search() {
    if (!this.q) { this.load(); return; }
    this.loading = true;
    this.api.getPeopleByQuery(this.q).subscribe({ next: (r) => { this.people = r; this.loading = false; }, error: () => this.loading = false });
  }

  goCreate() {
    this.router.navigate(['/persons', 'new']);
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

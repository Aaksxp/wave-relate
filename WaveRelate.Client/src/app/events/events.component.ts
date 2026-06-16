import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, EventEntry } from '../api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  selectedDate: string = new Date().toISOString().slice(0, 10);
  events: EventEntry[] = [];
  loading = false;
  searched = false;

  constructor(private api: ApiService, public router: Router) {
    this.search();
  }

  search() {
    if (!this.selectedDate) return;
    this.loading = true;
    this.searched = true;
    this.api.getEvents(this.selectedDate).subscribe({
      next: e => { this.events = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  navigateToPerson(id: number) {
    this.router.navigate(['/persons', id, 'details']);
  }

  getInitials(e: EventEntry): string {
    return `${e.firstName.charAt(0)}${e.lastName.charAt(0)}`.toUpperCase();
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService, Person } from '../api.service';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent {
  model: Partial<Person> = {};
  loading = true;
  saving = false;
  isNew = false;
  error: string | null = null;
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {
    this.load();
  }

  load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new' || id === null) {
      this.isNew = true;
      this.loading = false;
      return;
    }

    const nid = Number(id);
    this.api.getPerson(nid).subscribe({
      next: (p) => {
        this.model = p;
        if (this.model.dateOfBirth) {
          this.model.dateOfBirth = this.model.dateOfBirth.substring(0, 10);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save(form: NgForm) {
    this.error = null;
    if (form.invalid) {
      this.error = 'Please fix validation errors before saving.';
      return;
    }

    this.saving = true;
    if (this.isNew) {
      this.api.createPerson(this.model).subscribe({
        next: () => this.router.navigate(['/persons']),
        error: (e) => { console.error(e); this.error = 'Failed to save person.'; this.saving = false; }
      });
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.api.updatePerson(id, this.model).subscribe({
        next: () => this.router.navigate(['/persons']),
        error: (e) => { console.error(e); this.error = 'Failed to save person.'; this.saving = false; }
      });
    }
  }

  cancel() {
    this.router.navigate(['/persons']);
  }
}

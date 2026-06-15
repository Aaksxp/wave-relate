import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService, Person, PersonCategory } from '../api.service';

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
  genderOptions = ['Male', 'Female'];
  categoryOptions = [
    { value: PersonCategory.Relative, label: 'Relative' },
    { value: PersonCategory.Friend, label: 'Friend' }
  ];

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {
    this.load();
  }

  load() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new' || id === null) {
      this.isNew = true;
      const categoryParam = Number(this.route.snapshot.queryParamMap.get('category'));
      this.model.category = categoryParam === PersonCategory.Friend ? PersonCategory.Friend : PersonCategory.Relative;
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
        next: () => this.goToList(),
        error: (e) => { console.error(e); this.error = 'Failed to save person.'; this.saving = false; }
      });
    } else {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.api.updatePerson(id, this.model).subscribe({
        next: () => this.goToList(),
        error: (e) => { console.error(e); this.error = 'Failed to save person.'; this.saving = false; }
      });
    }
  }

  cancel() {
    this.goToList();
  }

  private goToList() {
    this.router.navigate([this.model.category === PersonCategory.Friend ? '/friends' : '/family']);
  }
}

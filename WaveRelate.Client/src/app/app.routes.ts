import { Routes } from '@angular/router';
import { PersonsComponent } from './persons/persons.component';
import { PersonFormComponent } from './persons/person-form.component';
import { PersonDetailsComponent } from './persons/person-details.component';
import { PersonCategory } from './api.service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'family' },
  { path: 'family', pathMatch: 'full', component: PersonsComponent, data: { category: PersonCategory.Relative } },
  { path: 'friends', pathMatch: 'full', component: PersonsComponent, data: { category: PersonCategory.Friend } },
  { path: 'persons/new', component: PersonFormComponent },
  { path: 'persons/:id/details', component: PersonDetailsComponent },
  { path: 'persons/:id', component: PersonFormComponent },
  { path: '**', redirectTo: 'family' }
];

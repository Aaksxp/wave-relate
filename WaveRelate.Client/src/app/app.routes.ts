import { Routes } from '@angular/router';
import { PersonsComponent } from './persons/persons.component';
import { PersonFormComponent } from './persons/person-form.component';
import { PersonDetailsComponent } from './persons/person-details.component';
import { FamilyTreeComponent } from './persons/family-tree.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'persons' },
  { path: 'persons', pathMatch: 'full', component: PersonsComponent },
  { path: 'persons/new', component: PersonFormComponent },
  { path: 'persons/:id/details', component: PersonDetailsComponent },
  { path: 'persons/:id/family-tree', component: FamilyTreeComponent },
  { path: 'persons/:id', component: PersonFormComponent },
  { path: '**', redirectTo: 'persons' }
];

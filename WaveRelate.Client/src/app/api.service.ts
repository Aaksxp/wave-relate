import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  notes?: string;
}

export interface Summary {
  totalPeople: number;
  totalRelationships: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = `${environment.apiBaseUrl}/persons`;

  constructor(private readonly http: HttpClient) {}

  getPeople() {
    return this.http.get<Person[]>(this.apiUrl);
  }

  getPeopleByQuery(q: string) {
    const url = `${this.apiUrl}?q=${encodeURIComponent(q)}`;
    return this.http.get<Person[]>(url);
  }

  getPerson(id: number) {
    return this.http.get<Person>(`${this.apiUrl}/${id}`);
  }

  createPerson(person: Partial<Person>) {
    return this.http.post<Person>(this.apiUrl, person);
  }

  updatePerson(id: number, person: Partial<Person>) {
    return this.http.put<Person>(`${this.apiUrl}/${id}`, person);
  }

  deletePerson(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Relationships
  getRelationshipsForPerson(personId: number) {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/relationships/by-person/${personId}`);
  }

  getFamilyTree(personId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}/familytree/${personId}`);
  }

  createRelationship(payload: { personId: number; relatedPersonId: number; relationshipType: number }) {
    return this.http.post(`${environment.apiBaseUrl}/relationships`, payload);
  }

  deleteRelationship(id: number) {
    return this.http.delete(`${environment.apiBaseUrl}/relationships/${id}`);
  }

  getSummary() {
    return this.http.get<Summary>(`${environment.apiBaseUrl}/summary`);
  }
}

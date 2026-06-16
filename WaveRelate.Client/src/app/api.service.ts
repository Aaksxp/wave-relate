import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export enum PersonCategory {
  Relative = 1,
  Friend = 2
}

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
  category?: PersonCategory;
  isHidden?: boolean;
}

export interface ImportantDate {
  id: number;
  personId: number;
  label: string;
  date: string;
}

export interface EventEntry {
  personId: number;
  firstName: string;
  lastName: string;
  occasion: string;
  date: string;
}

export interface Summary {
  totalPeople: number;
  totalRelationships: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = `${environment.apiBaseUrl}/persons`;

  constructor(private readonly http: HttpClient) {}

  getPeople(category?: PersonCategory) {
    const url = category ? `${this.apiUrl}?category=${category}` : this.apiUrl;
    return this.http.get<Person[]>(url);
  }

  getPeopleByQuery(q: string, category?: PersonCategory) {
    let url = `${this.apiUrl}?q=${encodeURIComponent(q)}`;
    if (category) url += `&category=${category}`;
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

  // Important dates
  getImportantDates(personId: number) {
    return this.http.get<ImportantDate[]>(`${environment.apiBaseUrl}/importantdates/by-person/${personId}`);
  }

  createImportantDate(payload: { personId: number; label: string; date: string }) {
    return this.http.post<ImportantDate>(`${environment.apiBaseUrl}/importantdates`, payload);
  }

  deleteImportantDate(id: number) {
    return this.http.delete(`${environment.apiBaseUrl}/importantdates/${id}`);
  }

  // Events: birthdays + important dates matching a date (month+day)
  getEvents(date: string) {
    return this.http.get<EventEntry[]>(`${environment.apiBaseUrl}/events?date=${encodeURIComponent(date)}`);
  }
}

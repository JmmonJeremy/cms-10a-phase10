import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Contact } from './contact.model';
import {MOCKCONTACTS} from './MOCKCONTACTS';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  contactListChangedEvent = new Subject<Contact[]>();
  contactChangedEvent = new EventEmitter<Contact[]>();
  contactSelectedEvent = new EventEmitter<Contact>();
  contacts: Contact[] = [];
  contactsListClone: Contact[] = [];
  maxContactId: number;

  constructor(private http: HttpClient) {
    // this.contacts = MOCKCONTACTS;
    this.maxContactId = this.getMaxId();
  }

getContacts(): void {
  this.http.get<Contact[]>('https://learning-demo-ce50f-default-rtdb.firebaseio.com/contacts.json').subscribe({
    // Success callback
    next: (contacts: Contact[]) => {        
      this.contacts = contacts;
      console.log('Contacts loaded:', this.contacts);
      this.maxContactId = this.getMaxId();
      this.contacts.sort((a, b) => a.name.localeCompare(b.name));
      this.contactListChangedEvent.next(this.contacts.slice());
    },
    // Error callback
    error: (error: any) => {
      console.error('Error loading contacts:', error);
    }
  });     
}

storeContacts(): void {    
  const data = JSON.stringify(this.contacts);
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  this.http
    .put('https://learning-demo-ce50f-default-rtdb.firebaseio.com/contacts.json', data, { headers })
    .subscribe({
      next: () => {
        this.contactListChangedEvent.next(this.contacts.slice());
      },
      error: (err) => {
        console.error('storeContacts() failed:', err);
      }
    });
  }

  getContact(id: string): Contact {     
    for (let contact of this.contacts) {
      if (contact.id === id) {
        return contact;
      }
    }
    return null;
  }

  getMaxId(): number {
    let maxId = 0;
    for (const contact of this.contacts) {
      const currentId = parseInt(contact.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

  addContact(newContact: Contact){
    if (!newContact){
      return;
    }
    this.maxContactId++;
    newContact.id = this.maxContactId.toString();
    this.contacts.push(newContact);
    this.contactsListClone = this.contacts.slice();
    this.storeContacts();
  }  

  updateContact(originalContact: Contact, newContact: Contact) {
    if (!originalContact || !newContact) {
      return;
    }
    const pos = this.contacts.indexOf(originalContact);
    if (pos < 0) {
      return;
    }
    newContact.id = originalContact.id;
    this.contacts[pos] = newContact;
    this.contactsListClone = this.contacts.slice();
    this.storeContacts();
  }

  deleteContact(contact: Contact) {
    if (!contact) {
        return;
    }
    const pos = this.contacts.indexOf(contact);
    if (pos < 0) {
        return;
    }
    this.contacts.splice(pos, 1);
    this.contactsListClone = this.contacts.slice()
    this.storeContacts();
  }
}

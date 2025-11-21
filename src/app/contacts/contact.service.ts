import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Contact } from './contact.model';
import { environment } from '../../environments/environment';
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

  private sortAndSend() {
    this.contacts.sort((a, b) => a.name.localeCompare(b.name));
    this.contactListChangedEvent.next(this.contacts.slice());
  }

  getContactByMongoId(mongoId: string): Contact {
    return this.contacts.find(c => c._id === mongoId);
  }

  getContacts(): void {
    this.http.get<{ message: string, contacts: Contact[] }>(`${environment.apiUrl}/contacts`).subscribe({
      // Success callback
      next: (response) => {        
        this.contacts = response.contacts;
        console.log('Contacts loaded:', this.contacts);
        this.maxContactId = this.getMaxId();
        this.sortAndSend();
      },
      // Error callback
      error: (error: any) => {
        console.error('Error loading contacts:', error);
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

  addContact(contact: Contact) {
    if (!contact) {
      return;
    }
    // make sure id of the new Contact is empty
    contact.id = '';
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // add to database
    this.http.post<{ message: string, contact: Contact }>(`${environment.apiUrl}/contacts`,
      contact,
      { headers: headers })
      .subscribe(
        (responseData) => {
          // add new contact to contacts
          this.contacts.push(responseData.contact);
          this.sortAndSend();
        }
      );
  }

  updateContact(originalContact: Contact, newContact: Contact) {
    if (!originalContact || !newContact) {
      return;
    }
    const pos = this.contacts.indexOf(originalContact);
    if (pos < 0) {
      return;
    }
    // set the id of the new Contact to the id of the old Contact
    newContact.id = originalContact.id;
    newContact._id = originalContact._id;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // update database
    this.http.put(`${environment.apiUrl}/contacts/` + originalContact.id,
      newContact, { headers: headers })
      .subscribe(
        (response: Response) => {
          this.contacts[pos] = newContact;
          this.sortAndSend();
        }
      );
  }

  deleteContact(contact: Contact) {
    if (!contact) {
        return;
    }
    const pos = this.contacts.findIndex(d => d.id === contact.id);
    if (pos < 0) {
        return;
    }
    // delete from database
    this.http.delete(`${environment.apiUrl}/contacts/` + contact.id)
      .subscribe(
        (response: Response) => {
          this.contacts.splice(pos, 1);
          this.sortAndSend();
        }
      );
  }
}

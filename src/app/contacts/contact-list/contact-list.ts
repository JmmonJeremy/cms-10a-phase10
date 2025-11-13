import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';

@Component({
  selector: 'cms-contact-list',
  standalone: false,
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css'
})
export class ContactList implements OnInit, OnDestroy {  
  contacts: Contact[] = [];
  private subscription: Subscription;
  term: string;

  constructor(private contactService: ContactService) {

  }
  
  ngOnInit(): void {
    this.contactService.getContacts();

    this.subscription = this.contactService.contactListChangedEvent
      .subscribe(
        (contactList: Contact[])=> {
          this.contacts = contactList
          .sort((a, b) => a.name.localeCompare(b.name));
        }
      )
  }

  search(value: string) {
    this.term = value;
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}


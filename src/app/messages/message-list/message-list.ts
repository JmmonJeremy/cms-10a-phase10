import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Message } from '../message.model';
import { MessageService } from '../message.service';
import { ContactService } from '../../contacts/contact.service';

@Component({
  selector: 'cms-message-list',
  standalone: false,
  templateUrl: './message-list.html',
  styleUrl: './message-list.css'
})
export class MessageList implements OnInit, OnDestroy {
  messages: Message[] = [];
  private messageSubscription: Subscription;

  constructor(private messageService: MessageService, private contactService: ContactService) {

  }

  ngOnInit(): void {
    this.contactService.getContacts();
    this.messageService.getMessages();
    this.messageSubscription = this.messageService.messageChangedEvent
      .subscribe(
        (messages: Message[])=> {
          this.messages = messages;
        }
      )
  }

  onAddMessage(message: Message){
    this.messages.push(message);
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();  // Clean up
  }
}


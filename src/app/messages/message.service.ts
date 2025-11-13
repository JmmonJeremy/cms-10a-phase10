import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Message } from './message.model';
import { MOCKMESSAGES } from './MOCKMESSAGES';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messageChangedEvent = new Subject<Message[]>();
  messages: Message[] = [];
  maxMessageId: number;

  constructor(private http: HttpClient) {
    // this.messages = MOCKMESSAGES;   
  }

  getMessages(): void {
    this.http.get<Message[]>('https://learning-demo-ce50f-default-rtdb.firebaseio.com/messages.json').subscribe({
      // Success callback
      next: (messages: Message[]) => {        
        // Filter out nulls or malformed messages
        this.messages = (messages || []).filter(m => m && m.id && m.subject && m.msgText);        
        this.maxMessageId = this.getMaxId();
        // Safe sort by id
        this.messages.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        this.messageChangedEvent.next(this.messages.slice());
      },
      // Error callback
      error: (error: any) => {
        console.error('Error loading messages:', error);
      }
    });     
  }

  storeMessages(): void {    
  const data = JSON.stringify(this.messages);
  const headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  this.http
    .put('https://learning-demo-ce50f-default-rtdb.firebaseio.com/messages.json', data, { headers })
    .subscribe({
      next: () => {
        this.messageChangedEvent.next(this.messages.slice());
      },
      error: (err) => {
        console.error('storeMessages() failed:', err);
      }
    });
  }
    
  getMessage(id: string): Message {     
    for (let message of this.messages) {
      if (message.id === id) {
        return message;
      }
    }
    return null;
  }

  getMaxId() : number {
    let maxId = 0;
    for (const message of this.messages) {
      const currentId = parseInt(message.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

  addMessage(message: Message) {
    this.messages.push(message);
    this.storeMessages();
  }
}

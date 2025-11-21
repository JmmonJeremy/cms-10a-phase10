import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Message } from './message.model';
import { environment } from '../../environments/environment';
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

  private sortAndSend() {
    this.messages.sort((a, b) => Number(a.id) - Number(b.id));
    this.messageChangedEvent.next(this.messages.slice());
  }

  getMessages(): void {
    this.http.get<{ note: string, messages: Message[] }>(`${environment.apiUrl}/messages`).subscribe({
      // Success callback
      next: (response) => {        
        // Filter out nulls or malformed messages
        this.messages = (response.messages || []).filter(m => m && m.id && m.subject && m.msgText);
        console.log('Messages loaded from MongoDB:', this.messages);        
        this.maxMessageId = this.getMaxId();
        // Safe sort by id
        this.sortAndSend();
      },
      // Error callback
      error: (error: any) => {
        console.error('Error loading messages:', error);
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
    if (!message) {
      return;
    }
    // make sure id of the new Message is empty
    message.id = '';
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    // add to database
    this.http.post<{ note: string, message: Message }>(`${environment.apiUrl}/messages`,
      message,
      { headers: headers })
      .subscribe(
        (responseData) => {
          // add new message to messages
          this.messages.push(responseData.message);
          this.sortAndSend();
        }
      );
  }
}

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

import { Message } from '../message.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'cms-message-edit',
  standalone: false,
  templateUrl: './message-edit.html',
  styleUrl: './message-edit.css'
})
export class MessageEdit {
  @ViewChild('subject') subjectInputRef: ElementRef;
  @ViewChild('msgText') msgTextInputRef: ElementRef;
  @Output() addMessageEvent = new EventEmitter<Message>();
  currentSender: string = "19";

  constructor(private messageService: MessageService) {

  }

  onSendMessage(){    
    const msgSubject = this.subjectInputRef.nativeElement.value;
    const msgText = this.msgTextInputRef.nativeElement.value;
    const message = new Message((this.messageService.getMaxId() + 1).toString(), msgSubject, msgText, this.currentSender);  
    this.messageService.addMessage(message);
    this.onClear();  
  }

  onClear(){
    this.subjectInputRef.nativeElement.value = "";
    this.msgTextInputRef.nativeElement.value = "";
  }
}


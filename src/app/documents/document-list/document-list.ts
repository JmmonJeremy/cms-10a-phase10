import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Document } from '../document.model';
import { DocumentService } from '../document.service';

@Component({
  selector: 'cms-document-list',
  standalone: false,
  templateUrl: './document-list.html',
  styleUrl: './document-list.css'
})
export class DocumentList implements OnInit, OnDestroy {
  documents: Document[] = [];
  private subscription: Subscription;

  constructor(private documentService: DocumentService) {

  }

  ngOnInit(): void {
    this.documentService.getDocuments();

    this.subscription = this.documentService.documentListChangedEvent
      .subscribe(
        (documentList: Document[])=> {
          this.documents = documentList;
        }
      )
  }  

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

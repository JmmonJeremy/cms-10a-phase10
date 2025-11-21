import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Document } from '../document.model';
import { DocumentService } from '../document.service';

@Component({
  selector: 'cms-document-edit',
  standalone: false,
  templateUrl: './document-edit.html',
  styleUrl: './document-edit.css'
})
export class DocumentEdit implements OnInit, OnDestroy{
  originalDocument: Document;
  document: Document;
  editMode: boolean = false;
  private paramsSubscription: Subscription;  // Store outer subscription
  private listSubscription: Subscription;

  constructor( 
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Store outer sub
    this.paramsSubscription = this.route.params.subscribe (
      (params: Params) => {
        const id = params['id'];
        if (!id) {
          this.editMode = false;
          return;
        } 

      // We have an id → we want to edit, but the list might not be loaded yet → wait for it
      // Only subscribe if not already (prevent multiples on re-emit)
      if (!this.listSubscription) {
        this.listSubscription = this.documentService.documentListChangedEvent.subscribe(
          (documents: Document[]) => {
            const foundDoc = documents.find(doc => doc.id === id);

            if (foundDoc) {
              this.originalDocument = foundDoc;
              this.document = JSON.parse(JSON.stringify(foundDoc)); // deep clone
              this.editMode = true;

              // Optional: unsubscribe now that we have the document
              this.listSubscription?.unsubscribe();
            }
          }
        );
      }
      // Make sure the list is loading (in case it hasn't started yet)
      this.documentService.getDocuments();
    });
  }

  onSubmit(form: NgForm) {
    const value = form.value;
    this.document = new Document(
      value.id,
      value.name,
      value.description,
      value.url,
      value.children
    );
    if (this.editMode) {
      this.documentService.updateDocument(this.originalDocument!, this.document);
    } else {
      this.documentService.addDocument(this.document);
    }
    this.router.navigate(['/documents']);
  }
  
  onCancel() {
    this.router.navigate(['/documents']);
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();  // Clean up outer subscription
    this.listSubscription?.unsubscribe();  // Clean up inner subscription
  }
}

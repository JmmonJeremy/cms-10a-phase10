import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Document } from '../document.model';
import { DocumentService } from '../document.service';
import { WindRefService } from '../../wind-ref.service';

@Component({
  selector: 'cms-document-detail',
  standalone: false,
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.css'
})
export class DocumentDetail implements OnInit, OnDestroy {
  document: Document;
  id: string;
  nativeWindow: any;
  private paramsSubscription: Subscription;  // Store outer sub
  private documentListSubscription: Subscription;  // Store inner sub

  constructor(private documentService: DocumentService,
              private windRefService: WindRefService,              
              private route: ActivatedRoute,
              private router: Router) {

  }

  ngOnInit(): void {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          // If documents are already loaded, get immediately
          if (this.documentService.documents.length > 0) {
            this.document = this.documentService.getDocument(this.id);
          }else {
              // Otherwise, wait until documents are loaded
              this.documentListSubscription = this.documentService.documentListChangedEvent.subscribe(() => {
                this.document = this.documentService.getDocument(this.id);
              });
              // Trigger a load for refresh cases (where documentListChangedEvent isn't fired)
              this.documentService.getDocuments();
            }
        }
      );

      this.nativeWindow = this.windRefService.getNativeWindow();
  }

  onView() {
    if (this.document.url) {
      this.nativeWindow.open(this.document.url);
    }
  }

  onDelete() {
    this.documentService.deleteDocument(this.document);
    this.router.navigate(['/documents']);
  }

  ngOnDestroy(): void {  // Add this method
    this.paramsSubscription?.unsubscribe();  // Clean up outer
    this.documentListSubscription?.unsubscribe();  // Clean up inner (if created)
  }  
}

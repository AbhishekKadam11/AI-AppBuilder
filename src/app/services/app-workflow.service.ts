import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class AppWorkflowService {

  private appWorkflowSubject = new BehaviorSubject<string>('');
  public appObject$ = this.appWorkflowSubject.asObservable();
  // private appObjectSubject = new BehaviorSubject<string>('');
  // public appObject$ = this.appObjectSubject.asObservable();
  
  constructor() { }

  processState(fact: string, appObject: any) {
    // this.appWorkflowSubject.next(state);
     switch (fact) {
      case 'appRecived':
        this.appWorkflowSubject.next(appObject);
        break;
     }
  }
}

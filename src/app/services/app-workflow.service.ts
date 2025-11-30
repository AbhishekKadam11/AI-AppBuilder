import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AppWorkflowService {

  private appWorkflowSubject = new BehaviorSubject<string>('');
  public appObject$ = this.appWorkflowSubject.asObservable();
  // private appObjectSubject = new BehaviorSubject<string>('');
  // public appObject$ = this.appObjectSubject.asObservable();

  constructor(private storageService: StorageService) { }

  processState(fact: string, appObject: any) {
    // this.appWorkflowSubject.next(state);
    switch (fact) {
      case 'appRecived':
        this.appWorkflowSubject.next(appObject);
        this.saveAppObjInLocalStorage(appObject);
        break;
    }
  }

  // setAppObjInLocalStorage(appObject: any): void {
  //   this.storageService.setItem('appObject', JSON.stringify(appObject));
  // }
  saveAppObjInLocalStorage(appDetails: any): void {
    const appObject = this.storageService.getItem('appObject');
    if (appObject) {
      const appList = JSON.parse(appObject);
      if (appList && Array.isArray(appList)) {
        const userAppIndex = appList.findIndex(app => app.data.extraConfig.projectName === appDetails.data.extraConfig.projectName);
        if (userAppIndex === -1) {
          appList.push(appDetails);
          return this.storageService.setItem('appObject', JSON.stringify(appList));
        } else if (userAppIndex !== -1) {
          appList.splice(userAppIndex, 1, appDetails);
          return this.storageService.setItem('appObject', JSON.stringify(appList));
        }
      }
    }
    return this.storageService.setItem('appObject', JSON.stringify([appDetails]));
  }

  fetchAppObjFromLocalStorage() {
    const appObject = this.storageService.getItem('appObject');
    if (appObject) {
      const appList = JSON.parse(appObject);
      return appList;
    }
    return null;
  }
}

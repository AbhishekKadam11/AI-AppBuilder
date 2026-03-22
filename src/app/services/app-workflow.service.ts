import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { StorageService } from './storage.service';
import { WebContainerService } from './web-container.service';

@Injectable({
  providedIn: 'root'
})
export class AppWorkflowService {

  private appWorkflowSubject = new BehaviorSubject<string>('');
  public appObject$ = this.appWorkflowSubject.asObservable();
  // private appObjectSubject = new BehaviorSubject<string>('');
  // public appObject$ = this.appObjectSubject.asObservable();

  constructor(private storageService: StorageService, private webContainerService: WebContainerService) { }

  processState(fact: string, appObject: any) {
    // this.appWorkflowSubject.next(state);
    switch (fact) {
      case 'appRecived':
        this.saveAppObjInLocalStorage(appObject);
        this.appWorkflowSubject.next(appObject);
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
      const appIndex = appList?.findIndex(( app: any) => app.data.extraConfig.projectName === appDetails.data.extraConfig.projectName);
      if (appIndex === -1) {
        appList?.push(appDetails);
      } else if (appIndex !== -1) {
        appDetails.data.messages.concat(appList[appIndex].data.messages);
        appList?.splice(appIndex, 1, appDetails);
      }
      this.storageService.setItem('appObject', JSON.stringify(appList));
    } else {
      this.storageService.setItem('appObject', JSON.stringify([appDetails]));
    }
  }

  fetchAppObjFromLocalStorage() {
    const appObject = this.storageService.getItem('appObject');
    if (appObject) {
      const appList = JSON.parse(appObject);
      return appList;
    }
    return null;
  }

  async webContainerCommandRunner(commandArray: string[]): Promise<void> {
    this.webContainerService.runCommands(commandArray);
  }
}

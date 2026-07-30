import { DestroyRef, inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { StorageService } from './storage.service';
import { WebContainerService } from './web-container.service';
import { firstValueFrom, map, Observable, Subject } from 'rxjs';
import { DirectoryControlService } from './directory-control.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { NbToastrService } from '@nebular/theme';
import { environment } from "../../environments/environment";

interface AppDetails {
  appName?: string;
  data: {
    extraConfig: {
      projectName?: string;
      routePath?: string;
    };
    messages: Array<any>
    supervisorMesssage: Array<any>
    uiMessages: Array<any>
    next: string
    chat_history: Array<any>
  };
  dataSource?: Array<{ component?: string }>;
}

interface SocketResponse {
  [projectName: string]: { directory: any };
}


@Injectable({
  providedIn: 'root'
})
export class AppWorkflowService {

  private appWorkflowSubject = new BehaviorSubject<AppDetails>({} as AppDetails);
  public appObject$ = this.appWorkflowSubject.asObservable();
  private appExtensionSubject = new Subject<any>();
  public appExtension$ = this.appExtensionSubject.asObservable();
  private browserUrlSubject = new Subject<any>();
  public browserUrl$ = this.browserUrlSubject.asObservable();
  private appLoggingSubject = new BehaviorSubject<string[]>([]);
  public appLogging$ = this.appLoggingSubject.asObservable();

  private readonly webContainerService = inject(WebContainerService);
  private readonly directoryControlService = inject(DirectoryControlService);
  private destroyRef = inject(DestroyRef);
  private apiService = inject(ApiService);
  private toastrService = inject(NbToastrService);

  private readonly apiPath = 'appdata';
  private readonly dbStoreEnabled = environment.dbStoreEnabled;

  constructor(private storageService: StorageService) {
    console.log("this.dbStoreEnabled", this.dbStoreEnabled);
  }

  processState(fact: string, appObject: AppDetails): void {
    // this.appWorkflowSubject.next(state);
    switch (fact) {
      case 'appRecived':
        this.storeAppObject(appObject);
        this.appWorkflowSubject.next(appObject);
        this.initDirectoryManager(appObject);
        break;
    }
  }

  storeAppObject(appObject: AppDetails): void {
    if (this.dbStoreEnabled) {
      return this.saveAppObjInCloud(appObject);
    }
    return this.saveAppObjInLocalStorage(appObject);
  }

  // App Extension related methods
  storeUserExtensionPreference(userPreferences?: any) {
    this.appExtensionSubject.next(userPreferences);
  }

  fetchUserExtensionPreference() {
    return this.appExtensionSubject.asObservable();
  }

  saveAppObjInLocalStorage(appDetails: AppDetails): void {
    const appObject = this.storageService.getItem('appObject');
    if (appObject) {
      const appList = JSON.parse(appObject);
      const appIndex = appList?.findIndex((app: any) => app.data.extraConfig.projectName === appDetails.data.extraConfig.projectName);
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

  saveAppObjInCloud(appDetails: AppDetails): void {
    const payload = { "app_name": appDetails.data.extraConfig.projectName, "app_data": appDetails.data };
    this.apiService.post(this.apiPath, payload).subscribe((response: any) => {
      this.toastrService.show('Success', `User app save successfully`, { status: 'success' });
    }, (error: any) => {
      console.log(error);
      this.toastrService.show('Failed', `Unable to save user app`, { status: 'danger' });
    });
  }

  fetchAppObjFromLocalStorage() {
    const appObject = this.storageService.getItem('appObject');
    if (appObject) {
      const appList = JSON.parse(appObject);
      return appList;
    }
    return null;
  }

  async fetchAppObjFromCloud(): Promise<string[]> {
    const resposne = await firstValueFrom(this.apiService.get(this.apiPath)) as string[];
    resposne.forEach((item: any) => {
      item.data = item.app_data;
      delete item.app_data;
    });
    return resposne;
  }

  async webContainerCommandRunner(commandArray: string[]): Promise<void> {
    this.webContainerService.runCommands(commandArray);
  }

  currentAppObject(): any {
    return this.appWorkflowSubject.getValue();
  }

  initDirectoryManager(appDetails: AppDetails): void {
    if (appDetails && appDetails?.data?.extraConfig?.projectName) {
      const projectName = appDetails.data.extraConfig.projectName;
      this.directoryControlService.loadDirectoryContents(projectName);
      this.directoryControlService.directoryData$.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((response: any) => typeof response !== "boolean" && this.handleWebContainerResponse(response, projectName));
    }
  }

  private handleWebContainerResponse(response: SocketResponse, projectName: string): Promise<void> | void {

    if (!response || !response[projectName]) return;

    const directory = response[projectName]?.['directory'];

    if (!directory) {
      console.warn('Directory not found in response for:', projectName);
      return;
    }

    if (!this.webContainerService.isWebContainerBooted) {
      return this.webContainerService.bootAndRun(directory);
    }

    return this.webContainerService.mountFiles(directory);
  }

  currentActiveUrl(): any {
    return this.webContainerService.iframeUrlSubject.getValue();
  }

  currentActiveDirectory(): any {
    return this.directoryControlService.directoryDataSubject.getValue();
  }

  storeAppLogging(log: string[]): void {
    const existingLogs = this.appLoggingSubject.getValue() || [];
    const newLogs = Array.from(new Set([...existingLogs, ...log])); // Merge and remove duplicates
    this.appLoggingSubject.next(newLogs);
  }

  currentAppLogging(): any {
    return this.appLoggingSubject.getValue();
  }
}

import { inject, Injectable, OnDestroy } from '@angular/core';
import { StorageService } from './storage.service';
import { SocketService } from './socket.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class JiraGraberService implements OnDestroy {

  public jiraStatus: boolean = false;
  private storageService: StorageService = inject(StorageService);
  private socketService = inject(SocketService);
  private socketSubscription?: Subscription;
  private serverReplySubscription?: Subscription;
  private readonly jiraSocketNamespace: string = '/jiraId';

  constructor() {
    const storedStatus = this.storageService.getItem('user');
    if (storedStatus) {
      const userPreferences = JSON.parse(storedStatus);
      this.jiraStatus = userPreferences.active_extensions?.includes('jira') || false;
      console.log("JiraGraberService jiraStatus =>", this.jiraStatus);
    }
    this.socketService.connectSocket('/jiraId');
    this.initJiraSocketInstance()
  }

  initJiraSocketInstance() {
    if (this.serverReplySubscription) {
      return;
    }

    this.socketSubscription = this.socketService.socketStatus.subscribe((message) => {
      console.log("JiraGraberService message =>", message);
    });

    const serverReply$ = this.socketService.on('receiveJiraEvent', this.jiraSocketNamespace);
    this.serverReplySubscription = serverReply$.subscribe((response: any) => {
      console.log("JiraGraberService response =>", response);
    });
  }

  ngOnDestroy(): void {
    this.socketSubscription?.unsubscribe();
    this.serverReplySubscription?.unsubscribe();
  }

}

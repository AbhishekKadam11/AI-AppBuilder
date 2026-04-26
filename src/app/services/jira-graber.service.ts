import { inject, Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})

export class JiraGraberService {

  public jiraStatus: boolean = false;
  private storageService: StorageService = inject(StorageService);
  private socketService = inject(SocketService);

  constructor() {
    const storedStatus = this.storageService.getItem('user');
    if (storedStatus) {
      const userPreferences = JSON.parse(storedStatus);
      this.jiraStatus = userPreferences.active_extensions?.includes('jira') || false;
      console.log("JiraGraberService jiraStatus =>", this.jiraStatus);
    }

    // this.initJiraSocketInstance();
    this.socketService.connectSocket('/jiraId');
    this.socketService.sendMessage('sendJiraStatus', this.jiraStatus);
  }

  // initJiraSocketInstance() {
  //   // Initialize the Socket.IO connection with the server address
  //   this.socket = io(environment.socketUrl, { transports: ['websocket'], autoConnect: true, timeout: 20000 });
  //   this.socket.on('connect', () => {
  //     console.log(`JiraGraberService socket connected`);
  //   });
  //   this.socket.on('connect_error', (err: any) => {
  //     console.log("JiraGraberService connect_error=>", err.message);
  //     console.log("JiraGraberService connect_error_description=>", err?.description);
  //   });
  // }

}

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbLayoutModule } from "@nebular/theme";
import { Subscription } from 'rxjs/internal/Subscription';
import { WebContainerService } from '../services/web-container.service';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';

@Component({
  selector: 'app-browser-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, NbInputModule, CommonModule, FormsModule],
  templateUrl: './browser-window.component.html',
  styleUrl: './browser-window.component.scss'
})

export class BrowserWindowComponent implements OnInit, AfterViewInit {

  @ViewChild('webcontainerIframe') iframe!: ElementRef<HTMLIFrameElement>;
  title = 'My Browser Window';
  isMinimized = false;
  isMaximized = false;
  iframeUrl: SafeResourceUrl | string = "";
  outputLogs: string[] = [];
  private subscriptions: Subscription = new Subscription();
  private webContainerSubscription: Subscription | undefined;
  private readonly readDirectoryContent: string = 'ReadDirectoryContent';
  private readonly webContainerFiles: string = 'WebContainerFiles';
  private readonly directoryManager: string = 'DirectoryManager';
  messages: any = { "action": "geContinerFiles", "path": "newApp1" };
  private fileSystemTree: any | null = null;
  private isWebContainerActive: boolean = false;
  progressGifUrl: string = '';
  public appUrl: string | null = null;
  placeholderUrl: string = 'https://webcontainer.io';
  private containerUrl: string = '';
  private appObject: any = {}


  constructor(private webContainerService: WebContainerService,
    private progressControlService: ProgressControlService,
    private socketService: SocketService,
    private appWorkflowService: AppWorkflowService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

    // Subscribe to iframe URL updates from the service
    this.subscriptions.add(
      this.webContainerService.iframeUrl$.subscribe(url => {
        if (url) {
          this.containerUrl = url+'/'+ this.appObject.path;
          this.appUrl = this.placeholderUrl;
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      })
    );

    // Subscribe to logs for display
    this.subscriptions.add(
      this.webContainerService.output$.subscribe(log => {
        this.outputLogs.push(log);
      })
    );

    // Subscribe to progress GIF updates
    this.subscriptions.add(
      this.progressControlService.progresGif$.subscribe(gifUrl => {
        this.progressGifUrl = gifUrl;
      })
    );

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails.projectName && !this.socketService?.socketStatus.closed) {
          this.appObject = appDetails;
          this.messages = { "action": "geContinerFiles", "path": this.appObject.projectName };
          this.socketService.sendMessage(this.directoryManager, this.messages);
          const webContainerFiles$ = this.socketService?.on(this.webContainerFiles);
          if (webContainerFiles$) {
            this.webContainerSubscription = webContainerFiles$.subscribe((response: any) => {
              console.log('Received webContainerFiles from server:', response);
              this.fileSystemTree = this.webContainerService.buildWebContainerFileTree(response.data[this.appObject.projectName]['directory']) as any;
              // console.log('Constructed FileSystemTree:', this.fileSystemTree);
              if (this.fileSystemTree && !this.isWebContainerActive) {
              //  this.webContainerService.bootAndRun(response.data[this.appObject.projectName]['directory']);
                this.isWebContainerActive = true;
              }
            });
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Implement dragging and resizing logic here
  }

  minimize(): void {
    this.isMinimized = !this.isMinimized;
    // Apply styles to minimize the window
  }

  maximize(): void {
    this.isMaximized = !this.isMaximized;
    // Apply styles to maximize the window
  }

  close(): void {
    // Emit an event or trigger a service to close the window
  }

  openUrl(): void {

  }

  navigateToUrl(): void {
    if (this.appUrl && this.iframe) {
      this.appUrl = this.appUrl.replace(this.placeholderUrl, this.containerUrl);
      const newUrl = new URL(this.appUrl);
      const iframeWindow = this.iframe.nativeElement.contentWindow;
      if (iframeWindow) {
        iframeWindow.postMessage({ type: 'navigate', url: newUrl.href }, '*');
      }
      this.appUrl = this.appUrl.replace(this.containerUrl, this.placeholderUrl);
    }
  }
}
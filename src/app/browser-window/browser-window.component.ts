import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  effect,
  signal,
  ViewChild,
  SecurityContext
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbLayoutModule } from "@nebular/theme";
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { WebContainerService } from '../services/web-container.service';
import { SocketService } from '../services/socket.service';
import { ProgressControlService } from '../services/progress-control.service';
import { AppWorkflowService } from '../services/app-workflow.service';
import { DirectoryControlService } from '../services/directory-control.service';
import { take } from 'rxjs/operators';

// Define interfaces for better type safety
interface AppDetails {
  appName?: string;
  data?: {
    extraConfig?: {
      projectName?: string;
      routePath?: string;
    };
  };
  dataSource?: Array<{ component?: string }>;
}

interface SocketResponse {
  [projectName: string]: { directory: any };
}

@Component({
  selector: 'app-browser-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule, NbInputModule, FormsModule],
  templateUrl: './browser-window.component.html',
  styleUrl: './browser-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowserWindowComponent implements OnInit, AfterViewInit {
  // --- State Management with Signals ---
  iframeUrl = signal<SafeResourceUrl | string>('');
  outputLogs = signal<string[]>([]);
  progressGifUrl = signal<string>('');
  progressInfo = signal<string>('');

  // Internal State
  private appObject = signal<AppDetails | null>(null);
  private readonly directoryManager = 'DirectoryManager';

  // --- Constants & Defaults ---
  public appUrl: string | null = null;
  readonly placeholderUrl: string = 'https://webcontainer.io';

  // --- ViewChild ---
  @ViewChild('webcontainerIframe', { static: false }) iframeRef!: ElementRef<HTMLIFrameElement>;

  // --- Inputs ---
  @Input() set navigationUrl(url: SafeResourceUrl | string) {
    this.appUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
    this.iframeUrl.set(url);
  }

  // --- Dependency Injection ---
  private webContainerService = inject(WebContainerService);
  private progressControlService = inject(ProgressControlService);
  private socketService = inject(SocketService);
  private appWorkflowService = inject(AppWorkflowService);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private readonly directoryControlService = inject(DirectoryControlService);

  constructor() {
    // Effect: Automatically triggers initialization when appObject changes
    console.log('BrowserWindowComponent constructor called this.appObject()', this.appObject());
    effect(() => {
        this.initWebContainer();
    });
  }

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    this.setupAppObject();
    this.resetWebContainerState();
  }

  setupAppObject(): void {
    console.log("current app object in workflow", this.appWorkflowService.currentAppObject());
    if (!this.appObject()) {
      this.appWorkflowService.appObject$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((appDetails: AppDetails) => {
          console.log('Received app details from AppWorkflowService:', appDetails);
          if (appDetails?.data?.extraConfig?.projectName && !this.socketService?.socketStatus.closed) {
           console.log('Updating appObject with new project details:', appDetails);
            this.appObject.set(appDetails);
          }
        });
    }
  }

  private setupSubscriptions(): void {
    // 1. Subscribe to iframe URL updates
    this.webContainerService.iframeUrl$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(url => {
        if (url) {
          this.updateIframeUrl(url);
        }
      });

    // 2. Subscribe to logs
    // this.webContainerService.output$
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(log => {
    //     this.outputLogs.update(logs => [...logs, log]);
    //   });

    // 3. Subscribe to progress updates
    this.progressControlService.progresGif$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(url => this.progressGifUrl.set(url));

    this.progressControlService.progresText$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(text => this.progressInfo.set(text));
  }

  private updateIframeUrl(baseUrl: string): void {
    const app = this.appObject();
    if (!app) return;

    let path = '';

    // Determine path based on app structure
    if (app.data?.extraConfig?.routePath) {
      path = `/${app.data.extraConfig.routePath}`;
    } else if (app.dataSource?.length && app.dataSource[0]['component']) {
      path = `/${app.dataSource[0]['component']}`;
    }

    this.appUrl = baseUrl + path;
    this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.appUrl));
  }

  private initWebContainer(): void {
    console.log('initWebContainer called1:', this.appObject());
   // if(this.webContainerService.isWebContainerBooted) return;

    const projectName = this.appObject()?.data?.extraConfig?.projectName || this.appObject()?.appName;
    if (!projectName) return;
    // if (this.webContainerService.isWebContainerBooted) return;

    this.directoryControlService.loadDirectoryContents(projectName);
    this.directoryControlService.directoryData$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((response: any) => typeof response !== "boolean" && this.handleWebContainerResponse(response, projectName));

  }

  private handleWebContainerResponse(response: SocketResponse, projectName: string): void {
    const directory = response[projectName]?.['directory'];

    if (!directory) {
      console.warn('Directory not found in response for:', projectName);
      return;
    }

    // if (!this.webContainerService.isWebContainerBooted) {
    this.webContainerService.bootAndRun(directory);
    // }
    // else {
    //   console.log('WebContainer is already active. Mounting files.');
    //   this.webContainerService.mountFiles(directory);
    // }
  }

  private resetWebContainerState(): void {
    if (this.webContainerService.isWebContainerBooted) {
      this.webContainerService.iframeUrl$.pipe(take(1)).subscribe(url => this.updateIframeUrl(url));
    }
  }

  openUrl(): void {
    if (this.appUrl) {
      window.open(this.appUrl, '_blank');
    }
  }

  navigateToUrl(): void {
    if (this.appUrl) {
      this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.appUrl));
    }
  }

  navigateToBack(): void {
    this.iframeRef.nativeElement.contentWindow?.history.back();
  }

  navigateToForward(): void {
    this.iframeRef.nativeElement.contentWindow?.history.forward();
  }
}


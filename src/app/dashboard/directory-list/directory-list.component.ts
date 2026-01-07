import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, Renderer2, signal, ViewChild } from '@angular/core';
import { NbAdjustment, NbCardModule, NbContextMenuDirective, NbContextMenuModule, NbIconModule, NbMenuItem, NbMenuModule, NbMenuService, NbPosition, NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule } from '@nebular/theme';
import { FsIconComponent } from '../fs-icon/fs-icon.component';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { AppWorkflowService } from '../../services/app-workflow.service';
import { WebContainerService } from '../../services/web-container.service';
import { WindowService } from '../../services/window.service';
import { CodeEditorComponent } from '../../code-display/code-editor.component';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  name: string;
  kind: string;
  items?: number;
}

@Component({
  selector: 'app-directory-list',
  imports: [NbTreeGridModule, NbIconModule, NbCardModule, CommonModule, FsIconComponent, NbMenuModule, NbContextMenuModule],
  standalone: true,
  templateUrl: './directory-list.component.html',
  styleUrl: './directory-list.component.scss'
})

export class DirectoryListComponent {
  customColumn = 'name';
  defaultColumns = ['kind', 'items'];
  allColumns = [this.customColumn];

  dataSource!: NbTreeGridDataSource<FSEntry>;
  sortColumn!: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  private readonly directoryManager: string = 'DirectoryManager';
  private directorySubscription: Subscription | undefined;
  messages: any = { "action": "getAll", "path": "" };
  private subscriptions: Subscription = new Subscription();
  @Output() openFile = new EventEmitter<any>();
  private readonly webContainerFiles: string = 'WebContainerFiles';
  private isWebContainerActive: boolean = false;
  private appList: any[] = [];
  private currentMaxZIndex = signal(2000);
  @ViewChild(NbContextMenuDirective)
  contextMenu!: NbContextMenuDirective;
  @ViewChild('contextMenuPosition') contextMenuPositionRef!: ElementRef;
 readonly position = NbPosition.BOTTOM;
 readonly NbAdjustment = NbAdjustment;

  contextMenuItems: NbMenuItem[] = [
    { title: 'View Details', icon: 'eye-outline' },
    { title: 'Edit Node', icon: 'edit-outline' },
    { title: 'Delete Node', icon: 'trash-outline' },
  ];

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private socketService: SocketService,
    private webContainerService: WebContainerService,
    private windowService: WindowService,
    private nbMenuService: NbMenuService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private appWorkflowService: AppWorkflowService) {
  }

  ngAfterViewInit() {

    this.subscriptions.add(
      this.appWorkflowService.appObject$.subscribe((appDetails: any) => {
        if (appDetails && appDetails.data.extraConfig.projectName && !this.socketService?.socketStatus.closed) {
          this.messages = { "action": "getContainerFiles", "path": appDetails.data.extraConfig.projectName };
          this.socketService.sendMessage(this.directoryManager, this.messages);
          const serverReply$ = this.socketService?.on(this.directoryManager);
          if (serverReply$) {
            this.directorySubscription = serverReply$.subscribe((response: any) => {
              console.log('Received directorySubscription from server:', response);
              const formatedTree: TreeNode<FSEntry>[] = this.webContainerService.transformToNebularTree(response.data);
              this.dataSource = this.dataSourceBuilder.create(formatedTree);
            });
          }
        }
      })
    );
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  onRowClick(row: any) {
    if (row && row.data && row.data.kind !== 'directory') {
      this.webContainerService.webContainerFileContent(row.data.path.replace(/\\/g, '/')).then((fileData: string) => {
        this.currentMaxZIndex.update(z => z + 1);
        this.windowService.openWindow({
          title: row.data.name,
          contentComponent: CodeEditorComponent, // Pass the component class to render
          data: { fileDetails: { fileContent: fileData, filePath: row.data.path.replace(/\\/g, '/') } },
          placeholder: 'h-full w-full col-start-1 col-end-2 row-start-1 row-span-2',
          isMaximized: signal(true),
          zIndex: signal(this.currentMaxZIndex())
        });
      }, error => {
        console.log('onRowClick error', error);
      });
    }
  }

  menuPosition = { x: 0, y: 0 };
  selectedRow: any;

  onRightClick(event: MouseEvent) {
    event.preventDefault();

    // 1. Set coordinates from the event
    // this.menuPosition = { x: event.clientX, y: event.clientY };

    // 2. Hide the menu to clear any existing CDK overlay instance
    this.contextMenu.hide();

    // 3. Force Angular to update the DOM immediately
   

    // 4. Use requestAnimationFrame to ensure the anchor <div> has moved 
    // to the new (x, y) BEFORE the overlay starts calculation
    requestAnimationFrame(() => {
      this.contextMenu.show();
      setTimeout(() => {
   const overlayPane = document.querySelector('.cdk-overlay-pane') as HTMLElement;
    if (overlayPane) {
      // overlayPane.style.transform = 'none'; // Prevents Nebular offset interference
      overlayPane.style.top = event.clientX + 'px'; // Prevents Nebular offset interference
      overlayPane.style.bottom = event.clientY + 'px'; // Prevents Nebular offset interference
    }
    //  this.cdr.detectChanges();
    console.log('overlayPane', overlayPane)
      }, 10);
    
      
    });
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}



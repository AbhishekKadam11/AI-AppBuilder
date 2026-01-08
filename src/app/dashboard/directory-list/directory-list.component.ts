import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output, signal, ViewChild } from '@angular/core';
import { NbCardModule, NbContextMenuModule, NbIconModule, NbMenuItem, NbMenuModule, NbMenuService, NbPopoverDirective, NbPopoverModule, NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbTreeGridModule, NbCdkMappingModule } from '@nebular/theme';
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
  imports: [NbTreeGridModule, NbIconModule, NbCardModule, CommonModule, FsIconComponent, NbMenuModule, NbContextMenuModule, NbPopoverModule, NbCdkMappingModule],
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
  @ViewChild(NbPopoverDirective)
  popover!: NbPopoverDirective;
  @ViewChild('popoverHost', { read: ElementRef })
  popoverHost!: ElementRef;

  contextMenuItems: NbMenuItem[] = [
    { title: 'View Details', icon: 'eye-outline' },
    { title: 'Edit Node', icon: 'edit-outline' },
    { title: 'Delete Node', icon: 'trash-outline' },
  ];

  constructor(private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private socketService: SocketService,
    private webContainerService: WebContainerService,
    private windowService: WindowService,
    private menuService: NbMenuService,
    private appWorkflowService: AppWorkflowService) {
   
  }

  ngOnInit() {
    this.menuService.onItemClick().subscribe((data) => {
      console.log(data);
      switch(data.item.title) {
        case 'Rename':
          console.log('Rename');
          break;
        case 'Delete':
          console.log('Delete');
          break;
        case 'Add Folder':
          console.log('Add Folder');
          break;
        case 'Add File':
          console.log('Add File');
          break;
      }
    });

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

  openOnRightClick(event: MouseEvent, popover: any, row: any) {
    if (row.kind === 'directory') {
      this.contextMenuItems = [
        { title: 'Rename', icon: 'edit-outline' },
        { title: 'Delete', icon: 'trash-outline' },
        { title: 'Add Folder', icon: 'folder-outline' },
        { title: 'Add File', icon: 'file-text-outline' }
      ]
    } else if (row.kind === 'file') {
      this.contextMenuItems = [
        { title: 'Rename', icon: 'edit-outline' },
        { title: 'Delete', icon: 'trash-outline' }
      ]
    }
    event.preventDefault();
    this.onDocumentClick(event);
    popover.show();
    this.popover = popover;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
   
    if (this.popover && this.popover.isShown) {
      const clickedInside = this.popoverHost.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.popover.hide();
      }
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}



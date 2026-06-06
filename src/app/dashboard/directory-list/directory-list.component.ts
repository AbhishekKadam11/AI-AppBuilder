import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  signal,
  ViewChild,
  OnDestroy,
  OnInit,
  AfterViewInit,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbContextMenuModule,
  NbIconModule,
  NbMenuItem,
  NbMenuModule,
  NbMenuService,
  NbPopoverDirective,
  NbPopoverModule,
  NbSortDirection,
  NbSortRequest,
  NbTreeGridDataSource,
  NbTreeGridDataSourceBuilder,
  NbTreeGridModule,
  NbInputModule,
  NbFormFieldModule
} from '@nebular/theme';
import { filter, take, shareReplay, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';

import { FsIconComponent } from '../fs-icon/fs-icon.component';
import { SocketService } from '../../services/socket.service';
import { AppWorkflowService } from '../../services/app-workflow.service';
import { WebContainerService } from '../../services/web-container.service';
import { WindowService } from '../../services/window.service';
import { CodeEditorComponent } from '../../code-display/code-editor.component';
import { DirectoryControlService } from '../../services/directory-control.service';

// Constants
const DIRECTORY_MANAGER = 'DirectoryManager';
const REFRESH_DIRECTORY = 'RefreshDirectory';
const SOCKET_NAMESPACE = '/projectId';
const MIN_WIDTH_MULTIPLE_COLUMNS = 400;
const NEXT_COLUMN_STEP = 100;

// Types
interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  name: string;
  kind: string;
  items?: number;
  path?: string;
  id?: string;
}

interface ActiveElement {
  element: HTMLElement;
  row: any;
}

@Component({
  selector: 'app-directory-list',
  imports: [
    NbTreeGridModule,
    NbIconModule,
    NbCardModule,
    CommonModule,
    FsIconComponent,
    NbMenuModule,
    NbContextMenuModule,
    NbPopoverModule,
    NbInputModule,
    FormsModule,
    NbFormFieldModule
  ],
  standalone: true,
  templateUrl: './directory-list.component.html',
  styleUrl: './directory-list.component.scss'
})
export class DirectoryListComponent implements OnInit, AfterViewInit, OnDestroy {
  // Inject services using inject() for better tree-shaking
  private readonly dataSourceBuilder = inject(NbTreeGridDataSourceBuilder<FSEntry>);
  private readonly socketService = inject(SocketService);
  private readonly webContainerService = inject(WebContainerService);
  private readonly windowService = inject(WindowService);
  private readonly menuService = inject(NbMenuService);
  private readonly appWorkflowService = inject(AppWorkflowService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly directoryControlService = inject(DirectoryControlService);

  // Column configuration
  readonly customColumn = 'name';
  readonly defaultColumns = ['kind', 'items'];
  readonly allColumns = [this.customColumn];

  // Grid state
  dataSource!: NbTreeGridDataSource<FSEntry>;
  sortColumn = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  // UI state
  @Output() openFile = new EventEmitter<any>();
  @ViewChild(NbPopoverDirective) popover!: NbPopoverDirective;
  @ViewChild('popoverHost', { read: ElementRef }) popoverHost!: ElementRef;
  @ViewChild('editInput') inputElement!: ElementRef;

  setReadOnly = false;
  addNewInputRow = '';
  insertNewRowIndicator = '';

  // Private state
  private currentMaxZIndex = signal(2000);
  private activeElements: ActiveElement[] = [];
  private setKind = '';
  private projectName = '';

  private directorySubscription: Subscription | null = null;
  private refreshSubscription: Subscription | null = null;

  // Context menu configurations
  contextMenuItems: NbMenuItem[] = [
    { title: 'View Details', icon: 'eye-outline' },
    { title: 'Edit Node', icon: 'edit-outline' },
    { title: 'Delete Node', icon: 'trash-outline' },
  ];

  private readonly directoryMenuItems = [
    { title: 'Rename', icon: 'edit-outline' },
    { title: 'Delete', icon: 'trash-outline' },
    { title: 'Copy', icon: 'copy-outline' },
    { title: 'Cut', icon: 'scissors-outline' },
    { title: 'Add Folder', icon: 'folder-outline' },
    { title: 'Add File', icon: 'file-text-outline' }
  ];

  private readonly fileMenuItems = [
    { title: 'Rename', icon: 'edit-outline' },
    { title: 'Copy', icon: 'copy-outline' },
    { title: 'Cut', icon: 'scissors-outline' },
    { title: 'Delete', icon: 'trash-outline' }
  ];

  ngOnInit(): void {
    this.setupMenuListeners();
  }

  ngAfterViewInit(): void {
    this.setupFileSystemSubscription();
  }

  // Public methods
  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    return this.sortColumn === column ? this.sortDirection : NbSortDirection.NONE;
  }

  getShowOn(index: number): number {
    return MIN_WIDTH_MULTIPLE_COLUMNS + (NEXT_COLUMN_STEP * index);
  }

  onRowClick(row: any): void {
    if (!row?.data || row.data.kind === 'directory') return;
    this.openFileInEditor(row);
  }

  openOnRightClick(event: MouseEvent, popover: NbPopoverDirective, row: FSEntry): void {
    event.preventDefault();
    this.contextMenuItems = row.kind === 'directory'
      ? this.directoryMenuItems.map(item => ({ ...item, data: row }))
      : this.fileMenuItems.map(item => ({ ...item, data: row }));

    this.onDocumentClick(event);
    popover.show();
    this.popover = popover;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.popover?.isShown && !this.popoverHost?.nativeElement.contains(event.target)) {
      this.popover.hide();
    }
  }

   private handleMenuItemClick(item: NbMenuItem): void {
    const actions: Record<string, () => void> = {
      'Rename': () => this.rowHasFocus(item.data),
      'Delete': () => this.sendActionRequest('delete', item.data),
      'Add Folder': () => this.sendActionRequest('AddFolder', item.data),
      // 'Add Folder': () => this.addFileAndFolder(item.data, 'directory'),
      'Add File': () => this.sendActionRequest('AddFile', item.data),
    };

    actions[item.title]?.();
  }

  rowHasFocus(row: any): void {
    row.setReadOnly = !row.setReadOnly;
    const element = document.getElementById(row.name);

    if (element) {
      setTimeout(() => {
        element.focus();
        this.manageActiveElements(element as HTMLElement, row);
      });
    }
  }

  focusOutInput(row: any): void {
    if (this.activeElements.length === 0 || !this.projectName) return;
    // this.webContainerActions('rename', row);
    this.sendActionRequest('rename', row);
    this.blurAllActiveElements();
  }

  trackByFn(_index: number, item: any): string {
    return item.data?.id;
  }

  addFileAndFolder(row: any, kind: string): void {
    this.insertNewRowIndicator = row.name;
    this.setKind = kind;
  }

  addNewDirectoryRow(row: any): void {
    if (!this.addNewInputRow.trim()) return;

    const newRow = {
      name: this.addNewInputRow,
      kind: this.setKind,
      path: row.data.path,
    };

    this.insertNewRowIndicator = '';
    const action = this.setKind === 'file' ? 'AddFile' : 'AddFolder';

    // this.webContainerService.createDirectoryInWebContainer(row.data.path, this.addNewInputRow).then((result) => {
    //   console.log(`${this.setKind} created successfully in web container:`, result);
    //     // this.sendActionRequest(action, newRow);
    //     this.updateDataSource({[this.projectName]:result});
    //   })
    //   .catch(error => {
    //     console.error(`Error creating ${this.setKind} in web container:`, error);
    //   });
    this.sendActionRequest(action, newRow);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions manually
    this.cleanupSubscriptions();
  }

  // Private methods
  private setupMenuListeners(): void {
    this.menuService.onItemClick()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ item }) => {
        this.handleMenuItemClick(item);
      });
  }


  private setupFileSystemSubscription(): void {
    this.appWorkflowService.appObject$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((appDetails: any) => !!appDetails?.data?.extraConfig?.projectName),
        filter(() => !this.socketService?.socketStatus?.closed)
      )
      .subscribe((appDetails: any) => {
        this.projectName = appDetails.data.extraConfig.projectName;
        this.directoryControlService.directoryData$.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe((response: any) => response !== null && typeof response !== "boolean" && this.updateDataSource(response));
      });
  }

  private cleanupSubscriptions(): void {
    // Unsubscribe from existing subscriptions to prevent duplicates
    if (this.directorySubscription) {
      this.directorySubscription.unsubscribe();
      this.directorySubscription = null;
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  private updateDataSource(data: any): void {
    const formatedTree = this.webContainerService.transformToNebularTree(data);
    this.dataSource = this.dataSourceBuilder.create(formatedTree);
  }

  private openFileInEditor(row: any): void {
    const filePath = row.data.path.replace(/\\/g, '/');

    this.webContainerService.webContainerFileContent(filePath)
      .then((fileData: string) => {
        this.currentMaxZIndex.update(z => z + 1);
        this.windowService.openWindow({
          title: row.data.name,
          contentComponent: CodeEditorComponent,
          data: {
            fileDetails: {
              fileContent: fileData,
              filePath: filePath
            }
          },
          placeholder: 'h-full w-full col-start-1 col-end-2 row-start-1 row-span-2',
          isMaximized: signal(true),
          zIndex: signal(this.currentMaxZIndex())
        });
      })
      .catch(error => {
        console.error('onRowClick error', error);
      });
  }

  private manageActiveElements(element: HTMLElement, row: any): void {
    this.activeElements = this.activeElements.filter(el => {
      if (el.element !== element) {
        el.row.setReadOnly = true;
        el.element.blur();
        return false;
      }
      return true;
    });

    this.activeElements.push({ element, row });
  }

  private sendRenameRequest(row: any): void {
    if (!this.projectName) return;

    // Use take(1) to automatically unsubscribe after first emission
    this.appWorkflowService.appObject$
      .pipe(
        take(1),
        filter((appDetails: any) => !!appDetails?.data?.extraConfig?.projectName),
        filter(() => !this.socketService?.socketStatus?.closed)
      )
      .subscribe((appDetails: any) => {
        const message = {
          action: 'rename',
          path: appDetails.data.extraConfig.projectName,
          content: row
        };
        // this.webContainerService.renameWebContainerFile(row);
        this.socketService.sendMessage(DIRECTORY_MANAGER, message, SOCKET_NAMESPACE);
      });
  }

  private sendActionRequest(action: string, newRow: any): void {
    console.log(`sendActionRequest - Action: ${action}, Row:`, newRow);

    this.appWorkflowService.appObject$
      .pipe(
        take(1),
        filter((appDetails: any) => !!appDetails?.data?.extraConfig?.projectName),
        filter(() => !this.socketService?.socketStatus?.closed)
      )
      .subscribe((appDetails: any) => {
        console.log('sendActionRequest - App Details:', appDetails);
        const message = {
          action,
          path: appDetails.data.extraConfig.projectName,
          content: newRow
        };

        this.socketService.sendMessage(DIRECTORY_MANAGER, message, SOCKET_NAMESPACE);

        // // Clean up previous refresh subscription
        if (this.refreshSubscription) {
          this.refreshSubscription.unsubscribe();
        }

        const refreshReply$ = this.socketService?.on(REFRESH_DIRECTORY);
        if (refreshReply$) {
          this.refreshSubscription = refreshReply$.subscribe((response: any) => {
            console.log('Received add new file from server:', response);
            this.updateFileSystem(appDetails);
          });
        }
      });
  }

  private blurAllActiveElements(): void {
    this.activeElements.forEach(el => {
      el.row.setReadOnly = true;
      el.element.blur();
    });
    this.activeElements = [];
  }

  private updateFileSystem(appObject: any): void {
    if (!appObject?.data?.extraConfig?.projectName) return;

    // Clean up previous directory subscription before creating new one
    this.cleanupSubscriptions();

    const projectName = appObject.data.extraConfig.projectName;
    const message = { action: 'getContainerFiles', path: projectName };

    this.socketService.sendMessage(DIRECTORY_MANAGER, message);

    const webContainerFiles$ = this.socketService?.on(DIRECTORY_MANAGER);
    if (webContainerFiles$) {
      this.directorySubscription = webContainerFiles$.subscribe((response: any) => {
        console.log('Received updateFileSystem from server:', response);

        if (response?.data?.[projectName]) {
          this.updateDataSource(response.data);
          this.webContainerService.mountFiles(response.data[projectName].directory);
        } else {
          console.warn('Unable to receive webContainerFiles from server: Invalid response data');
        }
      });
    }
  }

  deleteNode(row: any): void {
    if (!this.projectName) return;
    this.sendActionRequest('delete', row);
  }

  // webContainerActions(action: string, row: any): void {
  //   switch (action) {
  //     case 'rename':
  //       this.webContainerService.renameWebContainerFile(row);
  //       break;
  //     case 'delete':
  //       this.deleteNode(row);
  //       break;
  //     case 'AddFolder':
  //       this.addFileAndFolder(row, 'directory');
  //       break;
  //     case 'AddFile':
  //       this.addFileAndFolder(row, 'file');
  //       break;
  //     default:
  //       console.warn('Unknown action:', action);
  //   }
  // }
}

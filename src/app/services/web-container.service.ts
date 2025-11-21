import { Injectable } from '@angular/core';
import { WebContainer, FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { AnsiStripPipe } from './ansi-strip.pipe';
import { ProgressControlService } from './progress-control.service';

interface FileEntry {
  name: string;
  kind: 'file' | 'directory';
  path: string;
  contents?: string; // Optional for files
}

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WebContainerService {
  private webcontainerInstance!: WebContainer;
  private iframeUrlSubject = new BehaviorSubject<string>('');
  public iframeUrl$ = this.iframeUrlSubject.asObservable();
  private outputSubject = new BehaviorSubject<string>('');
  public output$ = this.outputSubject.asObservable();
  private ansiStrip: AnsiStripPipe
  private isWebContainerBooted = false;

  constructor(private progressControlService: ProgressControlService) {
    this.ansiStrip = new AnsiStripPipe();
  }

  public async bootAndRun(files: FileSystemTree): Promise<void> {
    if (this.isWebContainerBooted) {
      console.warn('WebContainer already booted. Skipping.');
      return;
    }

    try {
      this.webcontainerInstance = await WebContainer.boot();
      this.isWebContainerBooted = true;
      this.outputSubject.next('WebContainer booted successfully.');
      await this.mountFiles(files);
      this.progressControlService.showProgressGif('dependency');
      await this.runCommands(['npm', 'install', '--legacy-peer-deps']);
      this.listenForServerReady();
      this.progressControlService.showProgressGif('templating');
      await this.runCommands(['npm', 'run', 'start']);
    } catch (error) {
      console.error('Failed to boot and run WebContainer:', error);
      this.outputSubject.next(`Error: ${error}`);
    }
  }

  public async mountFiles(files: FileSystemTree): Promise<void> {
    this.outputSubject.next('Mounting files...');
    await this.webcontainerInstance.mount(files);
    this.outputSubject.next('Files mounted.');
  }

  private async runCommands(commands: string[]): Promise<void> {
    this.outputSubject.next(`Running command: ${commands.join(' ')}`);
    const process = await this.webcontainerInstance.spawn(commands[0], commands.slice(1));

    // Pipe the process output to the output subject for real-time logs
    process.output.pipeTo(
      new WritableStream({
        write: (data) => {
          const asniDecodedString = this.ansiStrip.transform(data.toString());
          this.outputSubject.next(asniDecodedString)
        },
      })
    );

    const exitCode = await process.exit;
    if (exitCode !== 0) {
      throw new Error(`Command failed with exit code ${exitCode}`);
    }
    // return exitCode;

  }

  private listenForServerReady(): void {
    this.webcontainerInstance.on('server-ready', (port: number, url: string) => {
      this.progressControlService.showProgressGif('');
      this.iframeUrlSubject.next(url);
      this.outputSubject.next(`Server ready on port ${port} at ${url}`);
    });
  }

  public buildWebContainerFileTree(fsTree: string): string {
    const content = `import { FileSystemTree } from '@webcontainer/api';\n\n/** @satisfies {FileSystemTree} */\nexport const files = ${JSON.stringify(fsTree, null, 2)};`;
    return content;
  }

  public async webContainerFileContent(fileName: string): Promise<string> {
    if (!this.webcontainerInstance) {
      return Promise.reject('WebContainer not initialized.');
    }
    return this.webcontainerInstance.fs.readFile(fileName, 'utf8');
  }

  public async webContainerWriteFileContent(filePath: string, fileContent: string): Promise<void> {
    if (!this.webcontainerInstance) {
      return Promise.reject('WebContainer not initialized.');
    }
    // console.log('Writing file filePath:', filePath);
    await this.webcontainerInstance.fs.writeFile(filePath, fileContent, { encoding: 'utf8' });
    // const readContent = await this.webcontainerInstance.fs.readFile(filePath, 'utf8');
    // console.log('File content read back:', readContent);
  }

  public transformToNebularTree(jsonNode: any): TreeNode<FileEntry>[] {
    const result: TreeNode<FileEntry>[] = [];

    for (const name in jsonNode) {
      if (Object.prototype.hasOwnProperty.call(jsonNode, name)) {
        const entry = jsonNode[name];
        // Handle directories
        if (entry.directory) {
          const directoryNode: TreeNode<FileEntry> = {
            data: { name: name, kind: 'directory', path: entry.path },
            children: this.transformToNebularTree(entry.directory), // Recurse for children
          };
          result.push(directoryNode);
        }

        // Handle files
        if (entry.file) {
          const fileNode: TreeNode<FileEntry> = {
            data: {
              name: name,
              kind: 'file',
              path: entry.file.path,
              contents: entry.file.contents,
            },
          };
          result.push(fileNode);
        }
      }
    }

    return result;
  }

}
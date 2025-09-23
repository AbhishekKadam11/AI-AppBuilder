import { Injectable } from '@angular/core';
import { WebContainer, FileSystemTree, WebContainerProcess } from '@webcontainer/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { AnsiStripPipe } from './ansi-strip.pipe';

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

  constructor() { 
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
      await this.runCommands(['npm', 'install', '--legacy-peer-deps']);
      this.listenForServerReady();
      await this.runCommands(['npm', 'run', 'start']);
    } catch (error) {
      console.error('Failed to boot and run WebContainer:', error);
      this.outputSubject.next(`Error: ${error}`);
    }
  }

  private async mountFiles(files: FileSystemTree): Promise<void> {
    this.outputSubject.next('Mounting files...');
    await this.webcontainerInstance.mount(files);
    this.outputSubject.next('Files mounted.');
  }

  private async runCommands(commands: string[]): Promise<void>  {
    this.outputSubject.next(`Running command: ${commands.join(' ')}`);
    const process = await this.webcontainerInstance.spawn(commands[0], commands.slice(1));

    // Pipe the process output to the output subject for real-time logs
    process.output.pipeTo(
      new WritableStream({
        write: (data) =>{ 
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
      this.iframeUrlSubject.next(url);
      this.outputSubject.next(`Server ready on port ${port} at ${url}`);
    });
  }

  public buildWebContainerFileTree(fsTree: string): string {
    const content = `import { FileSystemTree } from '@webcontainer/api';\n\n/** @satisfies {FileSystemTree} */\nexport const files = ${JSON.stringify(fsTree, null, 2)};`;
    return content;
  }
}
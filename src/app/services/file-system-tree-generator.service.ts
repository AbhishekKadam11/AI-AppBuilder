import { Inject, Injectable } from '@angular/core';
import { promises as fs, Dirent } from 'fs';
import { join, relative } from 'path';


export type FileSystemTree = {
  [key: string]: {
    file: { contents: string }
  } | {
    directory: FileSystemTree
  };
};

export type FileSystemNode = {
  name: string;
  kind: 'file' | 'directory';
  content?: string; // Only for files
  children?: FileSystemNode[]; // Only for directories
};

export type FileSystemNodeTree = {
  data: { name: string; kind: 'file' | 'directory'; path: string, items?: number, content?: string };
  children?: FileSystemNodeTree[];
};

@Injectable({
  providedIn: 'root'
})

export class FileSystemTreeGeneratorService {

  private ignoredPaths: Set<string>;
  private projectPath: string;
  private outputFilePath: string;

  constructor(
    @Inject('PROJECT_PATH') projectPath: string,
    @Inject('OUTPUT_FILE_PATH') outputFilePath: string,
    @Inject('IGNORED_PATHS') ignoredPaths: string[]
  ) {
    this.projectPath = projectPath;
    this.outputFilePath = outputFilePath;
    this.ignoredPaths = new Set(ignoredPaths);
  }

  public async generateTree(): Promise<FileSystemTree> {
    const tree = await this.readDirectory(this.projectPath);
    return tree;
  }

  private async readDirectory(dir: string): Promise<FileSystemTree> {
    const fileTree: FileSystemTree = {};
    const entries: Dirent[] = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (this.ignoredPaths.has(entry.name)) {
        continue;
      }

      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        fileTree[entry.name] = {
          directory: await this.readDirectory(fullPath),
        };
      } else {
        const content = await fs.readFile(fullPath, 'utf8');
        fileTree[entry.name] = {
          file: { contents: content },
        };
      }
    }
    return fileTree;
  }

  public buildFileSystemTree(fileArray: FileSystemNodeTree[]): FileSystemTree {
    const tree: FileSystemTree = {};

    fileArray.forEach((item: FileSystemNodeTree) => {
      const { name, kind, content } = item.data;
      if (kind === 'directory') {
        // Recursively build the tree for this directory's children
        tree[name] = {
          directory: this.buildFileSystemTree(item.children || [])
        };
      } else if (kind === 'file') {
        // Create a file object with its content
        tree[name] = {
          file: {
            contents: content ? content : ''
          }
        };
      }
    });

    return tree;
  }

  public async saveTreeToFile(fsTree: FileSystemTree): Promise<void> {
    console.log('Saving file system tree to:',fsTree);
    const content = `import { FileSystemTree } from '@webcontainer/api';\n\n/** @satisfies {FileSystemTree} */\nexport const files = ${JSON.stringify(fsTree, null, 2)};`;
    await fs.writeFile(this.outputFilePath, content, 'utf8');
    console.log(`Successfully generated file system tree at ${this.outputFilePath}`);
  }
}

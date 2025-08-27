import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-fs-icon',
  imports: [NbIconModule, CommonModule],
  standalone: true,
  templateUrl: './fs-icon.component.html',
  styleUrl: './fs-icon.component.scss'
})
export class FsIconComponent {
  @Input()
  kind!: string;
  @Input()
  expanded!: boolean;

  isDir(): boolean {
    return this.kind === "directory";
  }
}

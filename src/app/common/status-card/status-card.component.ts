import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NbCardModule, NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-status-card',
  styleUrls: ['./status-card.component.scss'],
  imports: [NbCardModule, CommonModule, NbIconModule],
  template: `
    <nb-card (click)="toggle()" [ngClass]="{'off': !on}" >
      <div class="icon-container">
        <div class="icon status-{{ type }}">
          <ng-content></ng-content>
        </div>
      </div>

      <div class="details">
        <div class="title h5">{{ title }}</div>
        <div class="status text-basic">{{ on ? 'ON' : 'OFF' }}</div>
        <p class="paragraph-2">{{ description }}</p>
      </div>
    </nb-card>
  `,
})
export class StatusCardComponent {

  @Input()
  title!: string;
  @Input()
  description!: string;
  @Input()
  type!: string;
  @Input()
  on: boolean = true;
  @Input()
  status: boolean = true;

  toggle(): void {
    if (this.status) {
      this.on = !this.on;
    }
  }

}

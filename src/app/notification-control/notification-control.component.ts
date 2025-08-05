import { Component } from '@angular/core';
import { NbActionsModule, NbCardModule } from '@nebular/theme';

@Component({
  selector: 'app-notification-control',
  imports: [NbCardModule, NbActionsModule],
  standalone: true,
  templateUrl: './notification-control.component.html',
  styleUrl: './notification-control.component.scss'
})
export class NotificationControlComponent {

}

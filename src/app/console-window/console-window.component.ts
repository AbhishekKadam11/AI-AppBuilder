import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule } from '@nebular/theme';

@Component({
  selector: 'app-console-window',
  imports: [NbLayoutModule, NbCardModule, NbIconModule, NbButtonModule],
  standalone: true,
  templateUrl: './console-window.component.html',
  styleUrl: './console-window.component.scss'
})
export class ConsoleWindowComponent {

}

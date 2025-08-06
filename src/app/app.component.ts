import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { NbLayoutModule } from '@nebular/theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DashboardComponent, NbLayoutModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AI-AppBuilder';

  constructor() {

  }


}

import { Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../themes/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AI-AppBuilder';
  readonly themeColor = 'dark';

  constructor(public themeService: ThemeService) {

  }

  @HostBinding('class.dark') get isDark() {
    return this.themeService.isDarkMode();
  }
}

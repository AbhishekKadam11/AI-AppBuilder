import { Component, OnDestroy } from '@angular/core';
import { NbCardModule, NbIconModule, NbThemeService } from '@nebular/theme';
import { StatusCardComponent } from '../../common/status-card/status-card.component';
import { CommonModule } from '@angular/common';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';

interface CardSettings {
  title: string;
  description: string;
  iconClass: string;
  type: string;
  status: boolean;
}

@Component({
  selector: 'app-extensions',
  imports: [NbCardModule, StatusCardComponent, CommonModule, NbIconModule],
  templateUrl: './extensions.component.html',
  styleUrl: './extensions.component.scss'
})
export class ExtensionsComponent implements OnDestroy {

  private alive = true;
  lightCard: CardSettings = {
    title: 'Angular',
    description: 'App builder will create app using Angular framework. this extension is mandatory and cannot be turned off.',
    iconClass: 'angular-icon',
    type: 'primary',
    status: false,
  };
  rollerShadesCard: CardSettings = {
    title: 'SonarQube',
    description: 'SonarQube extension for code quality analysis',
    iconClass: 'sonarqube-icon',
    type: 'primary',
    status: true,
  };
  wirelessAudioCard: CardSettings = {
    title: 'Docker',
    description: 'Docker extension for containerization',
    iconClass: 'docker-icon',
    type: 'primary',
    status: true,
  };
  coffeeMakerCard: CardSettings = {
    title: 'Coffee Maker',
    description: 'Coffee Maker',
    iconClass: 'nb-coffee-maker',
    type: 'primary',
    status: true,
  };

  statusCards: any = {};

  commonStatusCardsSet: CardSettings[] = [
    this.lightCard,
    this.rollerShadesCard,
    this.wirelessAudioCard,
    this.coffeeMakerCard,
  ];

  statusCardsByThemes: any = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.lightCard,
        type: 'warning',
      },
      {
        ...this.rollerShadesCard,
        type: 'primary',
      },
      {
        ...this.wirelessAudioCard,
        type: 'danger',
      },
      {
        ...this.coffeeMakerCard,
        type: 'info',
      },
    ],
    dark: this.commonStatusCardsSet,
  };
  isGrayscale = true;

  constructor(private themeService: NbThemeService,) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe((theme: any) => {
        this.statusCards = this.statusCardsByThemes[theme.name] || this.statusCardsByThemes['default'];
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

}

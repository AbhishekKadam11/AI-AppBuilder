import { Component, OnDestroy } from '@angular/core';
import { NbCardModule, NbIconModule, NbThemeService } from '@nebular/theme';
import { StatusCardComponent } from '../../common/status-card/status-card.component';
import { CommonModule } from '@angular/common';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'app-extensions',
  imports: [NbCardModule, StatusCardComponent, CommonModule, NbIconModule],
  templateUrl: './extensions.component.html',
  styleUrl: './extensions.component.scss'
})
export class ExtensionsComponent implements OnDestroy {

  private alive = true;

  // statusCardsByThemes: any = {
  //   default: ['lightCard', 'rollerShadesCard', 'wirelessAudioCard', 'coffeeMakerCard'],
  //   cosmic: ['lightCard', 'rollerShadesCard', 'wirelessAudioCard', 'coffeeMakerCard'],
  //   corporate: ['lightCard', 'rollerShadesCard', 'wirelessAudioCard', 'coffeeMakerCard'],
  //   dark: ['lightCard', 'rollerShadesCard', 'wirelessAudioCard', 'coffeeMakerCard'],
  // };
 lightCard: CardSettings = {
    title: 'Light',
    iconClass: 'angular-icon',
    type: 'primary',
  };
  rollerShadesCard: CardSettings = {
    title: 'Roller Shades',
    iconClass: 'nb-roller-shades',
    type: 'success',
  };
  wirelessAudioCard: CardSettings = {
    title: 'Wireless Audio',
    iconClass: 'nb-audio',
    type: 'info',
  };
  coffeeMakerCard: CardSettings = {
    title: 'Coffee Maker',
    iconClass: 'nb-coffee-maker',
    type: 'warning',
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

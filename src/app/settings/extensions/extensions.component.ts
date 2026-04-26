import { Component, OnDestroy } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbThemeService, NbToastrService } from '@nebular/theme';
import { StatusCardComponent } from '../../common/status-card/status-card.component';
import { CommonModule } from '@angular/common';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { ApiService } from '../../services/api.service';
import { themes } from '../../common/header/header.component';
import { StorageService } from '../../services/storage.service';

interface CardSettings {
  title: string;
  description: string;
  iconClass: string;
  type: string;
  status: boolean;
  active: boolean;
}

@Component({
  selector: 'app-extensions',
  imports: [NbCardModule, StatusCardComponent, CommonModule, NbIconModule, NbButtonModule],
  templateUrl: './extensions.component.html',
  styleUrl: './extensions.component.scss'
})
export class ExtensionsComponent implements OnDestroy {

  private alive = true;
  statusCards: any = [];
  extensions: CardSettings[] = [];
  commonStatusCardsSet: CardSettings[] = [];
  statusCardsByThemes: any = {};
  isGrayscale = true;
  apiPath = 'userPreferences/extensions';
  userPreferences!: any;

  constructor(private themeService: NbThemeService, private apiService: ApiService, private toastrService: NbToastrService, private storageService: StorageService) {
    this.apiService.get(this.apiPath).subscribe((response: any) => {
      this.commonStatusCardsSet = response;
      //  console.log("get commonStatusCardsSet ",response);
      for (let theme of themes) {
        this.statusCardsByThemes[theme.value] = this.commonStatusCardsSet;
      }
      this.themeService.getJsTheme()
        .pipe(takeWhile(() => this.alive))
        .subscribe((theme: any) => {
          this.statusCards = this.statusCardsByThemes[theme.value] || this.statusCardsByThemes['default'];
          this.userPreferences = this.statusCards.filter((card: any) => card.active).map((card: any) => card.id);
          this.storeUserExtensionPreference();
          // this.storageService.setAppExtension(this.statusCards);
        });
    }, (error: any) => {
      console.error(error);
    });
  }

  ngOnDestroy() {
  }
  save() {
    // console.log("post statusCards ", this.statusCards);
    this.apiService.post(this.apiPath, { extensions: this.statusCards }).subscribe((response: any) => {
      this.userPreferences = this.statusCards.filter((card: any) => card.active).map((card: any) => card.id);
      this.storeUserExtensionPreference();
      this.toastrService.show('Success', `User preferences updated successfully`, { status: 'success' });
    }, (error: any) => {
      console.log(error);
      this.toastrService.show('Failed', `Unable to update user preferences`, { status: 'danger' });
    });
  }
  cancel() {
  }

  storeUserExtensionPreference() {
    const currentUser = this.storageService.getItem('user');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      userData.active_extensions = this.userPreferences;
      this.storageService.setItem('user', JSON.stringify(userData));
    }
    return;
  }


}

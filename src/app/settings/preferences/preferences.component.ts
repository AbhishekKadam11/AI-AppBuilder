import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NbButtonModule, NbCardModule, NbIconModule, NbRadioModule, NbTabsetModule, NbToastrService, NbTooltipModule } from '@nebular/theme';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

type Platforms = 'client' | 'server';

interface IUserPreferences {
  logLevel: 'info' | 'debug' | 'error' | 'off';
  captureLogs: boolean;
  captureLevels?: string[];
}

type ICaptureLogs = {
  [K in Platforms]: IUserPreferences
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule, NbIconModule, NbTabsetModule, NbRadioModule, FormsModule, NbTooltipModule],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})

export class PreferencesComponent {

  private readonly apiPath = 'userPreferences';
  private readonly dbStoreEnabled = environment.dbStoreEnabled;

  userPreferences!: ICaptureLogs;

  constructor(private apiService: ApiService, private toastrService: NbToastrService, private storageService: StorageService) {
    this.fetchUserPreferences();
  }

  save() {
    if (this.dbStoreEnabled) {
      return this.storeUserPreferenceOnRemote();
    }
    return this.storeUserPreferenceOnLocal();
  }

  cancel() {
  }

  storeUserPreferenceOnRemote() {
    return this.apiService.post(this.apiPath, { preferences: this.userPreferences }).subscribe((response: any) => {
      this.toastrService.show('success', `User preferences updated successfully`, { status: 'success' });
    }, (error: any) => {
      console.error(error);
      this.toastrService.show('danger', `Unable to update user preferences`, { status: 'danger' });
    });
  }

  storeUserPreferenceOnLocal() {
    const currentUser = this.storageService.getItem('user');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      userData.preferences = this.userPreferences;
      this.storageService.setItem('user', JSON.stringify(userData));
    }
    return;
  }

  fetchUserPreferences() {
    if (this.dbStoreEnabled) {
      return this.fetchUserPreferenceFromRemote();
    }
    return this.fetchUserPreferenceFromLocal();
  }

  fetchUserPreferenceFromRemote() {
    return this.apiService.get(this.apiPath).subscribe((response: any) => {
      this.userPreferences = response != null ? response.preferences : { client: {}, server: {} };
    }, (error: any) => {
      console.error(error);
    });
  }

  fetchUserPreferenceFromLocal() {
    const userPreferences = this.storageService.getItem('user');
    if (userPreferences) {
      this.userPreferences = JSON.parse(userPreferences).preferences;
    }
  }
}

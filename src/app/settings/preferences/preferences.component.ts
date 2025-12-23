import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbIconModule, NbRadioModule, NbTabsetModule, NbToastrService, NbTooltipModule } from '@nebular/theme';
import { ApiService } from '../../services/api.service';

type Platforms = 'client' | 'server';

interface IUserPreferences {
    logLevel: 'info' | 'debug' | 'error' | 'off';
    captureLogs: boolean;
    captureLevels?: string[];
}

type ICaptureLogs ={
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

  userPreferences!: ICaptureLogs;

  constructor(private apiService: ApiService, private toastrService: NbToastrService) { 
    this.userPreferences = {
      client: {
        logLevel: 'info',
        captureLogs: true
      },
      server: {
        logLevel: 'info',
        captureLogs: true
      }
    }
    this.save();
  }

  save() {
    // console.log(this.userPreferences)
    this.apiService.post(this.apiPath, { userPreferences: this.userPreferences }).subscribe((response: any)=>{
      console.log(response);
       this.toastrService.show('success', `User preferences updated successfully`, { status: 'success' });
    }, (error: any) => {
      console.error(error);
      this.toastrService.show('danger', `Unable to update user preferences`, { status: 'danger' });
    });
  }
  cancel() {
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    readonly isDarkMode = signal(false); // Default to light mode

    toggleDarkMode() {
        this.isDarkMode.update(value => !value);
    }
}
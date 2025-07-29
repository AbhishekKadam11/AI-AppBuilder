import { Injectable, signal } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

interface IThemwMode {
    default: string;
    dark: string;
}

@Injectable({
    providedIn: 'root'
})

export class ThemeService {
    readonly isDarkMode = signal(false); // Default to light mode
    private nbThemeMode: IThemwMode = {default: 'default', dark: 'dark'};

    constructor(private themeService: NbThemeService) {
        // Check local storage for saved theme preference
        // const savedTheme = localStorage.getItem('theme');
        // if (savedTheme) {
        //     this.isDarkMode.set(savedTheme === 'dark');
        // }
    }

    toggleDarkMode(themeColor: string = 'default') {
        //@ts-ignore
        const themeColr = this.nbThemeMode[themeColor] === 'dark' ? 'dark' : 'default';
        debugger
        this.isDarkMode.update(value => !value);
        this.themeService.changeTheme(themeColr);
    }
}
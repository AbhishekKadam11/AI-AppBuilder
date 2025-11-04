import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class ProgressControlService {

  private progresGifSubject = new BehaviorSubject<string>('');
  public progresGif$ = this.progresGifSubject.asObservable();
  private progresTextSubject = new BehaviorSubject<string>('');
  public progresText$ = this.progresTextSubject.asObservable();

  constructor() { }

  public showProgressGif(fact: string) {
    switch (fact) {
      case 'init':
        this.progresGifSubject.next('assets/images/progress-init.png');
        this.progresTextSubject.next('Ask AI to build your app...');
        break;
      case 'reseacrhing':
        this.progresGifSubject.next('assets/images/progress-searching.gif');
        this.progresTextSubject.next('AI is researching your app idea...');
        break;
      case 'processing':
        this.progresGifSubject.next('assets/images/progress-processing.gif');
        this.progresTextSubject.next('AI is processing your app requirements...');
        break;
      case 'templating':
        this.progresGifSubject.next('assets/images/progress-templating.gif');
        this.progresTextSubject.next('AI is creating app template...');
        break;
      case 'dependency':
        this.progresGifSubject.next('assets/images/progress-dependencies-install.gif');
        this.progresTextSubject.next('AI is installing app dependencies...');
        break;
      case '': // clear gif
        this.progresGifSubject.next('');
        this.progresTextSubject.next('');
        break;
      default:
        this.progresGifSubject.next('');
        this.progresTextSubject.next('');
        break;
    }
  }
}

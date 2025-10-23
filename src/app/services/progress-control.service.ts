import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class ProgressControlService {

  private progresGifSubject = new BehaviorSubject<string>('');
  public progresGif$ = this.progresGifSubject.asObservable();

  constructor() { }

  public showProgressGif(fact: string) {
    switch (fact) {
      case 'init':
        this.progresGifSubject.next('assets/images/progress-init.png');
        break;
      case 'reseacrhing':
        this.progresGifSubject.next('assets/images/progress-searching.gif');
        break;
      case 'processing':
        this.progresGifSubject.next('assets/images/progress-processing.gif');
        break;
      case 'templating':
        this.progresGifSubject.next('assets/images/progress-templating.gif');
        break;
      case 'dependency':
        this.progresGifSubject.next('assets/images/progress-dependencies-install.gif');
        break;
      case '': // clear gif
        this.progresGifSubject.next('');
        break;
      default:
        this.progresGifSubject.next('');
        break;
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ansiStrip',
  standalone: false,
})
export class AnsiStripPipe implements PipeTransform {
  // Regex to match and remove ANSI escape codes.
  private ansiRegex = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

  transform(value: string): string {
    if (typeof value !== 'string') {
      return value;
    }
    return value.replace(this.ansiRegex, '');
  }
}
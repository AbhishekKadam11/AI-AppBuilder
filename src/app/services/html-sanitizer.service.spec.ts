import { TestBed } from '@angular/core/testing';

import { HtmlSanitizerService } from './html-sanitizer.service';

describe('HtmlSanitizerService', () => {
  let service: HtmlSanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlSanitizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

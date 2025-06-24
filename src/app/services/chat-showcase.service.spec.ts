import { TestBed } from '@angular/core/testing';

import { ChatShowcaseService } from './chat-showcase.service';

describe('ChatShowcaseService', () => {
  let service: ChatShowcaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatShowcaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

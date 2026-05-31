import { TestBed } from '@angular/core/testing';

import { DirectoryControlService } from './directory-control.service';

describe('DirectoryControlService', () => {
  let service: DirectoryControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoryControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

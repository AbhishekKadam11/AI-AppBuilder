import { TestBed } from '@angular/core/testing';

import { FileSystemTreeGeneratorService } from './file-system-tree-generator.service';

describe('FileSystemTreeGeneratorService', () => {
  let service: FileSystemTreeGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSystemTreeGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

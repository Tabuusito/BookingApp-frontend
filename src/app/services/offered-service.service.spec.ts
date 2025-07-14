import { TestBed } from '@angular/core/testing';

import { OfferedServiceService } from './offered-service.service';

describe('OfferedServiceService', () => {
  let service: OfferedServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferedServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

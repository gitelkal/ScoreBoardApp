import { TestBed } from '@angular/core/testing';

import { ThirdPartyApiService } from './third-party-api.service';

describe('ThirdPartyApiService', () => {
  let service: ThirdPartyApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThirdPartyApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

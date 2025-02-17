import { TestBed } from '@angular/core/testing';

import { TeamUsersService } from './team-users.service';

describe('TeamUsersService', () => {
  let service: TeamUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

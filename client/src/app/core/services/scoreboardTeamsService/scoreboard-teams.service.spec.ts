import { TestBed } from '@angular/core/testing';

import { ScoreboardTeamsService } from './scoreboard-teams.service';

describe('ScoreboardTeamsService', () => {
  let service: ScoreboardTeamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreboardTeamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

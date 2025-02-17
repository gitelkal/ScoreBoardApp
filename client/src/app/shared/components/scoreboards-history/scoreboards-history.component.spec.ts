import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardsHistoryComponent } from './scoreboards-history.component';

describe('ScoreboardsHistoryComponent', () => {
  let component: ScoreboardsHistoryComponent;
  let fixture: ComponentFixture<ScoreboardsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardsHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

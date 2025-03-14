import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardVBarViewComponent } from './scoreboard-v-bar-view.component';

describe('ScoreboardVBarViewComponent', () => {
  let component: ScoreboardVBarViewComponent;
  let fixture: ComponentFixture<ScoreboardVBarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardVBarViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardVBarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardTaskViewComponent } from './scoreboard-task-view.component';

describe('ScoreboardTaskViewComponent', () => {
  let component: ScoreboardTaskViewComponent;
  let fixture: ComponentFixture<ScoreboardTaskViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardTaskViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardTaskViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

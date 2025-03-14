import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardStapleViewComponent } from './scoreboard-staple-view.component';

describe('ScoreboardStapleViewComponent', () => {
  let component: ScoreboardStapleViewComponent;
  let fixture: ComponentFixture<ScoreboardStapleViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardStapleViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardStapleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

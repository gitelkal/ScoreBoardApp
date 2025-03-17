import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardBaseComponent } from './scoreboard-base.component';

describe('ScoreboardBaseComponent', () => {
  let component: ScoreboardBaseComponent;
  let fixture: ComponentFixture<ScoreboardBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

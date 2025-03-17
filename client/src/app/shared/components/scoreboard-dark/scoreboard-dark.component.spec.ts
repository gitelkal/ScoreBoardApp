import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardDarkComponent } from './scoreboard-dark.component';

describe('ScoreboardDarkComponent', () => {
  let component: ScoreboardDarkComponent;
  let fixture: ComponentFixture<ScoreboardDarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardDarkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardDarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScoreboardDetailsComponent } from './scoreboard-details.component';

describe('ScoreboardDetailsComponent', () => {
  let component: ScoreboardDetailsComponent;
  let fixture: ComponentFixture<ScoreboardDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

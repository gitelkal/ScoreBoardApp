import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddScoreboardComponent } from './add-scoreboard.component';

describe('AddScoreboardComponent', () => {
  let component: AddScoreboardComponent;
  let fixture: ComponentFixture<AddScoreboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddScoreboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddScoreboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

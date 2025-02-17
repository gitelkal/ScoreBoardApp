import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveScoreboardsComponent } from './active-scoreboards.component';

describe('ActiveScoreboardsComponent', () => {
  let component: ActiveScoreboardsComponent;
  let fixture: ComponentFixture<ActiveScoreboardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveScoreboardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveScoreboardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

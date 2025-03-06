import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeamUserComponent } from './register-team-user.component';

describe('RegisterTeamUserComponent', () => {
  let component: RegisterTeamUserComponent;
  let fixture: ComponentFixture<RegisterTeamUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterTeamUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterTeamUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

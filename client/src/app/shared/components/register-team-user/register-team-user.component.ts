import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { NgIf, NgClass } from '@angular/common';
import { RegisterService } from '@app/core/services/registerService/register.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';

@Component({
  selector: 'app-register-team-user',
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './register-team-user.component.html',
  styleUrl: '../register/register.component.css'
})
export class RegisterTeamUserComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  errorMessage: string = '';
  success: boolean = false;
  usernameExists: boolean = false;

  constructor(private registerService: RegisterService, private teamUsersService: TeamUsersService) {}

  submitRegister(form: NgForm) {
    
    if(form.invalid) { return; }
      
  }
  
  addUser(form: NgForm)
  {
    if(form.invalid) { return; }
    
  }

  private resetErrorStates(): void {
    this.usernameExists = false;
    this.errorMessage = '';
  }
  
  private triggerFieldError(field: 'username', message: string): void {
    this.errorMessage = message;
  
    if (field === 'username') {
      this.usernameExists = true;
    } 
    setTimeout(() => {
      this.resetErrorStates();
    }, 1000);
  }
}

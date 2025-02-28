import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { NgIf, NgClass } from '@angular/common';
import { RegisterService } from '@app/core/services/registerService/register.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  errorMessage: string = '';
  success: boolean = false;
  usernameExists: boolean = false;

  constructor(private registerService: RegisterService) {}

  submitRegister(form: NgForm) {
    if(form.invalid) { return; }
      this.registerService.createNewUser({ username: this.username, password: this.password, firstname: this.firstname, lastname: this.lastname }).subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => {
            this.dialog.closeAll();
            form.resetForm();
          }, 2000);
        },
        error: (error) => {
          if (error.status === 400) {
            this.triggerFieldError('username', 'Användarnamnet är upptaget');
            return;
          } else {
            this.errorMessage = 'Ett oväntat fel inträffade.';          
          }
        setTimeout(() => this.resetErrorStates(), 2500);
      } 
    });
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

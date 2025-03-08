import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, NgClass, RouterLink, MatDialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  router = inject(Router);
  userId: number = 0;
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  errorMessage: string = '';
  success: boolean = false;
  wrongPassword: boolean = false;
  usernameExists: boolean = false;

  submitLogin(form: NgForm) {
    if (form.invalid) { return; }
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        this.success = true;
        this.firstname = response.firstname;
        setTimeout(() => {
          window.location.reload();
          form.resetForm();
          this.dialog.closeAll();
        }, 2000);
      },
      error: (error) => {
          if (error.status === 401) {
            if (error.error.message === 'Fel användarnamn') {
              this.triggerFieldError('username', 'Du har angett fel användarnamn');
              return;
            } else if (error.error.message === 'Fel lösenord') {
              this.triggerFieldError('password', 'Du har angett fel lösenord');
              return;
            } else {
              this.errorMessage = 'Ett oväntat fel inträffade.';
              return;
            }
          }
          setTimeout(() => this.resetErrorStates(), 2500);
      }
    });
  }
  
  private resetErrorStates(): void {
    this.usernameExists = false;
    this.wrongPassword = false;
    this.errorMessage = '';
  }
  
  private triggerFieldError(field: 'username' | 'password', message: string): void {
    this.errorMessage = message;
  
    if (field === 'username') {
      this.usernameExists = true;
    } else {
      this.wrongPassword = true;
    }
    setTimeout(() => {
      this.resetErrorStates();
    }, 1000);
  }

  closeModal() {
    this.dialog.closeAll();
  }
}

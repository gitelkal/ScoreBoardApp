import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgIf, AsyncPipe, NgClass } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, AsyncPipe, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  router = inject(Router);
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  errorMessage: string = '';
  success: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  passwordInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  usernameInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  wrongPassword: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  wrongUsername: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  submitLogin() {
    if (this.validateInputs()) {
      this.authService.login({ username: this.username, password: this.password }).subscribe({
        next: response => {
          this.firstname = response.firstname;
          this.lastname = response.lastname;
          this.success.next(true);
          setTimeout(() => {
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
                this.errorMessage = 'An unexpected error occurred.';
                return;
              }
            }
            setTimeout(() => this.resetErrorStates(), 2500);
        }
      });
    }
  }

  private resetErrorStates(): void {
    this.wrongUsername.next(false);
    this.wrongPassword.next(false);
    this.errorMessage = '';
  }
  
  private triggerFieldError(field: 'username' | 'password', message: string): void {
    this.errorMessage = message;
  
    if (field === 'username') {
      this.wrongUsername.next(true);
    } else {
      this.wrongPassword.next(true);
    }
    setTimeout(() => {
      this.resetErrorStates();
    }, 2500);
  }
  
  validateInputs(): boolean {
    if (this.username === "" && this.password === "") {
      this.usernameInput.next(false);
      this.passwordInput.next(false);
      return false;
    } else if (this.password === "" && this.username !== "") {
      this.passwordInput.next(false);
      this.usernameInput.next(true);
      return false;
    } else if (this.username === "" && this.password !== "") {
      this.passwordInput.next(true);
      this.usernameInput.next(false);
      return false;
    }
    this.usernameInput.next(true);
    this.passwordInput.next(true);
    return true;
  }
}

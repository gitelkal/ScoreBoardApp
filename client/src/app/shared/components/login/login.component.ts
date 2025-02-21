import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, AsyncPipe],
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
  success: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  passwordInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  usernameInput: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  submitLogin() {
      if (this.validateInputs()) {
      this.authService.login({username: this.username, password: this.password}).subscribe(response => {
        this.firstname= response.firstname 
        this.lastname = response.lastname;
        this.success = this.authService.adminLoggedIn
        setTimeout(() => {
          this.dialog.closeAll();
        }, 2000);
      });
    }
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

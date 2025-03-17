import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { NgIf, NgClass } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  email: string = '';
  username: string = '';
  password: string = '';
  firstname: string = '';
  lastname: string = '';
  errorMessage: string = '';
  success: boolean = false;
  usernameExists: boolean = false;
  emailExists: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitRegister(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.auth.createNewUser({
      email: this.email,
      username: this.username,
      password: this.password,
      firstname: this.firstname,
      lastname: this.lastname
    }).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => {
          this.dialog.closeAll();
          form.resetForm();
        }, 2000);
      },
      error: (error) => {
        console.error('Error:', error);
        if (error.error.message) {
          if (error.error.message === 'Username already exists') {
            this.triggerFieldError('username', 'Användarnamnet är upptaget');
          } else if (error.error.message === 'Email already exists') {
            this.triggerFieldError('email', 'E-postadressen är redan registrerad');
          } else {
            this.errorMessage = 'Ett oväntat fel inträffade.';
          }
        } else {
          this.errorMessage = 'Ett oväntat fel inträffade.';
        }
        setTimeout(() => this.resetErrorStates(), 5000);
      }
    });
  }

  private resetErrorStates(): void {
    this.usernameExists = false;
    this.emailExists = false;
    this.errorMessage = '';
  }

  private triggerFieldError(field: 'username' | 'email', message: string): void {
    this.errorMessage = message;

    if (field === 'username') {
      this.usernameExists = true;
    } else if (field === 'email') {
      this.emailExists = true;
    }
  }
}

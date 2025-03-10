import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, NgIf],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  email: string = '';
  token: string = '';
  expiriation: Date = new Date();
  newPassword: string = '';
  confirmPassword: string = '';
  success: boolean = false;
  passwordMismatch: boolean = false;
  unknownError: boolean = false;
  timedOut: boolean = false;

  constructor(private authService: AuthService) {
    const urlParams = new URLSearchParams(window.location.search);
    this.email = urlParams.get('email')?.toLowerCase() ?? '';
    this.token = urlParams.get('token') ?? '';
    this.expiriation = new Date(urlParams.get('expires') ?? '');

  }
  resetPassword(form: NgForm) {
    if (new Date() > this.expiriation) {
      this.timedOut = true;
      setTimeout(() => {
      this.timedOut = false;
      }, 3000);
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      setTimeout(() => {
        this.passwordMismatch = false;
      }, 3000);
      return;
    } else {
      this.authService.resetPassword(this.email, this.token, this.newPassword).subscribe({
        next: () => {
            this.success = true;
            setTimeout(() => {
              this.success = false;
            }, 60000);
        },
        error: (error) => {
          console.error(error);
            this.unknownError = true;
            setTimeout(() => {
              this.unknownError = false;
            }, 3000);
          }
      });
    }
  }
}

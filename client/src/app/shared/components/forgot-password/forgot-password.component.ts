import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, NgIf],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  success: boolean = false;
  emailNotFound: boolean = false;
  unknownError: boolean = false;

  constructor(private authService: AuthService) {}

  forgotPassword() {
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => {
          this.success = false;
        }, 3000);
      },
      error: (error) => {
        if (error.status === 400) {
        this.emailNotFound = true;
        setTimeout(() => {
          this.emailNotFound = false;
        }, 3000);
      } else {
        this.unknownError = true;
        setTimeout(() => {
          this.unknownError = false;
        }, 3000);
      }
        console.log('Error: ', error);
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  router = inject(Router);
  username: string = '';
  password: string = '';

  submitLogin() {
      this.authService.login({username: this.username, password: this.password}).subscribe(response => {
        this.dialog.closeAll();
        // this.router.navigate(['/admin']);
      });
  } 
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  username: string = '';
  password: string = '';

  login() {
      this.authService.login({username: this.username, password: this.password}).subscribe(response => {
          console.log(response.username, "Logged in");
          this.dialog.closeAll();
      });
        
  }

}

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/auth/auth.service';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatDialogModule, NgIf, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  adminLoggedIn!: Observable<boolean>;
  
  constructor() {
    if (typeof window !== 'undefined' && typeof location !== 'undefined' && this.authService) {
      this.authService.tokenExpirationCheck();
      this.adminLoggedIn = this.authService.adminLoggedIn;
    }
  }
  
  toggleLoginModal() {
    this.dialog.open(LoginComponent);
  }
  
  logoutButton () { 
    this.authService.logout(); 
  }

}


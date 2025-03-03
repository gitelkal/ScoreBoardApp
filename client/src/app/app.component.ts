import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderComponent } from './shared/components/header/header.component';
import { AdminService } from './core/services/adminService/admin.service';
import { AuthService } from './core/services/auth/auth.service';
import { AdminCheckRequest } from './interfaces/admin-check-request';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [HeaderComponent, RouterOutlet, MatButtonModule, MatIconModule, MatToolbarModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'client';
  http = inject(HttpClient);

  constructor(private adminService: AdminService, private authService: AuthService) {}
   
  ngOnInit() {
    const username = this.authService.getUsername()?.toString();
    if (username) {
      const adminCheckRequest: AdminCheckRequest = { username };
      this.adminService.checkIfAdmin(adminCheckRequest).subscribe(() => {
        this.authService.isAdmin.next(true);
      });
  } else {
    this.authService.isAdmin.next(false);
  }
  }
}

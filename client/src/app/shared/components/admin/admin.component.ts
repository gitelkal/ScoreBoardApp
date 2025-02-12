import { AdminService } from '@app/core/services/AdminService/admin.service';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe ],
  providers: [AdminService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  adminService = inject(AdminService);
  
  getAllAdmins$ = this.adminService.getAllAdmins();

  constructor(private router: Router) {} // Injecta router för navigering

  handleAdminClick(admin: any) {
    console.log('Admin clicked:', admin);
    // Navigera till en admin-detaljsida
    this.router.navigate(['/admin', admin.adminID]);
  }
}

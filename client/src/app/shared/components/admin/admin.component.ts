import { AdminService } from '@app/core/services/AdminService/admin.service';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  providers: [AdminService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  adminService = inject(AdminService);
  getAllAdmins$ = this.adminService.getAllAdmins();
  router = inject(Router);

  // 🟢 Saknade variabler
  searchQuery: string = '';
  sortBy: string = 'name'; // Default sorteringsvärde
  admins: any[] = []; // Admin-lista

  constructor() {
    // Hämta alla admins och lagra i `admins`-arrayen
    this.adminService.getAllAdmins().subscribe((data) => {
      this.admins = data;
    });
  }

  handleAdminClick(admin: any) {
    console.log('Admin clicked:', admin);
    this.router.navigate(['/admin', admin.adminID]); // Navigera till admin-detaljsida
  }

  addNewAdmin() {
    console.log('Lägger till en ny admin!');
  }

  get sortedAdmins() {
    if (!this.filteredAdmins || this.filteredAdmins.length === 0) return [];

    return this.filteredAdmins.sort((a: any, b: any) => {
      if (!this.sortBy) return 0; // Om `sortBy` är null eller undefined

      if (this.sortBy === 'name') return a.firstname.localeCompare(b.firstname);
      if (this.sortBy === 'date') {
        return (
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );
      }
      return 0;
    });
  }

  get filteredAdmins() {
    return this.admins.filter((admin: any) =>
      (admin.firstname + ' ' + admin.lastname)
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );
  }
  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');

    // Spara i localStorage
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
  }

  // Lägg till detta i `ngOnInit()` så att Dark Mode aktiveras vid sidladdning
  ngOnInit() {
    if (localStorage.getItem('darkMode') === 'enabled') {
      document.documentElement.classList.add('dark');
    }
  }
}

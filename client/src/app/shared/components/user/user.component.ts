import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, NavigationEnd } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { UserService } from '@app/core/services/userService/user.service';
import { ScoreboardBasic } from '@app/shared/models/scoreboardBasic.model';
import { AdminService } from '@app/core/services/adminService/admin.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { Teams } from '@app/shared/models/teams.models';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit, OnDestroy {
  userService = inject(UserService);
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  router = inject(Router);

  isAdmin: boolean = false;
  userID: number = 0;
  username: string = '';
  firstname: string = '';
  lastname: string = '';
  userScoreboards: ScoreboardBasic[] = [];
  userTeams: Teams[] = [];

  private routeSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;
  private scoreboardsSubscription: Subscription | undefined;
  private teamsSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('userID');
      this.userID = Number(id);
      this.loadUser();
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.scoreboardsSubscription?.unsubscribe();
    this.teamsSubscription?.unsubscribe();
  }

  loadUser() {
    this.userSubscription = this.userService.getOneUser(this.userID).subscribe({
      next: (response) => {
        this.firstname = response.firstname;
        this.lastname = response.lastname;
        this.username = response.username;
        this.checkAdminStatus(response.username);
      }
    });

    this.scoreboardsSubscription = this.userService.getUserScoreboards(this.userID).subscribe({
      next: (response) => {
        this.userScoreboards = response;
      }
    });

    this.teamsSubscription = this.userService.getUserTeams(this.userID).subscribe({
      next: (response) => {
        this.userTeams = response;
      }
    });
  }

  checkAdminStatus(username: string) {
    this.adminService.checkIfAdmin({ username }).subscribe(response => {
      this.isAdmin = response.success;
      console.log("Is admin:", this.isAdmin);
    });
  }
}

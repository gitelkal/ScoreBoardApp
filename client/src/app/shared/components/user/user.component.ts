import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Users } from '@app/shared/models/users.model';
import { BehaviorSubject, switchMap } from 'rxjs';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { UserService } from '@app/core/services/userService/user.service';
import { ScoreboardBasic } from '@app/shared/models/scoreboardBasic.model';
import { RouterLink } from '@angular/router';
import { AdminService } from '@app/core/services/adminService/admin.service';
import { response } from 'express';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor, RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  userService = inject(UserService);
  adminService = inject(AdminService);
  userSubject = new BehaviorSubject<Users | null>(null);
  getOneUser$ = this.userSubject.asObservable();
  isAdmin: boolean = false;
  userScoreboards: ScoreboardBasic[] = [];
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.loadInitialUser();
    this.loadUserScoreboards();
  }

  loadInitialUser() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('userID');
        return this.userService.getOneUser(id!);
      })
    ).subscribe(userResponse => {
      console.log("User response:", userResponse); 
      this.userSubject.next(userResponse);
      this.checkAdminStatus(userResponse.username)
    });
  }

  checkAdminStatus(username: string) {
    this.adminService.checkIfAdmin({username: username}).subscribe(response => {
      this.isAdmin = response.success;
      console.log("Is admin:", this.isAdmin);
    });
  }

  loadUserScoreboards() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('userID');
        return this.userService.getUserScoreboards(id!);
      })
    ).subscribe(userScoreboardsResponse => {
      console.log(userScoreboardsResponse);
      this.userScoreboards = userScoreboardsResponse;
    });
  }

}

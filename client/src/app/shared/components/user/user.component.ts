import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Users } from '@app/shared/models/users.model';
import { BehaviorSubject, switchMap } from 'rxjs';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { UserService } from '@app/core/services/userService/user.service';
import { ScoreboardBasic } from '@app/shared/models/scoreboardBasic.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor, RouterLink],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  userService = inject(UserService);
  userSubject = new BehaviorSubject<Users | null>(null);
  getOneUser$ = this.userSubject.asObservable();


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
      this.userSubject.next(userResponse);
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

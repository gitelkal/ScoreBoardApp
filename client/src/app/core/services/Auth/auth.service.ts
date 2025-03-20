import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { LoginRequest } from '@app/interfaces/login-request';
import { AuthResponse } from '@app/interfaces/auth-response';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../userService/user.service';
import { AdminService } from '../adminService/admin.service';
import { RegisterRequest } from '@app/interfaces/register-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string;
  private readonly tokenKey = 'token';
  isAdmin = new BehaviorSubject<boolean>(false); 
  loggedIn = new BehaviorSubject<boolean>(false); 
  tokenExpirationDateTime: Date = new Date();
  timeUntilExpiration:number = 0;
  userID: number = 0;
  username: string = '';
  firstname: string = '';
  lastname: string = '';
  errorMessage: string = '';
  authService: any;

  constructor(private apiService: ApiService, private http: HttpClient, private userService: UserService, private adminService: AdminService) {
    this.api = this.apiService.api;
    this.tokenExpirationCheck();
  }
  
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/account/login`, data).pipe(
      map((response: AuthResponse) => {
        if (response.token) localStorage.setItem(this.tokenKey, response.token);
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + response.tokenExpiration);
        localStorage.setItem('tokenExpiration', expirationDate.toISOString());
        localStorage.setItem('username', response.username);
        localStorage.setItem('userID', response.id.toString());
        this.loggedIn.next(true);
        console.log(response.username, "Logged in", this.loggedIn);
        this.userID = response.id;
        this.username = response.username;
        this.firstname = response.firstname;
        this.lastname = response.lastname;
        if (response.admin) {
          this.isAdmin.next(true);
        }
        return response;
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.errorMessage = error.error;
        }
        return throwError(error);
      })
    );
  }

  createNewUser(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.api}/account/register`, data).pipe(
      map((response: any) => {
        this.login({ username: data.username, password: data.password }).subscribe();
        return response;
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/account/forgot-password`, { email });
  }

  resetPassword(Email: string, Token: string, NewPassword: string): Observable<any> {
    return this.http.post(`${this.api}/account/reset-password`, { Email, Token, NewPassword });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('username');
    localStorage.removeItem('userID');
    this.isAdmin.next(false);
    this.loggedIn.next(false);
    this.userID = 0;
    this.username = '';
    this.firstname = '';
    this.lastname = '';
  }

  tokenExpirationCheck() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    let token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.loggedIn.next(true);
      this.userID = parseInt(localStorage.getItem('userID')!);
      this.loadUserData();
    }
    setInterval(() => {
      let expirationTime = localStorage.getItem('tokenExpiration');
      if (expirationTime) {
        this.timeUntilExpiration = (new Date(expirationTime).getTime() - new Date().getTime()) / 1000;
        console.log(this.timeUntilExpiration);
      } 
      if (this.timeUntilExpiration < 4000 && this.timeUntilExpiration > 3000) {
        console.log("Token kommer att gå ut om cirka 1 timme");
      } else if (this.timeUntilExpiration <= 0) {
        console.log("Token har utgått");
        this.logout();
      }
    }, 360000); // 1 timme
  }
  
  private loadUserData() {
    this.userService.getOneUser(this.getUserID()).then((response: { firstname: string; lastname: string; username: string }) => {
      this.firstname = response.firstname;
      this.lastname = response.lastname;
      this.username = response.username;
      this.adminService.checkIfAdmin({ username: this.getUsername() }).subscribe((response: { success: boolean }) => {
        if (response.success) {
          this.isAdmin.next(true);
        }
      });
    });
  }

  getUserID() {
    return this.userID;
  }

  getUsername() {
    return this.username;
  }

  getFirstname() {
    return this.firstname;
  }

  getLastname() {
    return this.lastname;
  }
}

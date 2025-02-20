import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { LoginRequest } from '@app/interfaces/login-request';
import { AuthResponse } from '@app/interfaces/auth-response';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string;
  private readonly tokenKey = 'token';
  adminLoggedIn = new BehaviorSubject<boolean>(false); 
  tokenExpirationDateTime: Date = new Date();
  timeUntilExpiration:number = 0;

  constructor(private apiService: ApiService, private http: HttpClient) {
    this.api = this.apiService.api;
  }
  login(data:LoginRequest):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
      map((response: AuthResponse) => {
        if (response.token) localStorage.setItem(this.tokenKey, response.token);
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + response.tokenExpiration);
        localStorage.setItem('tokenExpiration', expirationDate.toISOString());
        this.adminLoggedIn.next(true);
        console.log(response.username, "Logged in", this.adminLoggedIn);
        return response;
      })
    );    
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('tokenExpiration');
    this.adminLoggedIn.next(false);
  }

  tokenExpirationCheck() {
    let token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.adminLoggedIn.next(true);
    }
    let expirationTime = localStorage.getItem('tokenExpiration');
    if (expirationTime) {
      this.timeUntilExpiration = (new Date(expirationTime).getTime() - new Date().getTime()) / 1000;
    } 
    setInterval(() => {
      if (expirationTime) {
        this.timeUntilExpiration = (new Date(expirationTime).getTime() - new Date().getTime()) / 1000;
      } 
      if (this.timeUntilExpiration < 4000 || this.timeUntilExpiration > 3000) {
        console.log("Token kommer att gå ut om cirka 1 timme");
      } else if (this.timeUntilExpiration <= 0) {
        console.log("Token har utgått");
        this.logout();
      }
    },360000); // 1 timme
  }
}

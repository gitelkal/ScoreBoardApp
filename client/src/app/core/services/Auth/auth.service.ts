import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { LoginRequest } from '@app/interfaces/login-request';
import { AuthResponse } from '@app/interfaces/auth-response';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string;
  private tokenKey = 'token';


  constructor(private apiService: ApiService, private http: HttpClient) {
    this.api = this.apiService.api;
  }
  login(data:LoginRequest):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
      map((response: AuthResponse) => {
        if (response.token) localStorage.setItem(this.tokenKey, response.token);
        return response;
      })
    );


  }
}

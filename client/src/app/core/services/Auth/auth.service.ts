import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api: string;


  constructor(private apiService: ApiService) {
    this.api = this.apiService.api;
  }
}

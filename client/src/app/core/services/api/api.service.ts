import { Injectable } from '@angular/core';

export const API_URL = 'https://localhost:7062/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public api = API_URL;

  constructor() { }
}
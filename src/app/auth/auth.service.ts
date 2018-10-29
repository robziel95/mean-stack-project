import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data-model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  createUser(email: string, password: string){
    const authData: AuthData = {email: email, password: password}
    this.http.post("http://localhost:3000/api/user/signup", authData).subscribe(
      response=>{
        console.log(response);
      }
    );
  }

  login(email: string, password: string){
    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string}>("http://localhost:3000/api/user/login", authData).subscribe(
      response => {
        const loginToken = response.token;
        this.token = loginToken;
        if(loginToken){
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.router.navigate(['/']);
        }

      }
    );
  }

  getToken() {
    return this.token;
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getAuthStatusListener(){
    //asObservable - allows to emit only from service, not from anywhere else
    return this.authStatusListener.asObservable();
  }

  logout(){
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
  }
}

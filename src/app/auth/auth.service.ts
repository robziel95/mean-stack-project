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
  private tokenTimer: any;
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
    this.http.post<{token: string, expiresIn: number}>("http://localhost:3000/api/user/login", authData).subscribe(
      response => {
        const loginToken = response.token;
        this.token = loginToken;
        if(loginToken){
          const expiresInDuration = response.expiresIn * 1000;//convert to seconds
          this.setAuthTimer(expiresInDuration);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration);

          this.isAuthenticated = true;
          this.authStatusListener.next(true);

          this.saveAuthData(loginToken, expirationDate)
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

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if (!authInformation){
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if(expiresIn > 0){
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn);//expiresIn is in iliseconds and Auth timer works with seconds
      this.authStatusListener.next(true);
    }
  }

  logout(){
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number){
    console.log("timer duration: " + duration);
    this.tokenTimer = setTimeout(
      () => {
        this.logout();
      }, duration
    );
  }

  private saveAuthData(token: string, expirationDate: Date){
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
  }

  private getAuthData(){
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if(!token && expirationDate){
      return;
    }
    return{
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }
}

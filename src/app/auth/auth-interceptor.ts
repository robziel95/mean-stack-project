import { HttpInterceptor, HttpRequest, HttpHandler } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

//interceptor can modify any outgoing http requrest for example to attach token to it
//Intercept has to receive two arguments, incoming request, and outgoing next request which allows to leave the incercept

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService){}

  intercept(req: HttpRequest<any>, next: HttpHandler){
    //get token
    const authToken = this.authService.getToken();
    //clone authorisation request and edit it to pass token with its header
    const authRequest = req.clone({
      //set ads new header to existing headers
      headers: req.headers.set('Authorization', "Bearer " + authToken)
    });
    //return modified request in the form of "Bearer 'token' "
    return next.handle(authRequest);
  }
}

import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog){}

  intercept(req: HttpRequest<any>, next: HttpHandler){
    //change response observable stream
    return next.handle(req).pipe(
      //handle error in stream
      catchError(
        (error: HttpErrorResponse) => {
          let errorMessage = "An unknown error occured!";
          if(error.error.message){
            errorMessage = error.error.message;
          }
          //error handling
          this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
          //throw error
          return throwError(error);
        }
      )
    );
  }
}

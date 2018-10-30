import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  message = "An unknown error occured"

  //We use inject to identify data we pass, bcoz of the way error component is created
  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}){}

  ngOnInit() {
  }

}

/*
 * Anarchy, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-service';
import { Case } from './models/case';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public cases: Case[];

  constructor(private httpService: HttpService) {}

  ngOnInit() {
    this.httpService.cases_GetOpen({}).subscribe(res => {
      this.cases = res;
    });
  }
}

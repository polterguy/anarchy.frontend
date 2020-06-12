/*
 * Anarchy, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

import { Component, OnInit } from '@angular/core';
import { CaseSlim } from 'src/app/models/case-slim';
import { PublicService } from 'src/app/services/http/public.service';
import { RegionsModel } from 'src/app/models/regions-model';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public cases: CaseSlim[] = [];
  private more: boolean;
  public regions: RegionsModel = null;
  public canCreateCase = false;

  constructor(
    private httpService: PublicService,
    private jwtHelper: JwtHelperService) {}

  ngOnInit() {
    this.httpService.getOpenCases().subscribe(res => {
      this.cases = res;
      this.more = res !== null && res.length === 25;
    });
    if (this.isLoggedIn()) {
      this.httpService.getMyRegions().subscribe(res => {
        this.regions = res;
      });
      this.httpService.canCreateCase('norge').subscribe(res => {
        this.canCreateCase = res.result === 'SUCCESS';
      });
    }
  }

  getMore() {
    this.httpService.getOpenCases(this.cases[this.cases.length - 1].id).subscribe(res => {
      this.more = res && res.length === 25;
      this.cases = this.cases.concat(res);
    });
  }

  hasNoCases() {
    return !this.cases || this.cases.length === 0;
  }

  // Returns true if user is logged in, with a valid token, that's not expired.
  isLoggedIn() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      return false;
    }
    if (this.jwtHelper.isTokenExpired(token)) {
      return false;
    }
    return true;
  }
}

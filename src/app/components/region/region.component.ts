/*
 * AnarQ, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

/*
 * Common system imports.
 */
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/*
 * Custom imports for component.
 */
import { CaseSlim } from 'src/app/models/case-slim';
import { BaseComponent } from 'src/app/helpers/base.component';
import { PublicService } from 'src/app/services/http/public.service';
import { MessageService, Messages } from 'src/app/services/message.service';

/**
 * Component for viewing cases within a single region in the system.
 * Also allows you to create cases within the specified region, which
 * is found by parsing parameters passed into the component.
 */
@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.scss']
})
export class RegionComponent extends BaseComponent {

  private cases: CaseSlim[] = [];
  private more: boolean;
  private region: string = null;
  private canCreateCase = false;

  /**
   * Constructor for component.
   * 
   * @param service Service to retrieve data from server.
   * @param messages Message publishing/subscription bus service.
   * @param snack Snack bar required by base class to show errors.
   * @param route Activated route, used to figure out region user wants to retrieve items from.
   * @param router Router to allow us to redirect user to router links.
   */
  constructor(
    protected service: PublicService,
    protected messages: MessageService,
    protected snack: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router)
  {
    super(service, messages, snack);
  }

  /**
   * @inheritDoc
   * 
   * Implementation simply returns all open cases, which depends upon whether
   * or not the user is logged in or not.
   */
  protected init() {

    // We need to figure out which region we're in before we fetch items.
    this.route.params.subscribe(pars => {
      this.region = pars.region;
      this.getNextBatch();
    });

    // Checking if user can ask a question in current region.
    this.canAskQuestion();
  }

  /**
   * @inheritDoc
   * 
   * We are only interested in logging out and in of the system, since
   * that changes the cases the user should see, according to whether
   * or not he has previously voted for the case or not.
   * 
   * Psst, we only show cases the user has NOT voted for by default.
   */
  protected initSubscriptions() {

    /*
     * Making sure we subscribe to relevant messages.
     */
    return this.messages.getMessage().subscribe(msg => {

      switch (msg.name) {

        /*
         * Cases are dependent upon whether or not a user is logged in or not.
         * If the client is logged in, he will only see relevant cases, for his
         * regions, that he have still not voted for.
         * 
         * If client is not logged in, he will see all cases, but not be able
         * to vote for any of them.
         * Hence, we need to handle these two messages, and once raised, fetch
         * all cases again.
         */
        case Messages.APP_LOGGED_OUT:
          this.cases = [];
          this.getNextBatch();
          this.canAskQuestion();
          break;

        case Messages.APP_LOGGED_IN:
          this.cases = [];
          this.getNextBatch();
          this.canAskQuestion();
          break;
      }
    });
  }

  /**
   * Returns true if user is legally allowed to ask a question in
   * current region.
   */
  private canAskQuestion() {

    // Retrieving username first.
    const username = this.messages.getValue(Messages.APP_GET_USERNAME);

    // Figuring out if user is allowed to ask qustions in this region or not.
    this.route.params.subscribe(pars => {
      this.region = pars.region;
      if (username) {
        this.service.canCreateCase(this.region).subscribe(res => {
          this.canCreateCase = res.result === 'SUCCESS';
        });
      }
    });
  }

  /**
   * Returns next "batch" of cases relevant to the client.
   */
  private getNextBatch() {

    // Retrieving username, if any for currently authenticated client.
    const username = this.messages.getValue(Messages.APP_GET_USERNAME);

    // Retrieving next batch of open cases within region.
    this.service.getOpenCases(this.cases.length, this.region, username).subscribe(res => {
      this.more = res && res.length === 25;
      if (res) {
        this.cases = this.cases.concat(res);
      }
    });
  }

  /**
   * Returns a string representation of open cases,
   * counting positive versus negative votes for the case.
   * 
   * @param item Case item
   */
  private getCount(item: CaseSlim) {
    return item.positive + '/' + (item.votes - item.positive);
  }

  /**
   * Asks a question within the current region.
   */
  private askQuestion() {
    this.router.navigate(['/ask/' + this.region]);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';


@Component({
  selector: 'app-sites',
  templateUrl: './sites.page.html',
  styleUrls: ['./sites.page.scss'],
})
export class SitesPage implements OnInit {

  
  constructor(public loading: LoadingService, public router: Router) {
  }

  ngOnInit() {
  }

  mySites() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['my-sites']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  allSites() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['all-sites']).then(() => {
        this.loading.dismiss();
      });
    });
  }

}


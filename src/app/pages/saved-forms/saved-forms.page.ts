import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Platform } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-saved-forms',
  templateUrl: './saved-forms.page.html',
  styleUrls: ['./saved-forms.page.scss'],
})
export class SavedFormsPage implements OnInit {

  items = [];
  noForms = false;

  constructor(public loading: LoadingService, private router: Router, private storage: Storage, private platform: Platform, private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.chechStorage().then(() => {
      this.loading.dismiss();
    }).catch(err => {
      this.loading.dismiss();
    });
  }

  chechStorage() {
    return new Promise<void>((resolve, reject) => {
      this.loading.present('Fetching Saved Forms...').then(() => {
        this.storage.ready().then(() => {
          this.storage.forEach((value: any) => {
            if (value.date) {
              this.items.push(value);
              resolve();
            } else {
              resolve();
            }
          });
          console.log(this.items.length);
        });
      });
    });
  }

  open(item) {
    var reportUrl = item.report;
    if (reportUrl === 'Site Visit') {
      reportUrl = 'site-visit';
    } else if (reportUrl === 'Site Visit Gen') {
      reportUrl = 'site-visit-gen';
    } else if (reportUrl === 'Training Form') {
      reportUrl = 'training-form';
    } else if (reportUrl === 'Uniform Order') {
      reportUrl = 'uniform-order';
    } else if (reportUrl === 'Vehicle Inspection') {
      reportUrl = 'vehicle-inspection';
    } else if (reportUrl === 'Crime Incident Report') {
      reportUrl = 'crime-incident-report';
    } else if (reportUrl === 'Incident Notification') {
      reportUrl = 'incident-notification';
    } else if (reportUrl === 'Risk Assessment') {
      reportUrl = 'risk-assessment';
    } else if (reportUrl === 'Incident Report') {
      reportUrl = 'general-incident-report';
    } else if (reportUrl === 'Leave Application') {
      reportUrl = 'leave-application';
    } else if (reportUrl === 'Disciplinary Report') {
      reportUrl = 'disciplinary-report';
    } else if (reportUrl === 'Client Meeting') {
      reportUrl = 'meeting-report';
    } else if (reportUrl === 'Client Instruction') {
      reportUrl = 'client-instruction';
    } else if (reportUrl === 'OB Entry') {
      reportUrl = 'ob-entry';
    } else if (reportUrl === 'Tenant Survey') {
      reportUrl = 'tenant-visit';
    } else if (reportUrl === 'Transparency Report') {
      reportUrl = 'transparency-report';
    } else if (reportUrl === 'Employee Performance Evaluation Form') {
      reportUrl = 'emp-performance-form';
    } else if (reportUrl === 'NCR') {
      reportUrl = 'ncr';
    } else if (reportUrl === 'appeal') {
      reportUrl = 'appeal'
    }
   
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`${reportUrl}/${item.key}`]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Saved Forms',
        screen_class: 'SavedFormsPage'
      });
    })
  }

}


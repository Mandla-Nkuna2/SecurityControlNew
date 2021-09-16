import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertController } from '@ionic/angular';
import { PdfService } from 'src/app/services/pdf.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  form = { key: '' };
  site = { key: '' };

  siteId;
  companyId;
  userKey;
  reportTypeCollection: AngularFirestoreCollection<any>;
  reportTypes: Observable<any[]>;
  reportCollection: AngularFirestoreCollection<any>;
  reports: Observable<any[]>;
  siteCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  deleteForms: boolean = true;
  formValue: boolean = true;
  snapValue: boolean = false;
  selectedForm = 'sitevisits';
  data;

  constructor(public router: Router, private pdfService: PdfService, public loading: LoadingService, private storage: Storage,
    private afs: AngularFirestore, public toast: ToastService, public alertCtrl: AlertController) { }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      if (user.companyId) {
        this.userKey = user.key;
        this.companyId = user.companyId;
        if (user.key) {
          var id = user.key;
        }
        this.siteCollection = this.afs.collection(`sites`, ref => ref.where('companyId', '==', this.companyId).orderBy('name'));
        this.sites = this.siteCollection.valueChanges();
      }
    });
  }

  view(report) {
    var reportUrl = report.report;
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
    } else if (reportUrl === 'PnP Site Visit') {
      reportUrl = 'pnp-visit';
    } else if (reportUrl === 'AR Site Visit') {
      reportUrl = 'ar-site-visit';
    } else if (reportUrl === 'AOD') {
      reportUrl = 'aod';
    } else if (reportUrl === 'Employee form') {
      reportUrl = 'emp-performance-form';
    } else if (reportUrl === 'NCR') {
      reportUrl = 'ncr';
    }

    this.data = { key: report.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`${reportUrl}/view`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  getForms(form) {
    if (this.form.key === 'SITE') {
      this.selectedForm = 'sitevisits';
    } else if (this.form.key === 'GEN SITE') {
      this.selectedForm = 'visits';
    } else if (this.form.key === 'TRAINING FORM') {
      this.selectedForm = 'trainings';
    } else if (this.form.key === 'UNIFORM ORDER') {
      this.selectedForm = 'uniforms';
    } else if (this.form.key === 'VEHICLE INSPECTION') {
      this.selectedForm = 'vehicles';
    } else if (this.form.key === 'CRIME INCIDENT REPORT') {
      this.selectedForm = 'incidents';
    } else if (this.form.key === 'INCIDENT NOTIFICATION') {
      this.selectedForm = 'notifications';
    } else if (this.form.key === 'RISK ASSESSMENT') {
      this.selectedForm = 'assessments';
    } else if (this.form.key === 'GENERAL INCIDENT REPORT') {
      this.selectedForm = 'genIncidents';
    } else if (this.form.key === 'LEAVE APPLICATION') {
      this.selectedForm = 'leaveApps';
    } else if (this.form.key === 'DISCIPLINARY REPORT') {
      this.selectedForm = 'disciplinarys';
    } else if (this.form.key === 'MEETING REPORT') {
      this.selectedForm = 'meetings';
    } else if (this.form.key === 'CLIENT INSTRUCTION') {
      this.selectedForm = 'instructions';
    } else if (this.form.key === 'OB ENTRY') {
      this.selectedForm = 'obs';
    } else if (this.form.key === 'TENANT VISIT') {
      this.selectedForm = 'tenant';
    } else if (this.form.key === 'TRANSPARENCY REPORT') {
      this.selectedForm = 'transparencys';
    } else if (this.form.key === 'PNP') {
      this.selectedForm = 'pnpvisit';
    } else if (this.form.key === 'AR') {
      this.selectedForm = 'arVisits';
    } else if (this.form.key === 'ACKNOWLEDGEMENT OF DEBT') {
      this.selectedForm = 'aod';
    } else if (this.form.key === 'EMPLOYEE PERFORMANCE EVALUATION FORM') {
      this.selectedForm = 'evaluations';
    } else if (this.form.key === 'NON-CONFORMANCE FORM') {
      this.selectedForm = 'ncrs';
    }

    this.downloadForms();
  }

  downloadForms() {
    if (this.site.key !== '') {
      const key = this.site.key + '';
      this.reportCollection = this.afs.collection(this.selectedForm, ref =>
        ref.where('companyId', '==', this.companyId).where('siteKey', '==', key).orderBy('date', 'desc')
          .orderBy('time', 'desc').limit(25));
      this.reports = this.reportCollection.valueChanges();
      this.reports.subscribe(snapshot => {
        if (snapshot.length === 0) {
          this.formValue = false;
        } else {
          this.formValue = true;
        }
      });
    } else {
      this.reportCollection = this.afs.collection(this.selectedForm, ref =>
        ref.where('companyId', '==', this.companyId).orderBy('date', 'desc').limit(25));
      this.reports = this.reportCollection.valueChanges();
      this.reports.subscribe(snapshot => {
        if (snapshot.length === 0) {
          this.formValue = false;
        } else {
          this.formValue = true;
        }
      });
    }
  }

}




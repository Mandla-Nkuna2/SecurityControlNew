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

  constructor(public pdfservice: PdfService, public router: Router, private pdfService: PdfService, public loading: LoadingService, private storage: Storage,
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
    var selectURL = ''
    if (reportUrl === 'Site Visit') {
      selectURL = 'site-visit';
    } else if (reportUrl === 'Site Visit Gen') {
      selectURL = 'site-visit-gen';
    } else if (reportUrl === 'Training Form') {
      selectURL = 'training-form';
    } else if (reportUrl === 'Uniform Order') {
      selectURL = 'uniform-order';
    } else if (reportUrl === 'Vehicle Inspection') {
      selectURL = 'vehicle-inspection';
    } else if (reportUrl === 'Crime Incident Report') {
      selectURL = 'crime-incident-report';
    } else if (reportUrl === 'Incident Notification') {
      selectURL = 'incident-notification';
    } else if (reportUrl === 'Risk Assessment') {
      selectURL = 'risk-assessment';
    } else if (reportUrl === 'Incident Report') {
      selectURL = 'general-incident-report';
    } else if (reportUrl === 'Leave Application') {
      selectURL = 'leave-application';
    } else if (reportUrl === 'Disciplinary Report') {
      selectURL = 'disciplinary-report';
    } else if (reportUrl === 'Client Meeting') {
      selectURL = 'meeting-report';
    } else if (reportUrl === 'Client Instruction') {
      selectURL = 'client-instruction';
    } else if (reportUrl === 'OB Entry') {
      selectURL = 'ob-entry';
    } else if (reportUrl === 'Tenant Survey') {
      selectURL = 'tenant-visit';
    } else if (reportUrl === 'Transparency Report') {
      selectURL = 'transparency-report';
    } else if (reportUrl === 'PnP Site Visit') {
      selectURL = 'pnp-visit';
    } else if (reportUrl === 'AR Site Visit') {
      selectURL = 'ar-site-visit';
    } else if (reportUrl === 'AOD') {
      selectURL = 'aod';
    } else if (reportUrl === 'Employee form') {
      selectURL = 'emp-performance-form';
    } else if (reportUrl === 'NCR') {
      selectURL = 'ncr';
    }
    else {
      this.afs.firestore.collection(this.selectedForm).doc(report.key).get().then((page: any) => {
        this.pdfService.download(page.data())
      })
    }

    this.data = { key: report.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };

    if (selectURL != '') {
      this.loading.present('Opening Please Wait...').then(() => {
        this.router.navigate([`${selectURL}/view`], navigationExtras).then(() => {
          this.loading.dismiss();
        });
      });
    }
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
    else if (this.form.key === 'APPEAL FORM') {
      this.selectedForm = 'appealForms';
    }
    else if (this.form.key === 'FENCE INSPECTION') {
      this.selectedForm = 'fenceInspection';
    }
    else if (this.form.key === 'GRIEVANCE FORM') {
      this.selectedForm = 'grievance';
    }
    else if (this.form.key === 'PERFORMANCE APPRAISAL') {
      this.selectedForm = 'performanceAppraisal';
    }
    else if (this.form.key === 'GAS EXPLOSION') {
      this.selectedForm = 'explosion';
    }
    else if (this.form.key === 'THEFT REPORT') {
      this.selectedForm = 'theft';
    }
    else if (this.form.key === 'FIRE REPORT') {
      this.selectedForm = 'fire';
    }
    else if (this.form.key === 'TEMPERATURE REPORT') {
      this.selectedForm = 'temperatureList';
    }
    else if (this.form.key === 'PLOYGRAPH FORM') {
      this.selectedForm = 'polygraph';
    }
    else if (this.form.key === 'PAY-QUERY') {
      this.selectedForm = 'payQuery';
    }
    else if (this.form.key === 'EXTINGUISHER CHECKLIST') {
      this.selectedForm = 'extinguisher';
    }
    else if (this.form.key === 'RESIGNATION FORM') {
      this.selectedForm = 'resign';
    }
    else if (this.form.key === 'INJURY REPORT') {
      this.selectedForm = 'injury';
    }
    this.downloadForms();
  }

  downloadForms() {
    if (this.site.key !== '') {
      const key = this.site.key + '';
      this.reportCollection = this.afs.collection(this.selectedForm, ref =>
        ref.where('companyId', '==', this.companyId).where('siteKey', '==', key).orderBy('date', 'desc')
          .orderBy('time', 'desc').limit(50));
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
        ref.where('companyId', '==', this.companyId).orderBy('date', 'desc').limit(50));
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




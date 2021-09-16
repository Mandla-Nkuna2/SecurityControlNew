import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-view-user-reports',
  templateUrl: './view-user-reports.page.html',
  styleUrls: ['./view-user-reports.page.scss'],
})
export class ViewUserReportsPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  reportCollection: AngularFirestoreCollection<any>;
  reports: Observable<any[]>;

  normal: boolean = true;
  formValue: boolean;
  cert1_pdf;
  report;
  params;
  data;

  constructor(public toast: ToastService, public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService,
    public activatedRoute: ActivatedRoute, public router: Router, public PdfService: PdfService) {
    this.report = 'visit';
  }

  ngOnInit() {
    this.getUrlData().then(() => {
      this.user = this.data;
    });
  }

  getUrlData() {
    return new Promise<any>((resolve, reject) => {
      this.activatedRoute.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.data = this.router.getCurrentNavigation().extras.state.data;
          resolve(this.data);
        }
      });
    });
  }

  loadReports(report) {
    console.log(report);
    if (report === 'LEAVE APPLICATIONS') {
      var selectedForm = 'leaveApps';
      this.normal = false;
    }
    if (report === 'DISCIPLINARY REPORTS') {
      var selectedForm = 'disciplinarys';
      this.normal = false;
    }
    if (report === 'CRIME INCIDENT REPORTS') {
      var selectedForm = 'incidents';
      this.normal = true;
    }
    if (report === 'GENERAL INCIDENT REPORTS') {
      var selectedForm = 'genIncidents';
      this.normal = true;
    }
    if (report.report === 'MEETING MINUTES') {
      var selectedForm = 'meetings';
      this.normal = true;
    }
    if (report.report === 'AR SITE VISITS') {
      var selectedForm = 'arVisits';
      this.normal = false;
    }
    if (report.report === 'TRANSPARENCY REPORTS') {
      var selectedForm = 'transparency';
      this.normal = true;
    }
    if (report.report === 'SITE VISIT REPORTS') {
      var selectedForm = 'sitevisits';
      this.normal = true;
    }
    if (report.report === 'UNIFORM ORDERS') {
      var selectedForm = 'uniforms';
      this.normal = false;
    }
    if (report.report === 'TRAINING FORMS') {
      var selectedForm = 'trainings';
      this.normal = false;
    }
    if (report.report === 'TENANT VISITS') {
      var selectedForm = 'tenant';
      this.normal = true;
    }
    if (report.report === 'VEHICLE INSPECTIONS') {
      var selectedForm = 'vehicles';
      this.normal = false;
    }
    if (report.report === 'RISK ASSESSMENTS') {
      var selectedForm = 'assessments';
      this.normal = true;
    }
    if (report.report === 'INCIDENT NOTIFICATIONS') {
      var selectedForm = 'notifications';
      this.normal = true;
    }
    if (report.report === 'CLIENT INSTRUCTIONS') {
      var selectedForm = 'instructions';
      this.normal = true;
    }
    this.reportCollection = this.afs.collection(selectedForm, ref =>
      ref.where('userKey', '==', this.user.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.reports = this.reportCollection.valueChanges();
    this.reports.subscribe(snapshot => {
      if (snapshot.length === 0) {
        this.formValue = false;
      } else {
        this.formValue = true;
      }
    });
  }

  download(report) {
    if (report.report === 'Leave Application') {
      var form = 'leaveApps';
    }
    if (report.report === 'Disciplinary Report') {
      var form = 'disciplinary';
    }
    if (report.report === 'Crime Incident Report' || report.report === 'Incident Report') {
      var form = 'incidents';
    }
    if (report.report === 'Client Meeting') {
      var form = 'meeting';
    }
    if (report.report === 'Client Meeting') {
      var form = 'meeting';
    }
    if (report.report === 'AR Site Visit') {
      var form = 'arvisits';
    }
    if (report.report === 'Transparency Report') {
      var form = 'transparency';
    }
    if (report.report === 'Site Visit' || report.report === 'Site Visit Gen') {
      var form = 'sitevisits';
    }
    if (report.report === 'Uniform Order') {
      var form = 'uniform';
    }
    if (report.report === 'Training Form') {
      var form = 'training';
    }
    if (report.report === 'Tenant Survey') {
      var form = 'tenants';
    }
    if (report.report === 'Vehicle Inspection') {
      var form = 'vehicle';
    }
    if (report.report === 'Risk Assessment') {
      var form = 'assessments';
    }
    if (report.report === 'Incident Notification') {
      var form = 'notifications';
    }
    if (report.report === 'Client Instruction') {
      var form = 'instruction';
    }
    this.PdfService.download(form);
  }

  async deleteReport(report) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Report?',
      message: `Are you sure you want to delete this ${report.report}?`,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Delete',
          handler: data => {
            this.loading.present('Deleting Please Wait...');
            setTimeout(() => {
              this.loading.dismiss();
            }, 10000);
            if (report.report === 'Site Visit') {
              var form = 'sitevisits';
            }
            if (report.report === 'Site Visit Gen') {
              var form = 'visits';
            }
            if (report.report === 'AR Site Visit') {
              var form = 'arVisits';
            }
            if (report.report === 'Client Meeting') {
              var form = 'meetings';
            }
            if (report.report === 'Disciplinary Report') {
              var form = 'disciplinarys';
            }
            if (report.report === 'Crime Incident Report') {
              var form = 'incidents';
            }
            if (report.report === 'Incident Report') {
              var form = 'genIncidents';
            }
            if (report.report === 'Leave Application') {
              var form = 'leaveApps';
            }
            if (report.report === 'training Form') {
              var form = 'trainings';
            }
            if (report.report === 'Transparency Report') {
              var form = 'transparencys';
            }
            if (report.report === 'Uniform Order') {
              var form = 'uniforms';
            }
            if (report.report === 'Tenant Survey') {
              var form = 'tenant';
            }
            if (report.report === 'Vehicle Inspection') {
              var form = 'vehicles';
            }
            if (report.report === 'Risk Assessment') {
              var form = 'assessments';
            }
            if (report.report === 'Incident Notification') {
              var form = 'notifications';
            }
            if (report.report === 'Client Instruction') {
              var form = 'instruction';
            }
            this.afs.collection(form).doc(report.key).delete().then(() => {
              this.toast.show(`${report.report} Successfully Deleted!`);
              this.loading.dismiss();
            });
          }
        }
      ]
    });
    prompt.present();
  }
}

/*

loadReports() {
    this.visitsCollection = this.afs.collection('sitevisits', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.visits = this.visitsCollection.valueChanges();

    this.visitgensCollection = this.afs.collection('visits', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.visitGens = this.visitgensCollection.valueChanges();

    this.incidentsCollection = this.afs.collection('genIncidents', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.incidents = this.incidentsCollection.valueChanges();

    this.crimesCollection = this.afs.collection('incidents', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.crimes = this.crimesCollection.valueChanges();

    this.uniformsCollection = this.afs.collection('uniforms', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.uniforms = this.uniformsCollection.valueChanges();

    this.trainingsCollection = this.afs.collection('trainings', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.trainings = this.trainingsCollection.valueChanges();

    this.transCollection = this.afs.collection('transparencys', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.transparencys = this.transCollection.valueChanges();

    this.disciplinarysCollection = this.afs.collection('disciplinarys', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.disciplinarys = this.disciplinarysCollection.valueChanges();

    this.leaveCollection = this.afs.collection('leaveApps', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.leaveApps = this.leaveCollection.valueChanges();

    this.arvisitsCollection = this.afs.collection('arVisits', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.arvisits = this.arvisitsCollection.valueChanges();

    this.meetingsCollection = this.afs.collection('meetings', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.meetings = this.meetingsCollection.valueChanges();

    this.vehiclesCollection = this.afs.collection('vehicles', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.vehicles = this.vehiclesCollection.valueChanges();

    this.assessmentsCollection = this.afs.collection('assessments', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.assessments = this.assessmentsCollection.valueChanges();

    this.instructionsCollection = this.afs.collection('instructions', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.instructions = this.instructionsCollection.valueChanges();

    this.notificationsCollection = this.afs.collection('notifications', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.notifications = this.notificationsCollection.valueChanges();

    this.tenantsCollection = this.afs.collection('tenant', ref => ref.where('userKey', '==', this.user.key)
    .orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
    this.tenants = this.tenantsCollection.valueChanges();
  }

  download(report) {
    if (report.report === 'Leave Application') {
      var form = 'leaveApps';
    }
    if (report.report === 'Disciplinary Report') {
      var form = 'disciplinary';
    }
    if (report.report === 'Crime Incident Report' || report.report === 'Incident Report') {
      var form = 'incidents';
    }
    if (report.report === 'Client Meeting') {
      var form = 'meeting';
    }
    if (report.report === 'Client Meeting') {
      var form = 'meeting';
    }
    if (report.report === 'AR Site Visit') {
      var form = 'arvisits';
    }
    if (report.report === 'Transparency Report') {
      var form = 'transparency';
    }
    if (report.report === 'Site Visit' || report.report === 'Site Visit Gen') {
      var form = 'sitevisits';
    }
    if (report.report === 'Uniform Order') {
      var form = 'uniform';
    }
    if (report.report === 'Training Form') {
      var form = 'training';
    }
    if (report.report === 'Tenant Survey') {
      var form = 'tenants';
    }
    if (report.report === 'Vehicle Inspection') {
      var form = 'vehicle';
    }
    if (report.report === 'Risk Assessment') {
      var form = 'assessments';
    }
    if (report.report === 'Incident Notification') {
      var form = 'notifications';
    }
    if (report.report === 'Client Instruction') {
      var form = 'instruction';
    }
    this.PdfService.download(form);
  }

  async deleteReport(report) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Report?',
      message: `Are you sure you want to delete this ${report.report}?`,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Delete',
          handler: data => {
            this.loading.present('Deleting Please Wait...');
            setTimeout(() => {
              this.loading.dismiss();
            }, 10000);
            if (report.report === 'Site Visit') {
              var form = 'sitevisits';
            }
            if (report.report === 'Site Visit Gen') {
              var form = 'visits';
            }
            if (report.report === 'AR Site Visit') {
              var form = 'arVisits';
            }
            if (report.report === 'Client Meeting') {
              var form = 'meetings';
            }
            if (report.report === 'Disciplinary Report') {
              var form = 'disciplinarys';
            }
            if (report.report === 'Crime Incident Report') {
              var form = 'incidents';
            }
            if (report.report === 'Incident Report') {
              var form = 'genIncidents';
            }
            if (report.report === 'Leave Application') {
              var form = 'leaveApps';
            }
            if (report.report === 'Training Form') {
              var form = 'trainings';
            }
            if (report.report === 'Transparency Report') {
              var form = 'transparencys';
            }
            if (report.report === 'Uniform Order') {
              var form = 'uniforms';
            }
            if (report.report === 'Tenant Survey') {
              var form = 'tenant';
            }
            if (report.report === 'Vehicle Inspection') {
              var form = 'vehicles';
            }
            if (report.report === 'Risk Assessment') {
              var form = 'assessments';
            }
            if (report.report === 'Incident Notification') {
              var form = 'notifications';
            }
            if (report.report === 'Client Instruction') {
              var form = 'instruction';
            }
            this.afs.collection(form).doc(report.key).delete().then(() => {
              this.toast.show(`${report.report} Successfully Deleted!`);
              this.loading.dismiss();
            });
          }
        }
      ]
    });
    prompt.present();
  }
}

*/


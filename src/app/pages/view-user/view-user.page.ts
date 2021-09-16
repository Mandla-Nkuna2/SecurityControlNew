import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.page.html',
  styleUrls: ['./view-user.page.scss'],
})
export class ViewUserPage implements OnInit {

  userSite = {
    name: '', siteKey: '', key: '',
  };

  site = {
    key: '', name: '', client: '', address: '', contact: '', email: '', lastVisit: '', visitBy: '', issues: '', visitKey: '',
    companyId: '', lat: null, lng: null, dayShift: false, nightShift: false, noonShift: false,
  };

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDelete: AngularFirestoreCollection<any>;
  delete: Observable<any[]>;
  params;

  reportCollection: AngularFirestoreCollection<any>;
  reports: Observable<any[]>;
  report = 'SITE VISIT REPORTS';
  normal = true;
  userValue = false;
  formValue: boolean;

  id;
  data;
  passedForm;

  constructor(public toast: ToastService, public loadingCtrl: LoadingController, public alertCtrl: AlertController,
    public modalCtrl: ModalController, private afs: AngularFirestore, public navCtrl: NavController, private platform: Platform,
    public router: Router, public loading: LoadingService, public activatedRoute: ActivatedRoute, private storage: Storage,
    public PdfService: PdfService) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.getKey().then(() => {
        this.getUser().then(() => {
          this.sitesCollection = this.afs.collection(`users/${this.user.key}/sites`, ref => ref.orderBy('name'));
          this.sites = this.sitesCollection.valueChanges();
          if (this.user.companyId === '0qbfVjnyuKE8EAdenn3T') {
            this.reportCollection = this.afs.collection('sitevisits', ref => ref.where('userKey', '==', this.user.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
            this.reports = this.reportCollection.valueChanges();
            this.normal = true;
            this.formValue = true;
          } else {
            this.reportCollection = this.afs.collection('visits', ref => ref.where('userKey', '==', this.user.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
            this.reports = this.reportCollection.valueChanges();
            this.normal = true;
            this.formValue = true;
          }
        });
      });
    });
  }

  async getKey() {
    this.id = await this.activatedRoute.snapshot.paramMap.get('id');
  }

  async getUser() {
    return new Promise<any>((resolve, reject) => {
      this.afs.collection('users').doc(this.id).ref.get().then((user) => {
        this.data = user.data();
        if (this.data) {
          resolve(true);
          return this.user = this.data;
        }
      }).catch(err => {
        reject();
        alert('Error: ' + err);
      });
    });
  }

  edit(user) {
    this.data = { key: user.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`add-user/edit`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  view(site) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/view-site', site.key]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async remove(site) {
    this.loading.present('Removing Please Wait...');
    const numKey = site.key + '';
    let prompt = await this.alertCtrl.create({
      header: `Remove Site?`,
      message: `Are you sure you want to remove ${site.name} from ${this.user.name}?`,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            this.loading.dismiss();
          }
        },
        {
          text: 'Remove',
          handler: data => {
            this.afs.collection(`users/${this.user.key}/sites`).doc(numKey).delete().then(() => {
              this.toast.show(`${site.name} Successfully Removed from ${this.user.name}!`);
              this.loading.dismiss();
            });
          }
        }
      ]
    });
    this.loading.dismiss();
    prompt.present();
  }

  loadReports(report) {
    if (report === 'LEAVE APPLICATIONS') {
      var selectedForm = 'leaveApps';
      this.normal = false;
      this.userValue = false;
    }
    if (report === 'DISCIPLINARY REPORTS') {
      var selectedForm = 'disciplinarys';
      this.normal = false;
      this.userValue = false;
    }
    if (report === 'CRIME INCIDENT REPORTS') {
      var selectedForm = 'incidents';
      this.normal = true;
      this.userValue = false;
    }
    if (report === 'GENERAL INCIDENT REPORTS') {
      var selectedForm = 'genIncidents';
      this.normal = true;
      this.userValue = true;
    }
    if (report === 'MEETING MINUTES') {
      var selectedForm = 'meetings';
      this.normal = true;
      this.userValue = true;
    }
    if (report === 'AR SITE VISITS') {
      var selectedForm = 'arVisits';
      this.normal = false;
      this.userValue = false;
    }
    if (report === 'TRANSPARENCY REPORTS') {
      var selectedForm = 'transparency';
      this.normal = true;
      this.userValue = false;
    }
    if (report === 'SITE VISIT REPORTS') {
      var selectedForm = 'sitevisits';
      this.normal = true;
      this.userValue = false;
    }  
    if (report === 'GENERAL SITE VISIT REPORTS') {
      var selectedForm = 'visits';
      this.normal = true;
      this.userValue = false;
    }
    if (report === 'UNIFORM ORDERS') {
      var selectedForm = 'uniforms';
      this.normal = false;
      this.userValue = false;
    }
    if (report === 'TRAINING FORMS') {
      var selectedForm = 'trainings';
      this.normal = false;
      this.userValue = false;
    }
    if (report === 'TENANT VISITS') {
      var selectedForm = 'tenant';
      this.normal = true;
      this.userValue = true;
    }
    if (report === 'VEHICLE INSPECTIONS') {
      var selectedForm = 'vehicles';
      this.normal = false;
      this.userValue = false;
    }
    if (report === 'RISK ASSESSMENTS') {
      var selectedForm = 'assessments';
      this.normal = true;
      this.userValue = false;
    }
    if (report === 'INCIDENT NOTIFICATIONS') {
      var selectedForm = 'notifications';
      this.normal = true;
      this.userValue = true;
    }
    if (report === 'CLIENT INSTRUCTIONS') {
      var selectedForm = 'instructions';
      this.normal = true;
      this.userValue = true;
    }
    console.log(selectedForm);
    this.reportCollection = this.afs.collection(selectedForm, ref => ref.where('userKey', '==', this.user.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
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
    if (report.report === 'Site Visit') {
      var form = 'sitevisits';
    }
    if (report.report === 'Site Visit Gen') {
      var form = 'visits';
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
    this.PdfService.download(report);
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

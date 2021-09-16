import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-view-site',
  templateUrl: './view-site.page.html',
  styleUrls: ['./view-site.page.scss'],
})
export class ViewSitePage implements OnInit {

  site = {
    key: '', name: '', client: '', address: '', contact: '', email: '', lastVisit: Date, visitBy: '', issues: '',
    visitKey: '', recipient: '',
  };

  user = {
    key: '', type: '', companyId: '', siteId: '',
  };

  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  removeGuard;
  reportCollection: AngularFirestoreCollection<any>;
  reports: Observable<any[]>;
  report = 'SITE VISIT REPORTS';
  normal = true;
  formValue: boolean;
  id;
  data;

  viewstaff: boolean = true;
  viewreport: boolean = true;
  userValue = false;

  permission: boolean = false;

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public toast: ToastService,
    private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService, public router: Router,
    private storage: Storage, public activatedRoute: ActivatedRoute, private platform: Platform, public PdfService: PdfService) {
  }

  async ngOnInit() {
    await this.platform.ready();
    this.storage.get('user').then(async (user) => {
      this.user.key = user.key;
      this.user.type = user.type;
      this.user.companyId = user.companyId;
      if (this.user.type === 'Owner') {
        this.permission = true;
      }
      await this.getSiteKey().then(() => {
        this.getSite().then(() => {
          this.guardsCollection = this.afs.collection(`guards`, ref => ref.where('siteId', '==', this.site.key).orderBy('name'));
          this.guards = this.guardsCollection.valueChanges();
          if (this.user.companyId === '0qbfVjnyuKE8EAdenn3T') {
            this.reportCollection = this.afs.collection('sitevisits', ref => ref.where('siteKey', '==', this.site.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
            this.reports = this.reportCollection.valueChanges();
            this.normal = true;
            this.formValue = true;
          } else {
            this.reportCollection = this.afs.collection('visits', ref => ref.where('siteKey', '==', this.site.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
            this.reports = this.reportCollection.valueChanges();
            this.normal = true;
            this.formValue = true;
          }
        });
      });
    });
  }

  async getSiteKey() {
    this.id = await this.activatedRoute.snapshot.paramMap.get('id');
  }

  getSite() {
    return new Promise<any>((resolve, reject) => {
      this.storage.get('user').then((user) => {
        var key = user.key;
        this.afs.collection('sites').doc(this.id).ref.get().then((site) => {
          this.data = site.data();
          if (this.data) {
            resolve(true);
            return this.site = this.data;
          }
        }).catch(err => {
          reject();
          alert('Error: ' + err);
        });
      });
    });
  }

  edit(site) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`add-site/${site.key}`]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async deleteSite(site) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Site',
      message: `Are you sure you want to delete site: ${site.name}?`,
      cssClass: 'alert',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'DELETE',
          handler: () => {
            this.loading.present('Deleting Please Wait...').then(() => {
              this.afs.collection('sites').doc(site.key).delete().then(() => {
                this.afs.collection(`users/${this.user.key}/sites`).doc(this.site.key).delete().then(() => {
                  this.router.navigate(['/sites']).then(() => {
                    this.loading.dismiss().then(() => {
                      this.toast.show('Site Successfully Deleted!');
                    });
                  });
                });
              });
            });
          }
        }
      ]
    });
    return await prompt.present();
  }

  viewStaff() {
    if (this.viewstaff === false) {
      this.viewstaff = true;
    } else {
      this.viewstaff = false;
    }
  }

  viewReport() {
    if (this.viewreport === false) {
      this.viewreport = true;
    } else {
      this.viewreport = false;
    }
  }

  add(site) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/add-guard-to-site', site.key]);
      this.loading.dismiss();
    });
  }

  async delete(guard) {
    this.removeGuard = {
      siteId: ''
    };
    let prompt = await this.alertCtrl.create({
      header: 'Remove Staff Member?',
      message: `Are you sure you want to remove ${guard.name} from ${this.site.name}?`,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Remove',
          handler: data => {
            this.loading.present('Removing Please Wait...').then(() => {
              this.afs.collection(`guards`).doc(guard.Key).update(this.removeGuard).then(() => {
                this.toast.show(`Staff Member: ${guard.name} Successfully Removed from ${this.site.name}!`);
                this.loading.dismiss();
              });
            });
          }
        }
      ]
    });
    return await prompt.present();
  }

  view(guard) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/view-guard', guard.Key]).then(() => {
        this.loading.dismiss();
      });
    });
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
    if (selectedForm === 'vehicles') {
      this.reportCollection = this.afs.collection(selectedForm, ref => ref.where('companyId', '==', this.user.companyId).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
      this.reports = this.reportCollection.valueChanges();
      this.reports.subscribe(snapshot => {
        if (snapshot.length === 0) {
          this.formValue = false;
        } else {
          this.formValue = true;
        }
      });
    } else {
      this.reportCollection = this.afs.collection(selectedForm, ref => ref.where('siteKey', '==', this.site.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(20));
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


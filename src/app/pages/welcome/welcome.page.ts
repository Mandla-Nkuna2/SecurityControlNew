import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EditMyAccountPage } from '../edit-my-account/edit-my-account.page';
import { AddNewsPage } from '../add-news/add-news.page';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})

export class WelcomePage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  company = {
    name: '', address: '', country: '', lat: '', lng: '', vat: '', contact: null, email: '', rep: '', logo: '', key: '',
    sites: null, workDays: null, companyLeave: null, visit: '', visitUser: false, visitClient: '', meeting: '', meetingUser: false,
    meetingClient: '', uniform: '', uniformUser: false, uniformClient: '', incident: '', incidentUser: false, incidentClient: '',
    vehicle: '', vehicleUser: false, vehicleClient: '', disciplinary: '', disciplinaryUser: false, disciplinaryClient: '',
    training: '', trainingUser: false, trainingClient: '', transparency: '', transparencyUser: false, transparencyClient: '',
    ec: '', ecUser: false, ecClient: '', incidentGen: '', incidentGenUser: false, incidentGenClient: '', leave: '', leaveUser: false,
    leaveClient: '', arVisit: '', arVisitUser: false, arVisitClient: '', ob: '', obUser: false, obClient: '', assessment: '',
    assessmentUser: false, assessmentClient: '', tenant: '', tenantUser: false, tenantClient: '', instruction: '',
    instructionUser: false, instructionClient: '', notification: '', notificationUser: false, notificationClient: '',
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  newsCollection: AngularFirestoreCollection<any>;
  news: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  companys: Observable<any[]>;
  versionCollection: AngularFirestoreCollection<any>;
  versions: Observable<any[]>;
  expDate;
  logoUpload: boolean = true;
  logo;
  update;
  currentVersion: number;
  updateVersion: number;
  versionUpdate;

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, private storage: Storage,
    private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService, public router: Router,
    private auth: AuthenticationService, public modalCtrl: ModalController, private platform: Platform, private analyticsService: AnalyticsService) { }


  ngOnInit() {
    //   this.afs.firestore.collection('guards').get().then((gu) => {
    //     gu.forEach((staff) => {
    //       // console.log( Array.isArray(staff.data().siteId) )

    //       if ( staff.data().name == 'AA TEST' ){

    //         // console.log(staff.data());

    //       // console.log( typeof staff.data().siteId === 'object')
    //       // console.log(  staff.data().siteId == null )
    //       // console.log(  Array.isArray( staff.data().siteId) )
    //       console.log(typeof staff.data().siteId === 'object' && staff.data().siteId !== null && !Array.isArray(staff.data().siteId))
    //       if (typeof staff.data().siteId === 'object' && staff.data().siteId !== null && !Array.isArray(staff.data().siteId))
    //        { 

    //         console.log('you again', staff.data());

    //          let nn = staff.data()
    //          nn.site = nn.siteId.name
    //          nn.siteId = nn.siteId.key
    //          console.log(nn);

    //          this.afs.collection('guards').doc(nn.Key).set(nn).then(()=> console.log('donne '))

    //        }
    //       }

    // })
    //   })

    if (window.innerWidth < 500) {
      setTimeout(() => {
        this.router.navigate(['forms']);
      }, 500);
    } else {
      this.storage.get('user').then((user) => {
        this.usersCollection = this.afs.collection('users', ref => ref.where('key', '==', user.key));
        this.users = this.usersCollection.snapshotChanges().pipe(map(changes => {
          return changes.map((a: any) => {
            const info = a.payload.doc.data() as any;
            const key = a.payload.doc.id;
            return { key, ...info };
          });
        }));
        this.users.subscribe(users => {
          users.forEach(user => {
            this.user.name = user.name;
            this.user.company = user.company;
            this.user.contact = user.contact;
            this.user.companyId = user.companyId;
            this.currentVersion = user.version;
            if (user.version === undefined) {
              this.currentVersion = 0;
              this.checkForUpdate();
            }
            else {
              this.checkForUpdate();
            }
            if (this.user.companyId) {
              this.fetchLogo();
            }
            this.user.email = user.email;
            this.user.type = user.type;
            this.user.key = user.key;
            this.user.endDate = user.endDate;
            this.user.trial = user.trial;
            this.user.permission = user.permission;

            this.newsCollection = this.afs.collection(`news`, ref => ref.orderBy('timeStamp', 'desc').limit(6));
            this.news = this.newsCollection.valueChanges();

            var newDate = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
            var a = moment(user.endDate);
            var b = moment(newDate);
            this.expDate = a.diff(b, 'days') // =1

          });
        });
      });
    }
  }

  async checkForUpdate() {
    this.versionCollection = this.afs.collection('Version');
    this.versions = this.versionCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data() as any;
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.versions.subscribe(versions => {
      versions.forEach(async version => {
        if (version.console !== undefined) {
          this.updateVersion = version.console;
          if (this.currentVersion < this.updateVersion) {
            this.versionUpdate = {
              version: this.updateVersion
            };
            let prompt = await this.alertCtrl.create({
              header: 'Update Available',
              message: `Please update to the latest version: ${this.updateVersion}`,
              buttons: [
                {
                  text: 'UPDATE',
                  handler: data => {
                    this.loading.present('Updating...');
                    this.afs.collection('users').doc(this.user.key).update(this.versionUpdate).then(() => {
                      this.loading.dismiss();
                      location.reload();
                    });
                  }
                }
              ]
            });
            return await prompt.present();
          }
        }
      });
    });
  }

  logOut() {
    this.loading.present('Logging Out...').then(() => {
      return this.auth.logout().then(() => {
        return this.loading.dismiss();
      });
    });
  }

  async fetchLogo() {
    this.companyCollection = this.afs.collection('companies', ref => ref.where('key', '==', `${this.user.companyId}`));
    this.companys = this.companyCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.companys.subscribe(companys => {
      companys.forEach(async company => {
        this.company.key = company.key;
        this.company.logo = company.logo;
        if (this.user.type === 'Owner' || this.user.type === 'Account Admin') {
          if (company.logo !== undefined && company.logo !== '') {
            this.logoUpload = true;
            this.logo = company.logo;
          }
          else {
            this.logoUpload = false;
            let alert = await this.alertCtrl.create({
              header: 'Upload Company Logo',
              message: `You haven't uploaded a Company Logo Yet!`,
              buttons: [
                {
                  text: 'UPLOAD NOW',
                  handler: async data => {
                    this.loading.present('Opening Please Wait...');
                    setTimeout(() => {
                      this.loading.dismiss();
                    }, 10000);
                    const modal = await this.modalCtrl.create({
                      component: EditMyAccountPage,
                      componentProps: { user: this.user }
                    });
                    return await modal.present().then(() => {
                      this.loading.dismiss();
                    }).catch(async err => {
                      this.loading.dismiss();
                      let prompt = await this.alertCtrl.create({
                        header: 'Error',
                        message: err,
                        buttons: [
                          {
                            text: 'OK',
                            handler: data => {
                            }
                          }
                        ]
                      });
                      return await prompt.present();
                    });
                  }
                },
                {
                  text: 'CANCEL',
                  handler: data => {
                  }
                }
              ]
            });
            return await alert.present();
          }
        }
      });
    });
  }

  async addNews() {
    this.loading.present('Opening Please Wait...');
    const modal = await this.modalCtrl.create({
      component: AddNewsPage
    });
    modal.present().then(() => {
      this.loading.dismiss();
    }).catch(async err => {
      this.loading.dismiss();
      let prompt = await this.alertCtrl.create({
        header: 'Error',
        message: err,
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      return await prompt.present();
    });
  }

  sites() {
    this.router.navigate(['view-user', this.user.key]).then(() => {
    });
  }

  clients() {
    this.router.navigate(['clients']);
  }

  clientUsers() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['client-users']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async editUser() {
    const modal = await this.modalCtrl.create({
      component: EditMyAccountPage,
      componentProps: { user: this.user }
    });
    return await modal.present();
  }

  async support() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/support']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async bugs() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/bugs']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async fleet() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['fleet']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Welcome',
        screen_class: 'WelcomePage'
      });
    })
  }

}

/*

 async logout() {
    this.loading.present('Logging Out...');
    this.navCtrl.setRoot('login').then(() => {
      firebase.auth().signOut().then(() => {
        this.loading.dismiss()
      }).catch(async err => {
        this.loading.dismiss();
        let prompt = await this.alertCtrl.create({
          header: 'Error',
          message: err,
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            }
          ]
        });
        prompt.present();
      })
    }).catch(async err => {
      this.loading.dismiss();
      let prompt = await this.alertCtrl.create({
        header: 'Error',
        message: err,
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      return await prompt.present();
    })
  }

  */


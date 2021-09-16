import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';

import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-tenant-visit',
  templateUrl: './tenant-visit.page.html',
  styleUrls: ['./tenant-visit.page.scss'],
})
export class TenantVisitPage implements OnInit {

  tenant = {
    key: '',
    recipient: '',
    userKey: '',
    siteKey: '',
    site: '',
    companyId: '',
    userEmail: '',
    company: '',
    logo: '',
    user: '',
    date: '',
    time: '',
    timeStamp: '',
    report: '',
    name: '',
    rep: '',
    cctv: '',
    working: '',
    alarms: '',
    aworking: '',
    tested: '',
    rating: '',
    comments: '',
    sigUser: '',
    sigClient: '',
    lat: 0,
    lng: 0,
    acc: 0,
    clientEmail: '',
    companyEmail: '',
    emailUser: true,
    emailClient: '',
    emailtoClient: '',
    by: '',
    action: '',
    panic: '',
    procedures: '',
    safes: '',
    hasp: '',
    locks: '',
    security: ''
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  update;

  siteValue: boolean = true;
  tenantValue: boolean = true;
  repValue: boolean = true;
  cctvValue: boolean = true;
  workingValue: boolean = true;
  alarmsValue: boolean = true;
  aworkingValue: boolean = true;
  testedValue: boolean = true;
  ratingValue: boolean = true;
  commentsValue: boolean = true;
  locksValue: boolean = true;
  haspValue: boolean = true;
  safesValue: boolean = true;
  proceduresValue: boolean = true;
  panicValue: boolean = true;
  securityValue: boolean = true;


  sigValue: boolean = true;
  sig2Value: boolean = true;
  emailOption: boolean;
  emailValue: boolean = true;
  isApp: boolean;
  sitesValues: boolean;
  
  
  history: boolean = false;
  data;
  id;
  view: boolean = false;
  passedForm;

  saved = false;

  public formData: any;

  
 


  constructor( public popoverController: PopoverController, public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController, public alertCtrl: AlertController,
    public navCtrl: NavController, private storage: Storage, public loading: LoadingService,
    public router: Router, public activatedRoute: ActivatedRoute, public PdfService: PdfService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            var id = user.key;
            this.displayUser(id);
            this.searchSites(id);
          }
          this.getLocation();
          this.tenant.key = UUID.UUID();
          this.tenant.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.tenant.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.tenant.timeStamp = this.tenant.date + ' at ' + this.tenant.time;
          this.tenant.report = 'Tenant Survey';

          if ((!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'))) {
            this.isApp = true;
          }
          else {
            this.isApp = false;
          }
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('tenant').doc(this.data.key).ref.get().then((tenant) => {
          this.passedForm = tenant.data();
          if (this.passedForm) {
            this.tenant = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((tenant) => {
        this.tenant = tenant;
        this.saved = true;
      });
    }
  }
role;

    
  async openPOP(mm: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        items: mm
      },
      translucent: true,
    });

    await popover.present();
    this.role = await popover.onDidDismiss();

    this.tenant[`${this.role.data.for}`] = this.role.data.out
  }



  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.tenant.user = user.name;
      this.tenant.userKey = user.key;
      this.tenant.userEmail = user.email;
      this.tenant.company = user.company;
      this.tenant.companyId = user.companyId;
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().tenant !== '' && company.data().tenant !== undefined) {
          this.tenant.companyEmail = company.data().tenant;
          console.log(this.tenant.companyEmail);
        }
      });
      if (user.logo !== undefined) {
        this.tenant.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.tenant.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      this.tenant.lat = position.coords.latitude;
      this.tenant.lng = position.coords.longitude;
      this.tenant.acc = position.coords.accuracy;
      console.log(position.coords.accuracy);
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

  searchSites(id) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.getSites(id).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
        this.sitesValues = true;
      });
    }
  }

  getSites(id) {
    this.sitesCollection = this.afs.collection(`users/${id}/sites`, ref => ref.orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
  }

  async exit() {
    let prompt = await this.alertCtrl.create({
      header: 'Exit Form',
      message: 'Are you sure you want to Exit?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'EXIT',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    return await prompt.present();
  }

  applicable(tenant) {
    if (tenant.cctv === 'NO') {
      this.tenant.working = 'NOT APPLICABLE';
    }
    if (tenant.alarms === 'NO') {
      this.tenant.aworking = 'NOT APPLICABLE';
      this.tenant.tested = 'NOT APPLICABLE';
    }
  }

  async alertMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      cssClass: 'alert',
      message: "Please Note ALL fields marked with an '*' must be filled in to submit the form!",
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

  getSiteDetails(tenant) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', tenant.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.tenant.site = site.name;
        if (site.recipient) {
          this.tenant.recipient = site.recipient;
        }
        this.tenant.siteKey = site.key;
        if (site.email !== undefined) {
          this.tenant.clientEmail = site.email;
        }
      });
    });
  }

  check(tenant) {
    if (this.tenant.siteKey !== undefined && this.tenant.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.tenant.name !== '') {
      this.tenantValue = true;
    } else {
      this.tenantValue = false;
    }
    if (this.tenant.rep !== '') {
      this.repValue = true;
    } else {
      this.repValue = false;
    }
    if (this.tenant.locks !== '') {
      this.locksValue = true;
    } else {
      this.locksValue = false;
    }
    if (this.tenant.hasp !== '') {
      this.haspValue = true;
    } else {
      this.haspValue = false;
    }
    if (this.tenant.safes !== '') {
      this.safesValue = true;
    } else {
      this.safesValue = false;
    }
    if (this.tenant.procedures !== '') {
      this.proceduresValue = true;
    } else {
      this.proceduresValue = false;
    }
    if (this.tenant.panic !== '') {
      this.panicValue = true;
    } else {
      this.panicValue = false;
    }
    if (this.tenant.cctv !== '') {
      this.cctvValue = true;
    } else {
      this.cctvValue = false;
    }
    if (this.tenant.working !== '') {
      this.workingValue = true;
    } else {
      this.workingValue = false;
    }
    if (this.tenant.alarms !== '') {
      this.alarmsValue = true;
    } else {
      this.alarmsValue = false;
    }
    if (this.tenant.aworking !== '') {
      this.aworkingValue = true;
    } else {
      this.aworkingValue = false;
    }
    if (this.tenant.tested !== '') {
      this.testedValue = true;
    } else {
      this.testedValue = false;
    }
    if (this.tenant.security !== '') {
      this.securityValue = true;
    } else {
      this.securityValue = false;
    }
    if (this.tenant.rating !== '') {
      this.ratingValue = true;
    } else {
      this.ratingValue = false;
    }
    if (this.tenant.comments !== '') {
      this.commentsValue = true;
    } else {
      this.commentsValue = false;
    }
    if (this.tenant.sigUser !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    if (this.tenant.sigClient !== '') {
      this.sig2Value = true;
    } else {
      this.sig2Value = false;
    }
    this.send(tenant);
  }

  send(tenant) {
    if (this.tenant.siteKey !== undefined && this.tenant.siteKey !== '') {
      this.siteValue = true;

      if (this.tenant.name !== '') {
        this.tenantValue = true;

        if (this.tenant.rep !== '') {
          this.repValue = true;

          if (this.tenant.cctv !== '') {
            this.cctvValue = true;

            if (this.tenant.working !== '') {
              this.workingValue = true;

              if (this.tenant.alarms !== '') {
                this.alarmsValue = true;

                if (this.tenant.aworking !== '') {
                  this.aworkingValue = true;

                  if (this.tenant.tested !== '') {
                    this.testedValue = true;

                    if (this.tenant.rating !== '') {
                      this.ratingValue = true;

                      if (this.tenant.comments !== '') {
                        this.commentsValue = true;

                        if (this.tenant.sigUser !== '') {
                          this.sigValue = true;

                          if (!this.view) {
                            this.completeActionSheet();
                          } else {
                            this.viewActionSheet();
                          }

                        } else {
                          this.sigValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.commentsValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.ratingValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.testedValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.aworkingValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.alarmsValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.workingValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.cctvValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.repValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.tenantValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  save(tenant) {
    this.storage.set(this.tenant.key, this.tenant).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Tenant Visit Saved Successfully');
      });
    });
  }

  step2(tenant) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('tenant').doc(this.tenant.key).set(this.tenant).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Tenant Visit Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.tenant.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.tenant).then(() => {
      this.afs.collection('tenant').doc(this.tenant.key).set(this.tenant).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Report Sent Successfully!');
          });
        });
      });
    });
  }

  async completeActionSheet() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Options: ',
      cssClass: 'actionSheet',
      mode: 'ios',
      buttons: [
        {
          text: 'Submit and Exit',
          icon: 'paper-plane',
          cssClass: 'successAction',
          handler: () => {
            this.step2(this.tenant);
          }
        },
        {
          text: 'Download PDF Document',
          icon: 'download',
          cssClass: 'secondaryAction',
          handler: () => {
            this.downloadPdf();
          }
        },
        {
          text: 'Exit Inspection',
          icon: 'close',
          cssClass: 'dangerAction',
          handler: () => {
            this.exit();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }]
    });
    await actionSheet.present();
  }

  async viewActionSheet() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Options: ',
      cssClass: 'actionSheet',
      mode: 'ios',
      buttons: [
        {
          text: 'Download PDF Document',
          icon: 'download',
          cssClass: 'secondaryAction',
          handler: () => {
            this.PdfService.download(this.tenant);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.tenant);
          }
        },
        {
          text: 'Exit Inspection',
          icon: 'close',
          cssClass: 'dangerAction',
          handler: () => {
            this.exit();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }]
    });
    await actionSheet.present();
  }

  async delFunction(report) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Report',
      message: `Are you sure you want to Delete ${report.form}?`,
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
              this.afs.collection('tenant').doc(report.key).delete().then(() => {
                this.router.navigate(['/forms']).then(() => {
                  this.loading.dismiss().then(() => {
                    this.toast.show('Report Successfully Deleted!');
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

  async invalidActionSheet() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Incomplete Form!',
      mode: 'ios',
      cssClass: 'actionSheet',
      buttons: [
        {
          text: 'Save and Exit',
          icon: 'save',
          cssClass: 'successAction',
          handler: () => {
            this.save(this.tenant);
          }
        },
        {
          text: 'Delete',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delete();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          handler: () => {
          }
        }]
    });
    await actionSheet.present();
  }

}

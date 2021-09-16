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
  selector: 'app-incident-notification',
  templateUrl: './incident-notification.page.html',
  styleUrls: ['./incident-notification.page.scss'],
})
export class IncidentNotificationPage implements OnInit {

  notification = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', companyId: '', userEmail: '', company: '', logo: '', user: '',
    date: '', time: '', timeStamp: '', type: '', ob: '', incDate: '', incTime: '', description: '', to: '', by: '', report: '',
    sigUser: '', lat: 0, lng: 0, acc: 0, clientEmail: '', emailToClient: '', companyEmail: '', emailUser: true, emailClient: '',
  };
  role;

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  update;

  siteValue: boolean = true;
  dateValue: boolean = true;
  timeValue: boolean = true;
  obValue: boolean = true;
  typeValue: boolean = true;
  descriptionValue: boolean = true;
  byValue: boolean = true;
  toValue: boolean = true;
  sigValue: boolean = true;
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


  

  constructor( public popoverController:PopoverController,private platform: Platform, public geolocation: Geolocation, private afs: AngularFirestore, public toast: ToastService,
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, private activatedRoute: ActivatedRoute, public PdfService: PdfService,
    public actionCtrl: ActionSheetController) {
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
          this.notification.key = UUID.UUID();
          this.notification.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.notification.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.notification.timeStamp = this.notification.date + ' at ' + this.notification.time;
          this.notification.report = 'Incident Notification';

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
        this.afs.collection('notifications').doc(this.data.key).ref.get().then((notification) => {
          this.passedForm = notification.data();
          if (this.passedForm) {
            this.notification = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((notification) => {
        this.notification = notification;
        this.saved = true;
      });
    }
    if ((!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'))) {
      this.isApp = true;
    }
    else {
      this.isApp = false;
    }
  }

  
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

    this.notification[`${this.role.data.for}`] = this.role.data.out
  }


  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.notification.user = user.name;
      this.notification.userKey = user.key;
      this.notification.userEmail = user.email;
      this.notification.company = user.company;
      this.notification.companyId = user.companyId;
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().notification !== '' && company.data().notification !== undefined) {
          this.notification.companyEmail = company.data().notification;
          console.log(this.notification.companyEmail);
        }
      });
      if (user.logo !== undefined) {
        this.notification.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.notification.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.notification.lat = position.coords.latitude;
        this.notification.lng = position.coords.longitude;
        this.notification.acc = position.coords.accuracy;
        console.log(position.coords.accuracy);
      }
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
      }, 300);
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

  getSiteDetails(notification) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', notification.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.notification.site = site.name;
        this.notification.siteKey = site.key;
        if (site.recipient) {
          this.notification.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.notification.clientEmail = site.email;
        }
      });
    });
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

  downloadPdf() {
    this.PdfService.download(this.notification).then(() => {
      this.afs.collection('notifications').doc(this.notification.key).set(this.notification).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Notification Sent Successfully!');
          });
        });
      });
    });
  }

  formatDate() {
    this.notification.incDate = moment(this.notification.incDate).locale('en').format('YYYY/MM/DD');
    this.notification.incTime = moment(this.notification.incTime).locale('en').format('HH:mm');
  }

  check(notification) {
    this.formatDate();
    if (this.notification.siteKey !== undefined && this.notification.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.notification.incDate !== '' && this.notification.incDate !== undefined) {
      this.dateValue = true;
    } else {
      this.dateValue = false;
    }
    if (this.notification.incTime !== '' && this.notification.incTime !== undefined) {
      this.timeValue = true;
    } else {
      this.timeValue = false;
    }
    if (this.notification.ob !== '' && this.notification.ob !== undefined) {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.notification.type !== '' && this.notification.type !== undefined) {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.notification.description !== '' && this.notification.description !== undefined) {
      this.descriptionValue = true;
    } else {
      this.descriptionValue = false;
    }
    if (this.notification.to !== '' && this.notification.to !== undefined) {
      this.toValue = true;
    } else {
      this.toValue = false;
    }
    if (this.notification.by !== '' && this.notification.by !== undefined) {
      this.byValue = true;
    } else {
      this.byValue = false;
    }
    if (this.notification.sigUser !== '' && this.notification.sigUser !== undefined) {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.send(notification);
  }

  send(notification) {
    if (this.notification.siteKey !== undefined && this.notification.siteKey !== '') {
      this.siteValue = true;

      if (this.notification.incDate !== '' && this.notification.incDate !== undefined) {
        this.dateValue = true;

        if (this.notification.incTime !== '' && this.notification.incTime !== undefined) {
          this.timeValue = true;

          if (this.notification.ob !== '' && this.notification.ob !== undefined) {
            this.obValue = true;

            if (this.notification.type !== '' && this.notification.type !== undefined) {
              this.typeValue = true;

              if (this.notification.description !== '' && this.notification.description !== undefined) {
                this.descriptionValue = true;

                if (this.notification.to !== '' && this.notification.to !== undefined) {
                  this.toValue = true;

                  if (this.notification.by !== '' && this.notification.by !== undefined) {
                    this.byValue = true;

                    if (this.notification.sigUser !== '' && this.notification.sigUser !== undefined) {
                      this.sigValue = true;

                      if (this.notification.emailClient === 'User Choice') {

                        if (this.notification.emailToClient !== undefined && this.notification.emailToClient !== '') {
                          this.emailValue = true;

                          if (!this.view) {
                            this.completeActionSheet();
                          } else {
                            this.viewActionSheet();
                          }

                        } else {
                          this.emailValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        if (this.view === false) {
                          this.completeActionSheet();
                        } else {
                          this.viewActionSheet();
                        }
                      }
                    } else {
                      this.sigValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.byValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.toValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.descriptionValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.typeValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.obValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.timeValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.dateValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(notification) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('notifications').doc(this.notification.key).set(this.notification).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Notification Sent Successfully!');
          });
        });
      });
    });
  }

  save(notification) {
    this.storage.set(this.notification.key, this.notification).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Incident Notification Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.notification.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
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
            this.step2(this.notification);
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
            this.PdfService.download(this.notification);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.notification);
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
              this.afs.collection('notifications').doc(report.key).delete().then(() => {
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
            this.save(this.notification);
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


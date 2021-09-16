import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, IonContent, IonSlides, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-meeting-report',
  templateUrl: './meeting-report.page.html',
  styleUrls: ['./meeting-report.page.scss'],
})
export class MeetingReportPage implements OnInit {

  meeting = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', report: '', companyId: '', userEmail: '', clientEmail: '',
    emailToClient: '', company: '', logo: '', user: '', date: '', time: '', timeStamp: null, ob: '', client: '', attendees: '',
    apologies: '', prev: '', reason: '', minutes: '', sigUser: '', sigClient: '', lat: 0, lng: 0, acc: null, companyEmail: '',
    emailUser: true, emailClient: 'No',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  
  

  siteValue: boolean = true;
  obValue: boolean = true;
  clientValue: boolean = true;
  sitesValues: boolean = false;

  emailValue: boolean = true;
  reasonValue: boolean = true;
  minutesValue: boolean = true;
  sigValue: boolean = true;
  sig2Value: boolean = true;
  emailOption: boolean;
  tab: boolean;
  history: boolean = false;

  public formData: any;
  update;
  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  data;
  id;
  view: boolean = false;
  passedForm;

  saved = false;

    @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    minWidth: 2,
    backgroundColor: '#fffffe',
    penColor: '#000'
  };

  constructor(public popoverController:PopoverController,public platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController, public PdfService: PdfService,
    private storage: Storage, public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute,
    public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          const id = user.key;
          this.displayUser(id);
          this.getLocation();
          this.searchSites(id);
          this.meeting.key = UUID.UUID();
          this.meeting.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.meeting.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.meeting.report = 'Client Meeting';
          this.meeting.timeStamp = this.meeting.date + ' at ' + this.meeting.time;
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('meetings').doc(this.data.key).ref.get().then((meeting) => {
          this.passedForm = meeting.data();
          if (this.passedForm) {
            this.meeting = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((meeting) => {
        this.meeting = meeting;
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

    this.meeting[`${this.role.data.for}`] = this.role.data.out
  }


  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.meeting.user = user.name;
      this.meeting.company = user.company;
      this.meeting.userEmail = user.email;
      this.meeting.userKey = user.key;
      this.meeting.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.meeting.logo = user.logo;
      }
      if (user.logo === undefined) {
        this.meeting.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().meeting !== '' && company.data().meeting !== undefined) {
          this.meeting.companyEmail = company.data().meeting;
          console.log(this.meeting.companyEmail);
        }
      });
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.meeting.lat = position.coords.latitude;
        this.meeting.lng = position.coords.longitude;
        this.meeting.acc = position.coords.accuracy;
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

  async getSlideNumber() {
    this.slideNumber = await this.slides.getActiveIndex();
  }

  async prev() {
    this.nxtButton = true;
    this.slides.lockSwipes(false);
    this.getSlideNumber().then(() => {
      if (this.slideNumber === 1) {
        this.exitButton = true;
        this.prevButton = false;
      } else {
        this.prevButton = true;
        this.exitButton = false;
      }
      this.slides.slidePrev();
      this.content.scrollToTop().then(() => {
        this.slides.lockSwipes(true);
      });
    });
  }

  next() {
    this.getSlideNumber().then(() => {
      this.prevButton = true;
      this.exitButton = false;
      if (this.slideNumber > 0) {
        this.exitButton = false;
        this.prevButton = true;
      }
      this.slides.lockSwipes(false).then(() => {
        this.slides.slideNext().then(() => {
          this.content.scrollToTop().then(() => {
            this.slides.lockSwipes(true);
            if (this.slideNumber === 1) {
              this.nxtButton = false;
            }
          });
        });
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


  getSiteDetails(meeting) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', meeting.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data() as any;
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.meeting.site = site.name;
        this.meeting.siteKey = site.key;
        if (site.recipient) {
          this.meeting.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.meeting.clientEmail = site.email;
        }
      });
    });
  }

  save(meeting) {
    this.storage.set(this.meeting.key, this.meeting).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Meeting Form Saved Successfully!');
      });
    });
  }

  check(meeting) {
    if (this.meeting.siteKey !== undefined && this.meeting.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.meeting.ob !== undefined && this.meeting.ob !== '') {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.meeting.client !== undefined && this.meeting.client !== '') {
      this.clientValue = true;
    } else {
      this.clientValue = false;
    }
    if (this.meeting.reason !== undefined && this.meeting.reason !== '') {
      this.reasonValue = true;
    } else {
      this.reasonValue = false;
    }
    if (this.meeting.minutes !== undefined && this.meeting.minutes !== '') {
      this.minutesValue = true;
    } else {
      this.minutesValue = false;
    }
    this.send(meeting);
  }

  send(meeting) {
    if (this.meeting.siteKey !== undefined && this.meeting.siteKey !== '') {
      this.siteValue = true;

      if (this.meeting.ob !== undefined && this.meeting.ob !== '') {
        this.obValue = true;

        if (this.meeting.client !== undefined && this.meeting.client !== '') {
          this.clientValue = true;

          if (this.meeting.reason !== undefined && this.meeting.reason !== '') {
            this.reasonValue = true;

            if (this.meeting.minutes !== undefined && this.meeting.minutes !== '') {
              this.minutesValue = true;

              if (this.meeting.emailClient === 'User Choice') {

                if (this.meeting.emailToClient !== undefined && this.meeting.emailToClient !== '') {
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
              this.minutesValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.reasonValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.clientValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.obValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(meeting) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('meetings').doc(this.meeting.key).set(this.meeting).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Meeting Form Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.meeting.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.meeting).then(() => {
      this.afs.collection('meetings').doc(this.meeting.key).set(this.meeting).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Meeting Form Sent Successfully!');
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
            this.step2(this.meeting);
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
            this.PdfService.download(this.meeting);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.meeting);
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
              this.afs.collection('meetings').doc(report.key).delete().then(() => {
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
            this.save(this.meeting);
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




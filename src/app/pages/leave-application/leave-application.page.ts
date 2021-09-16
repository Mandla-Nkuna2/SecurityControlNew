import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, IonSlides, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-leave-application',
  templateUrl: './leave-application.page.html',
  styleUrls: ['./leave-application.page.scss'],
})
export class LeaveApplicationPage implements OnInit {

  leave = {
    key: '', recipient: '', userKey: '', companyId: '', userEmail: '', company: '', logo: '', user: '', date: '', time: '', timeStamp: '',
    report: '', site: '', siteKey: '', so: '', soKey: '', soCoNo: '', manSig: '', guardSig: '', type: '', available: 0, from: '', to: '',
    days: 0, photo: '', lat: 0, lng: 0, acc: 0, clientEmail: '', emailToClient: '', emailClient: '', companyEmail: '', emailUser: true,
    usedLeave: 0, accruedLeave: 0, daysWorked: 0, availableLeave: 0, remainingLeave: 0,
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;

  
  

  siteValue: boolean = true;
  soValue: boolean = true;
  typeValue: boolean = true;
  availableValue: boolean = true;
  fromValue: boolean = true;
  toValue: boolean = true;
  emailValue: boolean = true;
  sig1Value: boolean = true;
  sig2Value: boolean = true;
  update;
  annualLeave: number;
  sickLeave: number;
  familyLeave: number;
  isApp: boolean;
  slideNum;
  sitesValues: boolean = false;
  guardValues: boolean = false;
  history: boolean = false;

  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;

  emailOption: boolean;
  public formData: any;
  companyLeave: number;
  holidays;
  workDays;
  data;
  id;
  view: boolean = false;
  passedForm;
  saved = false;

  imageChangedEvent: any = '';

    @ViewChild('slides') slides: IonSlides;
  @ViewChild('picture') picture: ElementRef;
  @ViewChild('content') content: IonContent;

  signaturePadOptions: Object = {
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  constructor(public popoverController:PopoverController,public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    public alertCtrl: AlertController, private camera: Camera, public toast: ToastService, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public activatedRoute: ActivatedRoute, public router: Router, public PdfService: PdfService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
       this.isApp = this.platform.platforms().includes("cordova")

    console.log(this.isApp);
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            var id = user.key;
            this.displayUser(id);
            this.searchSites(id);
          }
          this.getLocation();
          this.leave.key = UUID.UUID();
          this.leave.timeStamp = this.leave.date + ' at ' + this.leave.time;
          this.leave.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.leave.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.leave.report = 'Leave Application';
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);

        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('leaveApps').doc(this.data.key).ref.get().then((leave) => {
          this.passedForm = leave.data();
          if (this.passedForm) {
            this.leave = this.passedForm;
            console.log(this.leave.date, this.leave.key);
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((leave) => {
        this.leave = leave;
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

    this.leave[`${this.role.data.for}`] = this.role.data.out
  }



  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.leave.lat = position.coords.latitude;
        this.leave.lng = position.coords.longitude;
        this.leave.acc = position.coords.accuracy;
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

  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.leave.user = user.name;
      this.leave.company = user.company;
      this.leave.userEmail = user.email;
      this.leave.userKey = user.key;
      this.leave.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.leave.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.leave.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      if (user.workDays !== undefined) {
        this.workDays = user.workDays;
      }
      if (user.companyLeave !== undefined) {
        this.companyLeave = user.companyLeave;
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().leave !== '' && company.data().leave !== undefined) {
          this.leave.companyEmail = company.data().leave;
          console.log(this.leave.companyEmail);
        }
      });
    });
  }

  searchSites(id) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...');
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
      message: "Are you sure you want to Exit?",
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
            if (this.slideNumber === 0) {
              this.nxtButton = false;
            }
          });
        });
      });
    });
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

  getSiteDetails(leave) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', leave.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.leave.site = site.name;
        this.leave.siteKey = site.key;
        if (site.recipient) {
          this.leave.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.leave.clientEmail = site.email;
        }
      });
    });
    this.Guards(leave);
  }

  Guards(leave) {
    if (!this.guardValues) {
      this.loading.present('Fetching Staff...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.getGuards(leave).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
      });
    }
  }

  getGuards(leave) {
    this.guardsCollection = this.afs.collection('guards', ref => ref.where('siteId', '==', leave.siteKey).orderBy('name'));
    return this.guards = this.guardsCollection.valueChanges();
  }

  guardDetails(leave) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', leave.soKey));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.leave.so = guard.name;
        if (guard.CoNo !== undefined) {
          this.leave.soCoNo = guard.CoNo;
        }
        this.leave.soKey = guard.Key;
        if (guard.workDays !== undefined) {
          this.leave.daysWorked = guard.workDays;
        }
        if (guard.annualAccrued !== undefined) {
          this.leave.accruedLeave = guard.annualAccrued;
        }
        if (guard.annualUsed !== undefined) {
          this.leave.usedLeave = guard.annualUsed;
        }
      });
    });
  }

  getAvailable(leave) {
    if (leave.type === 'ANNUAL LEAVE') {
      var monthsWorked = moment(new Date().toISOString()).locale('en').format('M');
      var numMonthsWorked = parseInt(monthsWorked);
      if (this.leave.daysWorked === 5) {
        this.leave.availableLeave = ((1.25 * numMonthsWorked) + (this.leave.accruedLeave * 1) - (this.leave.usedLeave * 1));
        this.leave.available = 1.25 * numMonthsWorked;
      }
      else if (this.leave.daysWorked === 6) {
        this.leave.availableLeave = ((1.5 * numMonthsWorked) + (this.leave.accruedLeave * 1) - (this.leave.usedLeave * 1));
        this.leave.available = 1.5 * numMonthsWorked;
      }
    }
    else {
      this.leave.availableLeave = null;
      this.leave.available = null;
      this.leave.accruedLeave = null;
      this.leave.usedLeave = null;
    }
  }

  daysCalc(leave) {
    if (this.workDays === 5) {
      this.leave.days = (<any>moment()).isoWeekdayCalc({
        rangeStart: `${leave.from}`,
        rangeEnd: `${leave.to}`,
        weekdays: [1, 2, 3, 4, 5],
        exclusions: ['9 Aug 2018', '24 Sep 2018', '17 Dec 2018', '25 Dec 2018', '26 Dec 2018']
      });
      if (leave.type === 'ANNUAL LEAVE') {
        this.leave.remainingLeave = (this.leave.availableLeave * 1) - (this.leave.days * 1);
      }
      else {
        this.leave.remainingLeave = null;
      }
    }
    if (this.workDays === 6) {
      this.leave.days = (<any>moment()).isoWeekdayCalc({
        rangeStart: `${leave.from}`,
        rangeEnd: `${leave.to}`,
        weekdays: [1, 2, 3, 4, 5, 6],
        exclusions: ['16 Jun 2018', '9 Aug 2018', '24 Sep 2018', '17 Dec 2018', '25 Dec 2018', '26 Dec 2018']
      });
      if (leave.type === 'ANNUAL LEAVE') {
        this.leave.remainingLeave = (this.leave.availableLeave * 1) - (this.leave.days * 1);
      }
      else {
        this.leave.remainingLeave = null;
      }
    }
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.leave.photo = event.base64;
  }

  async takePhoto() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage(useAlbum: boolean) {
    const options: CameraOptions = {
      quality: 90,
      targetWidth: 300,
      targetHeight: 300,
      allowEdit: false,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.leave.photo = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  formatDate() {
    this.leave.from = moment(this.leave.from).locale('en').format('YYYY/MM/DD');
    this.leave.to = moment(this.leave.to).locale('en').format('YYYY/MM/DD');
  }

  check(leave) {
    this.formatDate();
    if (this.leave.siteKey !== undefined && this.leave.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.leave.soKey !== undefined && this.leave.soKey !== '') {
      this.soValue = true;
    } else {
      this.soValue = false;
    }
    if (this.leave.type !== undefined && this.leave.type !== '') {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.leave.from !== undefined && this.leave.from !== '') {
      this.fromValue = true;
    } else {
      this.fromValue = false;
    }
    if (this.leave.to !== undefined && this.leave.to !== '') {
      this.toValue = true;
    } else {
      this.toValue = false;
    }
    this.send(leave);
  }

  send(leave) {
    if (this.leave.siteKey !== undefined && this.leave.siteKey !== '') {
      this.siteValue = true;

      if (this.leave.soKey !== undefined && this.leave.soKey !== '') {
        this.soValue = true;

        if (this.leave.type !== undefined && this.leave.type !== '') {
          this.typeValue = true;

          if (this.leave.from !== undefined && this.leave.from !== '') {
            this.fromValue = true;

            if (this.leave.to !== undefined && this.leave.to !== '') {
              this.toValue = true;

              if (this.leave.emailClient === 'User Choice') {

                if (this.leave.emailToClient !== undefined && this.leave.emailToClient !== '') {
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
              this.toValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.fromValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.typeValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.soValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(leave) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection(`leaveApps`).doc(this.leave.key).set(this.leave).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Leave App Sent Successfully!');
          });
        });
      });
    });
  }

  save(leave) {
    this.storage.set(this.leave.key, this.leave).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Leave App Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.leave.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.leave).then(() => {
      this.afs.collection('leaveApps').doc(this.leave.key).set(this.leave).then(() => {
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
            console.log(this.leave.to)
            this.step2(this.leave);
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
            this.PdfService.download(this.leave);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.leave);
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
              this.afs.collection('leaveApps').doc(report.key).delete().then(() => {
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
            this.save(this.leave);
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


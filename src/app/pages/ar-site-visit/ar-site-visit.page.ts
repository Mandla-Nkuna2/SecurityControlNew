import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, IonContent, IonSlides, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-ar-site-visit',
  templateUrl: './ar-site-visit.page.html',
  styleUrls: ['./ar-site-visit.page.scss'],
})
export class ArSiteVisitPage implements OnInit {

  visit = {
    key: '', recipient: '', report: '', siteKey: '', userKey: '', userEmail: '', site: '', companyId: '', company: '', logo: '',
    timeStamp: null, date: '', time: '', user: '', ob: '', so: '', soCoNo: '', soKey: '', photo: '', fence: '', volt: '', amp: '',
    panic: '', radio: '', incidents: '', description: '', action: '', signature: '', lat: 0, lng: 0, acc: 0, companyEmail: '',
    emailUser: true, emailClient: 'No', emailToClient: '', clientEmail: '', email: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  guardDetailsCollection: AngularFirestoreCollection<any>;
  guardDetails: Observable<any[]>;
  update;

  siteValue: boolean = true;
  obValue: boolean = true;
  soValue: boolean = true;
  photoValue: boolean = true;
  fenceValue: boolean = true;
  panicValue: boolean = true;
  radioValue: boolean = true;
  incidentsValue: boolean = true;
  sigValue: boolean = true;
  emailOption: boolean;
  emailValue: boolean = true;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  
  isApp: boolean;
  sitesValues: boolean = false;

  rawId;
  data;
  id;
  view: boolean = false;
  saved = false;
  passedForm;

  public formData: any;

  downloadURL: Observable<string>;
role;
  imageChangedEvent: any = '';

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('guardPhoto') guardPhoto: ElementRef;

 


  constructor(private popoverController:PopoverController,public loading: LoadingService, private platform: Platform, public geolocation: Geolocation, public router: Router,
    private afs: AngularFirestore, private camera: Camera, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage, public actionCtrl: ActionSheetController,
    public PdfService: PdfService, private activatedRoute: ActivatedRoute) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          var id = user.key;
          this.displayUser(id);
          this.searchSites(id);
          this.visit.key = UUID.UUID();
          this.visit.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.visit.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.visit.timeStamp = this.visit.date + ' at ' + this.visit.time;
          this.visit.report = 'AR Site Visit';
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
          this.getLocation();
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('sitevisits').doc(this.data.key).ref.get().then((info) => {
          this.passedForm = info.data();
          if (this.passedForm) {
            this.visit = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((visit) => {
        this.visit = visit;
        this.saved = true;
      });
    }
       this.isApp = this.platform.platforms().includes("cordova")

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

    this.visit[`${this.role.data.for}`] = this.role.data.out
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
      this.visit.user = user.name;
      this.visit.userKey = user.key;
      this.visit.userEmail = user.email;
      if (user.company !== undefined) {
        this.visit.company = user.company;
      }
      if (user.companyId !== undefined) {
        this.visit.companyId = user.companyId;
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().arVisits !== '' && company.data().arVisits !== undefined) {
          this.visit.companyEmail = company.data().arVisits;
          console.log(this.visit.companyEmail);
        }
      });
      if (user.logo !== '') {
        this.visit.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.visit.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      if (this.visit.emailClient === 'User Choice') {
        this.emailOption = true;
      }
      else {
        this.emailOption = false;
        this.visit.emailToClient = this.visit.emailClient;
      }
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.visit.lat = position.coords.latitude;
        this.visit.lng = position.coords.longitude;
        this.visit.acc = position.coords.accuracy;
        console.log(position.coords.accuracy);
      }
    });
  }

  searchSites(id) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 15000);
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
    const prompt = await this.alertCtrl.create({
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

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.visit.photo = event.base64;
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
      this.visit.photo = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  slide1Valid() {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;

      if (this.visit.ob !== '') {
        this.obValue = true;
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.content.scrollToTop().then(() => {
          this.slides.lockSwipeToNext(true);
        });
      }
      else {
        this.obValue = false;
        this.alertMsg();
      }
    }
    else {
      this.siteValue = false;
      this.alertMsg();
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

  getSiteDetails(visit) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', visit.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.visit.site = site.name;
        this.visit.siteKey = site.key;
        if (site.recipient) {
          this.visit.recipient = site.recipient;
        }
        if (site.eamil) {
          this.visit.clientEmail = site.email;
        }
      });
    });
    this.allGuards(visit);
  }

  allGuards(visit) {
    this.loading.present('Fetching Staff...');
    setTimeout(() => {
      this.loading.dismiss();
    }, 30000);
    return this.getGuards(visit).pipe(take(1)).subscribe(() => {
      this.loading.dismiss();
    });
  }

  getGuards(visit) {
    this.guardsCollection = this.afs.collection('guards', ref => ref.where('siteId', '==', visit.siteKey));
    return this.guards = this.guardsCollection.valueChanges();
  }
  getGuardDetails(visit) {
    this.guardDetailsCollection = this.afs.collection('guards', ref => ref.where('Key', '==', visit.soKey));
    this.guardDetails = this.guardDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardDetails.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.soKey = guard.Key;
        this.visit.so = guard.name;
        if (guard.CoNo) {
          this.visit.soCoNo = guard.CoNo;
        }
      });
    });
  }

  slide2Valid() {
    if (this.visit.soKey !== undefined && this.visit.soKey !== '') {
      this.soValue = true;

      if (this.visit.photo !== undefined && this.visit.photo !== '') {
        this.photoValue = true;

        if (this.visit.fence !== '') {
          this.fenceValue = true;

          if (this.visit.panic !== '') {
            this.panicValue = true;

            if (this.visit.radio !== '') {
              this.radioValue = true;

              if (this.visit.incidents !== '') {
                this.incidentsValue = true;

                this.slides.lockSwipes(false);
                this.slides.slideNext();
                this.content.scrollToTop().then(() => {
                  this.slides.lockSwipeToNext(true);
                  this.slides.lockSwipeToPrev(true);
                  this.nxtButton = false;
                });
              }
              else {
                this.incidentsValue = false;
                this.alertMsg();
              }
            }
            else {
              this.radioValue = false;
              this.alertMsg();
            }
          }
          else {
            this.panicValue = false;
            this.alertMsg();
          }
        }
        else {
          this.fenceValue = false;
          this.alertMsg();
        }
      }
      else {
        this.photoValue = false;
        this.alertMsg();
      }
    }
    else {
      this.soValue = false;
      this.alertMsg();
    }
  }

  save(visit) {
    this.storage.set(this.visit.key, this.visit).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Site Visit Saved Successfully!');
      });
    });
  }

  delete() {
    this.storage.remove(this.visit.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.visit).then(() => {
      this.afs.collection('arVisits').doc(this.visit.key).set(this.visit).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Report Sent Successfully!');
          });
        });
      });
    });
  }

  check(visit) {
    this.visit.date = moment(this.visit.date).locale('en').format('YYYY/MM/DD');
    if (this.visit.signature !== undefined && this.visit.signature !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.send(visit);
  }

  send(visit) {
    if (this.visit.signature !== undefined && this.visit.signature !== '') {
      this.sigValue = true;

      if (this.visit.emailClient === 'User Choice') {

        if (this.visit.email !== undefined && this.visit.email !== '') {
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
            this.continue();
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
            this.PdfService.download(this.visit);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.visit);
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
              this.afs.collection('arVisits').doc(report.key).delete().then(() => {
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
            this.save(this.visit);
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
            this.actionCtrl.dismiss();
          }
        }]
    });
    await actionSheet.present();
  }

  continue() {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('arVisits').doc(this.visit.key).set(this.visit).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Client Instruction Sent Successfully!');
          });
        });
      });
    });
  }

}


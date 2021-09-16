import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, IonSlides, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-transparency-report',
  templateUrl: './transparency-report.page.html',
  styleUrls: ['./transparency-report.page.scss'],
})
export class TransparencyReportPage implements OnInit {

  trans = {
    report: '', key: '', recipient: '', siteKey: '', userKey: '', userEmail: '', company: '', companyId: '', logo: '', timeStamp: '',
    manager: '', date: '', time: '', site: '', ob: '', manSig: '', guardSig: '', photo1: '', details1: '', actions1: '',
    recommendations1: '', photo2: '', details2: '', actions2: '', recommendations2: '', photo3: '', details3: '', actions3: '',
    recommendations3: '', photo4: '', details4: '', actions4: '', recommendations4: '', lat: 0, lng: 0, acc: 0, emailToClient: '',
    companyEmail: '', emailUser: true, emailClient: '', clientEmail: '',
  };

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;

  
  

  siteValue = true;
  obValue = true;
  slide1 = false;
  sitesValues = false;

  snag2 = false;
  snag3 = false;
  snag4 = false;

  photoValue = true;
  detailsValue = true;

  actionsValue = true;
  recommendValue = true;
  emailValue = true;
  isApp: boolean;
  update;
  sigValue = true;

  slideNum;
  nxtButton = true;
  prevButton = false;
  exitButton = true;
  slideNumber = 0;
  emailOption: boolean;
  public formData: any;
  history = false;
  params;
  view: boolean = false;
  id;
  data;
  passedForm;
  saved = false;

  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';
  imageChangedEvent4: any = '';

    @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;
  @ViewChild('picture4') picture4: ElementRef;

  signaturePadOptions: Object = {
    minWidth: 2,
    backgroundColor: '#fff',
    penColor: '#000'
  };

  constructor( public popoverController:PopoverController,private platform: Platform, public geolocation: Geolocation, public actionCtrl: ActionSheetController,
    public alertCtrl: AlertController, private camera: Camera, public toast: ToastService, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public navCtrl: NavController, private storage: Storage, public PdfService: PdfService,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            var key = user.key;
            this.displayUser(key);
            this.searchSites(key);
          }
          this.getLocation();
          this.trans.key = UUID.UUID();
          this.trans.timeStamp = this.trans.date + ' at ' + this.trans.time;
          this.trans.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.trans.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.trans.report = 'Transparency Report';

          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);

          if (document.URL.indexOf('http://localhost') === 0 || document.URL.indexOf('ionic') === 0 || document.URL.indexOf('https://localhost') === 0) {
            this.isApp = true;
          } else {
            this.isApp = false;
          }
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('transparencys').doc(this.data.key).ref.get().then((trans) => {
          this.passedForm = trans.data();
          if (this.passedForm) {
            this.trans = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((trans) => {
        this.trans = trans;
        this.saved = true;
        this.view = false;
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

    this.trans[`${this.role.data.for}`] = this.role.data.out
  }



  displayUser(key) {
    this.storage.get('user').then((user) => {
      this.trans.manager = user.name;
      this.trans.company = user.company;
      this.trans.userEmail = user.email;
      this.trans.userKey = user.key;
      this.trans.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.trans.logo = user.logo;
      } else if (user.logo === undefined) {
        this.trans.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().transparency !== '' && company.data().transparency !== undefined) {
          this.trans.companyEmail = company.data().transparency;
          console.log(this.trans.companyEmail);
        }
      });
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude !== undefined) {
        this.trans.lat = position.coords.latitude;
        this.trans.lng = position.coords.longitude;
        this.trans.acc = position.coords.accuracy;
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

  searchSites(key) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.getSites(key).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
        this.sitesValues = true;
      });
    }
  }

  getSites(key) {
    this.sitesCollection = this.afs.collection(`users/${key}/sites`, ref => ref.orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
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

  async alertMsg() {
    const prompt = await this.alertCtrl.create({
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

  addSnag2() {
    this.snag2 = true;
  }
  addSnag3() {
    this.snag3 = true;
  }
  addSnag4() {
    this.snag4 = true;
  }

  getSiteDetails(trans) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', trans.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.trans.site = site.name;
        this.trans.siteKey = site.key;
        if (site.recipient) {
          this.trans.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.trans.clientEmail = site.email;
        }
      });
    });
  }

  fileChangeEvent1(event: any): void {
    this.imageChangedEvent1 = event;
  }

  imageCropped1(event: ImageCroppedEvent) {
    this.trans.photo1 = event.base64;
  }

  async takePhoto1() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage1(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage1(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage1(useAlbum: boolean) {
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
      this.trans.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.trans.photo2 = event.base64;
  }

  async takePhoto2() {
    const actionSheet2 = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage2(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage2(true);
          }
        },
      ]
    });
    return await actionSheet2.present();
  }

  async captureImage2(useAlbum: boolean) {
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
      this.trans.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent3(event: any): void {
    this.imageChangedEvent3 = event;
  }

  imageCropped3(event: ImageCroppedEvent) {
    this.trans.photo3 = event.base64;
  }

  async takePhoto3() {
    const actionSheet3 = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage3(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage3(true);
          }
        },
      ]
    });
    return await actionSheet3.present();
  }

  async captureImage3(useAlbum: boolean) {
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
      this.trans.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent4(event: any): void {
    this.imageChangedEvent4 = event;
  }

  imageCropped4(event: ImageCroppedEvent) {
    this.trans.photo4 = event.base64;
  }

  async takePhoto4() {
    const actionSheet4 = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage4(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage4(true);
          }
        },
      ]
    });
    return await actionSheet4.present();
  }

  async captureImage4(useAlbum: boolean) {
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
      this.trans.photo4 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  check() {
    if (this.trans.site !== undefined && this.trans.site !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.trans.ob !== undefined && this.trans.ob !== '') {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.trans.photo1 !== undefined && this.trans.photo1 !== '') {
      this.photoValue = true;
    } else {
      this.photoValue = false;
    }
    if (this.trans.details1 !== undefined && this.trans.details1 !== '') {
      this.detailsValue = true;
    } else {
      this.detailsValue = false;
    }
    if (this.trans.actions1 !== undefined && this.trans.actions1 !== '') {
      this.actionsValue = true;
    } else {
      this.actionsValue = false;
    }
    if (this.trans.recommendations1 !== undefined && this.trans.recommendations1 !== '') {
      this.recommendValue = true;
    } else {
      this.recommendValue = false;
    }
    if (this.trans.manSig !== undefined && this.trans.manSig !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.step2();
  }


  step2() {
    if (this.trans.site !== undefined && this.trans.site !== '') {
      this.siteValue = true;

      if (this.trans.ob !== undefined && this.trans.ob !== '') {
        this.obValue = true;

        if (this.trans.photo1 !== undefined && this.trans.photo1 !== '') {
          this.photoValue = true;

          if (this.trans.details1 !== undefined && this.trans.details1 !== '') {
            this.detailsValue = true;

            if (this.trans.actions1 !== undefined && this.trans.actions1 !== '') {
              this.actionsValue = true;

              if (this.trans.recommendations1 !== undefined && this.trans.recommendations1 !== '') {
                this.recommendValue = true;

                if (this.trans.manSig !== undefined && this.trans.manSig !== '') {
                  this.sigValue = true;

                  if (this.view === false) {
                    this.completeActionSheet();
                  } else {
                    this.viewActionSheet();
                  }

                } else {
                  this.sigValue = false;
                  this.invalidActionSheet();
                }

              } else {
                this.recommendValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.actionsValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.detailsValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.photoValue = false;
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

  downloadPdf() {
    this.PdfService.download(this.trans).then(() => {
      this.afs.collection('transparencys').doc(this.trans.key).set(this.trans).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Training Form Sent Successfully!');
          });
        });
      });
    });
  }


  send(trans) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.update = {
        lastVisit: trans.date,
        visitBy: trans.manager
      };
      const id = this.trans.siteKey + '';
      this.afs.collection('sites').doc(id).update(this.update).then(() => {
        this.afs.collection(`users/${this.trans.userKey}/sites`).doc(id).update(this.update).then(() => {
          this.afs.collection(`transparencys`).doc(this.trans.key).set(this.trans).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Transparency Report Sent Successfully!');
              });
            });
          });
        });
      });
    });
  }

  save(trans) {
    this.storage.set(this.trans.key, this.trans).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Transparency Report Saved Successfully!');
      });
    });
  }

  delete() {
    this.storage.remove(this.trans.key).then(() => {
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
            this.send(this.trans);
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
            this.PdfService.download(this.trans);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.trans);
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
    const prompt = await this.alertCtrl.create({
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
              this.afs.collection('transparencys').doc(report.key).delete().then(() => {
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
            this.save(this.trans);
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

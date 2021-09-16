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
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-risk-assessment',
  templateUrl: './risk-assessment.page.html',
  styleUrls: ['./risk-assessment.page.scss'],
})
export class RiskAssessmentPage implements OnInit {
role;
  assessment = {
    report: '', recipeint: '', key: '', siteKey: '', userKey: '', userEmail: '', company: '', companyId: '', logo: '', timeStamp: '',
    manager: '', date: '', time: '', site: '', type: '', description: '', height: '', vulnerable: '', vulnerableDesc: '',
    vulnerableLevel: '', vulnerableRec: '', palarms: '', palarmsDesc: '', palarmsLevel: '', palarmsRec: '', elecfence: '',
    elecfenceDesc: '', elecfenceLevel: '', elecfenceRec: '', trees: '', treesDesc: '', treesLevel: '', treesRec: '', perimLight: '',
    perimLightDesc: '', perimLightLevel: '', perimLightRec: '', areas: '', areasLevel: '', areasDesc: '', areasRec: '', danger: '',
    dangerDesc: '', dangerLevel: '', dangerRec: '', stacked: '', stackedDesc: '', stackedLevel: '', stackedRec: '', surround: '',
    surroundDesc: '', surroundLevel: '', surroundRec: '', premLight: '', premLightDesc: '', premLightLevel: '', premLightRec: '',
    entrance: '', method: '', monitored: '', searched: '', staff: '', entry: '', entryDesc: '', entryLevel: '', entryRec: '',
    entryLight: '', entryLightDesc: '', entryLightLevel: '', entryLightRec: '', doors: '', lock: '', armed: '', doorsRisk: '',
    doorsRiskDesc: '', doorsRiskLevel: '', doorsRiskRec: '', alarms: '', panic: '', response: '', arcompany: '', tested: '', cams: '',
    monitoredcams: '', cctvsuf: '', cctv: '', cctvDesc: '', cctvLevel: '', cctvRec: '', guards: '', room: '', patrol: '', system: '',
    equipment: '', guard: '', guardDesc: '', guardLevel: '', guardRec: '', fire: '', serviced: '', aid: '', signs: '', evac: '',
    assembly: '', health: '', healthDesc: '', healthLevel: '', healthRec: '', notes: '', manSig: '', clientEmail: '', emailToClient: '',
    photo1: '', photo2: '', photo3: '', photo4: '', photo5: '', photo6: '', photo7: '', photo8: '', photo9: '', photo10: '', photo11: '',
    photo12: '', photo13: '', photo14: '', photo15: '', photo16: '', lat: 0, lng: 0, acc: 0, companyEmail: '', emailUser: true,
    emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  siteUpdate;
  risk2: boolean = false;
  risk3: boolean = false;
  
  emailOption: boolean;
  siteValue: boolean = true;
  typeValue: boolean = true;
  descValue: boolean = true;
  heightValue: boolean = true;
  vulnerableValue: boolean = true;
  palarmsValue: boolean = true;
  elecfenceValue: boolean = true;
  treesValue: boolean = true;
  perimLightValue: boolean = true;
  areasValue: boolean = true;
  dangerValue: boolean = true;
  stackedValue: boolean = true;
  surroundValue: boolean = true;
  premLightValue: boolean = true;
  entranceValue: boolean = true;
  methodValue: boolean = true;
  monitoredValue: boolean = true;
  searchedValue: boolean = true;
  staffValue: boolean = true;
  entryValue: boolean = true;
  entryLightValue: boolean = true;
  doorsValue: boolean = true;
  lockValue: boolean = true;
  armedValue: boolean = true;
  doorsRiskValue: boolean = true;
  alarmsValue: boolean = true;
  panicValue: boolean = true;
  responseValue: boolean = true;
  testedValue: boolean = true;
  arcompanyValue: boolean = true;
  camsValue: boolean = true;
  cctvValue: boolean = true;
  roomValue: boolean = true;
  patrolValue: boolean = true;
  guardValue: boolean = true;
  fireValue: boolean = true;
  servicedValue: boolean = true;
  aidValue: boolean = true;
  signsValue: boolean = true;
  evacValue: boolean = true;
  assemblyValue: boolean = true;
  healthValue: boolean = true;
  emailValue: boolean;
  sigValue: boolean = true;
  history: boolean = false;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  public formData: any;
  update;
  sitesValues: boolean = false;
  isApp: boolean;
  data;
  id;
  view: boolean = false;
  passedForm;

  saved = false;

  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';
  imageChangedEvent4: any = '';
  imageChangedEvent5: any = '';
  imageChangedEvent6: any = '';
  imageChangedEvent7: any = '';
  imageChangedEvent8: any = '';
  imageChangedEvent9: any = '';
  imageChangedEvent10: any = '';
  imageChangedEvent11: any = '';
  imageChangedEvent12: any = '';
  imageChangedEvent13: any = '';
  imageChangedEvent14: any = '';
  imageChangedEvent15: any = '';
  imageChangedEvent16: any = '';

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;
  @ViewChild('picture4') picture4: ElementRef;
  @ViewChild('picture5') picture5: ElementRef;
  @ViewChild('picture6') picture6: ElementRef;
  @ViewChild('picture7') picture7: ElementRef;
  @ViewChild('picture8') picture8: ElementRef;
  @ViewChild('picture9') picture9: ElementRef;
  @ViewChild('picture10') picture10: ElementRef;
  @ViewChild('picture11') picture11: ElementRef;
  @ViewChild('picture12') picture12: ElementRef;
  @ViewChild('picture13') picture13: ElementRef;
  @ViewChild('picture14') picture14: ElementRef;
  @ViewChild('picture15') picture15: ElementRef;
  @ViewChild('picture16') picture16: ElementRef;

 


  constructor(private popoverController:PopoverController, private storage: Storage, public actionCtrl: ActionSheetController, private platform: Platform, public loading: LoadingService,
    public geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    public activatedRoute: ActivatedRoute, public router: Router, public PdfService: PdfService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
       this.isApp = this.platform.platforms().includes("cordova")

    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            var id = user.key;
            this.displayUser(id);
            this.searchSites(id);
          }
          this.getLocation();
          this.assessment.key = UUID.UUID();
          this.assessment.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.assessment.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.assessment.timeStamp = this.assessment.date + ' at ' + this.assessment.time;
          this.assessment.report = 'Risk Assessment';
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('assessments').doc(this.data.key).ref.get().then((assessment) => {
          this.passedForm = assessment.data();
          if (this.passedForm) {
            this.assessment = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((assessment) => {
        this.assessment = assessment;
        this.saved = true;
      });
    }
  }

  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.assessment.manager = user.name;
      this.assessment.company = user.company;
      this.assessment.userEmail = user.email;
      this.assessment.userKey = user.key;
      this.assessment.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.assessment.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.assessment.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().assessment !== '' && company.data().assessment !== undefined) {
          this.assessment.companyEmail = company.data().assessment;
          console.log(this.assessment.companyEmail);
        }
      });
    });
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

    this.assessment[`${this.role.data.for}`] = this.role.data.out
  }


  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude !== undefined) {
        this.assessment.lat = position.coords.latitude;
        this.assessment.lng = position.coords.longitude;
        this.assessment.acc = position.coords.accuracy;
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
      })
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
            if (this.slideNumber === 7) {
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

  getSiteDetails(assessment) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', assessment.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.assessment.site = site.name;
        this.assessment.siteKey = site.key;
        if (site.recipient) {
          this.assessment.recipeint = site.recipient;
        }
        if (site.email !== undefined) {
          this.assessment.clientEmail = site.email;
        }
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

  fileChangeEvent1(event: any): void {
    this.imageChangedEvent1 = event;
  }

  imageCropped1(event: ImageCroppedEvent) {
    this.assessment.photo1 = event.base64;
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
      this.assessment.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.assessment.photo2 = event.base64;
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
      this.assessment.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent3(event: any): void {
    this.imageChangedEvent3 = event;
  }

  imageCropped3(event: ImageCroppedEvent) {
    this.assessment.photo3 = event.base64;
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
      this.assessment.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent4(event: any): void {
    this.imageChangedEvent4 = event;
  }

  imageCropped4(event: ImageCroppedEvent) {
    this.assessment.photo4 = event.base64;
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
      this.assessment.photo4 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent5(event: any): void {
    this.imageChangedEvent5 = event;
  }

  imageCropped5(event: ImageCroppedEvent) {
    this.assessment.photo5 = event.base64;
  }

  async takePhoto5() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage5(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage5(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage5(useAlbum: boolean) {
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
      this.assessment.photo5 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent6(event: any): void {
    this.imageChangedEvent6 = event;
  }

  imageCropped6(event: ImageCroppedEvent) {
    this.assessment.photo6 = event.base64;
  }

  async takePhoto6() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage6(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage6(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage6(useAlbum: boolean) {
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
      this.assessment.photo6 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent7(event: any): void {
    this.imageChangedEvent7 = event;
  }

  imageCropped7(event: ImageCroppedEvent) {
    this.assessment.photo7 = event.base64;
  }

  async takePhoto7() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage7(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage7(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage7(useAlbum: boolean) {
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
      this.assessment.photo7 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent8(event: any): void {
    this.imageChangedEvent8 = event;
  }

  imageCropped8(event: ImageCroppedEvent) {
    this.assessment.photo8 = event.base64;
  }

  async takePhoto8() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage8(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage8(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage8(useAlbum: boolean) {
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
      this.assessment.photo8 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent9(event: any): void {
    this.imageChangedEvent9 = event;
  }

  imageCropped9(event: ImageCroppedEvent) {
    this.assessment.photo9 = event.base64;
  }

  async takePhoto9() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage9(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage9(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage9(useAlbum: boolean) {
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
      this.assessment.photo9 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent10(event: any): void {
    this.imageChangedEvent10 = event;
  }

  imageCropped10(event: ImageCroppedEvent) {
    this.assessment.photo10 = event.base64;
  }

  async takePhoto10() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage10(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage10(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage10(useAlbum: boolean) {
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
      this.assessment.photo10 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent11(event: any): void {
    this.imageChangedEvent11 = event;
  }

  imageCropped11(event: ImageCroppedEvent) {
    this.assessment.photo11 = event.base64;
  }

  async takePhoto11() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage11(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage11(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage11(useAlbum: boolean) {
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
      this.assessment.photo11 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent12(event: any): void {
    this.imageChangedEvent12 = event;
  }

  imageCropped12(event: ImageCroppedEvent) {
    this.assessment.photo12 = event.base64;
  }

  async takePhoto12() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage12(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage12(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage12(useAlbum: boolean) {
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
      this.assessment.photo12 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent13(event: any): void {
    this.imageChangedEvent13 = event;
  }

  imageCropped13(event: ImageCroppedEvent) {
    this.assessment.photo13 = event.base64;
  }

  async takePhoto13() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage13(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage13(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage13(useAlbum: boolean) {
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
      this.assessment.photo13 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent14(event: any): void {
    this.imageChangedEvent14 = event;
  }

  imageCropped14(event: ImageCroppedEvent) {
    this.assessment.photo14 = event.base64;
  }

  async takePhoto14() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage14(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage14(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage14(useAlbum: boolean) {
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
      this.assessment.photo14 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent15(event: any): void {
    this.imageChangedEvent15 = event;
  }

  imageCropped15(event: ImageCroppedEvent) {
    this.assessment.photo15 = event.base64;
  }

  async takePhoto15() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage15(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage15(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage15(useAlbum: boolean) {
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
      this.assessment.photo15 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent16(event: any): void {
    this.imageChangedEvent16 = event;
  }

  imageCropped16(event: ImageCroppedEvent) {
    this.assessment.photo16 = event.base64;
  }

  async takePhoto16() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage16(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage16(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage16(useAlbum: boolean) {
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
      this.assessment.photo16 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  save(assessment) {
    this.storage.set(this.assessment.key, this.assessment).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Risk Assessment Saved Successfully');
      });
    });
  }

  check(assessment) {
    if (this.assessment.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.assessment.type !== '') {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.assessment.description !== '') {
      this.descValue = true;
    } else {
      this.descValue = false;
    }
    if (this.assessment.height !== '') {
      this.heightValue = true;
    } else {
      this.heightValue = false;
    }
    if (this.assessment.vulnerable !== '') {
      this.vulnerableValue = true;
    } else {
      this.vulnerableValue = false;
    }
    if (this.assessment.palarms !== '') {
      this.palarmsValue = true;
    } else {
      this.palarmsValue = false;
    }
    if (this.assessment.elecfence !== '') {
      this.elecfenceValue = true;
    } else {
      this.elecfenceValue = false;
    }
    if (this.assessment.trees !== '') {
      this.treesValue = true;
    } else {
      this.treesValue = false;
    }
    if (this.assessment.perimLight !== '') {
      this.perimLightValue = true;
    } else {
      this.perimLightValue = false;
    }
    if (this.assessment.areas !== '') {
      this.areasValue = true;
    } else {
      this.areasValue = false;
    }
    if (this.assessment.danger !== '') {
      this.dangerValue = true;
    } else {
      this.dangerValue = false;
    }
    if (this.assessment.stacked !== '') {
      this.stackedValue = true;
    } else {
      this.stackedValue = false;
    }
    if (this.assessment.surround !== '') {
      this.surroundValue = true;
    } else {
      this.surroundValue = false;
    }
    if (this.assessment.premLight !== '') {
      this.premLightValue = true;
    } else {
      this.premLightValue = false;
    }
    if (this.assessment.method !== '') {
      this.methodValue = true;
    } else {
      this.methodValue = false;
    }
    if (this.assessment.entrance !== '') {
      this.entranceValue = true;
    } else {
      this.entranceValue = false;
    }
    if (this.assessment.monitored !== '') {
      this.monitoredValue = true;
    } else {
      this.monitoredValue = false;
    }
    if (this.assessment.searched !== '') {
      this.searchedValue = true;
    } else {
      this.searchedValue = false;
    }
    if (this.assessment.staff !== '') {
      this.staffValue = true;
    } else {
      this.staffValue = false;
    }
    if (this.assessment.entry !== '') {
      this.entryValue = true;
    } else {
      this.entryValue = false;
    }
    if (this.assessment.entryLight !== '') {
      this.entryLightValue = true;
    } else {
      this.entryLightValue = false;
    }
    if (this.assessment.doors !== '') {
      this.doorsValue = true;
    } else {
      this.doorsValue = false;
    }
    if (this.assessment.lock !== '') {
      this.lockValue = true;
    } else {
      this.lockValue = false;
    }
    if (this.assessment.armed !== '') {
      this.armedValue = true;
    } else {
      this.armedValue = false;
    }
    if (this.assessment.doorsRisk !== '') {
      this.doorsRiskValue = true;
    } else {
      this.doorsRiskValue = false;
    }
    if (this.assessment.alarms !== '') {
      this.alarmsValue = true;
    } else {
      this.alarmsValue = false;
    }
    if (this.assessment.panic !== '') {
      this.panicValue = true;
    } else {
      this.panicValue = false;
    }
    if (this.assessment.response !== '') {
      this.responseValue = true;
    } else {
      this.responseValue = false;
    }
    if (this.assessment.tested !== '') {
      this.testedValue = true;
    } else {
      this.testedValue = false;
    }
    if (this.assessment.cams !== '') {
      this.camsValue = true;
    } else {
      this.camsValue = false;
    }
    if (this.assessment.cctv !== '') {
      this.cctvValue = true;
    } else {
      this.cctvValue = false;
    }
    if (this.assessment.room !== '') {
      this.roomValue = true;
    } else {
      this.roomValue = false;
    }
    if (this.assessment.patrol !== '') {
      this.patrolValue = true;
    } else {
      this.patrolValue = false;
    }
    if (this.assessment.guard !== '') {
      this.guardValue = true;
    } else {
      this.guardValue = false;
    }
    if (this.assessment.fire !== '') {
      this.fireValue = true;
    } else {
      this.fireValue = false;
    }
    if (this.assessment.serviced !== '') {
      this.servicedValue = true;
    } else {
      this.servicedValue = false;
    }
    if (this.assessment.aid !== '') {
      this.aidValue = true;
    } else {
      this.aidValue = false;
    }
    if (this.assessment.signs !== '') {
      this.signsValue = true;
    } else {
      this.signsValue = false;
    }
    if (this.assessment.evac !== '') {
      this.evacValue = true;
    } else {
      this.evacValue = false;
    }
    if (this.assessment.assembly !== '') {
      this.assemblyValue = true;
    } else {
      this.assemblyValue = false;
    }
    if (this.assessment.health !== '') {
      this.healthValue = true;
    } else {
      this.healthValue = false;
    }
    if (this.assessment.manSig !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.send(assessment);
  }

  send(assessment) {
    if (this.assessment.siteKey !== '') {
      this.siteValue = true;
      if (this.assessment.type !== '') {
        this.typeValue = true;
        if (this.assessment.description !== '') {
          this.descValue = true;
          if (this.assessment.height !== '') {
            this.heightValue = true;
            if (this.assessment.vulnerable !== '') {
              this.vulnerableValue = true;
              if (this.assessment.palarms !== '') {
                this.palarmsValue = true;
                if (this.assessment.elecfence !== '') {
                  this.elecfenceValue = true;
                  if (this.assessment.trees !== '') {
                    this.treesValue = true;
                    if (this.assessment.perimLight !== '') {
                      this.perimLightValue = true;
                      if (this.assessment.areas !== '') {
                        this.areasValue = true;
                        if (this.assessment.danger !== '') {
                          this.dangerValue = true;
                          if (this.assessment.stacked !== '') {
                            this.stackedValue = true;
                            if (this.assessment.surround !== '') {
                              this.surroundValue = true;
                              if (this.assessment.premLight !== '') {
                                this.premLightValue = true;
                                if (this.assessment.method !== '') {
                                  this.methodValue = true;
                                  if (this.assessment.entrance !== '') {
                                    this.entranceValue = true;
                                    if (this.assessment.monitored !== '') {
                                      this.monitoredValue = true;
                                      if (this.assessment.searched !== '') {
                                        this.searchedValue = true;
                                        if (this.assessment.staff !== '') {
                                          this.staffValue = true;
                                          if (this.assessment.entry !== '') {
                                            this.entryValue = true;
                                            if (this.assessment.entryLight !== '') {
                                              this.entryLightValue = true;
                                              if (this.assessment.doors !== '') {
                                                this.doorsValue = true;
                                                if (this.assessment.lock !== '') {
                                                  this.lockValue = true;
                                                  if (this.assessment.armed !== '') {
                                                    this.armedValue = true;
                                                    if (this.assessment.doorsRisk !== '') {
                                                      this.doorsRiskValue = true;
                                                      if (this.assessment.alarms !== '') {
                                                        this.alarmsValue = true;
                                                        if (this.assessment.panic !== '') {
                                                          this.panicValue = true;
                                                          if (this.assessment.tested !== '') {
                                                            this.testedValue = true;
                                                            if (this.assessment.cams !== '') {
                                                              this.camsValue = true;
                                                              if (this.assessment.cctv !== '') {
                                                                this.cctvValue = true;
                                                                if (this.assessment.room !== '') {
                                                                  this.roomValue = true;
                                                                  if (this.assessment.patrol !== '') {
                                                                    this.patrolValue = true;
                                                                    if (this.assessment.guard !== '') {
                                                                      this.guardValue = true;
                                                                      if (this.assessment.fire !== '') {
                                                                        this.fireValue = true;
                                                                        if (this.assessment.serviced !== '') {
                                                                          this.servicedValue = true;
                                                                          if (this.assessment.aid !== '') {
                                                                            this.aidValue = true;
                                                                            if (this.assessment.signs !== '') {
                                                                              this.signsValue = true;
                                                                              if (this.assessment.evac !== '') {
                                                                                this.evacValue = true;
                                                                                if (this.assessment.assembly !== '') {
                                                                                  this.assemblyValue = true;
                                                                                  if (this.assessment.health !== '') {
                                                                                    this.healthValue = true;
                                                                                    if (this.assessment.manSig !== '') {
                                                                                      this.signsValue = true;

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
                                                                                    this.healthValue = false;
                                                                                    this.invalidActionSheet();
                                                                                  }
                                                                                } else {
                                                                                  this.assemblyValue = false;
                                                                                  this.invalidActionSheet();
                                                                                }
                                                                              } else {
                                                                                this.evacValue = false;
                                                                                this.invalidActionSheet();
                                                                              }
                                                                            } else {
                                                                              this.signsValue = false;
                                                                              this.invalidActionSheet();
                                                                            }
                                                                          } else {
                                                                            this.aidValue = false;
                                                                            this.invalidActionSheet();
                                                                          }
                                                                        } else {
                                                                          this.servicedValue = false;
                                                                          this.invalidActionSheet();
                                                                        }
                                                                      } else {
                                                                        this.fireValue = false;
                                                                        this.invalidActionSheet();
                                                                      }
                                                                    } else {
                                                                      this.guardValue = false;
                                                                      this.invalidActionSheet();
                                                                    }
                                                                  } else {
                                                                    this.patrolValue = false;
                                                                    this.invalidActionSheet();
                                                                  }
                                                                } else {
                                                                  this.roomValue = false;
                                                                  this.invalidActionSheet();
                                                                }
                                                              } else {
                                                                this.cctvValue = false;
                                                                this.invalidActionSheet();
                                                              }
                                                            } else {
                                                              this.camsValue = false;
                                                              this.invalidActionSheet();
                                                            }
                                                          } else {
                                                            this.testedValue = false;
                                                            this.invalidActionSheet();
                                                          }
                                                        } else {
                                                          this.panicValue = false;
                                                          this.invalidActionSheet();
                                                        }
                                                      } else {
                                                        this.alarmsValue = false;
                                                        this.invalidActionSheet();
                                                      }
                                                    } else {
                                                      this.doorsRiskValue = false;
                                                      this.invalidActionSheet();
                                                    }
                                                  } else {
                                                    this.armedValue = false;
                                                    this.invalidActionSheet();
                                                  }
                                                } else {
                                                  this.lockValue = false;
                                                  this.invalidActionSheet();
                                                }
                                              } else {
                                                this.doorsValue = false;
                                                this.invalidActionSheet();
                                              }
                                            } else {
                                              this.entryLightValue = false;
                                              this.invalidActionSheet();
                                            }
                                          } else {
                                            this.entryValue = false;
                                            this.invalidActionSheet();
                                          }
                                        } else {
                                          this.staffValue = false;
                                          this.invalidActionSheet();
                                        }
                                      } else {
                                        this.searchedValue = false;
                                        this.invalidActionSheet();
                                      }
                                    } else {
                                      this.monitoredValue = false;
                                      this.invalidActionSheet();
                                    }
                                  } else {
                                    this.entranceValue = false;
                                    this.invalidActionSheet();
                                  }
                                } else {
                                  this.methodValue = false;
                                  this.invalidActionSheet();
                                }
                              } else {
                                this.premLightValue = false;
                                this.invalidActionSheet();
                              }
                            } else {
                              this.surroundValue = false;
                              this.invalidActionSheet();
                            }
                          } else {
                            this.stackedValue = false;
                            this.invalidActionSheet();
                          }
                        } else {
                          this.dangerValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.areasValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.perimLightValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.treesValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.elecfenceValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.palarmsValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.vulnerableValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.heightValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.descValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.typeValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(assessment) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection(`assessments`).doc(this.assessment.key).set(this.assessment).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Assessment Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.assessment.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.assessment).then(() => {
      this.afs.collection('assessments').doc(this.assessment.key).set(this.assessment).then(() => {
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
            this.step2(this.assessment);
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
            this.PdfService.download(this.assessment);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.assessment);
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
              this.afs.collection('assessments').doc(report.key).delete().then(() => {
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
            this.save(this.assessment);
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


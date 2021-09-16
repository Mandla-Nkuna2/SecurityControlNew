import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform, IonSlides, ActionSheetController } from '@ionic/angular';
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
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-pnp-visit',
  templateUrl: './pnp-visit.page.html',
  styleUrls: ['./pnp-visit.page.scss'],
})
export class PnpVisitPage implements OnInit {

  visit = {
    report: '', recipient: '', key: '', siteKey: '', userKey: '', userEmail: '', status: '', company: '', companyId: '', logo: '',
    timeStamp: null, manager: '', date: '', time: '', site: '', ob: '', duty: 0, so: '', so2: '', so3: '', so4: '', so5: '', so6: '', so7: '',
    so8: '', so9: '', so10: '', soKey: '', soKey2: '', soKey3: '', soKey4: '', soKey5: '', soKey6: '', soKey7: '', soKey8: '', soKey9: '',
    soKey10: '', soCoNo: '', soCoNo2: '', soCoNo3: '', soCoNo4: '', soCoNo5: '', soCoNo6: '', soCoNo7: '', soCoNo8: '', soCoNo9: '',
    soCoNo10: '', manSig: '', clientSig: '', incidents: '', incType: '', incDateTime: '', incReported: '', incActions: '', risk: '',
    alarms: '', uniforms: '', guardroom: '', obComplete: '', registers: '', radios: '', panic: '', phone: '', patrol: '', torch: '',
    elec: '', cameras: '', client: '', clientEmail: '', discussion: '', issues: '', email: '', photo1: '', riskDesc1: '', riskRec1: '',
    photo2: '', riskDesc2: '', riskRec2: '', photo3: '', riskDesc3: '', riskRec3: '', com1: '', com2: '', com3: '', com4: '', com5: '',
    com6: '', com7: '', com8: '', com9: '', com10: '', com11: '', com12: '', com13: '', com14: '', com15: '', com16: '', com17: '',
    com18: '', com19: '', com20: '', com21: '', com22: '', com23: '', com24: '', com25: '', com26: '', com27: '', com28: '', com29: '',
    com30: '', lat: 0, lng: 0, acc: 0, companyEmail: '', emailUser: true, emailClient: '', cont: '', cash: '', compl: '', dutyRoster: '',
    cctv: '', monitored: '', store: '', office: '', coverage: '', strategic: '', blind: '', hot: '', video: '', review: '', request: '',
    limited: '', manned: '', ingate: ''
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  siteUpdate;
  risk2: boolean = false;
  risk3: boolean = false;
  
  

  siteValue: boolean = true;
  obValue: boolean = true;
  soValue: boolean = true;
  slide1: boolean = false;

  incValue: boolean = true;
  incTypeValue: boolean = true;
  incDateValue: boolean = true;
  incRepValue: boolean = true;
  incActValue: boolean = true;
  slide2: boolean = false;

  riskValue: boolean = true;
  photoValue: boolean = true;
  detValue: boolean = true;
  recValue: boolean = true;
  slide3: boolean = false;

  alarmsValue: boolean = true;
  uniformValue: boolean = true;
  roomValue: boolean = true;
  obBookValue: boolean = true;
  regValue: boolean = true;
  radiosValue: boolean = true;
  panicValue: boolean = true;
  phoneValue: boolean = true;
  patrolValue: boolean = true;
  torchValue: boolean = true;
  elecValue: boolean = true;
  camValue: boolean = true;
  slide4: boolean = false;
  guardValues: boolean = false;

  clientValue: boolean = true;
  issuesValue: boolean = true;
  emailValue: boolean = true;
  sigValue: boolean = true;
  sig2Value: boolean = true;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  public formData: any;
  update;
  emailOption: boolean;
  sitesValues: boolean = false;
  isApp: boolean;
  history: boolean = false;

  data;
  id;
  view: boolean = false;
  passedForm;
  saved = false;

  timeStart;
  timeEnd;

  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';

    @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    minWidth: 2,
    backgroundColor: '#fff',
    penColor: '#000'
  };

  constructor(private popoverController:PopoverController,private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera,
    public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    public loading: LoadingService, private storage: Storage, public activatedRoute: ActivatedRoute, public router: Router,
    public actionCtrl: ActionSheetController, public PdfService: PdfService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            const id = user.key;
            this.searchSites(id);
            this.displayUser(id);
          }
          this.getLocation();
          this.visit.key = UUID.UUID();
          this.visit.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.visit.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.visit.report = 'PnP Site Visit';
          this.timeStart = moment(new Date().toISOString()).locale('en').format('HH:mm');

          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('pnpvisit').doc(this.data.key).ref.get().then((info) => {
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

    this.visit[`${this.role.data.for}`] = this.role.data.out
  }

  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.visit.manager = user.name;
      this.visit.company = user.company;
      this.visit.userEmail = user.email;
      this.visit.userKey = user.key;
      this.visit.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.visit.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.visit.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().visit !== '' && company.data().visit !== undefined) {
          this.visit.companyEmail = company.data().visit;
          console.log(this.visit.companyEmail);
        }
      });
    });
  }

  edit() {
    this.visit.incDateTime = moment(this.visit.incDateTime).locale('en').format('YYYY/MM/DD');
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude !== undefined) {
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
            if (this.slideNumber === 3) {
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


  addRisk2() {
    this.risk2 = true;
  }
  addRisk3() {
    this.risk3 = true;
  }

  getSiteDetails(visit) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', visit.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
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
        if (site.email !== undefined) {
          this.visit.clientEmail = site.email;
        }
      });
    });
    this.allGuards(visit);
  }

  allGuards(visit) {
    if (!this.guardValues) {
      this.loading.present('Fetching Staff...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.getGuards(visit).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
        this.guardValues = true;
      });
    }
  }

  getGuards(visit) {
    this.guardsCollection = this.afs.collection('guards', ref => ref.where('siteId', '==', visit.siteKey));
    return this.guards = this.guardsCollection.valueChanges();
  }

  guardDetails(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo = guard.CoNo;
        }
        this.visit.soKey = guard.Key;
      });
    });
  }

  guardDetails2(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey2));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so2 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo2 = guard.CoNo;
        }
        this.visit.soKey2 = guard.Key;
      });
    });
  }

  guardDetails3(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey3));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so3 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo3 = guard.CoNo;
        }
        this.visit.soKey3 = guard.Key;
      });
    });
  }

  guardDetails4(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey4));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so4 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo4 = guard.CoNo;
        }
        this.visit.soKey4 = guard.Key;
      });
    });
  }

  guardDetails5(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey5));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so5 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo5 = guard.CoNo;
        }
        this.visit.soKey5 = guard.Key;
      });
    });
  }

  guardDetails6(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey6));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so6 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo6 = guard.CoNo;
        }
        this.visit.soKey6 = guard.Key;
      });
    });
  }

  guardDetails7(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey7));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so7 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo7 = guard.CoNo;
        }
        this.visit.soKey7 = guard.Key;
      });
    });
  }

  guardDetails8(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey8));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so8 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo8 = guard.CoNo;
        }
        this.visit.soKey8 = guard.Key;
      });
    });
  }

  guardDetails9(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey9));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so9 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo9 = guard.CoNo;
        }
        this.visit.soKey9 = guard.Key;
      });
    });
  }

  guardDetails10(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey10));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.visit.so10 = guard.name;
        if (guard.CoNo !== undefined) {
          this.visit.soCoNo10 = guard.CoNo;
        }
        this.visit.soKey10 = guard.Key;
      });
    });
  }

  fileChangeEvent1(event: any): void {
    this.imageChangedEvent1 = event;
  }

  imageCropped1(event: ImageCroppedEvent) {
    this.visit.photo1 = event.base64;
  }

  async takePhoto1() {
    let actionSheet = await this.actionCtrl.create({
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
      this.visit.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.visit.photo2 = event.base64;
  }

  async takePhoto2() {
    let actionSheet = await this.actionCtrl.create({
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
    return await actionSheet.present();
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
      this.visit.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent3(event: any): void {
    this.imageChangedEvent3 = event;
  }

  imageCropped3(event: ImageCroppedEvent) {
    this.visit.photo3 = event.base64;
  }

  async takePhoto3() {
    let actionSheet = await this.actionCtrl.create({
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
    return await actionSheet.present();
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
      this.visit.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  status(visit) {
    if (visit.issues === 'Yes') {
      this.visit.status = 'ALERT!!!';
    } else if (visit.issues === 'No') {
      this.visit.status = 'NP';
    } else if (visit.issues === 'Not Available') {
      this.visit.status = 'NA';
    }
  }

  check(visit) {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.visit.ob !== undefined && this.visit.ob !== '') {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.visit.duty !== undefined && this.visit.duty != null) {
      this.soValue = true;
    } else {
      this.soValue = false;
    }
    if (this.visit.incidents !== undefined && this.visit.incidents !== '') {
      this.incValue = true;
    } else {
      this.incValue = false;
    }
    if (this.visit.risk !== undefined && this.visit.risk !== '') {
      this.riskValue = true;
    } else {
      this.riskValue = false;
    }
    if (this.visit.alarms !== undefined && this.visit.alarms !== '') {
      this.alarmsValue = true;
    } else {
      this.alarmsValue = false;
    }
    if (this.visit.uniforms !== undefined && this.visit.uniforms !== '') {
      this.uniformValue = true;
    } else {
      this.uniformValue = false;
    }
    if (this.visit.guardroom !== undefined && this.visit.guardroom !== '') {
      this.roomValue = true;
    } else {
      this.roomValue = false;
    }
    if (this.visit.obComplete !== undefined && this.visit.obComplete !== '') {
      this.obBookValue = true;
    } else {
      this.obBookValue = false;
    }
    if (this.visit.registers !== undefined && this.visit.registers !== '') {
      this.regValue = true;
    } else {
      this.regValue = false;
    }
    if (this.visit.radios !== undefined && this.visit.radios !== '') {
      this.radiosValue = true;
    } else {
      this.radiosValue = false;
    }
    if (this.visit.panic !== undefined && this.visit.panic !== '') {
      this.panicValue = true;
    } else {
      this.panicValue = false;
    }
    if (this.visit.phone !== undefined && this.visit.phone !== '') {
      this.phoneValue = true;
    } else {
      this.phoneValue = false;
    }
    if (this.visit.patrol !== undefined && this.visit.patrol !== '') {
      this.patrolValue = true;
    } else {
      this.patrolValue = false;
    }
    if (this.visit.torch !== undefined && this.visit.torch !== '') {
      this.torchValue = true;
    } else {
      this.torchValue = false;
    }
    if (this.visit.elec !== undefined && this.visit.elec !== '') {
      this.elecValue = true;
    } else {
      this.elecValue = false;
    }
    if (this.visit.cameras !== undefined && this.visit.cameras !== '') {
      this.camValue = true;
    } else {
      this.camValue = false;
    }
    if (this.visit.manSig !== undefined && this.visit.manSig !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.send(visit);
  }

  send(visit) {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;

      if (this.visit.ob !== undefined && this.visit.ob !== '') {
        this.obValue = true;

        if (this.visit.duty !== undefined && this.visit.duty != null) {
          this.soValue = true;

          if (this.visit.incidents !== undefined && this.visit.incidents !== '') {
            this.incValue = true;

            if (this.visit.risk !== undefined && this.visit.risk !== '') {
              this.riskValue = true;

              if (this.visit.alarms !== undefined && this.visit.alarms !== '') {
                this.alarmsValue = true;

                if (this.visit.uniforms !== undefined && this.visit.uniforms !== '') {
                  this.uniformValue = true;

                  if (this.visit.guardroom !== undefined && this.visit.guardroom !== '') {
                    this.roomValue = true;

                    if (this.visit.obComplete !== undefined && this.visit.obComplete !== '') {
                      this.obBookValue = true;

                      if (this.visit.registers !== undefined && this.visit.registers !== '') {
                        this.regValue = true;

                        if (this.visit.radios !== undefined && this.visit.radios !== '') {
                          this.radiosValue = true;

                          if (this.visit.panic !== undefined && this.visit.panic !== '') {
                            this.panicValue = true;

                            if (this.visit.phone !== undefined && this.visit.phone !== '') {
                              this.phoneValue = true;

                              if (this.visit.patrol !== undefined && this.visit.patrol !== '') {
                                this.patrolValue = true;

                                if (this.visit.torch !== undefined && this.visit.torch !== '') {
                                  this.torchValue = true;

                                  if (this.visit.elec !== undefined && this.visit.elec !== '') {
                                    this.elecValue = true;

                                    if (this.visit.cameras !== undefined && this.visit.cameras !== '') {
                                      this.camValue = true;

                                      if (this.visit.manSig !== undefined && this.visit.manSig !== '') {
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
                                    } else {
                                      this.camValue = false;
                                      this.invalidActionSheet();
                                    }
                                  } else {
                                    this.elecValue = false;
                                    this.invalidActionSheet();
                                  }
                                } else {
                                  this.torchValue = false;
                                  this.invalidActionSheet();
                                }
                              } else {
                                this.patrolValue = false;
                                this.invalidActionSheet();
                              }
                            } else {
                              this.phoneValue = false;
                              this.invalidActionSheet();
                            }
                          } else {
                            this.panicValue = false;
                            this.invalidActionSheet();
                          }
                        } else {
                          this.radiosValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.regValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.obBookValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.roomValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.uniformValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.alarmsValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.riskValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.incValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.soValue = false;
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

  continue(visit) {
    this.timeEnd = moment(new Date().toISOString()).locale('en').format('HH:mm');
    this.visit.timeStamp = moment(this.timeEnd, 'HH:mm').diff(moment(this.timeStart, 'HH:mm'), 'minutes', true);

    this.loading.present('Saving Please Wait...').then(() => {
      this.update = {
        lastVisit: visit.date,
        visitBy: visit.manager,
        status: visit.status,
        visitKey: visit.key
      };
      var id = this.visit.siteKey + '';
      this.afs.collection(`sites`).doc(id).update(this.update).then(() => {
        this.afs.collection(`users/${this.visit.userKey}/sites`).doc(id).update(this.update).then(() => {
          this.afs.collection(`pnpvisit`).doc(this.visit.key).set(this.visit).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('PnP Visit Sent Successfully!');
              });
            });
          });
        });
      });
    });
  }

  save(visit) {
    this.storage.set(this.visit.key, this.visit).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('PnP Site Visit Report Saved Successfully');
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
      this.sigValue = true;
      this.storage.set(this.visit.key, this.visit).then(() => {
        this.update = {
          lastVisit: this.visit.date,
          visitBy: this.visit.manager,
          status: this.visit.status,
          visitKey: this.visit.key
        };
        var id = this.visit.siteKey + '';
        this.afs.collection(`sites`).doc(id).update(this.update).then(() => {
          this.afs.collection(`users/${this.visit.userKey}/sites`).doc(id).update(this.update).then(() => {
            this.afs.collection(`pnpvisit`).doc(this.visit.key).set(this.visit).then(() => {
              this.storage.remove(this.visit.key).then(() => {
                this.router.navigate(['forms']).then(() => {
                  this.toast.show('Site Visit Sent Successfully!');
                });
              });
            });
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
            this.continue(this.visit);
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
              this.afs.collection('pnpvisit').doc(report.key).delete().then(() => {
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

}

/*

slide1Valid() {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;
      if (this.visit.ob !== undefined && this.visit.ob !== '') {
        this.obValue = true;
        if (this.visit.duty !== undefined && this.visit.duty != null) {
          this.soValue = true;
          this.slide1 = true;
          this.slides.lockSwipes(false);
          this.slides.slideNext();
          this.content.scrollToTop().then(() => {
            this.slides.lockSwipes(true);
            this.slides.lockSwipeToNext(true);
          });
        } else {
          this.soValue = false;
          this.alertMsg();
        }
      } else {
        this.obValue = false;
        this.alertMsg();
      }
    } else {
      this.siteValue = false;
      this.alertMsg();
    }
  }

  slide2Valid() {
    if (this.visit.incidents !== undefined && this.visit.incidents !== '') {
      this.incValue = true;

      if (this.visit.incidents === 'Yes') {

        if (this.visit.incType !== undefined && this.visit.incType !== '') {
          this.incTypeValue = true;

          if (this.visit.incDateTime !== undefined && this.visit.incDateTime !== '') {
            this.incDateValue = true;

            if (this.visit.incReported !== undefined && this.visit.incReported !== '') {
              this.incRepValue = true;

              if (this.visit.incActions !== undefined && this.visit.incActions !== '') {
                this.incActValue = true;
                this.slide2 = true;
                this.slides.lockSwipes(false);
                this.slides.slideNext();
                this.content.scrollToTop().then(() => {
                  this.slides.lockSwipes(true);
                  this.slides.lockSwipeToNext(true);
                });
              } else {
                this.incActValue = false;
                this.alertMsg();
              }
            } else {
              this.incRepValue = false;
              this.alertMsg();
            }
          } else {
            this.incDateValue = false;
            this.alertMsg();
          }
        } else {
          this.incTypeValue = false;
          this.alertMsg();
        }
      } else {
        this.slide2 = true;
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.content.scrollToTop().then(() => {
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      }
    } else {
      this.incValue = false;
      this.alertMsg();
    }
  }

  slide3Valid() {
    if (this.visit.risk !== undefined && this.visit.risk !== '') {
      this.riskValue = true;
      if (this.visit.risk === 'Yes') {

        if (this.visit.photo1 !== undefined && this.visit.photo1 !== '') {
          this.photoValue = true;

          if (this.visit.riskDesc1 !== undefined && this.visit.riskDesc1 !== '') {
            this.detValue = true;

            if (this.visit.riskRec1 !== undefined && this.visit.riskRec1 !== '') {
              this.recValue = true;
              this.slide3 = true;
              this.slides.lockSwipes(false);
              this.slides.slideNext();
              this.content.scrollToTop().then(() => {
                this.slides.lockSwipes(true);
                this.slides.lockSwipeToNext(true);
              });
            } else {
              this.recValue = false;
              this.alertMsg();
            }
          } else {
            this.detValue = false;
            this.alertMsg();
          }
        } else {
          this.photoValue = false;
          this.alertMsg();
        }
      } else {
        this.slide3 = true;
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.content.scrollToTop().then(() => {
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      }
    } else {
      this.riskValue = false;
      this.alertMsg();
    }
  }

  slide4Valid() {
    if (this.visit.alarms !== undefined && this.visit.alarms !== '') {
      this.alarmsValue = true;

      if (this.visit.uniforms !== undefined && this.visit.uniforms !== '') {
        this.uniformValue = true;

        if (this.visit.guardroom !== undefined && this.visit.guardroom !== '') {
          this.roomValue = true;

          if (this.visit.obComplete !== undefined && this.visit.obComplete !== '') {
            this.obBookValue = true;

            if (this.visit.registers !== undefined && this.visit.registers !== '') {
              this.regValue = true;

              if (this.visit.radios !== undefined && this.visit.radios !== '') {
                this.radiosValue = true;

                if (this.visit.panic !== undefined && this.visit.panic !== '') {
                  this.panicValue = true;

                  if (this.visit.phone !== undefined && this.visit.phone !== '') {
                    this.phoneValue = true;

                    if (this.visit.patrol !== undefined && this.visit.patrol !== '') {
                      this.patrolValue = true;

                      if (this.visit.torch !== undefined && this.visit.torch !== '') {
                        this.torchValue = true;

                        if (this.visit.elec !== undefined && this.visit.elec !== '') {
                          this.elecValue = true;

                          if (this.visit.cameras !== undefined && this.visit.cameras !== '') {
                            this.camValue = true;
                            this.slide4 = true;
                            this.slides.lockSwipes(false);
                            this.slides.slideNext();
                            this.content.scrollToTop().then(() => {
                              this.slides.lockSwipes(true);
                              this.slides.lockSwipeToNext(true);
                              this.nxtButton = false;
                            });
                          } else {
                            this.camValue = false;
                            this.alertMsg();
                          }
                        } else {
                          this.elecValue = false;
                          this.alertMsg();
                        }
                      } else {
                        this.torchValue = false;
                        this.alertMsg();
                      }
                    } else {
                      this.patrolValue = false;
                      this.alertMsg();
                    }
                  } else {
                    this.phoneValue = false;
                    this.alertMsg();
                  }
                } else {
                  this.panicValue = false;
                  this.alertMsg();
                }
              } else {
                this.radiosValue = false;
                this.alertMsg();
              }
            } else {
              this.regValue = false;
              this.alertMsg();
            }
          } else {
            this.obBookValue = false;
            this.alertMsg();
          }
        } else {
          this.roomValue = false;
          this.alertMsg();
        }
      } else {
        this.uniformValue = false;
        this.alertMsg();
      }
    } else {
      this.alarmsValue = false;
      this.alertMsg();
    }
  }

  */

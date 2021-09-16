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
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-crime-incident-report',
  templateUrl: './crime-incident-report.page.html',
  styleUrls: ['./crime-incident-report.page.scss'],
})
export class CrimeIncidentReportPage implements OnInit {
role;
  incident = {
    report: '',
    key: '',
    recipient: '',
    siteKey: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    logo: '',
    timeStamp: null,
    manager: '',
    date: '',
    time: '',
    site: '',
    ob: '',
    incDate: '',
    incTime: '',
    type: '',
    details: '',
    person: '',
    title: '',
    name: '',
    surname: '',
    address: '',
    contact: '',
    email: '',
    employer: '',
    injury: '',
    reported: '',
    sapsRepTime: '',
    sapsArrTime: '',
    officer: '',
    case: '',
    saps: '',
    metro: '',
    ambulance: '',
    fire: '',
    value: '',
    arrests: '',
    arrestDetails: '',
    management: '',
    client: '',
    obDone: '',
    incOb: '',
    noOb: '',
    photo1: '',
    photo2: '',
    photo3: '',
    photo4: '',
    photo5: '',
    photo6: '',
    manSig: '',
    notes1: '',
    notes2: '',
    notes3: '',
    notes4: '',
    notes5: '',
    notes6: '',
    lat: null,
    lng: null,
    acc: null,
    companyEmail: '',
    emailUser: true,
    emailClient: 'No',
    emailToClient: '',
    clientEmail: '',
    category: '',
    typeOther: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  incidentsCollection: AngularFirestoreCollection<any>;
  types: Observable<any[]>;
  categorysCollection: AngularFirestoreCollection<any>;
  categorys: Observable<any[]>;


  

  siteValue: boolean = true;
  obValue: boolean = true;
  dateValue: boolean = true;
  timeValue: boolean = true;
  typeValue: boolean = true;
  detailsValue: boolean = true;
  personValue: boolean = true;
  reportedValue: boolean = true;
  arrestsValue: boolean = true;
  managementValue: boolean = true;
  clientValue: boolean = true;
  obDoneValue: boolean = true;
  emailValue: boolean = true;
  sigValue: boolean = true;
  categoryValue: boolean = true;
  typeOtherValue: boolean = true;
  sitesValues: boolean = false;
  categoryValues: boolean = false;
  update;
  history: boolean = false;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  public formData: any;
  emailOption: boolean;
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

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;
  @ViewChild('picture4') picture4: ElementRef;
  @ViewChild('picture5') picture5: ElementRef;
  @ViewChild('picture6') picture6: ElementRef;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    minWidth: 2,
    backgroundColor: '#fff',
    penColor: '#000'
  };

  constructor(private popoverController:PopoverController, public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    public alertCtrl: AlertController, private camera: Camera, public toast: ToastService, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService,
    private storage: Storage, public activatedRoute: ActivatedRoute, public router: Router, public PdfService: PdfService) {
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
          this.getCategories();
          this.getLocation();
          this.incident.key = UUID.UUID();
          this.incident.timeStamp = this.incident.date + ' at ' + this.incident.time;
          this.incident.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.incident.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.incident.report = 'Crime Incident Report';

          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        
        this.afs.collection('incidents').doc(this.data.key).ref.get().then((incident) => {
          this.passedForm = incident.data();
          if (this.passedForm) {
            this.incident = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((incident) => {
        this.incident = incident;
        this.saved = true;
      });
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

    this.incident[`${this.role.data.for}`] = this.role.data.out
  }


  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.incident.manager = user.name;
      this.incident.company = user.company;
      this.incident.userEmail = user.email;
      this.incident.userKey = user.key;
      this.incident.companyId = user.companyId;
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().incident !== '' && company.data().incident !== undefined) {
          this.incident.companyEmail = company.data().incident;
          console.log(this.incident.companyEmail);
        }
      });
      if (user.logo !== undefined) {
        this.incident.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.incident.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.incident.lat = position.coords.latitude;
        this.incident.lng = position.coords.longitude;
        this.incident.acc = position.coords.accuracy;
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

  getCategories() {
    if (!this.categoryValues) {
      return this.allCategories().pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
        this.categoryValues = true;
      });
    }
  }

  allCategories() {
    this.categorysCollection = this.afs.collection('incidentCategorys', ref => ref.orderBy('category'));
    return this.categorys = this.categorysCollection.valueChanges();
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

  getTypes(incident) {
    if (incident.category !== 'OTHER') {
      this.loading.present('Fetching Types...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.incidentTypes(incident).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
      });
    }
  }

  incidentTypes(incident) {
    this.incidentsCollection = this.afs.collection('incidentTypes', ref => ref.where('category', '==', incident.category).orderBy('type'));
    return this.types = this.incidentsCollection.valueChanges();
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



  getSiteDetails(incident) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', incident.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.incident.site = site.name;
        if (site.recipient) {
          this.incident.recipient = site.recipient;
        }
        this.incident.siteKey = site.key;
        if (site.email !== undefined) {
          this.incident.clientEmail = site.email;
        }
      });
    });
  }

  fileChangeEvent1(event: any): void {
    this.imageChangedEvent1 = event;
  }

  imageCropped1(event: ImageCroppedEvent) {
    this.incident.photo1 = event.base64;
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
      this.incident.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.incident.photo2 = event.base64;
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
      this.incident.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent3(event: any): void {
    this.imageChangedEvent3 = event;
  }

  imageCropped3(event: ImageCroppedEvent) {
    this.incident.photo3 = event.base64;
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
      this.incident.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent4(event: any): void {
    this.imageChangedEvent4 = event;
  }

  imageCropped4(event: ImageCroppedEvent) {
    this.incident.photo4 = event.base64;
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
      this.incident.photo4 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent5(event: any): void {
    this.imageChangedEvent5 = event;
  }

  imageCropped5(event: ImageCroppedEvent) {
    this.incident.photo5 = event.base64;
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
      this.incident.photo5 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent6(event: any): void {
    this.imageChangedEvent6 = event;
  }

  imageCropped6(event: ImageCroppedEvent) {
    this.incident.photo6 = event.base64;
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
      this.incident.photo6 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  formatDate() {
    this.incident.incDate = moment(this.incident.incDate).locale('en').format('YYYY/MM/DD');
    this.incident.incTime = moment(this.incident.incTime).locale('en').format('HH:mm');
  }

  check(incident) {
    this.formatDate();
    if (this.incident.site !== undefined && this.incident.site !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.incident.ob !== undefined && this.incident.ob !== '') {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.incident.incDate !== undefined && this.incident.incDate !== '') {
      this.dateValue = true;
    } else {
      this.dateValue = false;
    }
    if (this.incident.incTime !== undefined && this.incident.incTime !== '') {
      this.timeValue = true;
    } else {
      this.timeValue = false;
    }
    if (this.incident.category !== undefined && this.incident.category !== '') {
      this.categoryValue = true;
    } else {
      this.categoryValue = false;
    }
    if (this.incident.type !== undefined && this.incident.type !== '') {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.incident.details !== undefined && this.incident.details !== '') {
      this.detailsValue = true;
    } else {
      this.detailsValue = false;
    }
    if (this.incident.person !== undefined && this.incident.person !== '') {
      this.personValue = true;
    } else {
      this.personValue = false;
    }
    if (this.incident.reported !== undefined && this.incident.reported !== '') {
      this.reportedValue = true;
    } else {
      this.reportedValue = false;
    }
    if (this.incident.arrests !== undefined && this.incident.arrests !== '') {
      this.arrestsValue = true;
    } else {
      this.arrestsValue = false;
    }
    if (this.incident.management !== undefined && this.incident.management !== '') {
      this.managementValue = true;
    } else {
      this.managementValue = false;
    }
    if (this.incident.client !== undefined && this.incident.client !== '') {
      this.clientValue = true;
    } else {
      this.clientValue = false;
    }
    if (this.incident.obDone !== undefined && this.incident.obDone !== '') {
      this.obDoneValue = true;
    } else {
      this.obDoneValue = false;
    }
    if (this.incident.manSig !== undefined && this.incident.manSig !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.send(incident);
  }

  downloadPdf() {
    this.PdfService.download(this.incident).then(() => {
      this.storage.set(this.incident.key, this.incident).then(() => {
        this.afs.collection(`incidents`).doc(this.incident.key).set(this.incident).then(() => {
          this.storage.remove(this.incident.key).then(() => {
            this.navCtrl.pop().then(() => {
              this.toast.show('Incident Report Sent Successfully!');
            });
          });
        });
      });
    });
  }

  send(incident) {
    if (this.incident.site !== undefined && this.incident.site !== '') {
      this.siteValue = true;

      if (this.incident.ob !== undefined && this.incident.ob !== '') {
        this.obValue = true;

        if (this.incident.incDate !== undefined && this.incident.incDate !== '') {
          this.dateValue = true;

          if (this.incident.incTime !== undefined && this.incident.incTime !== '') {
            this.timeValue = true;

            if (this.incident.category !== undefined && this.incident.category !== '') {
              this.categoryValue = true;

              if (this.incident.type !== undefined && this.incident.type !== '') {
                this.typeValue = true;

                if (this.incident.details !== undefined && this.incident.details !== '') {
                  this.detailsValue = true;

                  if (this.incident.person !== undefined && this.incident.person !== '') {
                    this.personValue = true;

                    if (this.incident.reported !== undefined && this.incident.reported !== '') {
                      this.reportedValue = true;

                      if (this.incident.arrests !== undefined && this.incident.arrests !== '') {
                        this.arrestsValue = true;

                        if (this.incident.management !== undefined && this.incident.management !== '') {
                          this.managementValue = true;

                          if (this.incident.client !== undefined && this.incident.client !== '') {
                            this.clientValue = true;

                            if (this.incident.obDone !== undefined && this.incident.obDone !== '') {
                              this.obDoneValue = true;

                              if (this.incident.manSig !== undefined && this.incident.manSig !== '') {
                                this.sigValue = true;

                                if (incident.type === 'OTHER') {
                                  this.incident.type = this.incident.typeOther;
                                }
                                if (this.incident.emailClient === 'User Choice') {

                                  if (this.incident.emailToClient !== undefined && this.incident.emailToClient !== '') {
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
                              this.obDoneValue = false;
                              this.invalidActionSheet();
                            }
                          } else {
                            this.clientValue = false;
                            this.invalidActionSheet();
                          }
                        } else {
                          this.managementValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.arrestsValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.reportedValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.personValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.detailsValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.typeValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.categoryValue = false;
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
        this.obValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(incident) {
    this.loading.present('Sending Please Wait...').then(() => {
      this.storage.set(this.incident.key, this.incident).then(() => {
        this.afs.collection(`incidents`).doc(this.incident.key).set(this.incident).then(() => {
          this.storage.remove(this.incident.key).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Incident Report Sent Successfully!');
              });
            });
          });
        });
      });
    });
  }

  save(incident) {
    this.storage.set(this.incident.key, this.incident).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Incident Report Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.incident.key).then(() => {
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
            this.step2(this.incident);
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
            this.PdfService.download(this.incident);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.incident);
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
              this.afs.collection('incidents').doc(report.key).delete().then(() => {
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
            this.save(this.incident);
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

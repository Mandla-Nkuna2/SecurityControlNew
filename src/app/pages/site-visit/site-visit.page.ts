import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, AlertController, Platform, IonContent, IonSlides, ActionSheetController, ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { WorkOrderPage } from '../work-order/work-order.page';

@Component({
  selector: 'app-site-visit',
  templateUrl: './site-visit.page.html',
  styleUrls: ['./site-visit.page.scss'],
})
export class SiteVisitPage implements OnInit {

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
  selectedSite = { name: '', key: '' };
  visit = {
    recipient: '',
    report: '',
    key: '',
    siteKey: '',
    userKey: '',
    userEmail: '',
    status: '',
    company: '',
    companyId: '',
    logo: '',
    timeStamp: null,
    timeStart: null,
    timeEnd: null,
    manager: '',
    duty: null,
    date: '',
    time: '',
    site: '',
    ob: '',
    guards: [],
    manSig: '',
    clientSig: '',
    incidents: '',
    incType: '',
    incDateTime: '',
    incReported: '',
    incActions: '',
    risk: '',
    alarms: '',
    uniforms: '',
    guardroom: '',
    obComplete: '',
    registers: '',
    radios: '',
    panic: '',
    phone: '',
    patrol: '',
    torch: '',
    elec: '',
    cameras: '',
    client: '',
    clientEmail: '',
    discussion: '',
    issues: '',
    email: '',
    photo1: '',
    riskDesc1: '',
    riskRec1: '',
    photo2: '',
    riskDesc2: '',
    riskRec2: '',
    photo3: '',
    riskDesc3: '',
    riskRec3: '',
    guardSig: '',
    com0: '',
    com1: '',
    com2: '',
    com3: '',
    com4: '',
    com5: '',
    com6: '',
    com7: '',
    com8: '',
    com9: '',
    com10: '',
    com11: '',
    com12: '',
    com13: '',
    com14: '',
    com15: '',
    trainingShed: '',
    dutyRost: '',
    jobDesc: '',
    parking: '',
    lat: null,
    lng: null,
    acc: null,
    form: '',
    companyEmail: '',
    emailUser: true,
    emailClient: 'No',
    photo: '',
    elecTested: '',
    responseTime: '',
  };
  siteUpdate;
  risk2: boolean = false;
  risk3: boolean = false;


  cc = ''

  siteValue: boolean = true;
  obValue: boolean = true;
  soValue: boolean = true;
  available: boolean = false;
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

  parkingValue: boolean = true;
  jobDescValue: boolean = true;
  dutyRostValue: boolean = true;
  trainingShedValue: boolean = true;
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
  photo2Value: boolean = true;

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
  sites = [];
  rawId;
  data;
  id;
  guardCount = true;
  view: boolean = false;
  passedForm;
  imageChangedEvent: any = '';
  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';

  header;

  saved = false;

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('photo') photo: ElementRef;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;


  visitsCollection: AngularFirestoreCollection<any>;
  visits: Observable<any[]>;

  constructor(public popoverController: PopoverController, private activatedRoute: ActivatedRoute, public router: Router, public loading: LoadingService, private storage: Storage,
    private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera, public toast: ToastService,
    private afs: AngularFirestore, public navCtrl: NavController, public PdfService: PdfService, public actionCtrl: ActionSheetController,
    public modalCtrl: ModalController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.getSites();
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.ready().then(() => {
          this.storage.get('user').then((user) => {
            this.visit.manager = user.name;
            this.visit.company = user.company;
            this.visit.userEmail = user.email;
            this.visit.userKey = user.key;
            this.visit.companyId = user.companyId;
            this.visit.key = UUID.UUID();
            this.visit.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
            this.visit.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
            this.visit.timeStart = moment(new Date().toISOString()).locale('en').format('HH:mm');
            this.visit.report = 'Site Visit';
            this.visit.form = 'site-visit';
            if (user.logo !== undefined) {
              this.visit.logo = user.logo;
            }
            else if (user.logo === undefined) {
              this.visit.logo = 'https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557';
            }
            this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
              if (company.data().visit !== '' && company.data().visit !== undefined) {
                this.visit.companyEmail = company.data().visit;
              }
            });
            this.guardsCollection = this.afs.collection('guards');
            this.guards = this.guardsCollection.valueChanges();

          });
        });
        this.getLocation();
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('sitevisits').doc(this.data.key).ref.get().then((info) => {
          this.passedForm = info.data();
          if (this.passedForm) {
            console.log('passed form', this.passedForm);

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

  role;
  async openPOP(mm: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        items: mm
      },
      translucent: true,
    });

    await popover.present();
    this.role = await popover.onDidDismiss();
    if (typeof this.role.data.for === "number") {
      this.visit.guards[`${this.role.data.for}`].guardSig = this.role.data.out;
    }
    else {
      this.visit[`${this.role.data.for}`] = this.role.data.out;
    }

  }

  OnDestroy() {
    this.visit.timeEnd = moment(new Date().toISOString()).locale('en').format('HH:mm');
    this.visit.timeStamp = moment(this.visit.timeEnd, 'HH:mm').diff(moment(this.visit.timeStart, 'HH:mm'), 'minutes', true);
  }

  // Complete a Work Order
  async workOrder() {
    const modal = await this.modalCtrl.create({
      component: WorkOrderPage,
      componentProps: { key: this.visit.manager, site: this.visit.site }
    });
    return await modal.present();
  }

  async getSites() {
    await this.storage.get('sites').then((sites) => {
      if (sites) {
        sites.forEach(site => {
          this.sites.push({ name: site.name, key: site.key });
        });
      }
    });
    return this.sites;
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude !== undefined) {
        this.visit.lat = position.coords.latitude;
        this.visit.lng = position.coords.longitude;
        this.visit.acc = position.coords.accuracy;
      }
    }).catch(err => 'Error: ' + err);
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
    await prompt.present();
  }

  addRisk2() {
    this.risk2 = true;
  }
  addRisk3() {
    this.risk3 = true;
  }

  getSiteDetails(visit) {
    if (this.sites.length !== 0) {
      this.visit.site = visit.site;
      if (this.visit.site && this.visit.site !== '') {
        this.selectedSite = this.sites.find(site => site.name === this.visit.site);
        this.rawId = this.selectedSite.key;
        console.log(this.rawId);
        this.visit.siteKey = this.selectedSite.key.toString();
        this.visit.site = visit.site;
        this.afs.collection('sites').doc(this.visit.siteKey).ref.get().then((site: any) => {
          if (site.data().recipient) {
            this.visit.recipient = site.data().recipient;
          }
          if (site.data().email !== undefined) {
            this.visit.clientEmail = site.data().email;
          }
        });
        var count;
        this.guardsCollection = this.afs.collection('guards', ref => ref.where('siteId', '==', this.rawId));
        this.guards = this.guardsCollection.valueChanges();

      }
    }
  }

  assignGuards() {

    if (this.id != 'view') {
      this.visit.guards = []
      for (let i = 0; i < this.visit.duty; i++) {
        this.visit.guards.push({ guardName: '', guardSig: '', guardPhoto: '', available: false, crop: false })
      }
    }
  }



  fileChangeEvent(event: any, i): void {
    for (let g = 0; g < this.visit.duty; g++) {
      if (g == i) {
        this.visit.guards[`${i}`].crop = true
      }
      else {
        this.visit.guards[`${g}`].crop = false
      }
    }

    this.cc = i

    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent, i) {


    this.visit.guards[`${this.cc}`].guardPhoto = event.base64;
    console.log(this.visit);

  }

  async takePhoto(i: number) {
    let actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage(false, i);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage(true, i);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage(useAlbum: boolean, i: number) {
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
      this.visit.guards[`${i}`].guardPhoto = 'data:image/jpeg;base64,' + imageData;
    }));
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
    }
    else if (visit.issues === 'No') {
      this.visit.status = 'NP';
    }
    else if (visit.issues === 'Not Available') {
      this.visit.status = 'NA';
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

  check(visit) {
    this.visit.date = moment(this.visit.date).locale('en').format('YYYY/MM/DD');

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
    if (this.visit.dutyRost !== undefined && this.visit.dutyRost !== '') {
      this.dutyRostValue = true;
    } else {
      this.dutyRostValue = false;
    }
    if (this.visit.jobDesc !== undefined && this.visit.jobDesc !== '') {
      this.jobDescValue = true;
    } else {
      this.jobDescValue = false;
    }
    if (this.visit.parking !== undefined && this.visit.parking !== '') {
      this.parkingValue = true;
    } else {
      this.parkingValue = false;
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
    this.send(visit);
  }

  downloadPdf() {
    this.OnDestroy();
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
        // this.afs.collection('sites').doc(id).update(this.update).then(() => {
        //   this.afs.collection(`users/${this.visit.userKey}/sites`).doc(id).update(this.update).then(() => {
        //     this.afs.collection(`sitevisits`).doc(this.visit.key).set(this.visit).then(() => {
        //       this.storage.remove(this.visit.key).then(() => {
        //         this.router.navigate(['forms']).then(() => {
        //           this.toast.show('Site Visit Sent Successfully!');
        //         });
        //       });
        //     });
        //   });
        // });
      });
    });
  }

  send(visit) {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;

      if (this.visit.ob !== undefined && this.visit.ob !== '') {
        this.obValue = true;

        if (this.visit.duty !== undefined && this.visit.duty != null) {
          this.soValue = true;

          if (this.visit.dutyRost !== undefined && this.visit.dutyRost !== '') {
            this.dutyRostValue = true;

            if (this.visit.jobDesc !== undefined && this.visit.jobDesc !== '') {
              this.jobDescValue = true;

              if (this.visit.parking !== undefined && this.visit.parking !== '') {
                this.parkingValue = true;

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

                                        return this.final();

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
                this.parkingValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.jobDescValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.dutyRostValue = false;
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

  jj() {
    console.log(this.visit);

  }

  final() {
    if (this.visit.client !== undefined && this.visit.client !== '') {
      this.clientValue = true;

      if (this.visit.issues !== undefined && this.visit.issues !== '') {
        this.issuesValue = true;

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
        this.issuesValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.clientValue = false;
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
              this.afs.collection('sitevisits').doc(report.key).delete().then(() => {
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
    this.OnDestroy();
    if (this.visit.manSig !== undefined && this.visit.manSig !== '') {
      this.sigValue = true;
      this.loading.present('Sending Please Wait...').then(() => {
        this.storage.set(this.visit.key, this.visit).then(() => {
          this.update = {
            lastVisit: this.visit.date,
            visitBy: this.visit.manager,
            status: this.visit.status,
            visitKey: this.visit.key
          };
          var id = this.visit.siteKey + '';
          this.afs.collection('sites').doc(id).update(this.update).then(() => {
            this.afs.collection(`users/${this.visit.userKey}/sites`).doc(id).update(this.update).then(() => {
              this.afs.collection(`sitevisits`).doc(this.visit.key).set(this.visit).then(() => {
                this.storage.remove(this.visit.key).then(() => {
                  this.router.navigate(['forms']).then(() => {
                    this.loading.dismiss().then(() => {
                      this.toast.show('Site Visit Sent Successfully!');
                    });
                  });
                });
              });
            });
          });
        });
      });
    } else {
      this.sigValue = false;
      this.invalidActionSheet();
    }
  }

  edit(visit) {
    this.view = false;
  }

}


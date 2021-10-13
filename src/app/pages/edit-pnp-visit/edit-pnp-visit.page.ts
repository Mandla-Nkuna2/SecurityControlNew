import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, IonContent, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-edit-pnp-visit',
  templateUrl: './edit-pnp-visit.page.html',
  styleUrls: ['./edit-pnp-visit.page.scss'],
})
export class EditPnpVisitPage implements OnInit {

  visit = {
    report: '', recipient: '', key: '', siteKey: '', userKey: '', userEmail: '', status: '', company: '', companyId: '', logo: '',
    timeStamp: '', manager: '', date: '', time: '', site: '', ob: '', duty: 0, so: '', so2: '', so3: '', so4: '', so5: '', so6: '', so7: '',
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

  slideNum;
  nxtButton: boolean = true;
  public formData: any;
  update;
  update2;
  emailOption: boolean;
  sitesValues: boolean = false;
  isApp: boolean;

    @ViewChild('visitSlider') visitSlider: any;
  @ViewChild('Content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    minWidth: 2,
    backgroundColor: '#fff',
    penColor: '#000'
  };

  constructor(public popoverController:PopoverController,private platform: Platform, public alertCtrl: AlertController, private camera: Camera, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController, private storage: Storage,
    public router: Router, public loading: LoadingService) { }

  async delete() {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Report?',
      cssClass: 'alert',
      message: 'Are you sure you want to delete this Report?',
      buttons: [
        {
          text: 'DELETE',
          handler: data => {
            this.storage.remove(this.visit.key).then(() => {
              this.navCtrl.pop().then(() => {
                this.toast.show('PnP Site Visit Report Deleted Successfully');
              });
            });
          }
        },
        {
          text: 'CANCEL',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      var id = this.visit.userKey;
      this.searchSites(id);
      this.visitSlider.lockSwipes(true);
      this.visitSlider.lockSwipeToNext(true);
      this.isApp = this.platform.platforms().includes("cordova")
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

  action() {
    this.slideNum = this.visitSlider.getActiveIndex();
    if (this.slideNum === 4) {
      this.nxtButton = false;
    }
    else {
      this.nxtButton = true;
    }
  }

  next() {
    if (this.visitSlider.isEnd()) {
      this.nxtButton = false;
    }
    this.slideNum = this.visitSlider.getActiveIndex();
    if (this.slideNum === 0) {
      this.slide1Valid();
    }
    else if (this.slideNum === 1) {
      this.slide2Valid();
    }
    else if (this.slideNum === 2) {
      this.slide3Valid();
    }
    else if (this.slideNum === 3) {
      this.slide4Valid();
    }
    else {
      return;
    }
  }

  async prev() {
    this.slideNum = this.visitSlider.getActiveIndex();
    if (this.slideNum === 0) {
      let prompt = await this.alertCtrl.create({
        header: 'Exit Form',
        message: 'Are you sure you want to Exit? Any inputted information will be lost from this form',
        buttons: [
          {
            text: 'CANCEL',
            handler: data => {
            }
          },
          {
            text: 'EXIT',
            handler: data => {
              this.navCtrl.pop();
            }
          }
        ]
      });
      return await prompt.present();
    }
    this.visitSlider.lockSwipes(false);
    this.visitSlider.slidePrev();
    this.content.scrollToTop().then(() => {
      this.visitSlider.lockSwipes(true);
      this.nxtButton = true;
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

  slide1Valid() {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;
      if (this.visit.ob !== undefined && this.visit.ob !== '') {
        this.obValue = true;
        if (this.visit.duty !== undefined && this.visit.duty != null) {
          this.soValue = true;
          this.slide1 = true;
          this.visitSlider.lockSwipes(false);
          this.visitSlider.slideNext();
          this.content.scrollToTop().then(() => {
            this.visitSlider.lockSwipes(true);
            this.visitSlider.lockSwipeToNext(true);
          });
        }
        else {
          this.soValue = false;
          this.alertMsg();
        }
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
                this.visitSlider.lockSwipes(false);
                this.visitSlider.slideNext();
                this.content.scrollToTop().then(() => {
                  this.visitSlider.lockSwipes(true);
                  this.visitSlider.lockSwipeToNext(true);
                });
              }
              else {
                this.incActValue = false;
                this.alertMsg();
              }
            }
            else {
              this.incRepValue = false;
              this.alertMsg();
            }
          }
          else {
            this.incDateValue = false;
            this.alertMsg();
          }
        }
        else {
          this.incTypeValue = false;
          this.alertMsg();
        }
      }
      else {
        this.slide2 = true;
        this.visitSlider.lockSwipes(false);
        this.visitSlider.slideNext();
        this.content.scrollToTop().then(() => {
          this.visitSlider.lockSwipes(true);
          this.visitSlider.lockSwipeToNext(true);
        });
      }
    }
    else {
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
              this.visitSlider.lockSwipes(false);
              this.visitSlider.slideNext();
              this.content.scrollToTop().then(() => {
                this.visitSlider.lockSwipes(true);
                this.visitSlider.lockSwipeToNext(true);
              });
            }
            else {
              this.recValue = false;
              this.alertMsg();
            }
          }
          else {
            this.detValue = false;
            this.alertMsg();
          }
        }
        else {
          this.photoValue = false;
          this.alertMsg();
        }
      }
      else {
        this.slide3 = true;
        this.visitSlider.lockSwipes(false);
        this.visitSlider.slideNext();
        this.content.scrollToTop().then(() => {
          this.visitSlider.lockSwipes(true);
          this.visitSlider.lockSwipeToNext(true);
        });
      }
    }
    else {
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
                            this.visitSlider.lockSwipes(false);
                            this.visitSlider.slideNext();
                            this.content.scrollToTop().then(() => {
                              this.visitSlider.lockSwipes(true);
                              this.visitSlider.lockSwipeToNext(true);
                              this.nxtButton = false;
                            });
                          }
                          else {
                            this.camValue = false;
                            this.alertMsg();
                          }
                        }
                        else {
                          this.elecValue = false;
                          this.alertMsg();
                        }
                      }
                      else {
                        this.torchValue = false;
                        this.alertMsg();
                      }
                    }
                    else {
                      this.patrolValue = false;
                      this.alertMsg();
                    }
                  }
                  else {
                    this.phoneValue = false;
                    this.alertMsg();
                  }
                }
                else {
                  this.panicValue = false;
                  this.alertMsg();
                }
              }
              else {
                this.radiosValue = false;
                this.alertMsg();
              }
            }
            else {
              this.regValue = false;
              this.alertMsg();
            }
          }
          else {
            this.obBookValue = false;
            this.alertMsg();
          }
        }
        else {
          this.roomValue = false;
          this.alertMsg();
        }
      }
      else {
        this.uniformValue = false;
        this.alertMsg();
      }
    }
    else {
      this.alarmsValue = false;
      this.alertMsg();
    }
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
      })
    });
  };

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

  async takePhoto1() {
    const options: CameraOptions = {
      quality: 90,
      targetWidth: 300,
      targetHeight: 300,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.visit.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async takePhoto2() {
    const options: CameraOptions = {
      quality: 90,
      targetWidth: 300,
      targetHeight: 300,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.visit.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async takePhoto3() {
    const options: CameraOptions = {
      quality: 90,
      targetWidth: 300,
      targetHeight: 300,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE
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

  send(visit) {
    if (this.visit.client !== undefined && this.visit.client !== '') {
      this.clientValue = true;

      if (this.visit.issues !== undefined && this.visit.issues !== '') {
        this.issuesValue = true;

        if (this.visit.emailClient === 'User Choice') {

          if (this.visit.email !== undefined && this.visit.email !== '') {
            this.emailValue = true;
            this.step2(visit);
          }
          else {
            this.emailValue = false;
            this.alertMsg();
          }
        }
        else {
          this.step2(visit);
        }
      }
      else {
        this.issuesValue = false;
        this.alertMsg();
      }
    }
    else {
      this.clientValue = false;
      this.alertMsg();
    }
  }

  step2(visit) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.update2 = {
        lastVisit: visit.date,
        visitBy: visit.manager,
        status: visit.status,
        visitKey: visit.key
      };
      var id = this.visit.siteKey + '';
      this.afs.collection(`sites`).doc(id).update(this.update2).then(() => {
        this.afs.collection(`users/${this.visit.userKey}/sites`).doc(id).update(this.update2).then(() => {
          this.afs.collection(`pnpvisit`).doc(this.visit.key).set(this.update).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('PnP Site Visit Report Sent Successfully');
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

}


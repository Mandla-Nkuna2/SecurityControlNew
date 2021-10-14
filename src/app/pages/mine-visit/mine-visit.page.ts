import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, IonContent, AlertController, Platform } from '@ionic/angular';
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
import { Router } from '@angular/router';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-mine-visit',
  templateUrl: './mine-visit.page.html',
  styleUrls: ['./mine-visit.page.scss'],
})

export class MineVisitPage implements OnInit {

  visit = {
    _id: '', report: '', recipient: '', key: '', siteKey: '', userKey: '', userEmail: '', company: '', companyId: '', logo: '',
    timeStamp: '', manager: '', date: '', time: '', site: '', ob: '', shift: '', numSo: 0, so: '', soKey: '', soCoNo: '', soPost: '',
    guardSig: '', manSig: '', alarms: '', uniforms: '', guardroom: '', obComplete: '', registers: '', radios: '', panic: '', phone: '',
    patrol: '', torch: '', elec: '', cameras: '', clientEmail: '', photo1: '', photo2: '', com1: '', com2: '', com3: '', com4: '',
    com5: '', com6: '', com7: '', com8: '', com9: '', com10: '', com11: '', com12: '', com13: '', com14: '', com15: '', com16: '',
    com17: '', com18: '', com19: '', com20: '', com21: '', com22: '', com23: '', com24: '', com25: '', com26: '', com27: '', com28: '',
    com29: '', com30: '', com31: '', com32: '', com33: '', com34: '', com35: '', com36: '', com37: '', com38: '', com39: '', com40: '',
    com41: '', com42: '', com43: '', com44: '', com45: '', lat: 0, lng: 0, acc: 0, companyEmail: '', emailUser: true, emailClient: '',
    email: '', pedestrian: '', presentable: '', left: '', heaters: '', announced: '', signedin: '', signedout: '', collection: '',
    hourly: '', incidents: '', handover: '', equipment: '', working: '', panicGuard: '', safeko: '', tested: '', present: '', comply: '',
    sop: '', signed: '', ids: '', points: '', qty: '', inplace: '', complaints: '', workshop: '', secure: '', valid: '', windows: '',
    supervisor: '', place: '', supCom: '', test: '', activated: '', notActive: '', checked: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  users: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  siteUpdate;
  
  
  sitesValues: boolean = false;

  siteValue: boolean = true;
  obValue: boolean = true;
  shiftValue: boolean = true;
  numValue: boolean = true;
  photoValue: boolean = true;

  soValue: boolean = true;
  photo2Value: boolean = true;
  postValue: boolean = true;
  uniformValue: boolean = true;
  roomValue: boolean = true;
  obBookValue: boolean = true;
  regValue: boolean = true;
  guardSigValue: boolean = true;

  alarmsValue: boolean = true;
  radiosValue: boolean = true;
  panicValue: boolean = true;
  phoneValue: boolean = true;
  patrolValue: boolean = true;
  torchValue: boolean = true;
  elecValue: boolean = true;
  camValue: boolean = true;

  sigValue: boolean = true;

  slideNum;
  nxtButton: boolean = true;
  public formData: any;
  update;
  emailOption: boolean;
  isApp: boolean;

  @ViewChild('picture') picture: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
    @ViewChild('visitSlider') visitSlider: any;
  @ViewChild('Content') content: IonContent;

 

  role;

  constructor(public popoverController:PopoverController,private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera,
    public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    public navParams: NavParams, public loading: LoadingService, private storage: Storage, public router: Router) {
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


  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('user').then((user) => {
        if (user.key) {
          var id = user.key;
          this.searchSites(id);
          this.displayUser(id);
        }
        this.getLocation();
        this.visit.key = UUID.UUID();
        this.visit._id = this.visit.key;
        this.visit.timeStamp = this.visit.date + ' at ' + this.visit.time;
        this.visit.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
        this.visit.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
        this.visit.report = 'Mine Visit';
        this.visitSlider.lockSwipes(true);
        this.visitSlider.lockSwipeToNext(true);
        this.isApp = this.platform.platforms().includes("cordova")
      });
    });
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
      if (user.visit !== undefined) {
        this.visit.companyEmail = user.mine;
      }
      if (user.visitUser !== undefined) {
        this.visit.emailUser = user.mineUser;
      }
      if (user.visitClient !== undefined) {
        this.visit.emailClient = user.mineClient;

        if (this.visit.emailClient === 'User Choice') {
          this.emailOption = true;
        } else {
          this.emailOption = false;
          this.visit.email = this.visit.emailClient;
        }
      }
    });
  }

 

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      this.visit.lat = position.coords.latitude;
      this.visit.lng = position.coords.longitude;
      this.visit.acc = position.coords.accuracy;
      console.log(position.coords.accuracy);
    });
  }

  canvasResize() {
    let canvas = document.querySelectorAll('canvas');
    var ctx1 = canvas[0].getContext('2d');
    ctx1.fillStyle = 'white';
    ctx1.fillRect(0, 0, canvas[0].width, canvas[0].height);
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

  next() {
    this.slideNum = this.visitSlider.getActiveIndex();
    if (this.slideNum === 0) {
      this.slide1Valid();
    }
    if (this.slideNum === 1) {
      this.slide2Valid();
    }
    if (this.slideNum === 2) {
      this.slide3Valid();
    }
    if (this.slideNum === 3) {
      this.slide4Valid();
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
              this.router.navigate(['/forms']);
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

        if (this.visit.shift !== undefined && this.visit.shift !== '') {
          this.shiftValue = true;

          if (this.visit.photo1 !== undefined && this.visit.photo1 !== '') {
            this.photoValue = true;
            this.visitSlider.lockSwipes(false);
            this.visitSlider.slideNext();
            this.content.scrollToTop().then(() => {
              this.visitSlider.lockSwipes(true);
              this.visitSlider.lockSwipeToNext(true);
            })
          }
          else {
            this.photoValue = false;
            this.alertMsg();
          }
        }
        else {
          this.shiftValue = false;
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
    if (this.visit.numSo !== undefined && this.visit.numSo !== null) {
      this.numValue = true;

      if (this.visit.numSo > 0) {

        if (this.visit.so !== undefined && this.visit.so !== '') {
          this.soValue = true;

          if (this.visit.photo2 !== undefined && this.visit.photo2 !== '') {
            this.photo2Value = true;

            if (this.visit.uniforms !== undefined && this.visit.uniforms !== '') {
              this.uniformValue = true;

              if (this.visit.guardroom !== undefined && this.visit.guardroom !== '') {
                this.roomValue = true;

                if (this.visit.obComplete !== undefined && this.visit.obComplete !== '') {
                  this.obBookValue = true;

                  if (this.visit.registers !== undefined && this.visit.registers !== '') {
                    this.regValue = true;

                    if (this.visit.alarms !== undefined && this.visit.alarms !== '') {
                      this.alarmsValue = true;

                      if (this.visit.radios !== undefined && this.visit.radios !== '') {
                        this.radiosValue = true;

                        if (this.visit.panic !== undefined && this.visit.panic !== '') {
                          this.panicValue = true;

                          if (this.visit.guardSig !== undefined && this.visit.guardSig !== '') {
                            this.guardSigValue = true;

                            this.visitSlider.lockSwipes(false);
                            this.visitSlider.slideNext();
                            this.content.scrollToTop().then(() => {
                              this.visitSlider.lockSwipes(true);
                              this.visitSlider.lockSwipeToNext(true);
                            });
                          } else {
                            this.guardSigValue = false;
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
                      this.alarmsValue = false;
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
            this.photo2Value = false;
            this.alertMsg();
          }
        } else {
          this.soValue = false;
          this.alertMsg();
        }
      } else {
        this.visitSlider.lockSwipes(false);
        this.visitSlider.slideNext();
        this.content.scrollToTop().then(() => {
          this.visitSlider.lockSwipes(true);
          this.visitSlider.lockSwipeToNext(true);
        });
      }
    }
  }

  slide3Valid() {
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
              this.visitSlider.lockSwipes(false);
              this.visitSlider.slideNext();
              this.content.scrollToTop().then(() => {
                this.visitSlider.lockSwipes(true);
                this.visitSlider.lockSwipeToNext(true);
                this.nxtButton = true;
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
  }

  slide4Valid() {
    this.visitSlider.lockSwipes(false);
    this.visitSlider.slideNext();
    this.content.scrollToTop().then(() => {
      this.visitSlider.lockSwipes(true);
      this.visitSlider.lockSwipeToNext(true);
      this.nxtButton = false;
    });
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
        if (site.recipient) {
          this.visit.recipient = site.recipient;
        }
        this.visit.siteKey = site.key;
        if (site.email !== undefined) {
          this.visit.clientEmail = site.email;
        }
      });
    });
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

  save(visit) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.update = {
        lastVisit: visit.date,
        visitBy: visit.manager,
        visitKey: visit.key
      };
      this.afs.collection('sites').doc(visit.siteKey).update(this.update).then(() => {
        this.afs.collection(`users/${visit.userKey}/sites`).doc(visit.siteKey).update(this.update).then(() => {
          this.afs.collection(`minevisits`).doc(visit.key).set(visit).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Mine Visit Saved Successfully!');
              });
            });
          });
        });
      });
    });
  }


}


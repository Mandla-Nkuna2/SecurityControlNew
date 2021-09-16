import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, AlertController, Platform, IonContent, IonSlides, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
// 
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-site-visit-gen',
  templateUrl: './site-visit-gen.page.html',
  styleUrls: ['./site-visit-gen.page.scss'],
})
export class SiteVisitGenPage implements OnInit {

  visit = {
    report: '', recipient: '', key: '', siteKey: '', userKey: '', userEmail: '', status: '', company: '', companyId: '',
    logo: '', timeStamp: '', manager: '', date: '', time: '', site: '', ob: '', shift: '', numSo: 0, so: '', soKey: '',
    soCoNo: '', soPost: '', guardSig: '', manSig: '', clientSig: '', alarms: '', uniforms: '', guardroom: '', obComplete: '',
    registers: '', radios: '', panic: '', phone: '', patrol: '', torch: '', elec: '', cameras: '', client: '', clientEmail: '',
    discussion: '', issues: '', email: '', photo1: '', photo2: '', com1: '', com2: '', com3: '', com4: '', com5: '', com6: '', com7: '',
    com8: '', com9: '', com10: '', com11: '', com12: '', lat: 0, lng: 0, acc: 0, companyEmail: '', emailUser: false, emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  users: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards = []
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

  clientValue: boolean = true;
  issuesValue: boolean = true;
  emailValue: boolean = true;
  sigValue: boolean = true;
  role: any;

  public formData: any;
  update;
  emailOption: boolean;
  isApp: boolean;
  history: boolean;

  data;
  id;
  view: boolean = false;
  passedForm;
  imageChangedEvent: any = '';
  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';
  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  header;

  saved = false;

  @ViewChild('picture') picture: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;




  constructor(public popoverController: PopoverController, private activatedRoute: ActivatedRoute, public router: Router, public loading: LoadingService, private storage: Storage,
    private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera, public toast: ToastService,
    private afs: AngularFirestore, public navCtrl: NavController, public PdfService: PdfService, public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.ready().then(() => {
          this.storage.get('user').then((user) => {
            if (user.key) {
              var id = user.key;
              this.sitesCollection = this.afs.collection(`users/${id}/sites`, ref => ref.orderBy('name'));
              this.sites = this.sitesCollection.valueChanges();
              this.displayUser(id);
            }
            this.getLocation();
            this.visit.key = UUID.UUID();
            this.visit.timeStamp = this.visit.date + ' at ' + this.visit.time;
            this.visit.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
            this.visit.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
            this.visit.report = 'Site Visit Gen';
            this.slides.lockSwipes(true);
            this.slides.lockSwipeToNext(true);
          });
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('visits').doc(this.data.key).ref.get().then((info) => {
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
        if (company.data()['visit'] !== '' && company.data()['visit'] !== undefined) {
          this.visit.companyEmail = company.data().visit;
          console.log(this.visit.companyEmail);
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


  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      this.visit.lat = position.coords.latitude;
      this.visit.lng = position.coords.longitude;
      this.visit.acc = position.coords.accuracy;
      console.log(position.coords.accuracy);
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
            if (this.slideNumber === 2) {
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


  getSiteDetails(visit) {
    console.log('in get site', visit.detail.value.key);
    let key = visit.detail.value.key
    if (typeof (key) !== "string") {
      key = key.toString()
    }
    this.afs.firestore.collection('sites').doc(key).get().then((place: any) => {

      if (place.data().email !== undefined) {
        this.visit.clientEmail = place.data().email;
      }
      if (place.data().recipient) {
        this.visit.recipient = place.data().recipient
      }
      this.visit.site = place.data().name;
      this.visit.siteKey = key;
      this.getGuards(visit.detail.value.key);

    })

  }

  getGuards(visitkey) {
    this.guards = []
    this.afs.firestore.collection(`guards`).where("siteId", '==', visitkey).get().then((officer) => {
      officer.forEach((sh) => {
        this.guards.push(sh.data())
      })

    })
  }

  async guardDetails(visit) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', visit.soKey));
    this.guardId = this.guardIdCollection.valueChanges();
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

  status(visit) {
    if (visit.issues === 'Yes') {
      this.visit.status = 'ALERT!!!';
    } else if (visit.issues === 'No') {
      this.visit.status = 'NP';
    } else if (visit.issues === 'Not Available') {
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
    this.send(visit);
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
        this.afs.collection('sites').doc(id).update(this.update).then(() => {
          this.afs.collection(`users/${this.visit.userKey}/sites`).doc(id).update(this.update).then(() => {
            this.afs.collection(`visits`).doc(this.visit.key).set(this.visit).then(() => {
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

  send(visit) {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;

      if (this.visit.ob !== undefined && this.visit.ob !== '') {
        this.obValue = true;

        return this.final();

      } else {
        this.obValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
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
              this.afs.collection('visits').doc(report.key).delete().then(() => {
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
              this.afs.collection(`visits`).doc(this.visit.key).set(this.visit).then(() => {
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

/*

slide1Valid() {
    if (this.visit.siteKey !== undefined && this.visit.siteKey !== '') {
      this.siteValue = true;

      if (this.visit.ob !== undefined && this.visit.ob !== '') {
        this.obValue = true;

        if (this.visit.shift !== undefined && this.visit.shift !== '') {
          this.shiftValue = true;

          if (this.visit.photo1 !== undefined && this.visit.photo1 !== '') {
            this.photoValue = true;
            this.slides.lockSwipes(false);
            this.slides.slideNext();
            this.content.scrollToTop().then(() => {
              this.slides.lockSwipes(true);
              this.slides.lockSwipeToNext(true);
            });
          } else {
            this.photoValue = false;
            this.alertMsg();
          }
        } else {
          this.shiftValue = false;
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
    if (this.visit.numSo !== undefined && this.visit.numSo != null) {
      this.numValue = true;

      if (this.visit.numSo > 0) {

        if (this.visit.so !== undefined && this.visit.so !== '') {
          this.soValue = true;

          if (this.visit.photo2 !== undefined && this.visit.photo2 !== '') {
            this.photo2Value = true;

            if (this.visit.soPost !== undefined && this.visit.soPost !== '') {
              this.postValue = true;

              if (this.visit.uniforms !== undefined && this.visit.uniforms !== '') {
                this.uniformValue = true;

                if (this.visit.guardroom !== undefined && this.visit.guardroom !== '') {
                  this.roomValue = true;

                  if (this.visit.obComplete !== undefined && this.visit.obComplete !== '') {
                    this.obBookValue = true;

                    if (this.visit.registers !== undefined && this.visit.registers !== '') {
                      this.regValue = true;

                      if (this.visit.guardSig !== undefined && this.visit.guardSig !== '') {
                        this.guardSigValue = true;

                        this.slides.lockSwipes(false);
                        this.slides.slideNext();
                        this.content.scrollToTop().then(() => {
                          this.slides.lockSwipes(true);
                          this.slides.lockSwipeToNext(true);
                        });
                      } else {
                        this.guardSigValue = false;
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
              this.postValue = false;
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
        this.slides.lockSwipes(false);
        this.slides.slideNext();
        this.content.scrollToTop().then(() => {
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      }
    }
  }

  slide3Valid() {
    if (this.visit.alarms !== undefined && this.visit.alarms !== '') {
      this.alarmsValue = true;

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
      this.alarmsValue = false;
      this.alertMsg();
    }
  }

  */


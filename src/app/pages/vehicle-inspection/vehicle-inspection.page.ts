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
import { Router, ActivatedRoute } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-vehicle-inspection',
  templateUrl: './vehicle-inspection.page.html',
  styleUrls: ['./vehicle-inspection.page.scss'],
})
export class VehicleInspectionPage implements OnInit {

  vehicle = {
    report: '', fleetKey: '', key: '', userKey: '', userEmail: '', company: '', companyId: '', logo: '', timeStamp: '', date: '', time: '',
    inspector: '', shift: '', registration: '', odometer: '', tires: '', wipers: '', headlights: '', tail: '', indicators: '', hazards: '',
    plates: '', disc: '', oil: '', exterior: '', breaks: '', handbreak: '', clutch: '', mirrors: '', hooter: '', lights: '', belts: '',
    spare: '', jack: '', interior: '', photo1: '', photo2: [], signature: '', lat: 0, lng: 0, acc: 0, emailUser: true, companyEmail: '',
  };

  registrationsCollection: AngularFirestoreCollection<any>;
  registrations: Observable<any[]>;
  fleetCollection: AngularFirestoreCollection<any>;
  fleets: Observable<any[]>;

  

  update;
  shiftValue: boolean = true;
  regValue: boolean = true;
  odometerValue: boolean = true;
  tiresValue: boolean = true;
  wipersValue: boolean = true;
  headValue: boolean = true;
  tailValue: boolean = true;
  indicatorsValue: boolean = true;
  hazardValue: boolean = true;
  platesValue: boolean = true;
  discValue: boolean = true;
  oilValue: boolean = true;
  exteriorValue: boolean = true;
  breaksValue: boolean = true;
  handValue: boolean = true;
  clutchValue: boolean = true;
  mirrorsValue: boolean = true;
  hooterValue: boolean = true;
  lightsValue: boolean = true;
  beltsValue: boolean = true;
  spareValue: boolean = true;
  jackValue: boolean = true;
  interiorValue: boolean = true;
  photo1Value: boolean = true;
  photo2Value: boolean = true;
  sigValue: boolean = true;
  isApp: boolean;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  public formData: any;
  history: boolean = false;
  data;
  id;
  view: boolean = false;
  passedForm;
role;
  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;

  signaturePadOptions: Object = {
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  constructor(public popoverController:PopoverController, private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera,
    public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    public router: Router, public loading: LoadingService, private storage: Storage, public actionCtrl: ActionSheetController,
    public activatedRoute: ActivatedRoute, public PdfService: PdfService) {
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
          }
          this.getLocation();
          this.vehicle.key = UUID.UUID();
          this.vehicle.timeStamp = this.vehicle.date + ' at ' + this.vehicle.time;
          this.vehicle.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.vehicle.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.vehicle.report = 'Vehicle Inspection';
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('vehicles').doc(this.data.key).ref.get().then((vehicle) => {
          this.passedForm = vehicle.data();
          if (this.passedForm) {
            this.vehicle = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((vehicle) => {
        this.vehicle = vehicle;
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

    this.vehicle[`${this.role.data.for}`] = this.role.data.out
  }



  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.vehicle.inspector = user.name;
      this.vehicle.company = user.company;
      this.vehicle.userEmail = user.email;
      this.vehicle.userKey = user.key;
      this.vehicle.companyId = user.companyId;
      if (this.vehicle.companyId !== '') {
        var key = this.vehicle.companyId;
        this.getRegistrations(key);
      }
      if (user.logo !== undefined) {
        this.vehicle.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.vehicle.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().vehicle !== '' && company.data().vehicle !== undefined) {
          this.vehicle.companyEmail = company.data().vehicle;
          console.log(this.vehicle.companyEmail);
        }
      });
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

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude !== undefined) {
        this.vehicle.lat = position.coords.latitude;
        this.vehicle.lng = position.coords.longitude;
        this.vehicle.acc = position.coords.accuracy;
        console.log(this.vehicle.acc);
      }
    });
  }

  getRegistrations(key) {
    this.loading.present('Fetching Registrations...');
    return this.Registrations(key).pipe(take(1)).subscribe(() => {
      this.loading.dismiss();
    });
  }

  Registrations(key) {
    this.registrationsCollection = this.afs.collection('fleet', ref => ref.where('companyId', '==', `${key}`));
    return this.registrations = this.registrationsCollection.valueChanges();
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

  getVehicle(vehicle) {
    this.fleetCollection = this.afs.collection('fleet', ref => ref.where('key', '==', `${vehicle.fleetKey}`));
    this.fleets = this.fleetCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.fleets.subscribe(fleets => {
      fleets.forEach(fleet => {
        this.vehicle.registration = fleet.registration;
        this.vehicle.fleetKey = fleet.key;
      });
    });
  }

  

  fileChangeEvent1(event: any): void {
    this.imageChangedEvent1 = event;
  }

  imageCropped1(event: ImageCroppedEvent) {
    this.vehicle.photo1 = event.base64;
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
      this.vehicle.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.vehicle.photo2.push(event.base64)
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
      this.vehicle.photo2.push('data:image/jpeg;base64,' + imageData)
    }));
  }

  check(vehicle) {
    if (this.vehicle.shift !== undefined && this.vehicle.shift !== '') {
      this.shiftValue = true;
    } else {
      this.shiftValue = false;
    }
    if (this.vehicle.registration !== undefined && this.vehicle.registration !== '') {
      this.regValue = true;
    } else {
      this.regValue = false;
    }
    if (this.vehicle.odometer !== undefined && this.vehicle.odometer !== '') {
      this.odometerValue = true;
    } else {
      this.odometerValue = false;
    }
    if (this.vehicle.tires !== undefined && this.vehicle.tires !== '') {
      this.tiresValue = true;
    } else {
      this.tiresValue = false;
    }
    if (this.vehicle.wipers !== undefined && this.vehicle.wipers !== '') {
      this.wipersValue = true;
    } else {
      this.wipersValue = false;
    }
    if (this.vehicle.headlights !== undefined && this.vehicle.headlights !== '') {
      this.headValue = true;
    } else {
      this.headValue = false;
    }
    if (this.vehicle.tail !== undefined && this.vehicle.tail !== '') {
      this.tailValue = true;
    } else {
      this.tailValue = false;
    }
    if (this.vehicle.indicators !== undefined && this.vehicle.indicators !== '') {
      this.indicatorsValue = true;
    } else {
      this.indicatorsValue = false;
    }
    if (this.vehicle.hazards !== undefined && this.vehicle.hazards !== '') {
      this.hazardValue = true;
    } else {
      this.hazardValue = false;
    }
    if (this.vehicle.plates !== undefined && this.vehicle.plates !== '') {
      this.platesValue = true;
    } else {
      this.platesValue = false;
    }
    if (this.vehicle.disc !== undefined && this.vehicle.disc !== '') {
      this.discValue = true;
    } else {
      this.discValue = false;
    }
    if (this.vehicle.oil !== undefined && this.vehicle.oil !== '') {
      this.oilValue = true;
    } else {
      this.oilValue = false;
    }
    if (this.vehicle.exterior !== undefined && this.vehicle.exterior !== '') {
      this.exteriorValue = true;
    } else {
      this.exteriorValue = false;
    }
    if (this.vehicle.breaks !== undefined && this.vehicle.breaks !== '') {
      this.breaksValue = true;
    } else {
      this.breaksValue = false;
    }
    if (this.vehicle.handbreak !== undefined && this.vehicle.handbreak !== '') {
      this.handValue = true;
    } else {
      this.handValue = false;
    }
    if (this.vehicle.clutch !== undefined && this.vehicle.clutch !== '') {
      this.clutchValue = true;
    } else {
      this.clutchValue = false;
    }
    if (this.vehicle.mirrors !== undefined && this.vehicle.mirrors !== '') {
      this.mirrorsValue = true;
    } else {
      this.mirrorsValue = false;
    }
    if (this.vehicle.hooter !== undefined && this.vehicle.hooter !== '') {
      this.hooterValue = true;
    } else {
      this.hooterValue = false;
    }
    if (this.vehicle.lights !== undefined && this.vehicle.lights !== '') {
      this.lightsValue = true;
    } else {
      this.lightsValue = false;
    }
    if (this.vehicle.belts !== undefined && this.vehicle.belts !== '') {
      this.beltsValue = true;
    } else {
      this.beltsValue = false;
    }
    if (this.vehicle.spare !== undefined && this.vehicle.spare !== '') {
      this.spareValue = true;
    } else {
      this.spareValue = false;
    }
    if (this.vehicle.jack !== undefined && this.vehicle.jack !== '') {
      this.jackValue = true;
    } else {
      this.jackValue = false;
    }
    if (this.vehicle.interior !== undefined && this.vehicle.interior !== '') {
      this.interiorValue = true;
    } else {
      this.interiorValue = false;
    }
    if (this.vehicle.signature !== undefined && this.vehicle.interior !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.send(vehicle);
  }

  downloadPdf(vehicle) {
    this.PdfService.download(this.vehicle).then(() => {
      this.update = {
        inspection: vehicle.date,
        inspector: vehicle.inspector,
        mileage: vehicle.odometer
      };
      this.afs.collection(`vehicles`).doc(this.vehicle.key).set(this.vehicle).then(() => {
        this.afs.collection('fleet').doc(this.vehicle.fleetKey).update(this.update).then(() => {
          this.navCtrl.pop().then(() => {
            this.toast.show('Vehicle Inspection Sent Successfully!');
          });
        });
      });
    });
  }

  send(vehicle) {
    if (this.vehicle.shift !== undefined && this.vehicle.shift !== '') {
      this.shiftValue = true;

      if (this.vehicle.registration !== undefined && this.vehicle.registration !== '') {
        this.regValue = true;

        if (this.vehicle.odometer !== undefined && this.vehicle.odometer !== '') {
          this.odometerValue = true;

          if (this.vehicle.tires !== undefined && this.vehicle.tires !== '') {
            this.tiresValue = true;

            if (this.vehicle.wipers !== undefined && this.vehicle.wipers !== '') {
              this.wipersValue = true;

              if (this.vehicle.headlights !== undefined && this.vehicle.headlights !== '') {
                this.headValue = true;

                if (this.vehicle.tail !== undefined && this.vehicle.tail !== '') {
                  this.tailValue = true;

                  if (this.vehicle.indicators !== undefined && this.vehicle.indicators !== '') {
                    this.indicatorsValue = true;

                    if (this.vehicle.hazards !== undefined && this.vehicle.hazards !== '') {
                      this.hazardValue = true;

                      if (this.vehicle.plates !== undefined && this.vehicle.plates !== '') {
                        this.platesValue = true;

                        if (this.vehicle.disc !== undefined && this.vehicle.disc !== '') {
                          this.discValue = true;

                          if (this.vehicle.oil !== undefined && this.vehicle.oil !== '') {
                            this.oilValue = true;

                            if (this.vehicle.exterior !== undefined && this.vehicle.exterior !== '') {
                              this.exteriorValue = true;

                              if (this.vehicle.breaks !== undefined && this.vehicle.breaks !== '') {
                                this.breaksValue = true;

                                if (this.vehicle.handbreak !== undefined && this.vehicle.handbreak !== '') {
                                  this.handValue = true;

                                  if (this.vehicle.clutch !== undefined && this.vehicle.clutch !== '') {
                                    this.clutchValue = true;

                                    if (this.vehicle.mirrors !== undefined && this.vehicle.mirrors !== '') {
                                      this.mirrorsValue = true;

                                      if (this.vehicle.hooter !== undefined && this.vehicle.hooter !== '') {
                                        this.hooterValue = true;

                                        if (this.vehicle.lights !== undefined && this.vehicle.lights !== '') {
                                          this.lightsValue = true;

                                          if (this.vehicle.belts !== undefined && this.vehicle.belts !== '') {
                                            this.beltsValue = true;

                                            if (this.vehicle.spare !== undefined && this.vehicle.spare !== '') {
                                              this.spareValue = true;

                                              if (this.vehicle.jack !== undefined && this.vehicle.jack !== '') {
                                                this.jackValue = true;

                                                if (this.vehicle.interior !== undefined && this.vehicle.interior !== '') {
                                                  this.interiorValue = true;

                                                  if (this.vehicle.signature !== undefined && this.vehicle.signature !== '') {
                                                    this.sigValue = true;

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
                                                  this.interiorValue = false;
                                                  this.invalidActionSheet();
                                                }
                                              } else {
                                                this.jackValue = false;
                                                this.invalidActionSheet();
                                              }
                                            } else {
                                              this.spareValue = false;
                                              this.invalidActionSheet();
                                            }
                                          } else {
                                            this.beltsValue = false;
                                            this.invalidActionSheet();
                                          }
                                        } else {
                                          this.lightsValue = false;
                                          this.invalidActionSheet();
                                        }
                                      } else {
                                        this.hooterValue = false;
                                        this.invalidActionSheet();
                                      }
                                    } else {
                                      this.mirrorsValue = false;
                                      this.invalidActionSheet();
                                    }
                                  } else {
                                    this.clutchValue = false;
                                    this.invalidActionSheet();
                                  }
                                } else {
                                  this.handValue = false;
                                  this.invalidActionSheet();
                                }
                              } else {
                                this.breaksValue = false;
                                this.invalidActionSheet();
                              }
                            } else {
                              this.exteriorValue = false;
                              this.invalidActionSheet();
                            }
                          } else {
                            this.oilValue = false;
                            this.invalidActionSheet();
                          }
                        } else {
                          this.discValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.platesValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.hazardValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.indicatorsValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.tailValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.headValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.wipersValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.tiresValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.odometerValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.regValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.shiftValue = false;
      this.invalidActionSheet();
    }
  }

  step2(vehicle) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.update = {
        inspection: vehicle.date,
        inspector: vehicle.inspector,
        mileage: vehicle.odometer
      };
      this.afs.collection(`vehicles`).doc(this.vehicle.key).set(this.vehicle).then(() => {
        this.afs.collection('fleet').doc(this.vehicle.fleetKey).update(this.update).then(() => {
          this.navCtrl.pop().then(() => {
            this.loading.dismiss().then(() => {
              this.toast.show('Vehicle Inspection Sent Successfully!');
            });
          });
        });
      });
    });
  }

  save(vehicle) {
    this.storage.set(this.vehicle.key, this.vehicle).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Vehicle Inspection Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.vehicle.key).then(() => {
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
            this.step2(this.vehicle);
          }
        },
        {
          text: 'Download PDF Document',
          icon: 'download',
          cssClass: 'secondaryAction',
          handler: () => {
            this.downloadPdf(this.vehicle);
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
            this.PdfService.download(this.vehicle);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.vehicle);
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
              this.afs.collection('vehicles').doc(report.key).delete().then(() => {
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
            this.save(this.vehicle);
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

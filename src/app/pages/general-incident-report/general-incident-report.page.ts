import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-general-incident-report',
  templateUrl: './general-incident-report.page.html',
  styleUrls: ['./general-incident-report.page.scss'],
})
export class GeneralIncidentReportPage implements OnInit {
role;
  incident = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', companyId: '', userEmail: '', company: '', logo: '', user: '', date: '',
    time: '', timeStamp: '', type: '', ob: '', incDate: '', incTime: '', description: '', action: '', recommendations: '', report: '',
    photo1: '', photo2: '', photo3: '', photo4: '', sigUser: '', lat: 0, lng: 0, acc: 0, clientEmail: '', emailToClient: '',
    companyEmail: '', emailUser: true, emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  update;

  siteValue: boolean = true;
  dateValue: boolean = true;
  timeValue: boolean = true;
  obValue: boolean = true;
  typeValue: boolean = true;
  descriptionValue: boolean = true;
  actionValue: boolean = true;
  recommendValue: boolean = true;
  sigValue: boolean = true;
  emailOption: boolean;
  emailValue: boolean = true;
  isApp: boolean;
  sitesValues: boolean;
  
  history: boolean = false;

  public formData: any;
  data;
  id;
  view: boolean = false;
  passedForm;
  saved = false;

  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';
  imageChangedEvent4: any = '';

  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;
  @ViewChild('picture4') picture4: ElementRef;

 


  constructor( public popoverController:PopoverController,public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, private camera: Camera, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute, public PdfService: PdfService) {
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
          this.incident.key = UUID.UUID();
          this.incident.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.incident.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.incident.timeStamp = this.incident.date + ' at ' + this.incident.time;
          this.incident.report = 'Incident Report';
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('genIncidents').doc(this.data.key).ref.get().then((incident) => {
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
      this.incident.user = user.name;
      this.incident.userKey = user.key;
      this.incident.userEmail = user.email;
      this.incident.company = user.company;
      this.incident.companyId = user.companyId;
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().incidentGen !== '' && company.data().incidentGen !== undefined) {
          this.incident.companyEmail = company.data().incidentGen;
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

  fileChangeEvent1(event: any): void {
    this.imageChangedEvent1 = event;
  }

  imageCropped1(event: ImageCroppedEvent) {
    this.incident.photo1 = event.base64;
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
    let actionSheet = await this.actionCtrl.create({
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
    return await actionSheet.present();
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

  getSiteDetails(incident) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', incident.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.incident.site = site.name;
        this.incident.siteKey = site.key;
        if (site.recipient) {
          this.incident.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.incident.clientEmail = site.email;
        }
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



  check(incident) {
    if (this.incident.siteKey !== undefined && this.incident.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.incident.incDate !== '' && this.incident.incDate !== undefined) {
      this.dateValue = true;
    } else {
      this.dateValue = false;
    }
    if (this.incident.incTime !== '' && this.incident.incTime !== undefined) {
      this.timeValue = true;
    } else {
      this.timeValue = false;
    }
    if (this.incident.ob !== '' && this.incident.ob !== undefined) {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.incident.type !== '' && this.incident.type !== undefined) {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.incident.description !== '' && this.incident.description !== undefined) {
      this.descriptionValue = true;
    } else {
      this.descriptionValue = false;
    }
    if (this.incident.action !== '' && this.incident.action !== undefined) {
      this.actionValue = true;
    } else {
      this.actionValue = false;
    }
    if (this.incident.sigUser !== '' && this.incident.sigUser !== undefined) {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.formatDate();
    this.send(incident);
  }

  formatDate() {
    this.incident.incDate = moment(this.incident.incDate).locale('en').format('YYYY/MM/DD');
    this.incident.incTime = moment(this.incident.incTime).locale('en').format('HH:mm');
  }

  send(incident) {
    if (this.incident.siteKey !== undefined && this.incident.siteKey !== '') {
      this.siteValue = true;

      if (this.incident.incDate !== '' && this.incident.incDate !== undefined) {
        this.dateValue = true;

        if (this.incident.incTime !== '' && this.incident.incTime !== undefined) {
          this.timeValue = true;

          if (this.incident.ob !== '' && this.incident.ob !== undefined) {
            this.obValue = true;

            if (this.incident.type !== '' && this.incident.type !== undefined) {
              this.typeValue = true;

              if (this.incident.description !== '' && this.incident.description !== undefined) {
                this.descriptionValue = true;

                if (this.incident.action !== '' && this.incident.action !== undefined) {
                  this.actionValue = true;

                  if (this.incident.sigUser !== '' && this.incident.sigUser !== undefined) {
                    this.sigValue = true;

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
                  this.actionValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.descriptionValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.typeValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.obValue = false;
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
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(incident) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('genIncidents').doc(this.incident.key).set(this.incident).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Incident Report Sent Successfully!');
          });
        });
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

  downloadPdf() {
    this.PdfService.download(this.incident).then(() => {
      this.afs.collection('genIncidents').doc(this.incident.key).set(this.incident).then(() => {
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
              this.afs.collection('genIncidents').doc(report.key).delete().then(() => {
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



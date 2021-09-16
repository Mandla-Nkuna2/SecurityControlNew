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
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-ob-entry',
  templateUrl: './ob-entry.page.html',
  styleUrls: ['./ob-entry.page.scss'],
})
export class ObEntryPage implements OnInit {

  ob = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', companyId: '', userEmail: '', company: '', logo: '', user: '', date: '',
    time: '', timeStamp: '', category: '', type: '', other: '', number: '', incDate: '', incTime: '', description: '', report: '',
    photo1: '', photo2: '', photo3: '', photo4: '', sigUser: '', lat: 0, lng: 0, acc: 0, clientEmail: '', emailToClient: '',
    companyEmail: '', emailUser: true, emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  categoriesCollection: AngularFirestoreCollection<any>;
  categories: Observable<any[]>;
  typesCollection: AngularFirestoreCollection<any>;
  types: Observable<any[]>;
  update;

  siteValue: boolean = true;
  dateValue: boolean = true;
  timeValue: boolean = true;
  obValue: boolean = true;
  categoryValue: boolean = true;
  typeValue: boolean = true;
  otherValue: boolean = true;
  descriptionValue: boolean = true;
  sigValue: boolean = true;
  emailOption: boolean;
  emailValue: boolean = true;
  sitesValues: boolean = false;
  isApp: boolean;
  
  history: boolean = false;

  data;
  id;
  view: boolean = false;
  passedForm;
  public formData: any;
  saved = false;

  imageChangedEvent1: any = '';
  imageChangedEvent2: any = '';
  imageChangedEvent3: any = '';
  imageChangedEvent4: any = '';

  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;
  @ViewChild('picture4') picture4: ElementRef;

 


  constructor(public popoverController:PopoverController, public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, private camera: Camera, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, public loading: LoadingService,
    private storage: Storage, public router: Router, public activatedRoute: ActivatedRoute, public PdfService: PdfService) {
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
            this.loadSites(id);
          }
          this.getLocation();
          this.ob.key = UUID.UUID();
          this.ob.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.ob.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.ob.timeStamp = this.ob.date + ' at ' + this.ob.time;
          this.ob.report = 'OB Entry';
          this.categoriesCollection = this.afs.collection('obCategories', ref => ref.orderBy('name'));
          return this.categories = this.categoriesCollection.valueChanges();
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('obs').doc(this.data.key).ref.get().then((ob) => {
          this.passedForm = ob.data();
          if (this.passedForm) {
            this.ob = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((ob) => {
        this.ob = ob;
        this.saved = true;
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

    this.ob[`${this.role.data.for}`] = this.role.data.out
  }



  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.ob.user = user.name;
      this.ob.userKey = user.key;
      this.ob.userEmail = user.email;
      this.ob.company = user.company;
      this.ob.companyId = user.companyId;
      if (user.obUser !== undefined) {
        this.ob.emailUser = user.obUser;
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().ob !== '' && company.data().ob !== undefined) {
          this.ob.companyEmail = company.data().ob;
          console.log(this.ob.companyEmail);
        }
      });
      if (user.logo !== undefined) {
        this.ob.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.ob.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.ob.lat = position.coords.latitude;
        this.ob.lng = position.coords.longitude;
        this.ob.acc = position.coords.accuracy;
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

  loadSites(id) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.userSites(id).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
        this.sitesValues = true;
      });
    }
  }

  userSites(id) {
    this.sitesCollection = this.afs.collection(`users/${id}/sites`, ref => ref.orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
  }

  obTypes(ob) {
    this.loading.present('Fetching Types...');
    setTimeout(() => {
      this.loading.dismiss();
    }, 30000);
    return this.getTypes(ob).pipe(take(1)).subscribe(() => {
      this.loading.dismiss();
    });
  }

  getTypes(ob) {
    return this.types = this.afs.collection('obTypes', ref => ref.where('category', '==', ob.category).orderBy('name')).valueChanges();
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
    this.ob.photo1 = event.base64;
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
      this.ob.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent2(event: any): void {
    this.imageChangedEvent2 = event;
  }

  imageCropped2(event: ImageCroppedEvent) {
    this.ob.photo2 = event.base64;
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
      this.ob.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent3(event: any): void {
    this.imageChangedEvent3 = event;
  }

  imageCropped3(event: ImageCroppedEvent) {
    this.ob.photo3 = event.base64;
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
      this.ob.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  fileChangeEvent4(event: any): void {
    this.imageChangedEvent4 = event;
  }

  imageCropped4(event: ImageCroppedEvent) {
    this.ob.photo4 = event.base64;
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
      this.ob.photo4 = 'data:image/jpeg;base64,' + imageData;
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

  getSiteDetails(ob) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', ob.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.ob.site = site.name;
        this.ob.siteKey = site.key;
        if (site.recipient) {
          this.ob.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.ob.clientEmail = site.email;
        }
      });
    });
  }

  formatDate() {
    this.ob.incDate = moment(this.ob.incDate).locale('en').format('YYYY/MM/DD');
    this.ob.incTime = moment(this.ob.incTime).locale('en').format('HH:mm');
  }

  check(ob) {
    if (this.ob.site !== undefined && this.ob.site !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.ob.incDate !== '') {
      this.dateValue = true;
    } else {
      this.dateValue = false;
    }
    if (this.ob.incTime !== '') {
      this.timeValue = true;
    } else {
      this.timeValue = false;
    }
    if (this.ob.number !== '') {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.ob.category !== '') {
      this.categoryValue = true;
    } else {
      this.categoryValue = false;
    }
    if (this.ob.type !== '') {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.ob.description !== '') {
      this.descriptionValue = true;
    } else {
      this.descriptionValue = false;
    }
    if (this.ob.sigUser !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    this.formatDate();
    this.send(ob);
  }

  send(ob) {
    if (this.ob.site !== undefined && this.ob.site !== '') {
      this.siteValue = true;

      if (this.ob.incDate !== '') {
        this.dateValue = true;

        if (this.ob.incTime !== '') {
          this.timeValue = true;

          if (this.ob.number !== '') {
            this.obValue = true;

            if (this.ob.category !== '') {
              this.categoryValue = true;

              if (this.ob.type !== '') {
                this.typeValue = true;

                if (this.ob.description !== '') {
                  this.descriptionValue = true;

                  if (this.ob.sigUser !== '') {
                    this.sigValue = true;

                    if (this.ob.emailClient === 'User Choice') {

                      if (this.ob.emailToClient !== undefined && this.ob.emailToClient !== '') {
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
                  this.descriptionValue = false;
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

  step2(ob) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('obs').doc(this.ob.key).set(this.ob).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('OB Entry Sent Successfully!');
          });
        });
      });
    });
  }

  save(ob) {
    this.storage.set(this.ob.key, this.ob).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('OB Entry Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.ob.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.ob).then(() => {
      this.afs.collection('obs').doc(this.ob.key).set(this.ob).then(() => {
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
            this.step2(this.ob);
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
            this.PdfService.download(this.ob);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.ob);
          }
        },
        {
          text: 'Exit Inspection',
          icon: 'assets/icons/ios-back.svg',
          cssClass: 'dangerAction',
          handler: () => {
            this.exit();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
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
              this.afs.collection('obs').doc(report.key).delete().then(() => {
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
            this.save(this.ob);
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


import { Component, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Storage } from '@ionic/storage';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { LoadingService } from 'src/app/services/loading.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-commercial-app',
  templateUrl: './commercial-app.page.html',
  styleUrls: ['./commercial-app.page.scss'],
})

export class CommercialAppPage implements OnInit {
role;
  app = {
    key: '', user: '', userKey: '', date: '', time: '', contractor: '', reg: '', id: '', address: '', vat: '', signatory: '', postal: '',
    email: '', type: '', photo1: '', photo2: '', photo3: '', photo4: '', userEmail: '', report: '', companyId: '', logo: '',
    companyEmail: '', emailUser: true, emailClient: '', emailToClient: '', signature: '', fullName: '', appId: '', contact: '',
    premises: '', other: '', roof: '', diagram: '', notes: '', canvas: '',
    qty1: 0, desc1: '', area1: '', qty2: 0, desc2: '', area2: '', qty3: 0, desc3: '', area3: '', qty4: 0, desc4: '', area4: '',
    qty5: 0, desc5: '', area5: '', form: ''
  };

  

  siteValue: boolean = true;
  obValue: boolean = true;
  clientValue: boolean = true;
  sitesValues: boolean = false;

  contractorValue: boolean = true;
  idValue: boolean = true;
  addressValue: boolean = true;
  vatValue: boolean = true;
  signatoryValue: boolean = true;
  postalValue: boolean = true;
  emailValue: boolean = true;
  typeValue: boolean = true;
  fullNameValue: boolean = true;
  appIdValue: boolean = true;
  sigValue: boolean = true;
  regValue: boolean = true;

  tab: boolean;
  nxtButton: boolean = true;
  orgType;

  public formData: any;
  update;
  slideNum;

  @ViewChild('visitSlider') visitSlider: any;
  @ViewChild('Content') content: IonContent;

  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    minWidth: 2,
    backgroundColor: '#fffffe',
    penColor: '#000'
  };

  constructor(private popoverController:PopoverController, public actionCtrl: ActionSheetController, private camera: Camera, public renderer: Renderer2,
    private storage: Storage, public platform: Platform, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('user').then((user) => {
        this.app.user = user.name;
        this.app.companyId = user.companyId;
        this.app.userKey = user.key;
        this.app.userEmail = user.email;
      });
      this.app.key = UUID.UUID();
      this.app.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
      this.app.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
      this.app.report = 'Commercial Application';
      this.visitSlider.lockSwipes(true);
      this.visitSlider.lockSwipeToNext(true);
      this.app.form = 'commercial-app';
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

    this.app[`${this.role.data.for}`] = this.role.data.out
  }


  postal() {
    return this.app.postal = this.app.address;
  }

  async photo1() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.captureImage1(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
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
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.app.photo1 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async photo2() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.captureImage2(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
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
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.app.photo2 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async photo3() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.captureImage3(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
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
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.app.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async photo4() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.captureImage4(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
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
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.app.photo4 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async photo5() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.captureImage5(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
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
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.app.diagram = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  next() {
    this.slideNum = this.visitSlider.getActiveIndex();
    if (this.slideNum === 3 || this.slideNum === 4) {
      this.nxtButton = false;
    }
    else {
      this.nxtButton = true;
      this.visitSlider.lockSwipes(false);
      this.visitSlider.slideNext();
      this.content.scrollToTop().then(() => {
        this.visitSlider.lockSwipes(true);
        this.visitSlider.lockSwipeToNext(true);
        if (this.visitSlider.getActiveIndex() === 3) {
          this.nxtButton = false;
        }
        if (this.app.appId === '') {
          this.app.appId = this.app.id;
          this.app.fullName = this.app.signatory;
        }
      });
    }
  }

  async prev() {
    this.nxtButton = true;
    this.slideNum = this.visitSlider.getActiveIndex();
    if (this.slideNum === 0) {
      let prompt = await this.alertCtrl.create({
        header: 'Exit Form',
        message: 'Are you sure you want to Exit?',
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
    else {
      this.visitSlider.lockSwipes(false);
      this.visitSlider.slidePrev();
      this.content.scrollToTop().then(() => {
        this.nxtButton = true;
        this.visitSlider.lockSwipes(true);
      });
    }
  }

  async alertMsg(item) {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      cssClass: 'alert',
      message: `Please complete the "${item}" field before sending!`,
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

 


  save(app) {
    this.storage.set(this.app.key, this.app).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Commercial Application Saved Successfully!');
      });
    });
  }

  send(app) {
    if (this.app.other !== '') {
      this.app.premises = this.app.other;
    }
    var item = '';
    if (this.app.contractor !== '') {
      this.contractorValue = true;
      if (this.app.id !== '') {
        this.idValue = true;
        if (this.app.address !== '') {
          this.addressValue = true;
          if (this.app.reg !== '') {
            this.regValue = true;
            if (this.app.vat !== '') {
              this.vatValue = true;
              if (this.app.signatory !== '') {
                this.signatoryValue = true;
                if (this.app.postal !== '') {
                  this.postalValue = true;
                  if (this.app.email !== '') {
                    this.emailValue = true;
                    if (this.app.type !== '') {
                      this.typeValue = true;
                      if (this.app.fullName !== '') {
                        this.fullNameValue = true;
                        if (this.app.appId !== '') {
                          this.appIdValue = true;
                          if (this.app.signature !== '') {
                            this.sigValue = true;
                            this.loading.present('Sending Please Wait...').then(() => {
                              this.storage.set(this.app.key, this.app).then(() => {
                                this.afs.collection('comApps').doc(this.app.key).set(this.app).then(() => {
                                  this.storage.remove(this.app.key).then(() => {
                                    this.navCtrl.pop().then(() => {
                                      this.loading.dismiss().then(() => {
                                        this.toast.show('Commercial Application Sent Successfully!');
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          }
                          else {
                            this.sigValue = false;
                            item = 'Applicant Authorized Signatory';
                            return this.alertMsg(item);
                          }
                        }
                        else {
                          this.appIdValue = false;
                          item = 'Applicant Signatory ID Number';
                          return this.alertMsg(item);
                        }
                      }
                      else {
                        this.fullNameValue = false;
                        item = 'Applicant Signatory Full Name';
                        return this.alertMsg(item);
                      }
                    }
                    else {
                      this.typeValue = false;
                      item = 'Contractor Organisation Type';
                      return this.alertMsg(item);
                    }
                  }
                  else {
                    this.emailValue = false;
                    item = 'Contractor official E-Mail address';
                    return this.alertMsg(item);
                  }
                }
                else {
                  this.postalValue = false;
                  item = 'Contractor Registered Postal Address';
                  return this.alertMsg(item);
                }
              }
              else {
                this.signatoryValue = false;
                item = 'Authorized Contractor signatory full names';
                return this.alertMsg(item);
              }
            }
            else {
              this.vatValue = false;
              item = 'Contractor VAT Number';
              return this.alertMsg(item);
            }
          }
          else {
            this.regValue = false;
            item = 'Contractor Registration Number';
            return this.alertMsg(item);
          }
        }
        else {
          this.addressValue = false;
          item = 'Contractor registered address';
          return this.alertMsg(item);
        }
      }
      else {
        this.idValue = false;
        item = 'Authorized Contractor signatory ID Number';
        return this.alertMsg(item);
      }
    }
    else {
      this.contractorValue = false;
      item = 'Contractor registered name';
      return this.alertMsg(item);
    }
  }


}


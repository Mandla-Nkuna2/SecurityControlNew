import { Component, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform, ActionSheetController, NavParams } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';

import { Storage } from '@ionic/storage';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-household-app',
  templateUrl: './household-app.page.html',
  styleUrls: ['./household-app.page.scss'],
})
export class HouseholdAppPage implements OnInit {

  app = {
    key: '', user: '', userKey: '', date: '', time: '', fullName: '', id: '', marital: '', address: '', spouse: '', spouseId: '',
    postal: '', applicant: '', email: '', type: '', photo1: '', photo2: '', photo3: '', photo4: '', userEmail: '', report: '',
    companyId: '', logo: '', companyEmail: '', emailUser: true, emailClient: '', emailToClient: '', signature: '', appId: '',
    contact: '', premises: '', other: '', roof: '', diagram: '', notes: '', qty1: 0, desc1: '', area1: '', qty2: 0, desc2: '',
    area2: '', qty3: 0, desc3: '', area3: '', qty4: 0, desc4: '', area4: '', qty5: 0, desc5: '', area5: '', form: ''
  };
  role;

  

  siteValue: boolean = true;
  obValue: boolean = true;
  clientValue: boolean = true;
  sitesValues: boolean = false;

  fullNameValue: boolean = true;
  idValue: boolean = true;
  addressValue: boolean = true;
  maritalValue: boolean = true;
  spouseValue: boolean = true;
  spouseIdValue: boolean = true;
  postalValue: boolean = true;
  emailValue: boolean = true;
  typeValue: boolean = true;
  applicantValue: boolean = true;
  appIdValue: boolean = true;
  sigValue: boolean = true;

  tab: boolean;
  nxtButton: boolean = true;
  orgType;
  
  public formData: any;
  update;
  slideNum;
  data;

  @ViewChild('visitSlider') visitSlider: any;
  @ViewChild('Content') content: IonContent;

  

  constructor( public popoverController:PopoverController,public navParams: NavParams, public actionCtrl: ActionSheetController, private camera: Camera, public renderer: Renderer2,
    private storage: Storage, public platform: Platform, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService) {
    this.data = this.navParams.data;
  }

  ngOnInit() {
    if (this.data.form) {
      this.app = this.data;
    }
    else {
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
        this.app.report = 'Household Application';
        this.visitSlider.lockSwipes(true);
        this.visitSlider.lockSwipeToNext(true);
        this.app.form = 'household-app';
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
        if (this.app.fullName !== '') {
          this.app.applicant = this.app.fullName;
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
      this.toast.show('Household Application Saved Successfully!');
      });
    });
  }

  send(app) {
    if (this.app.other !== '') {
      this.app.premises = this.app.other;
    }
    var item = '';
    if (this.app.fullName !== '') {
      this.fullNameValue = true;
      if (this.app.id !== '') {
        this.idValue = true;
        if (this.app.address !== '') {
          this.addressValue = true;
          if (this.app.marital !== '') {
            this.maritalValue = true;
            if (this.app.applicant !== '') {
              this.applicantValue = true;
              if (this.app.postal !== '') {
                this.postalValue = true;
                if (this.app.email !== '') {
                  this.emailValue = true;
                  if (this.app.fullName !== '') {
                    this.fullNameValue = true;
                    if (this.app.signature !== '') {
                      this.sigValue = true;
                      this.step2(app);
                    }
                    else {
                      this.sigValue = false;
                      item = 'Applicant Authorized Signatory';
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
                  this.emailValue = false;
                  item = 'Applicant E-Mail address';
                  return this.alertMsg(item);
                }
              }
              else {
                this.postalValue = false;
                item = 'Applicant Registered Postal Address';
                return this.alertMsg(item);
              }
            }
            else {
              this.applicantValue = false;
              item = 'Applicant full names';
              return this.alertMsg(item);
            }
          }
          else {
            this.maritalValue = false;
            item = 'Applicant Marital Status';
            return this.alertMsg(item);
          }
        }
        else {
          this.addressValue = false;
          item = 'Applicant registered address';
          return this.alertMsg(item);
        }
      }
      else {
        this.idValue = false;
        item = 'Applicant ID Number';
        return this.alertMsg(item);
      }
    }
    else {
      this.fullNameValue = false;
      item = 'Applicant Full Name';
      return this.alertMsg(item);
    }
  }

  step2(app) {
    this.loading.present('Sending Please Wait...').then(() => {
      this.storage.set(this.app.key, this.app).then(() => {
        this.afs.collection('houseApps').doc(this.app.key).set(this.app).then(() => {
          this.storage.remove(this.app.key).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Household Application Sent Successfully!');
              });
            });
          });
        });
      });
    });
  }


}


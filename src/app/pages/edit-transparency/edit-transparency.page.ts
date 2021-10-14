import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-edit-transparency',
  templateUrl: './edit-transparency.page.html',
  styleUrls: ['./edit-transparency.page.scss'],
})

export class EditTransparencyPage implements OnInit {

  trans = {
    report: '', key: '', recipient: '', siteKey: '', userKey: '', userEmail: '', company: '', companyId: '', logo: '', timeStamp: '',
    manager: '', date: '', time: '', site: '', ob: '', manSig: '', guardSig: '', photo1: '', details1: '', actions1: '',
    recommendations1: '', photo2: '', details2: '', actions2: '', recommendations2: '', photo3: '', details3: '', actions3: '',
    recommendations3: '', photo4: '', details4: '', actions4: '', recommendations4: '', lat: 0, lng: 0, acc: 0, emailToClient: '',
    companyEmail: '', emailUser: true, emailClient: '', clientEmail: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  
  

  siteValue: boolean = true;
  obValue: boolean = true;
  slide1: boolean = false;
  sitesValues: boolean = false;

  snag2: boolean = false;
  snag3: boolean = false;
  snag4: boolean = false;

  photoValue: boolean = true;
  detailsValue: boolean = true;

  actionsValue: boolean = true;
  recommendValue: boolean = true;
  emailValue: boolean = true;
  isApp: boolean;
  update;
  sigValue: boolean = true;

  slideNum;
  nxtButton: boolean = true;
  emailOption: boolean;
  public formData: any;

    @ViewChild('transSlider') transSlider: any;
  @ViewChild('Content') content: IonContent;
  @ViewChild('picture1') picture1: ElementRef;
  @ViewChild('picture2') picture2: ElementRef;
  @ViewChild('picture3') picture3: ElementRef;
  @ViewChild('picture4') picture4: ElementRef;

 


  constructor(public popoverController:PopoverController,private platform: Platform, public alertCtrl: AlertController, private camera: Camera,
    public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore,
    public navCtrl: NavController, private storage: Storage, public router: Router, public loading: LoadingService) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      var id = this.trans.userKey;
      this.searchSites(id);
      this.transSlider.lockSwipes(true);
      this.transSlider.lockSwipeToNext(true);
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

    this.trans[`${this.role.data.for}`] = this.role.data.out
  }


  async delete() {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Report?',
      cssClass: 'alert',
      message: 'Are you sure you want to delete this Report?',
      buttons: [
        {
          text: 'DELETE',
          handler: data => {
            this.storage.remove(this.trans.key).then(() => {
              this.navCtrl.pop().then(() => {
                this.toast.show('Transparency Report Deleted Successfully');
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
    this.slideNum = this.transSlider.getActiveIndex();
    if (this.slideNum === 0) {
      this.slide1Valid();
    }
    if (this.slideNum === 1) {
      this.slide2Valid();
    }
  }

  async prev() {
    this.slideNum = this.transSlider.getActiveIndex();
    if (this.slideNum === 0) {
      let prompt = await this.alertCtrl.create({
        header: 'Exit Form',
        message: 'Are you sure you want to Exit? Any inputted information will be lost from this form',
        buttons: [
          {
            text: 'OK',
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
    this.transSlider.lockSwipes(false);
    this.transSlider.slidePrev();
    this.content.scrollToTop().then(() => {
      this.transSlider.lockSwipes(true);
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
    if (this.trans.site !== undefined && this.trans.site !== '') {
      this.siteValue = true;
      if (this.trans.ob !== undefined && this.trans.ob !== '') {
        this.obValue = true;
        this.slide1 = true;
        this.transSlider.lockSwipes(false);
        this.transSlider.slideNext();
        this.content.scrollToTop().then(() => {
          this.transSlider.lockSwipes(true);
          this.transSlider.lockSwipeToNext(true);
        });
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
    if (this.trans.photo1 !== undefined && this.trans.photo1 !== '') {
      this.photoValue = true;

      if (this.trans.details1 !== undefined && this.trans.details1 !== '') {
        this.detailsValue = true;

        if (this.trans.actions1 !== undefined && this.trans.actions1 !== '') {
          this.actionsValue = true;
          if (this.trans.recommendations1 !== undefined && this.trans.recommendations1 !== '') {
            this.recommendValue = true;
            this.transSlider.lockSwipes(false);
            this.transSlider.slideNext();
            this.content.scrollToTop().then(() => {
              this.transSlider.lockSwipes(true);
              this.transSlider.lockSwipeToNext(true);
              this.nxtButton = false;
            });
          }
          else {
            this.recommendValue = false;
            this.alertMsg();
          }
        }
        else {
          this.actionsValue = false;
          this.alertMsg();
        }
      }
      else {
        this.detailsValue = false;
        this.alertMsg();
      }
    }
    else {
      this.photoValue = false;
      this.alertMsg();
    }
  }




  addSnag2() {
    this.snag2 = true;
  }
  addSnag3() {
    this.snag3 = true;
  }
  addSnag4() {
    this.snag4 = true;
  }

  getSiteDetails(trans) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', trans.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.trans.site = site.name;
        this.trans.siteKey = site.key;
        if (site.recipient) {
          this.trans.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.trans.clientEmail = site.email;
        }
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
      this.trans.photo1 = 'data:image/jpeg;base64,' + imageData;
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
      this.trans.photo2 = 'data:image/jpeg;base64,' + imageData;
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
      this.trans.photo3 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  async takePhoto4() {
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
      this.trans.photo4 = 'data:image/jpeg;base64,' + imageData;
    }));
  }

  save(trans) {
    this.storage.set(this.trans.key, this.trans).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Transparency Report Saved Successfully');
      });
    });
  }

  send(trans) {
    if (this.trans.emailClient === 'User Choice') {

      if (this.trans.emailToClient !== undefined && this.trans.emailToClient !== '') {
        this.emailValue = true;
        this.step2(trans);
      }
      else {
        this.emailValue = false;
        this.alertMsg();
      }
    }
    else {
      this.step2(trans);
    }
  }

  step2(trans) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.update = {
        lastVisit: trans.date,
        visitBy: trans.manager
      };
      var id = this.trans.siteKey + '';
      this.afs.collection('sites').doc(id).update(this.update).then(() => {
        this.afs.collection(`users/${this.trans.userKey}/sites`).doc(id).update(this.update).then(() => {
          this.afs.collection(`transparencys`).doc(this.trans.key).set(this.trans).then(() => {
            this.navCtrl.pop().then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Transparency Report Sent Successfully!');
              });
            });
          });
        });
      });
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastService } from 'src/app/services/toast.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as XLSX from 'xlsx';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {

  user = {
    key: '', consultantKey: '', site: '', siteId: '', companyId: '', company: '', photo: '', contact: '', name: '', tips: true,
    email: '', type: ''
  }

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  newSitesCollection: AngularFirestoreCollection<any>;
  newSites: Observable<any[]>;
  companiesCollection: AngularFirestoreCollection<any>;
  companies: Observable<any[]>;
  changed: boolean = false;
  app: boolean;
  imageChangedEvent: any = '';
  nameEdit: boolean = false;
  contactEdit: boolean = false;
  consultant: boolean = false;
  companyId;
  newCompany: boolean = false;
  tokens = [];
  tipStatus: boolean;
  tipsChanged: boolean = false;
  edit = false;

  constructor(private geolocation: Geolocation, public alertCtrl: AlertController, private camera: Camera, public actionCtrl: ActionSheetController, public loading: LoadingService, public navCtrl: NavController, private afs: AngularFirestore, private toast: ToastService, private auth: AuthenticationService, private storage: Storage, public modalCtrl: ModalController, private platform: Platform, private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.user = user;
      if (user.tips === undefined) {
        this.user.tips = true;
        this.tipStatus = true;
      }
      else {
        this.tipStatus = user.tips;
      }
      if (user.companyId) {
        this.sitesCollection = this.afs.collection('sites', ref => ref.where('companyId', '==', user.companyId).where('status', '==', 'ACTIVE'));
        this.sites = this.sitesCollection.valueChanges();
        if (user.consultantKey) {
          this.consultant = true;
          this.user.consultantKey = user.consultantKey;
          this.companiesCollection = this.afs.collection('companies', ref => ref.where('consultantId', '==', user.consultantKey));
          this.companies = this.companiesCollection.valueChanges()
        }
      }
      if (this.user.key !== '') {
        this.afs.collection('devices', ref => ref.where('userId', '==', this.user.key)).ref.get().then((devices) => {
          devices.forEach((device: any) => {
            if (device.data().userId === this.user.key) {
              this.tokens.push(device.data().token);
            }
          })
        })
      }
      this.user = user;
      this.afs.collection('companies').doc(this.user.companyId).ref.get().then((company: any) => {
        if (company.data()) {
          if (company.data().lat === undefined || company.data().lat === 0) {
            return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
              console.log(position.coords.accuracy);
              const update = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              this.afs.collection('companies').doc(this.user.companyId).update(update);
            })
          }
        }
      })
    })
    if (document.URL.indexOf('http://localhost') === 0 || document.URL.indexOf('ionic') === 0 || document.URL.indexOf('https://localhost') === 0) {
      this.app = true;
    }
    else {
      this.app = false;
    }
  }

  companyChanged(user) {
    this.companyId = "";
    this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
      this.user.site = "";
      this.user.siteId = "";
      this.user.companyId = company.data().key;
      this.user.company = company.data().name;
      this.companyId = user.companyId;
      this.newCompany = true;
      this.newSitesCollection = this.afs.collection('sites', ref => ref.where('companyId', '==', this.companyId).where('status', '==', 'ACTIVE'));
      this.newSites = this.newSitesCollection.valueChanges();
      this.changed = true;
    })
  }

  siteChanged() {
    this.afs.collection('sites').doc(this.user.siteId).ref.get().then((doc: any) => {
      this.user.siteId = doc.data().key;
      this.user.site = doc.data().name;
      this.changed = true;
    })
  }

  async takePhoto() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.captureImage(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.captureImage(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage(useAlbum: boolean) {
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
    }
    return await this.camera.getPicture(options).then((imageData => {
      this.user.photo = 'data:image/jpeg;base64,' + imageData;
      this.changed = true;
    }))
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    this.changed = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.user.photo = event.base64;
    this.siteChanged()
  }

  editName() {
    return this.nameEdit = true;
  }
  editContact() {
    return this.contactEdit = true;
  }

  contactChanged() {
    if (this.user.contact !== '') {
      return this.changed = true;
    }
  }

  nameChanged() {
    if (this.user.name !== '') {
      return this.changed = true;
    }
  }

  async alertMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid',
      cssClass: 'alert',
      message: `Please select a site before saving!`,
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

  save(user) {
    if (this.user.name !== '') {
      if (this.tipsChanged == true) {
        this.changeTips(user)
      }
      this.loading.present('Saving Please Wait...').then(() => {
        this.afs.collection('users').doc(this.user.key).update(this.user).then(() => {
          this.afs.collection('users').doc(this.user.key).ref.get().then((user) => {
            this.storage.set('user', user.data()).then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Account Updated Successfully!')
                this.imageChangedEvent = '';
                this.nameEdit = false;
                this.contactEdit = false;
                this.changed = false;
              });
            });
          });
        });
      });
    }
  }

  changeTips(user) {
    if (user.tips === false) {
      this.tokens.forEach(token => {
        this.afs.collection('devices', ref => ref.where('userId', '==', this.user.key)).doc(token).update({ 'tips': false });
      })
    }
    if (user.tips === true) {
      this.tokens.forEach(token => {
        this.afs.collection('devices').doc(token).update({ 'tips': true });
      })
    }
  }

  tips(user) {
    this.user.tips = user.tips;
    this.tipsChanged = true;
    return this.changed = true;
  }

  sync() {
    this.loading.present('Syncing Please Wait...').then(() => {
      this.afs.collection('users').doc(this.user.key).ref.get().then((user) => {
        this.storage.set('user', user.data()).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Account Synchronized Successfully!')
          })
        })
      })
    })
  }

  logout() {
    this.loading.present('Logging Out...').then(() => {
      return this.auth.logout().then(() => {
        return this.loading.dismiss()
      })
    })
  }

  analytics = [];
  getSummary() {
    this.afs.collection('companies').ref.orderBy('name').get().then((comps) => {
      comps.forEach((comp: any) => {
        var company: any = {};
        company.name = comp.data().name;
        company.key = comp.data().key;
        company.rep = comp.data().rep;
        company.contact = comp.data().contact;
        company.email = comp.data().email;
        company.trial = comp.data().trial;
        company.users = 0;
        company.guards = 0;
        company.sites = 0;
        this.getUsers(comp.data().key, company).then(company => {
          console.log(company.users)
          this.getGuards(comp.data().key, company).then(company => {
            console.log('Got guards')
            this.getSites(comp.data().key, company).then(company => {
              console.log('Got sites')
              this.getLast(comp.data().key, company).then(company => {
                this.analytics.push(company);
              })
            })
          })
        })
      })
      console.log('Done')
      setTimeout(() => {
        console.log(this.analytics)
        this.staffReport();
      }, 200000);
    })
  }

  getUsers(key, company) {
    return new Promise<any>((resolve, reject) => {
      console.log('In users')
      this.afs.collection("users").ref.where('companyId', '==', key).get().then(function (querySnapshot) {
        console.log(querySnapshot.size);
        company.users = querySnapshot.size;
        resolve(company);
      });
    })
  }

  getGuards(key, company) {
    return new Promise<any>((resolve, reject) => {
      console.log('In guards')
      this.afs.collection("guards").ref.where('companyId', '==', key).get().then(function (querySnapshot) {
        console.log(querySnapshot.size);
        company.guards = querySnapshot.size;
        resolve(company);
      });
    })
  }

  getSites(key, company) {
    return new Promise<any>((resolve, reject) => {
      console.log('In sites')
      this.afs.collection("sites").ref.where('companyId', '==', key).get().then(function (querySnapshot) {
        console.log(querySnapshot.size);
        company.sites = querySnapshot.size;
        resolve(company);
      });
    })
  }

  getLast(key, company) {
    return new Promise<any>((resolve, reject) => {
      console.log('In Last')
      this.afs.collection("sites").ref.where('companyId', '==', key).orderBy('lastVisit').limit(1).get().then(sites => {
        sites.forEach((site: any) => {
          company.last = site.data().lastVisit;
        })
        resolve(company);
      });
    })
  }

  staffReport(): void {
    let element = document.getElementById('analytics');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, `Analytics.xlsx`);
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Account',
        screen_class: 'AccountPage'
      });
    })
  }

}

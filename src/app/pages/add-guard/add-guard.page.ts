import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ToastService } from '../../services/toast.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-add-guard',
  templateUrl: './add-guard.page.html',
  styleUrls: ['./add-guard.page.scss'],
})

export class AddGuardPage implements OnInit {

  guard = {
    Key: '', grade: '', photo: '', id: null, AssNo: null, companyId: '', name: '', CoNo: '', cell: null, annualUsed: null,
    annualAccrued: null, workDays: null, siteId: '', site: '', learnershipNo: '', learnershipDate: '',
  };
  change = true
  window: any;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  gradeCollection: AngularFirestoreCollection<any>;
  grades: Observable<any[]>;
  sites = [];
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  guardNamesCollection: AngularFirestoreCollection<any>;
  guardNames: Observable<any[]>;
  nameValid = true;
  compValid: boolean = true;
  idValid: boolean = true;
  assValid: boolean = true;
  gradeValid: boolean = true;
  photoValid: boolean = true;
  siteValid: boolean = true;
  guardExists: boolean = false;
  isApp: boolean;
  data;
  id;
  edit: boolean = false;
  passedForm;

  key: '';
  thompsons = false;

  @ViewChild('picture') picture: ElementRef;

  constructor(private actionCtrl: ActionSheetController, public platform: Platform, public alertCtrl: AlertController,
    private afs: AngularFirestore, public toast: ToastService, public camera: Camera, public loadingCtrl: LoadingController,
    public navCtrl: NavController, public loading: LoadingService, private storage: Storage, private analyticsService: AnalyticsService,
    public activatedRoute: ActivatedRoute, public router: Router) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (document.URL.indexOf('http://localhost') === 0 || document.URL.indexOf('ionic') === 0 || document.URL.indexOf('https://localhost') === 0) {
      this.isApp = true;
    }
    else {
      this.isApp = false;
    }
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.getSites();
          const existingData = Object.keys(user).length;
          if (existingData !== 0) {
            var id = user.key;
            if (user.companyId !== undefined) {
              this.guard.companyId = user.companyId;
              this.guard.Key = UUID.UUID();
              this.guard.annualUsed = null;
            }
          }
          this.thompsonPerm();
          this.gradeCollection = this.afs.collection('grades', ref => ref.orderBy('name'));
          this.grades = this.gradeCollection.valueChanges();
        });
      });
    } else if (this.id === 'edit') {
      this.edit = true;
      this.getUrlData().then(() => {
        this.afs.collection('guards').doc(this.data.key).ref.get().then((guard: any) => {
          this.passedForm = guard.data();
          console.log(this.passedForm);

          if (this.passedForm) {
            this.guard = this.passedForm;
          }
        });
      });
      this.thompsonPerm().then(() => {
        this.getSites();
        this.gradeCollection = this.afs.collection('grades', ref => ref.orderBy('name'));
        this.grades = this.gradeCollection.valueChanges();
      });
    }
  }

  thompsonPerm() {
    return new Promise<void>((resolve, reject) => {
      this.storage.get('user').then((user) => {
        if (user.companyId === '0qbfVjnyuKE8EAdenn3T') {
          this.thompsons = true
        } else {
          this.thompsons = false;
        }
        resolve();
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

  async getSites() {
    await this.storage.get('user').then((user) => {
      this.afs.collection(`users/${user.key}/sites`).ref.get().then((sites) => {
        sites.forEach((site: any) => {
          if (site.data().name && site.data().name !== '') {
            this.sites.push({ key: site.data().key, name: site.data().name });
          }
        });
        this.storage.set('sites', this.sites);
        console.log('sites', this.sites);

      });

    });
    return this.sites;
  }

  checkGuardName(guard) {
    var numberExists = guard.CoNo;
    this.guardNamesCollection = this.afs.collection('guards', ref =>
      ref.where('companyId', '==', this.guard.companyId).where('CoNo', '==', numberExists));
    this.guardNames = this.guardNamesCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardNames.subscribe(guards => {
      guards.forEach(unit => {
        this.guardExists = true;
      });
    });
    this.guardExists = false;
  }

  getSite(guard) {
    this.change = false
    this.guard.site = guard.value.name
    this.guard.siteId = guard.value.key

  }

  async invalidMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
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

  async takePhoto() {
    let actionSheet = await this.actionCtrl.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
          handler: () => {
            this.captureImage1(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: !this.platform.is('ios') ? 'images-outline' : null,
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
    return await this.camera.getPicture(options).then(imageData => {
      this.guard.photo = 'data:image/jpeg;base64,' + imageData;
    });
  }

  selectImage(event: any) {
    const file = (event.target as HTMLInputElement).files[0];

    const reader = new FileReader();

    reader.onload = () => {

      this.guard.photo = reader.result.toString();

    }

    reader.readAsDataURL(file);
  }

  add(guard) {
    if (this.guard.name !== undefined && this.guard.name !== '') {
      this.nameValid = true;

      if (this.guard.CoNo !== undefined && this.guard.CoNo !== '') {
        this.compValid = true;

        if (this.guard.id !== undefined && this.guard.id !== null) {
          this.idValid = true;

          if (this.guard.AssNo !== undefined && this.guard.AssNo !== null) {
            this.assValid = true;

            if (this.guard.grade !== undefined && this.guard.grade !== '') {
              this.gradeValid = true;

              if (this.guard.siteId !== undefined && this.guard.siteId !== '') {
                this.siteValid = true;

                if (this.guard.photo !== undefined && this.guard.photo !== '') {
                  this.photoValid = true;

                  this.loading.present('Creating Please Wait...');
                  this.afs.collection('guards').doc(this.guard.Key).set(this.guard).then(() => {
                    //this.analyticsService.trackEvent("Added New Guard", "Added Guard", "User Added A New Guard", 1)
                    this.toast.show(`Guard ${this.guard.name} Successfully Added!`);
                    this.loading.dismiss();
                    this.navCtrl.pop();
                  });
                }
                else {
                  this.photoValid = false;
                  this.invalidMsg();
                }
              }
              else {
                this.siteValid = false;
                this.invalidMsg();
              }
            }
            else {
              this.gradeValid = false;
              this.invalidMsg();
            }
          }
          else {
            this.assValid = false;
            this.invalidMsg();
          }
        }
        else {
          this.idValid = false;
          this.invalidMsg();
        }
      }
      else {
        this.compValid = false;
        this.invalidMsg();
      }
    }
    else {
      this.nameValid = false;
      this.invalidMsg();
    }
  }

  update() {
    if (this.guard.name !== undefined && this.guard.name !== '') {
      this.nameValid = true;

      if (this.guard.CoNo !== undefined && this.guard.CoNo !== '') {
        this.compValid = true;

        if (this.guard.id !== undefined && this.guard.id !== null) {
          this.idValid = true;

          if (this.guard.AssNo !== undefined && this.guard.AssNo !== null) {
            this.assValid = true;

            if (this.guard.grade !== undefined && this.guard.grade !== '') {
              this.gradeValid = true;

              if (this.guard.siteId !== undefined && this.guard.siteId !== '') {
                this.siteValid = true;

                if (this.guard.photo !== undefined && this.guard.photo !== '') {
                  this.photoValid = true;

                  this.loading.present('Updating Please Wait...');
                  console.log('guradr update', this.guard);

                  this.afs.collection('guards').doc(this.guard.Key).update(this.guard).then(() => {
                    this.toast.show(`Guard ${this.guard.name} Successfully Updated!`);
                    this.loading.dismiss();
                    this.navCtrl.pop();
                  });
                }
                else {
                  this.photoValid = false;
                  this.invalidMsg();
                }
              }
              else {
                this.siteValid = false;
                this.invalidMsg();
              }
            }
            else {
              this.gradeValid = false;
              this.invalidMsg();
            }
          }
          else {
            this.assValid = false;
            this.invalidMsg();
          }
        }
        else {
          this.idValid = false;
          this.invalidMsg();
        }
      }
      else {
        this.compValid = false;
        this.invalidMsg();
      }
    }
    else {
      this.nameValid = false;
      this.invalidMsg();
    }
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Add a guard',
        screen_class: 'AddGuardPage'
      });
    })
  }
}





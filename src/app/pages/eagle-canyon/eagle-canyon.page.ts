import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-eagle-canyon',
  templateUrl: './eagle-canyon.page.html',
  styleUrls: ['./eagle-canyon.page.scss'],
})
export class EagleCanyonPage implements OnInit {

  eagle = {
    _id: '', key: '', recipient: '', userKey: '', siteKey: '7f113b5f-c065-167a-a03c-e6827d36abba', site: 'EAGLE CANYON ESTATE',
    companyId: '0qbfVjnyuKE8EAdenn3T', userEmail: '', company: '', logo: '', user: '', date: '', time: '', timeStamp: null,
    action: '', result: '', nature: '', ob: '', incDate: '', incTime: '', details: '', to: '', by: '', report: '', sigUser: '',
    lat: null, lng: null, acc: null, clientEmail: '', emailToClient: '', companyEmail: '', emailUser: true, emailClient: 'No', phone: '',
    oa: '',
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
  descriptionValue: boolean = true;
  byValue: boolean = true;
  toValue: boolean = true;
  sigValue: boolean = true;
  emailOption: boolean;
  emailValue: boolean = true;
  isApp: boolean;
  sitesValues: boolean;
  

  public formData: any;


  

  constructor(public popoverController:PopoverController,private platform: Platform, public geolocation: Geolocation, private afs: AngularFirestore, public toast: ToastService,
    public loadingCtrl: LoadingController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage, public router: Router, public loading: LoadingService) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('user').then((user) => {
        if (user.key) {
          var id = user.key;
          this.displayUser(id);
        }
        this.getLocation();
        this.eagle.key = UUID.UUID();
        this.eagle._id = this.eagle.key;
        this.eagle.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
        this.eagle.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
        this.eagle.incTime = moment(new Date().toISOString()).locale('en').format('HH:mm');
        this.eagle.timeStamp = this.eagle.date + ' at ' + this.eagle.time;
        this.eagle.report = 'EC Incident Report';
        this.isApp = this.platform.platforms().includes("cordova")
      });
    });
  }

  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.eagle.user = user.name;
      this.eagle.userKey = user.key;
    });
  }

  ngAfterViewInit() {
    this.canvasResize();
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

    this.eagle[`${this.role.data.for}`] = this.role.data.out
  }

  canvasResize() {
    let canvas = document.querySelectorAll('canvas');
    var ctx1 = canvas[0].getContext('2d');
    ctx1.fillStyle = 'white';
    ctx1.fillRect(0, 0, canvas[0].width, canvas[0].height);
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.eagle.lat = position.coords.latitude;
        this.eagle.lng = position.coords.longitude;
        this.eagle.acc = position.coords.accuracy;
        console.log(position.coords.accuracy);
      }
    });
  }

  async prev() {
    let prompt = await this.alertCtrl.create({
      header: 'Exit Form',
      message: "Are you sure you want to Exit? Any inputted information will be lost from this form",
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

  save(eagle) {
    this.storage.set(this.eagle.key, this.eagle).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Incident Report Saved Successfully!');
      });
    });
  }

  send(eagle) {
    if (this.eagle.siteKey !== undefined && this.eagle.siteKey !== '') {
      this.siteValue = true;

      if (this.eagle.incDate !== '' && this.eagle.incDate !== undefined) {
        this.dateValue = true;

        if (this.eagle.incTime !== '' && this.eagle.incTime !== undefined) {
          this.timeValue = true;

          if (this.eagle.ob !== '' && this.eagle.ob !== undefined) {
            this.obValue = true;

            if (this.eagle.nature !== '' && this.eagle.nature !== undefined) {
              this.descriptionValue = true;

              if (this.eagle.to !== '' && this.eagle.to !== undefined) {
                this.toValue = true;

                if (this.eagle.by !== '' && this.eagle.by !== undefined) {
                  this.byValue = true;
                  this.step2(eagle);
                } else {
                  this.byValue = false;
                  this.alertMsg();
                }
              } else {
                this.toValue = false;
                this.alertMsg();
              }
            } else {
              this.descriptionValue = false;
              this.alertMsg();
            }
          } else {
            this.obValue = false;
            this.alertMsg();
          }
        } else {
          this.timeValue = false;
          this.alertMsg();
        }
      } else {
        this.dateValue = false;
        this.alertMsg();
      }
    } else {
      this.siteValue = false;
      this.alertMsg();
    }
  }

  step2(eagle) {
    if (eagle.sigUser !== '' && eagle.sigUser !== undefined) {
      this.sigValue = true;
      this.loading.present('Saving Please Wait...').then(() => {
        this.afs.collection('eagles').doc(eagle.key).set(eagle).then(() => {
          this.router.navigate(['/forms']).then(() => {
            this.loading.dismiss().then(() => {
              this.toast.show('Incident Report Sent Successfully!');
            });
          });
        });
      });
    } else {
      this.sigValue = false;
      this.alertMsg();
    }
  }


}


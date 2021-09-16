import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, IonSlides, LoadingController, IonContent, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-aod',
  templateUrl: './aod.page.html',
  styleUrls: ['./aod.page.scss'],
})
export class AodPage implements OnInit {

  aod = {
    key: '', recipient: '', userKey: '', companyId: '0qbfVjnyuKE8EAdenn3T', clientEmail: '',
    companyEmail: 'yolandi@khuselars.co.za', supEmail: '', emailUser: true, emailClient: '', lat: 0, lng: 0, emailToClient: '',
    name: '', id: '', address: '', sum: '', sumWords: '', capital: '', repay: '', instal: '', instalWords: '', commDate: '',
    respect: '', time: '', day: '', month: '', signature: '', report: '', timeStamp: '', date: '', witSig: '',
  };

  id;



  view = false;
  data;
  passedForm;
  saved = false;
  emailValue: boolean = true;

  isApp = false;


  constructor(private popoverController:PopoverController,private loading: LoadingService, private router: Router, public platform: Platform,
    public geolocation: Geolocation, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    private storage: Storage, public activatedRoute: ActivatedRoute, public PdfService: PdfService,
    public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
       this.isApp = this.platform.platforms().includes("cordova")

    console.log(this.isApp)
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.aod.key = UUID.UUID();
          this.aod.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.aod.day = moment(new Date().toISOString()).locale('en').format('DD');
          this.aod.month = moment(new Date().toISOString()).locale('en').format('MMMM YYYY');
          this.aod.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.aod.report = 'AOD';
          this.aod.timeStamp = this.aod.date + ' at ' + this.aod.time;
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('aod').doc(this.data.key).ref.get().then((aod) => {
          this.passedForm = aod.data();
          if (this.passedForm) {
            this.aod = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((aod) => {
        this.aod = aod;
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

    this.aod[`${this.role.data.for}`] = this.role.data.out
  }


  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.aod.lat = position.coords.latitude;
        this.aod.lng = position.coords.longitude;
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



  save(aod) {
    this.storage.set(this.aod.key, this.aod).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Acknowledgement Of Debt Saved Successfully!');
      });
    });
  }

  send(aod) {

    if (this.aod.signature !== undefined && this.aod.signature !== '') {

      if (this.aod.emailClient === 'User Choice') {

        if (this.aod.emailToClient !== undefined && this.aod.emailToClient !== '') {
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
      this.invalidActionSheet();
    }
  }

  step2(aod) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('aod').doc(this.aod.key).set(this.aod).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Acknowledgement Of Debt Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.aod.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.aod).then(() => {
      this.afs.collection('aod').doc(this.aod.key).set(this.aod).then(() => {
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
            this.step2(this.aod);
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
            this.PdfService.download(this.aod);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.aod);
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
      message: `Are you sure you want to delete this ${report.report}?`,
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
              this.afs.collection('aod').doc(report.key).delete().then(() => {
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
            this.save(this.aod);
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



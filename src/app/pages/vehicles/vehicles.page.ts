import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform, IonSlides, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit {

  fleet = {
    key: '', companyId: '', registration: '', make: '', color: '', year: '', mileage: null, nextService: '', nextServiceMileage: null,
    inspection: '', inspector: '',
  };

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  makeValid: boolean = true;
  regValid: boolean = true;
  colorValid: boolean = true;
  yearValid: boolean = true;
  serviceValid: boolean = true;
  mileageValid: boolean = true;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  data;
  id;
  view: boolean = false;
  passedForm;

  constructor(private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController,
    public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    public router: Router, public loading: LoadingService, private storage: Storage, public actionCtrl: ActionSheetController,
    public activatedRoute: ActivatedRoute, public PdfService: PdfService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        if (user.key) {
          var id = user.key;
        }
        this.usersCollection = this.afs.collection('users', ref => ref.where('key', '==', id));
        this.users = this.usersCollection.snapshotChanges().pipe(map(changes => {
          return changes.map((a: any) => { 
            const info = a.payload.doc.data();
            const key = a.payload.doc.id;
            return { key, ...info };
          });
        }));
        this.users.subscribe(users => {
          users.forEach(user => {
            this.user.type = user.type;
            this.user.companyId = user.companyId;
            if (this.user.type === 'Owner' || this.user.type === 'Admin' || this.user.type === 'Account Admin' ||
              this.user.type === 'Fleet Manager') {
              this.fleet.key = UUID.UUID();
              this.fleet.inspector = '';
              this.fleet.inspection = '';
              this.fleet.companyId = this.user.companyId;
            }
          });
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('fleet').doc(this.data.key).ref.get().then((fleet) => {
          this.passedForm = fleet.data();
          if (this.passedForm) {
            this.fleet = this.passedForm;
          }
        });
      });
    } else if (this.id === 'edit') {
      this.getUrlData().then(() => {
        this.afs.collection('fleet').doc(this.data.key).ref.get().then((fleet) => {
          this.passedForm = fleet.data();
          if (this.passedForm) {
            this.fleet = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((fleet) => {
        this.fleet = fleet;
      });
    }
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


  async invalidMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      message: "Please Note ALL fields marked with '*' must be filled in to submit the form!",
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

  check(fleet) {
    if (this.fleet.make !== '') {
      this.makeValid = true;
    } else {
      this.makeValid = false;
    }
    if (this.fleet.registration !== '') {
      this.regValid = true;
    } else {
      this.regValid = false;
    }
    if (this.fleet.color !== '') {
      this.colorValid = true;
    } else {
      this.colorValid = false;
    }
    if (this.fleet.year !== '') {
      this.yearValid = true;
    } else {
      this.yearValid = false;
    }
    if (this.fleet.nextService !== '') {
      this.serviceValid = true;
    } else {
      this.serviceValid = false;
    }
    if (this.fleet.nextServiceMileage != null) {
      this.mileageValid = true;
    } else {
      this.mileageValid = false;
    }
    this.addVehicle(fleet);
  }

  addVehicle(fleet) {
    if (this.fleet.make !== '') {
      this.makeValid = true;

      if (this.fleet.registration !== '') {
        this.regValid = true;

        if (this.fleet.color !== '') {
          this.colorValid = true;

          if (this.fleet.year !== '') {
            this.yearValid = true;

            if (this.fleet.nextService !== '') {
              this.serviceValid = true;

              if (this.fleet.nextServiceMileage != null) {
                this.mileageValid = true;

                if (!this.view) {
                  this.completeActionSheet();
                } else {
                  this.viewActionSheet();
                }

              }
              else {
                this.mileageValid = false;
                this.invalidActionSheet();
              }
            }
            else {
              this.serviceValid = false;
              this.invalidActionSheet();
            }
          }
          else {
            this.yearValid = false;
            this.invalidActionSheet();
          }
        }
        else {
          this.colorValid = false;
          this.invalidActionSheet();
        }
      }
      else {
        this.regValid = false;
        this.invalidActionSheet();
      }
    }
    else {
      this.makeValid = false;
      this.invalidActionSheet();
    }
  }

  async step2(fleet) {
    this.loading.present('Creating Please Wait...');
    this.afs.collection('fleet').doc(this.fleet.key).set(fleet).then(() => {
      this.toast.show(`Vehicle ${fleet.registration} Successfully Added!`);
      this.navCtrl.pop();
      this.loading.dismiss();
    });
  }

  save(vehicle) {
    this.storage.set(this.fleet.key, this.fleet).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Vehicle Inspection Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.fleet.key).then(() => {
      this.router.navigate(['/welcome']).then(() => {
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
            this.step2(this.fleet);
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
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.fleet);
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
      message: `Are you sure you want to delete vehicle: ${report.registration}?`,
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
              this.afs.collection('fleet').doc(report.key).delete().then(() => {
                this.router.navigate(['/welcome']).then(() => {
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
            this.save(this.fleet);
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


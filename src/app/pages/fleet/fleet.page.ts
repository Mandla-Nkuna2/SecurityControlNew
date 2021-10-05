import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.page.html',
  styleUrls: ['./fleet.page.scss'],
})
export class FleetPage implements OnInit {

  vehicle = {
    key: '', companyId: '', registration: '', make: '', color: '', year: '', mileage: null, nextService: '', nextServiceMileage: null,
    inspection: '', inspector: '',
  };

  registrationsCollection: AngularFirestoreCollection<any>;
  registrations: Observable<any[]>;
  fleetCollection: AngularFirestoreCollection<any>;
  fleets: Observable<any[]>;
  vehicleCollection: AngularFirestoreCollection<any>;
  allVehicles: Observable<any[]>;

  vehicles;
  companyId;
  searchterm: string;
  startAt = new Subject();
  endAt = new Subject();
  startobs = this.startAt.asObservable();
  endobs = this.endAt.asObservable();
  searching: boolean = false;
  data;

  constructor(private platform: Platform, public loadingCtrl: LoadingController, public toast: ToastService,
    public alertCtrl: AlertController, private afs: AngularFirestore, public modalCtrl: ModalController, public navCtrl: NavController,
    private storage: Storage, public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('user').then((user) => {
        this.companyId = user.companyId;
        this.vehicleCollection = this.afs.collection('vehicles', ref =>
          ref.where('companyId', '==', this.companyId).orderBy('nextService').limit(10));
        this.allVehicles = this.vehicleCollection.valueChanges();

        this.fleetCollection = this.afs.collection('fleet', ref =>
          ref.where('companyId', '==', this.companyId).orderBy('nextService').limit(10));
        this.fleets = this.fleetCollection.valueChanges();
        combineLatest(this.startobs, this.endobs).subscribe((value) => {
          this.firequery(value[0], value[1]).subscribe((vehicles) => {
            this.vehicles = vehicles;
          });
        });
      });
    });
  }

  search($event) {
    let q = $event.target.value;
    if (q !== '') {
      this.startAt.next(q);
      this.endAt.next(q + "\uf8ff");
      this.searching = true;
    } else {
      this.searching = false;
    }
  }

  firequery(start, end) {
    return this.afs.collection('fleet', ref => ref.where('companyId', '==', this.companyId)
      .limit(5).orderBy('registration').startAt(start).endAt(end)).valueChanges();
  }

  searchTrue() {
    this.searching = true;
  }
  searchFalse() {
    this.searching = false;
  }

  add() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['vehicles/new']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  view(vehicle) {
    this.data = { key: vehicle.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`vehicles/view`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  edit(vehicle) {
    var reportUrl = vehicle.report;
    this.data = { key: vehicle.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`vehicles/edit`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async delete(vehicle) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Vehicle',
      message: `Are you sure you want to delete this vehicle?`,
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
              const update = {
                latest: false
              };
              this.afs.collection(`vehicles`).doc(vehicle.key).delete().then(() => {
                this.afs.collection(`fleet`).doc(vehicle.key).delete()
                this.alertCtrl.dismiss();
                this.loading.dismiss().then(() => {
                  this.toast.show('Vehicle Successfully Deleted!');
                });
              });
            });
          }
        }
      ]
    });
    return await prompt.present();
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Fleet',
        screen_class: 'FleetPage'
      });
    })
  }
}




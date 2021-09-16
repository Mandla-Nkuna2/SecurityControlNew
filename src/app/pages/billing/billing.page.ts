import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { map, take } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { UpdateBillingPage } from '../update-billing/update-billing.page';


@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  styleUrls: ['./billing.page.scss'],
})
export class BillingPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: false,
    startDate: Date, endDate: Date
  };

  bill = {
    key: '', amount: null, month: '', exRate: null, incRate: null, status: '', dateStamp: Date, companyId: '', company: '',
    due: Date, invDate: '',
  };

  company = {
    name: '', address: '', country: '', lat: '', lng: '', vat: '', contact: null, email: '', rep: '', logo: '', key: '',
    sites: null, workDays: null, companyLeave: null, visit: '', visitUser: false, visitClient: '', meeting: '', meetingUser: false,
    meetingClient: '', uniform: '', uniformUser: false, uniformClient: '', incident: '', incidentUser: false, incidentClient: '',
    vehicle: '', vehicleUser: false, vehicleClient: '', disciplinary: '', disciplinaryUser: false, disciplinaryClient: '',
    training: '', trainingUser: false, trainingClient: '', transparency: '', transparencyUser: false, transparencyClient: '',
    ec: '', ecUser: false, ecClient: '', incidentGen: '', incidentGenUser: false, incidentGenClient: '', leave: '', leaveUser: false,
    leaveClient: '', arVisit: '', arVisitUser: false, arVisitClient: '', ob: '', obUser: false, obClient: '', assessment: '',
    assessmentUser: false, assessmentClient: '', tenant: '', tenantUser: false, tenantClient: '', instruction: '',
    instructionUser: false, instructionClient: '', notification: '', notificationUser: false, notificationClient: '',
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  billCollection: AngularFirestoreCollection<any>;
  bills: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  companys: Observable<any[]>;
  expDate;
  dueDate;
  percent;
  updateInfo: boolean = false;

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController, public modalCtrl: ModalController,
    private afs: AngularFirestore, public navCtrl: NavController, public router: Router, private storage: Storage,
    public loading: LoadingService, public activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
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
          this.user.endDate = user.endDate;
          this.user.trial = user.trial;

          this.companyCollection = this.afs.collection('companies', ref => ref.where('key', '==', `${this.user.companyId}`));
          this.companys = this.companyCollection.snapshotChanges().pipe(map(changes => {
            return changes.map((a: any) => {
              const info = a.payload.doc.data();
              const key = a.payload.doc.id;
              return { key, ...info };
            });
          }));
          this.companys.subscribe(companys => {
            companys.forEach(company => {
              this.company.sites = company.sites;
              this.company.name = company.name;
              this.company.contact = company.contact;
              this.company.address = company.address;
              this.company.email = company.email;
              this.company.vat = company.vat;
              this.company.rep = company.rep;
              this.company.country = company.country;
              this.company.key = company.key;

              if (this.user.trial === false) {
                var date = new Date(), y = date.getFullYear(), m = date.getMonth();
                var lastDay = new Date(y, m + 1, 0);
                this.dueDate = moment(lastDay).format('YYYY/MM/DD');
                this.bill.due = this.dueDate;
                this.bill.month = moment(new Date().toISOString()).locale('en').format('MMMM');
                this.bill.status = 'CURRENT';
              }
              if (this.user.trial === true) {
                var startDate = moment(user.endDate);
                var endDate = moment(startDate).endOf('month');
                this.dueDate = moment(endDate).format('YYYY/MM/DD');
                this.bill.due = this.dueDate;
                this.bill.amount = 0.00;
                this.bill.month = moment(endDate).format('MMMM');
                this.bill.status = 'FREE TRIAL';
                var endTrialDate = moment(user.endDate);
                var endMonthDate = moment(this.dueDate);
                var startMonth = moment(startDate).startOf('month');
                var numDaysMonth = endMonthDate.diff(startMonth, 'days');
                var numDaysTrial = endMonthDate.diff(endTrialDate, 'days');
                this.percent = numDaysTrial / numDaysMonth;
                var newDate = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
                var a = moment(user.endDate);
                var b = moment(newDate);
                this.expDate = a.diff(b, 'days')   // =1
              }
              if (this.company.country === 'South Africa') {
                this.bill.incRate = 99.99;
              }
              else {
                this.bill.incRate = 9.99;
              }
            });
          });
        });
      });
    });
  }

  view(bill) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['view-bill', bill.key]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  breakdown() {
    this.router.navigate(['billing-breakdown', this.user]);
  }

  async update() {
    const modal = await this.modalCtrl.create({
      component: UpdateBillingPage
    });
    return await modal.present();
  }

  history() {

  }

}

/*

async update() {
    this.loading.present('Opening Please Wait...');
    setTimeout(() => {
      this.loading.dismiss();
    }, 10000);
    const modal = await this.modalCtrl.create({
      component: UpdateBillingPage
    });
    return await modal.present().then(() => {
      this.loading.dismiss();
    });
  }

  */


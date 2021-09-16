import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import * as XLSX from 'xlsx';
import moment from 'moment';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.page.html',
  styleUrls: ['./staff.page.scss'],
})
export class StaffPage implements OnInit {

  guard = {
    Key: '', grade: '', photo: '', id: 0, AssNo: 0, companyId: '', name: '', CoNo: '', cell: 0, annualUsed: 0, annualAccrued: 0,
    workDays: 0, siteId: '', site: '',
  };

  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  allGuards = [];
  sub;
  searchterm: string;
  startAt = new Subject();ls
  endAt = new Subject();
  startobs = this.startAt.asObservable();
  endobs = this.endAt.asObservable();
  employeeValues;
  siteId;
  companyId;
  searching: boolean = false;
  searchedCollection: AngularFirestoreCollection<any>;
  searched: Observable<any[]>;
  data;
  public userDetail: any;
  guardName: boolean = false;
  guardNumber: boolean = false;
  id = '';
  info;
  permission = false;
  thompsons = false;
date;
  constructor(private platform: Platform, public loadingCtrl: LoadingController, public toast: ToastService,
    public alertCtrl: AlertController, private afs: AngularFirestore, public modalCtrl: ModalController,
    public navCtrl: NavController, public loading: LoadingService, public router: Router,
    private storage: Storage, public activatedRoute: ActivatedRoute) {
  }
  ngOnInit() {
    this.platform.ready().then(() => {
      this.displayUser();
      combineLatest(this.startobs, this.endobs).subscribe((value) => {
        this.firequery(value[0], value[1]).subscribe((employees) => {
          this.employeeValues = employees;
        });
      });
    });
  }

  displayUser() {
    this.storage.get('user').then((user) => {
      if (user.companyId === '0qbfVjnyuKE8EAdenn3T') {
        this.thompsons = true;
      } else {
        this.thompsons = false;
      }
      if (user.type === 'Owner' || user.type === 'Account Admin') {
        this.permission = true;
      } else {
        this.permission = false;
      }
      if (user.companyId !== undefined) {
        this.guardsCollection = this.afs.collection('guards', ref => ref.where('companyId', '==', user.companyId).orderBy('name'));
        this.guards = this.guardsCollection.valueChanges();
        this.siteId = user.siteId;
        this.companyId = user.companyId;
      }
    });
  }

  firequery(start, end) {
    return this.afs.collection('guards', ref =>
      ref.where('companyId', '==', this.companyId).orderBy('name').limit(5).startAt(start).endAt(end)).valueChanges();
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

  add() {
    this.router.navigate(['/add-guard/new']);
  }

  edit(report) {
    this.data = { key: report.Key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`add-guard/edit`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async delete(guard) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Guard?',
      message: `Are you sure you want to delete guard ${guard.name}?`,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Delete',
          handler: data => {
            this.afs.collection('guards').doc(guard.Key).delete().then(() => {
              this.toast.show(`Guard ${guard.name} Successfully Deleted!`);
              this.loading.dismiss();
            });
          }
        }
      ]
    });
    prompt.present();
  }

  view(guard) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/view-guard', guard.Key]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  staffReport(): void {
    this.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');

    let element = document.getElementById('staffReport');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, `Staff_Report_${this.date}.xlsx`);
  }

}




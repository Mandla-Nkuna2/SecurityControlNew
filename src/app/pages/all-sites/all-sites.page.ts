import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-all-sites',
  templateUrl: './all-sites.page.html',
  styleUrls: ['./all-sites.page.scss'],
})
export class AllSitesPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyId: '';

  searchterm: string;
  startAt = new Subject();
  endAt = new Subject();
  startobs = this.startAt.asObservable();
  endobs = this.endAt.asObservable();
  sitesValues;
  searching: boolean = false;

  screen;
  app: boolean = false;
  permission: boolean = false;

  constructor(private platform: Platform, public loadingCtrl: LoadingController, public toast: ToastService,
    public alertCtrl: AlertController, private afs: AngularFirestore, public modalCtrl: ModalController, public navCtrl: NavController,
    private storage: Storage, public loading: LoadingService, public router: Router, private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('user').then((user) => {
        this.screen = window.innerWidth;
        if (window.innerWidth > 1024) {
          this.app = false;
        } else {
          this.app = true;
        }
        var id = user.key;
        this.user.companyId = user.companyId;
        this.user.type = user.type;
        if (this.user.type === 'Owner' || this.user.type === 'Account Admin' || this.user.type === 'Admin') {
          this.permission = true;
        }
        this.user.key = user.key;
        this.companyId = user.companyId;
        this.sitesCollection = this.afs.collection(`sites`, ref => ref.where('companyId', '==', user.companyId).orderBy('name'));
        this.sites = this.sitesCollection.valueChanges();
        combineLatest(this.startobs, this.endobs).subscribe((value) => {
          this.firequery(id, value[0], value[1]).subscribe((sites) => {
            this.sitesValues = sites;
          });
        });
      });
    });
  }

  firequery(id, start, end) {
    return this.afs.collection(`sites`, ref => ref.where('companyId', '==', this.user.companyId)
    .orderBy('name').limit(5).startAt(start).endAt(end)).valueChanges();
  }

  search($event) {
    let q = $event.target.value;
    if (q !== '') {
      this.startAt.next(q);
      this.endAt.next(q + '\uf8ff');
      this.searching = true;
    } else {
      this.searching = false;
    }
  }

  viewSite(site) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/view-site', site.key]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async addSite() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/add-site/new']).then(() => {
        this.loading.dismiss();
      });
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'All Sites',
        screen_class: 'AllSitesPage'
      });
    })
  }


}




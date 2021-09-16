import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-view-guard',
  templateUrl: './view-guard.page.html',
  styleUrls: ['./view-guard.page.scss'],
})
export class ViewGuardPage implements OnInit {

  guard = {
    Key: '', grade: '', photo: '', id: 0, AssNo: 0, companyId: '', name: '', CoNo: '', cell: 0, annualUsed: 0, annualAccrued: 0,
    workDays: 0, siteId: '', site: '',learnershipNo: '', learnershipDate: '', 
  };

  warningsCollection: AngularFirestoreCollection<any>;
  warnings: Observable<any[]>;
  uniformsCollection: AngularFirestoreCollection<any>;
  uniforms: Observable<any[]>;
  leavesCollection: AngularFirestoreCollection<any>;
  leaveApps: Observable<any[]>;
  trainingsCollection: AngularFirestoreCollection<any>;
  trainings: Observable<any[]>;
  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  public siteName;
  id;
  data;
  info;

  thompsons = false;

  constructor(private platform: Platform, public loadingCtrl: LoadingController, private afs: AngularFirestore,
    public navCtrl: NavController, public loading: LoadingService, private storage: Storage, public router: Router,
    public activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.getKey().then(() => {
        this.getGuard().then(() => {
          this.thompsonPerm();

          this.warningsCollection = this.afs.collection('disciplinarys', ref =>
            ref.where('soKey', '==', `${this.guard.Key}`).orderBy('date', 'desc').orderBy('time', 'desc'));
          this.warnings = this.warningsCollection.valueChanges();
          this.uniformsCollection = this.afs.collection('uniforms', ref =>
            ref.where('soKey', '==', `${this.guard.Key}`).orderBy('date', 'desc').orderBy('time', 'desc'));
          this.uniforms = this.uniformsCollection.valueChanges();
          this.leavesCollection = this.afs.collection('leaveApps', ref =>
            ref.where('soKey', '==', `${this.guard.Key}`).orderBy('date', 'desc').orderBy('time', 'desc'));
          this.leaveApps = this.leavesCollection.valueChanges();
          this.trainingsCollection = this.afs.collection('trainings', ref =>
            ref.where('soKey', '==', `${this.guard.Key}`).orderBy('date', 'desc').orderBy('time', 'desc'));
          this.trainings = this.trainingsCollection.valueChanges();

          this.sitesCollection = this.afs.collection('sites', ref => ref.where('key', '==', `${this.guard.siteId}`));
          this.sites = this.sitesCollection.valueChanges();
          this.sites.subscribe(sites => {
            sites.forEach(site => {
              if (this.guard.site === undefined) {
                this.guard.site = site.name;
              }
            });
          });
        });
      });
    });
  }

  async getKey() {
    this.id = await this.activatedRoute.snapshot.paramMap.get('id');
  }

  async getGuard() {
    return new Promise<any>((resolve, reject) => {
      this.afs.collection('guards').doc(this.id).ref.get().then((guard) => {
        this.data = guard.data();
        console.log(this.data);
        
        if (this.data) {
          resolve(true);
          return this.guard = this.data;
        }
      }).catch(err => {
        reject();
        alert('Error: ' + err);
      });
    });
  }

  thompsonPerm() {
    this.storage.get('user').then((user) => {
      if (user.companyId === '0qbfVjnyuKE8EAdenn3T') {
        this.thompsons = true
      } else {
        this.thompsons = false;
      }
    });
  }

  viewUniform(report) {
    this.info = { key: report.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.info
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`uniform-order/view`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  viewLeave(report) {
    this.info = { key: report.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.info
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`leave-application/view`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  viewTraining(report) {
    this.info = { key: report.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.info
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`training-form/view`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

}


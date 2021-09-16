import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-guard-to-site',
  templateUrl: './add-guard-to-site.page.html',
  styleUrls: ['./add-guard-to-site.page.scss'],
})
export class AddGuardToSitePage implements OnInit {

  guard = {
    Key: '', grade: '', photo: '', id: 0, AssNo: 0, companyId: '', name: '', CoNo: '', cell: 0, annualUsed: 0,
    annualAccrued: 0, workDays: 0, siteId: '', site: '',
  };

  site = {
    key: '', name: '', client: '', address: '', contact: '', email: '', lastVisit: Date, visitBy: '', issues: '',
    visitKey: '', recipient: '',
  };

  searchterm: string;
  startAt = new Subject();
  endAt = new Subject();
  startobs = this.startAt.asObservable();
  endobs = this.endAt.asObservable();
  startAt2 = new Subject();
  endAt2 = new Subject();
  startobs2 = this.startAt2.asObservable();
  endobs2 = this.endAt2.asObservable();

  allGuardsCollection: AngularFirestoreCollection<any>;
  allGuards: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards;
  guardid;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  user = {} as any;
  id = '';
  addGuard;
  guardName: boolean = false;
  guardNumber: boolean = false;
  data;
  searching: boolean = false;

  constructor(private storage: Storage, private platform: Platform, public loadingCtrl: LoadingController,
    public toast: ToastService, private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService,
    public activatedRoute: ActivatedRoute) {
  }

  async ngOnInit() {
    await this.platform.ready();
    await this.getSiteKey().then(() => {
      this.getSite().then(() => {
        this.storage.get('user').then((user) => {
          const existingData = Object.keys(user).length;
          if (existingData !== 0) {
            var id = user._id;
            if (user.companyId !== undefined) {
              this.user.companyId = user.companyId;
              this.user.type = user.type;
            }
          }
          this.allGuardsCollection = this.afs.collection('guards', ref => ref.where('companyId', '==', user.companyId).orderBy('name'));
          this.allGuards = this.allGuardsCollection.valueChanges();
        });
        this.guard.site = this.site.name;
        this.guard.siteId = this.site.key;
        this.query();
      });
    });
  }

  async getSiteKey() {
    this.id = await this.activatedRoute.snapshot.paramMap.get('id');
  }

  getSite() {
    return new Promise<any>((resolve, reject) => {
      this.storage.get('user').then((user) => {
        var key = user.key;
        this.afs.collection('sites').doc(this.id).ref.get().then((site: any) => {
          this.data = site.data();
          if (this.data) {
            resolve(true);
            return this.site = this.data;
          }
        }).catch(err => {
          reject();
          alert('Error: ' + err);
        });
      });
    });
  }

  check() {
    this.guardsCollection = this.afs.collection(`guards`, ref => ref.where('name', '==', this.guard.name));
    this.guardid = this.guardsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardid.subscribe(guards => {
      guards.forEach(unit => {
        this.guard.Key = unit.Key;
      });
    });
  }

  all() {
    this.searching = false;
    this.guardName = false;
    this.guardNumber = false;
    this.guard.name = '';
  }

  name() {
    this.guardName = true;
    this.guardNumber = false;
    this.searching = true;
    this.guard.name = '';
  }

  add(guard) {
    if (this.guard.name !== '') {
      this.loading.present('Adding Please Wait...');
      this.addGuard = {
        siteId: this.guard.siteId
      };
      this.afs.collection(`guards`).doc(guard.Key).update(this.addGuard).then(() => {
        this.toast.show(`Guard ${this.guard.name} successfully added to site ${this.guard.site}!`);
        this.loading.dismiss();
        this.navCtrl.pop();
      });
    }
  }

  query() {
    combineLatest(this.startobs, this.endobs).subscribe((value) => {
      this.firequery(value[0], value[1]).subscribe((guards) => {
        this.guards = guards;
      });
    });
    combineLatest(this.startobs2, this.endobs2).subscribe((value) => {
      this.firequery2(value[0], value[1]).subscribe((guards) => {
        this.guards = guards;
      });
    });
  }

  search($event) {
    let q = $event.target.value;
    if (q !== '') {
      this.startAt.next(q);
      this.endAt.next(q + "\uf8ff");
    }
  }

  searchNum($event) {
    let q = $event.target.value;
    if (q !== '') {
      this.startAt2.next(q);
      this.endAt2.next(q + "\uf8ff");
    }
  }

  firequery(start, end) {
    return this.afs.collection('guards', ref => ref.where('companyId', '==', this.user.companyId).
      limit(4).orderBy('name').startAt(start).endAt(end)).valueChanges();
  }

  firequery2(start2, end2) {
    return this.afs.collection('guards', ref => ref.where('companyId', '==', this.user.companyId).
      limit(4).orderBy('CoNo').startAt(start2).endAt(end2)).valueChanges();
  }
}


import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { map, take } from 'rxjs/operators';
import { AnalyticsService } from 'src/app/services/analytics.service';


@Component({
  selector: 'app-summaries',
  templateUrl: './summaries.page.html',
  styleUrls: ['./summaries.page.scss'],
})
export class SummariesPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;

  constructor(private afs: AngularFirestore, public navCtrl: NavController, public router: Router, private storage: Storage, private platform: Platform, private analyticsService: AnalyticsService) { }

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
        });
      });
    });
  }

  visit() {
    this.router.navigate(['site-visit-summary']);
  }

  training() {
    this.router.navigate(['training-summary']);
  }

  fleet() {
    this.router.navigate(['fleet-summary']);
  }
  
  all() {

  }

  ob() {

  }

  incident() {

  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Summaries',
        screen_class: 'SummariesPage'
      });
    })
  }


}


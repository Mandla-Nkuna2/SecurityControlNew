import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-site-to-user',
  templateUrl: './add-site-to-user.page.html',
  styleUrls: ['./add-site-to-user.page.scss'],
})
export class AddSiteToUserPage implements OnInit {


  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  site = {
    key: '', name: '', client: '', address: '', contact: '', email: '', lastVisit: '', visitBy: '', issues: '', visitKey: '',
    companyId: '', lat: null, lng: null, dayShift: false, nightShift: false, noonShift: false,
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteNames: AngularFirestoreCollection<any>;
  siteId: Observable<any[]>;
  siteDetails;
  id: string = '';

  userSite;
  params;

  constructor(public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    public toast: ToastService, private afs: AngularFirestore, public navCtrl: NavController, public navParams: NavParams,
    public loading: LoadingService, private storage: Storage, public modalCtrl: ModalController) {
    // this.params = navParams.data;
  }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.user = user;
      console.log(this.user.name);
      this.fetchSites();
    });
  }

  fetchSites() {
    this.sitesCollection = this.afs.collection('sites', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  check(site) {
    this.loading.present('Fetching Site...');
    this.siteNames = this.afs.collection(`sites`, ref => ref.where('key', '==', site.key));
    this.siteId = this.siteNames.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteId.subscribe(sites => {
      sites.forEach(site => {
        this.site.key = site.key;
        this.site.name = site.name;
        this.loading.dismiss();
      });
    });
  }

  async add(site) {
    const numKey = this.site.key + '';
    this.loading.present('Adding Please Wait...');
    this.userSite = {
      key: this.site.key,
      name: this.site.name
    };
    this.afs.collection(`users/${this.user.key}/sites`).doc(numKey).set(this.userSite).then(ref => {
      this.toast.show(`Site: ${this.site.name} Successfully Added to User: ${this.user.name}!`);
      this.navCtrl.pop();
      this.loading.dismiss();
    }).catch(async err => {
      this.loading.dismiss();
      const prompt = await this.alertCtrl.create({
        header: 'Error',
        message: err,
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      prompt.present();
    });
  }

}

/*

ngOnInit() {
    this.storage.get('user').then((user) => {
      this.usersCollection = this.afs.collection('users', ref => ref.where('key', '==', `${this.params}`));
      this.users = this.usersCollection.valueChanges();
      this.users.subscribe(users => {
        users.forEach(user => {
          this.user.type = user.type;
          this.user.companyId = user.companyId;
          this.user.name = user.name;
          console.log(this.user.companyId);
          if (this.user.companyId !== undefined) {
            this.loading.present('Fetching All Sites...');
            return this.fetchSites().subscribe(() => {
              this.loading.dismiss();
            });
          }
        });
      });
    });
  }

  */


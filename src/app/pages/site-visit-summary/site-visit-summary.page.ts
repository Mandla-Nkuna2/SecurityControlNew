import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import { map, take } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-site-visit-summary',
  templateUrl: './site-visit-summary.page.html',
  styleUrls: ['./site-visit-summary.page.scss'],
})
export class SiteVisitSummaryPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;

  data;
  selectSite = [];
  finalSites = [];

  site = {
    selected: false,
    recipient: '',
    date: '',
    status: '',
    key: ''
  };

  constructor(private afs: AngularFirestore, public navCtrl: NavController, public router: Router, private storage: Storage,
    public loading: LoadingService, public PdfService: PdfService, public alertCtrl: AlertController) { }

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

          this.sitesCollection = this.afs.collection('sites', ref =>
            ref.where('companyId', '==', this.user.companyId).orderBy('name'));
          this.sites = this.sitesCollection.valueChanges();
        });
      });
    });
  }

  async view(site) {
    if (site.visitKey === '' || site.visitKey === undefined) {
      const prompt = await this.alertCtrl.create({
        header: 'Invalid Action',
        cssClass: 'alert',
        message: 'This site has not yet been visited. Please complete a site visit form.',
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      await prompt.present();
    } else {
      if (this.user.companyId === '0qbfVjnyuKE8EAdenn3T') {
        this.data = { key: site.visitKey };
        const navigationExtras: NavigationExtras = {
          state: {
            data: this.data
          }
        };
        this.loading.present('Opening Please Wait...').then(() => {
          this.router.navigate([`site-visit/view`], navigationExtras).then(() => {
            this.loading.dismiss();
          });
        });
      } else {
        this.data = { key: site.visitKey };
        const navigationExtras: NavigationExtras = {
          state: {
            data: this.data
          }
        };
        this.loading.present('Opening Please Wait...').then(() => {
          this.router.navigate([`site-visit-gen/view`], navigationExtras).then(() => {
            this.loading.dismiss();
          });
        });
      }
    }
  }

  addToList(site) {
    if (site.selected === true) {
      this.selectSite.push(site);
    } else {
      for (var i = 0; i < this.selectSite.length; i++) {
        if (this.selectSite[i] === site) {
          this.selectSite.splice(i, 1);
        }
      }
    }
  }

  download() {
    if (this.selectSite.length > 0) {
      this.loading.present('Downloading Please Wait...').then(() => {
        this.checkVisists().then(() => {
          console.log(this.finalSites);
          this.PdfService.downloadAllVisits(this.finalSites).then(() => {
            this.loading.dismiss();
          });
        });
      });
    } else {
      alert('Please select the reports to download...');
    }
  }


  async checkVisists() {
    await this.selectSite.forEach(async site => {
      if (site.selected === true) {
        await this.finalSites.push(site);
      }
    });
  }

}


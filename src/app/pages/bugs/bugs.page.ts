import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from '../../services/toast.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-bugs',
  templateUrl: './bugs.page.html',
  styleUrls: ['./bugs.page.scss'],
})
export class BugsPage implements OnInit {

  bug = {
    key: '', dateStamp: '', details: '', image: '', user: '', email: '', contact: '', company: '', type: '',
  };

  data;

  bugsCollection: AngularFirestoreCollection<any>;
  bugs: Observable<any[]>;

  constructor(private afs: AngularFirestore, public navCtrl: NavController, public router: Router,
    public loading: LoadingService, public toast: ToastService, private storage: Storage) {
  }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      if (user.key === '2zvKzqSiNPhi6yjADn22CnvnIg63') {
        this.bugsCollection = this.afs.collection('Bugs', ref => ref.orderBy('dateStamp'));
        this.bugs = this.bugsCollection.valueChanges();
      }
    });
  }

  view(bug) {
    this.data = { key: bug.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`bug/view`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  delete(bug) {
    this.loading.present('Deleting Please Wait...').then(() => {
      this.afs.collection('Bugs').doc(bug.key).delete().then(() => {
        this.router.navigate(['/welcome']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Report Successfully Deleted!');
          });
        });
      });
    });
  }

}


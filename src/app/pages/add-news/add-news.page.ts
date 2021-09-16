import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.page.html',
  styleUrls: ['./add-news.page.scss'],
})
export class AddNewsPage implements OnInit {

  news = {
    timeStamp: '', date: '', details: '',
  };

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  item;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  valid: boolean = false;

  constructor(public alertCtrl: AlertController, public toast: ToastService, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public navCtrl: NavController, public navParams: NavParams, private storage: Storage,
    public loading: LoadingService, public router: Router, public modalCtrl: ModalController) {
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
          this.user.permission = user.permission;
          if (user.permission) {
            this.news.timeStamp = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
            this.news.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          }
        });
      });
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async invalidMsg() {
    const prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      message: "Please Note ALL fields marked with an '*' must be filled in to submit the form!",
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

  checkFields(news) {
    if (news.details !== undefined && news.details !== '') {
      this.valid = true;
    } else {
      this.valid = false;
    }
  }

  async addItem(news) {
    this.news.details = news.details;
    this.afs.collection('news').add(this.news).then(() => {
      this.toast.show('News Item Successfully Added!');
      this.modalCtrl.dismiss();
    }).catch(async err => {
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
      return await prompt.present();
    });
  }

}

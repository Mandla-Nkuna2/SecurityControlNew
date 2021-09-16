import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subject, combineLatest } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  user = {
    key: '', name: '', company: '', companyId: '', type: '', contact: '', email: '', password: ''
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
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

  permission: boolean = false;

  constructor(private platform: Platform, public loadingCtrl: LoadingController, public toast: ToastService,
    public alertCtrl: AlertController, private afs: AngularFirestore, public modalCtrl: ModalController,
    public navCtrl: NavController, public loading: LoadingService, public router: Router,
    private storage: Storage, public activatedRoute: ActivatedRoute) {
  }
  ngOnInit() {
    this.platform.ready().then(() => {
      this.storage.get('user').then((user) => {
        if (user.companyId !== undefined) {
          this.usersCollection = this.afs.collection('users', ref => ref.where('companyId', '==', user.companyId).orderBy('name'));
          this.users = this.usersCollection.valueChanges();
          this.siteId = user.siteId;
          this.companyId = user.companyId;
          this.user.type = user.type;
          if (this.user.type === 'Owner' || this.user.type === 'Account Admin') {
            this.permission = true;
          }
        }
      });
    });
  }

  add() {
    this.router.navigate(['/add-user/new']);
  }

  view(user) {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['/view-user', user.key]).then(() => {
        this.loading.dismiss();
      });
    });
  }

  edit(report) {
    this.data = { key: report.key };
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data
      }
    };
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate([`add-user/edit`], navigationExtras).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async delete(user) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete User?',
      message: `Are you sure you want to delete user ${user.name}?`,
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Delete',
          handler: data => {
            this.afs.collection('users').doc(user.key).delete().then(() => {
              this.toast.show(`User ${user.name} Successfully Deleted!`);
              this.loading.dismiss();
            });
          }
        }
      ]
    });
    prompt.present();
  }

}





import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, AlertController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.page.html',
  styleUrls: ['./work-order.page.scss'],
})
export class WorkOrderPage implements OnInit {

  order = {
    key: '', date: '', time: '', manager: '', desc: '', status: 'Pending', site: '', type: '', customer: '', assignedName: '', assignedKey: '', assignedEmail: '', recipient: '', companyEmail: '', companyId: '',
  };

  params;

  descValue = false;

  users = [];

  tech = false;

  user: any = {};

  constructor(public navParams: NavParams, public modalCtrl: ModalController, private afs: AngularFirestore, public loading: LoadingService, private storage: Storage,
    public toast: ToastService, public alertCtrl: AlertController) {
    this.params = navParams.data;
  }

  ngOnInit() {
    this.storage.ready().then(() => {
      this.storage.get('user').then((user) => {
        if (user.type === 'Technician') {
          this.tech = true;
          this.order.manager = user.name
          this.order.key = UUID.UUID();
          this.order.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.order.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.order.assignedName = user.name;
          this.order.assignedKey = user.key;
          this.order.assignedEmail = user.email;
          this.order.recipient = user.email,
            this.order.companyId = user.companyId;
        } else {
          this.tech = false;
          this.order.manager = user.name;
          this.order.key = UUID.UUID();
          this.order.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.order.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.order.companyId = user.companyId;
          this.getUsers();
        }
      });
    });
  }

  getUsers() {
    this.afs.collection('users').ref.where('type', '==', 'Technician').orderBy('name').get().then(users => {
      users.forEach(user => {
        this.users.push(user.data())
      })
    })
  }

  setUser(user) {
    console.log('In set')
    this.order.assignedName = user.name;
    this.order.assignedKey = user.key;
    this.order.assignedEmail = user.email;
    this.order.recipient = user.email
    console.log(this.order)
  }

  save() {
    if (this.order.customer !== '') {
      if (this.order.site !== '') {
        if (this.order.assignedName !== '') {
          if (this.order.desc !== '') {
            this.loading.present('Saving, Please Wait...').then(() => {
              this.afs.collection('work-orders').doc(this.order.key).set(this.order).then(() => {
                this.loading.dismiss();
                this.modalCtrl.dismiss();
                this.toast.show('Saved Successfully');
              });
            });
          } else {
            this.alertMsg('Job Desciption')
          }
        } else {
          this.alertMsg('Assigned User')
        }
      } else {
        this.alertMsg('Site')
      }
    } else {
      this.alertMsg('Customer Name')
    }
  }

  async alertMsg(item) {
    const prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      cssClass: 'alert',
      message: `Please complete field ${item} before saving!`,
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

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

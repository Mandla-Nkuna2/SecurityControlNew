import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-work-order-form',
  templateUrl: './work-order-form.page.html',
  styleUrls: ['./work-order-form.page.scss'],
})
export class WorkOrderFormPage implements OnInit {

  order = {
    key: '', date: '', time: '', manager: '', desc: '', status: 'Pending', site: '', type: '', customer: '', assignedName: '', assignedKey: '', assignedEmail: '',
    recipient: '', companyEmail: '', companyId: '',
  };

  sites = [];
  users = [];
  user;
  tech = false;

  constructor(private afs: AngularFirestore, public loading: LoadingService, public alertCtrl: AlertController, public navCtrl: NavController,
    public toast: ToastService, private storage: Storage, public router: Router) {
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
          this.getSites();
        } else {
          this.tech = false;
          this.order.manager = user.name;
          this.order.key = UUID.UUID();
          this.order.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.order.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.order.companyId = user.companyId;
          this.getSites();
          this.getUsers();
        }
      });
    });
  }

  async exit() {
    let prompt = await this.alertCtrl.create({
      header: 'Exit Form',
      message: 'Are you sure you want to Exit?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'EXIT',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    return await prompt.present();
  }

  async getSites() {
    await this.storage.get('sites').then((sites) => {
      if (sites) {
        sites.forEach(site => {
          this.sites.push({ name: site.name, key: site.key });
        });
      }
    });
    return this.sites;
  }

  getUsers() {
    this.afs.collection('users').ref.where('type', '==', 'Technician').orderBy('name').get().then(users => {
      users.forEach(user => {
        this.users.push(user.data())
      })
    })
  }

  setUser(user) {
    this.order.assignedName = user.name;
    this.order.assignedKey = user.key;
    this.order.assignedEmail = user.email;
    this.order.recipient = user.email
    // console.log(this.order)
  }

  save() {
    if (this.order.customer !== '') {
      if (this.order.site !== '') {
        if (this.order.assignedName !== '') {
          if (this.order.desc !== '') {
            this.loading.present('Saving, Please Wait...').then(() => {
              this.afs.collection('work-orders').doc(this.order.key).set(this.order).then(() => {
                this.loading.dismiss();
                if (this.tech) {
                  this.router.navigate(['work-orders'])

                } else {
                  this.router.navigate(['forms'])
                }
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

}

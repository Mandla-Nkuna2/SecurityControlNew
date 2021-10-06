import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-memberships',
  templateUrl: './memberships.page.html',
  styleUrls: ['./memberships.page.scss'],
})
export class MembershipsPage implements OnInit {

  accessType;
  basic = { title: '', price: '', access: [], id: ''};
  premium = { title: '', price: '', access: [], id: ''};
  enterprise = { title: '', price: '', access: [], id: ''};
  user;
  company;

  constructor(private afs: AngularFirestore, private storage: Storage, private alertCtrl: AlertController, private toast: ToastService) { }

  ngOnInit() {
    this.afs.collection('membershipPackages').ref.orderBy('title').get().then(packages => {
      packages.forEach((pack: any) => {
        if (pack.data().title === 'Basic') {
          this.basic = pack.data();
        } else if (pack.data().title === 'Premium') {
          this.premium = pack.data();
        } else {
          this.enterprise = pack.data();
        }
      })
      this.storage.get('user').then(user => {
        this.user= user;
        this.afs.collection('companies').doc(user.companyId).ref.get().then((comp: any) => {
          this.company = comp.data();
          if (comp.data().accessType && comp.data().accessType !== '') {
            this.accessType = comp.data().accessType;
          } else {
            this.accessType = '';
          }
        })
      })
    })
  }

  async enterpriseContact() {
    const alert = await this.alertCtrl.create({
      header: 'Enterprise inquiry',
      message: 'Would you like to contact us about upgrading to Enterprise?',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'SEND INQUIRY',
          handler: data => {
            var inq = {
              company: this.company.name,
              companyId: this.company.key,
              user: this.user.name,
              userEmail: this.user.email,
              userId: this.user.key,
              date: moment(new Date()).format('YYYY/MM/DD HH:mm'),
            }
            this.afs.collection('enterpriseInquiry').doc(inq.companyId).set(inq);
            this.toast.show('Your inquiry has been sent. Someone from our team will be contacting you soon!')
          }
        }
      ]
    })
    return alert.present();
  }

}

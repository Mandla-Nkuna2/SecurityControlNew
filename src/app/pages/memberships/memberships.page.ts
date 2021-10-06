import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { MembershipService } from 'src/app/services/membership.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-memberships',
  templateUrl: './memberships.page.html',
  styleUrls: ['./memberships.page.scss'],
})
export class MembershipsPage implements OnInit {

  accessType;
  basic = { title: '', price: '', access: [], id: '' };
  premium = { title: '', price: '', access: [], id: '' };
  enterprise = { title: '', price: '', access: [], id: '' };
  user;
  company;

  constructor(
    private storage: Storage,
    private alertCtrl: AlertController,
    private toast: ToastService,
    private membershipService: MembershipService
  ) { }

  ngOnInit() {
    this.membershipService.getMembershipPackages().then((packages: any[]) => {
      packages.forEach((pack: any) => {
        if (pack.title === 'Basic') {
          this.basic = pack;
        } else if (pack.title === 'Premium') {
          this.premium = pack;
        } else {
          this.enterprise = pack;
        }
      })
      this.storage.get('user').then(user => {
        this.user = user;
        console.log(this.user.openedSubscription);
        this.membershipService.getCompany(user.companyId).then((comp: any) => {
          this.company = comp;
          if (comp.accessType && comp.accessType !== '') {
            this.accessType = comp.accessType;
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
            this.membershipService.setEnterpriseInquiry(inq.companyId, inq).then(() => {
              this.toast.show('Your inquiry has been sent. Someone from our team will be contacting you soon!')
            })
          }
        }
      ]
    })
    return alert.present();
  }

}

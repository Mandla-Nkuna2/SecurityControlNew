import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { MembershipService } from 'src/app/services/membership.service';
import { PurchasesService } from 'src/app/services/purchases.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-memberships-app',
  templateUrl: './memberships-app.page.html',
  styleUrls: ['./memberships-app.page.scss'],
})
export class MembershipsAppPage implements OnInit {

  app = false;
  products = [];
  chosenItem;
  productIDs = ['standard_membership', 'premium_membership'];
  enterprise = {
    title: 'Enterprise', description: 'Bespoke features and access', price: 'Custom'
  }
  user;
  company;

  constructor(
    private purchaseService: PurchasesService,
    private platform: Platform,
    private storage: Storage,
    private router: Router,
    private membershipService: MembershipService,
    private alertCtrl: AlertController,
    private toast: ToastService,
    private navController: NavController
  ) { }

  ngOnInit() {
    if (this.platform.is('cordova')) {
      this.app = true;
      this.storage.get('user').then(user => {
        this.user = user;
        console.log(this.user.openedSubscription);
        this.membershipService.getCompany(user.companyId).then((comp: any) => {
          this.company = comp;
          this.purchaseService.register(this.productIDs).then(() => {
            this.purchaseService.getProducts().then(products => {
              this.products = products;
              console.log('Products: ', this.products);
              this.products.forEach(prod => {
                this.purchaseService.registerHandlers(prod);
              });
              this.products.push(this.enterprise)
            })
          })
        })
      })
    } else {
      this.app = false;
      this.router.navigate(['memberships'])
    }
  }

  async buy(product) {
    this.openTransactionSubscription();
    try {
      this.chosenItem = product;
      this.purchaseService.buy(product)
    } catch (err) {
      console.log('Error Ordering ', err);
    }
  }

  openTransactionSubscription() {
    this.purchaseService.transaction.subscribe((transaction: any) => {
      this.storage.get('user').then(user => {
        var newUser = user;
        var newObj: any = {};
        newObj = transaction;
        newObj.deferred = 'undefined';
        newObj.transaction.developerPayload = 'undefined';
        newObj.user = newUser;
        newObj.type = 'App';
        newObj.date = moment(new Date()).format('YYYY/MM/DD');
        newObj.companyId = newUser.companyId;
        newObj.number = 1;
        this.membershipService.setSubscriptions(newObj.companyId, Object.assign({}, newObj)).then(() => {
          this.membershipService.updateCompany(user, {
            accessType: this.chosenItem.title,
            access: true
          }).then(() => {
            newUser.premium = true;
            this.navController.navigateRoot('').then(() => {
              this.navController.navigateRoot('menu/forms');
            })
          })
        })
      })
    });
  }

  ngOnDestroy() {
    this.purchaseService.transaction.unsubscribe();
  }

  verify(prod) {
    this.purchaseService.verify(prod);
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

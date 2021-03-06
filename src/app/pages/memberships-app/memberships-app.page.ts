import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { FormServiceService } from 'src/app/services/form-service.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MembershipService } from 'src/app/services/membership.service';
import { PurchasesService } from 'src/app/services/purchases.service';
import { ToastService } from 'src/app/services/toast.service';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-memberships-app',
  templateUrl: './memberships-app.page.html',
  styleUrls: ['./memberships-app.page.scss'],
})
export class MembershipsAppPage implements OnInit {

  app = false;
  products: any = [];
  chosenItem;
  productIDs = ['standard_membership', 'premium_membership'];
  enterprise = {
    title: 'Enterprise', description: 'Bespoke features and access', price: 'Custom'
  }
  user;
  company;
  accessType = '';
  showProdcuts = false;

  constructor(
    private purchaseService: PurchasesService,
    private platform: Platform,
    private storage: Storage,
    private membershipService: MembershipService,
    private alertCtrl: AlertController,
    private toast: ToastService,
    private navController: NavController,
    private firestore: AngularFirestore,
    private loading: LoadingService,
    private formsService: FormServiceService,
    private router: Router,
    private uiService: UiService
  ) { }

  ngOnInit() {
    this.products = [];
    this.storage.get('user').then(user => {
      this.user = user;
      this.getCompany(user);
      this.products = [];
      this.purchaseService.register(this.productIDs).then(() => {
        this.purchaseService.getProducts().then((products: any[]) => {
          if (products.length < 2) {
            let interval = setInterval(() => {
              this.purchaseService.getProducts().then((prods: any[]) => {
                if (prods.length > 1) {
                  clearInterval(interval);
                  this.products = [];
                  products.forEach((prod) => {
                    this.products.push(Object.assign({}, prod))
                  });
                  console.log('Products: ', this.products);
                  this.products.forEach(prod => {
                    this.purchaseService.registerHandlers(prod);
                  });
                  this.products.push(this.enterprise)
                }
              })
            }, 1000)
          }
          else {
            this.products = [];
            products.forEach((prod) => {
              this.products.push(Object.assign({}, prod))
            })
            console.log('Products: ', this.products);
            this.products.forEach(prod => {
              this.purchaseService.registerHandlers(prod);
            });
            this.products.push(this.enterprise)
          }
        })
      })
    })
  }

  getCompany(user) {
    this.membershipService.getCompany(user.companyId).then((comp: any) => {
      if (comp) {
        this.company = comp;
        if (comp.accessType && comp.accessType !== '') {
          this.accessType = comp.accessType;
        } else {
          this.accessType = '';
        }
      } else {
        this.accessType = '';
      }
    })
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
        this.firestore.collection('subscriptions').doc(newUser.companyId).ref.set({
          user: newUser,
          date: moment(new Date()).format('YYYY/MM/DD'),
          companyId: newUser.companyId,
          number: 1,
          type: 'App',
          transaction: Object.assign({}, newObj)
        });
        this.membershipService.updateCompany(user, {
          accessType: this.chosenItem.title,
          access: true
        }).then(() => {
          this.formsService.retrieveForms(newUser.companyId).then(() => {
            newUser.premium = true;
            this.loading.dismiss();
            this.router.navigate(['menu/welcome']).then(() => {
              this.uiService.refreshMenuStart();
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
              company: this.user.company,
              companyId: this.user.companyId,
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

  async cancel() {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Subscription',
      message: 'Are you sure you want to delete your subscription to Security Control? We will only store your data for 14 days. After this time your account will be deleted',
      buttons: [
        {
          text: 'EXIT',
          handler: data => {
          }
        },
        {
          text: 'CANCEL SUBSCRIPTION',
          handler: async data => {
            this.cancelInfo();
          }
        }
      ]
    })
    return alert.present();
  }

  async cancelInfo() {
    var msg = '';
    if (this.platform.is('ios')) {
      msg = `<p>Cancel subscription on iStore</p>
      <ul>
        <li>Open the Settings app</li>
        <li>Tap your name</li>
        <li>Tap Subscriptions</li>
        <li>Tap the subscription that you want to manage</li>
        <li>Tap Cancel Subscription</li>
      </ul>`;
    } else if (this.platform.is('android')) {
      msg = `<p>Cancelling subscriptions on App Store</p>
      <ul>
        <li>On your device, open Google Play Store.</li>
        <li>Make sure you are signed in to the Google account used in purchasing the app.</li>
        <li>Tap the Menu icon, then tap Subscriptions.</li>
        <li>Select the subscription that you want to cancel.</li>
        <li>Tap Cancel subscription.</li>
        <li>Follow the remaining instructions.</li>
      </ul>`;
    }
    const alert = await this.alertCtrl.create({
      message: msg,
      buttons: [
        {
          text: 'OKAY',
          handler: data => {
          }
        },
      ]
    })
    return alert.present();
  }

  goDesktop() {
    window.open('https://app.securitycontrol.co.za')
  }

}

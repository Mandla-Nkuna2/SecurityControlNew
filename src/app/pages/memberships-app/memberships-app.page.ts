import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { MembershipService } from 'src/app/services/membership.service';
import { PurchasesService } from 'src/app/services/purchases.service';

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

  constructor(
    private purchaseService: PurchasesService,
    private platform: Platform,
    private storage: Storage,
    private router: Router,
    private memberShipService: MembershipService
  ) { }

  ngOnInit() {
    if (this.platform.is('cordova')) {
      this.app = true;
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
    } else {
      this.app = false;
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
        this.memberShipService.setSubscriptions(newObj.companyId, Object.assign({}, newObj)).then(() => {
          this.memberShipService.updateCompany(user.companyId, {
            accessType: this.chosenItem.title,
            access: true
          }).then(() => {
            newUser.premium = true;
            this.router.navigate(['menu/forms']);
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

}

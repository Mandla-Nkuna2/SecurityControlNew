import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { PurchasesService } from 'src/app/services/purchases.service';

@Component({
  selector: 'app-memberships',
  templateUrl: './memberships.page.html',
  styleUrls: ['./memberships.page.scss'],
})
export class MembershipsPage implements OnInit {

  app = false;
  products = [];
  chosenItem;

  constructor(private purchaseService: PurchasesService, private platform: Platform, private storage: Storage, private router: Router, private afs: AngularFirestore) { }

  ngOnInit() {
    if (this.platform.is('cordova')) {
      this.app = true;
      this.purchaseService.register('standard_membership').then(() => {
        this.purchaseService.getProducts().then(products => {
          this.products = products;
          console.log('Products: ', this.products);
          this.products.forEach(prod => {
            this.purchaseService.registerHandlers(prod);
          });
        })
      })
    } else {
      this.app = false;
    }
  }

  async buy(product) {
    this.openTransactionSubscription();
    try {
      this.chosenItem = product.id;
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
        newObj.transaction.developerPayload = 'undefined'
        newObj.user = newUser;
        newObj.key = newUser.key
        console.log('New Object: ', newObj);
        this.afs.collection('transactions').doc(newObj.key).set(Object.assign({}, newObj));
        this.afs.collection('companies').doc(user.companyId).update({
          subscriptionDate: moment(new Date()).format('YYYY/MM/DD'),
          subscriptionType: transaction.id,
          subscriptionUser: user,
          subscription: transaction,
          subscribed: true
        })
        .then(() => {
          newUser.premium = true;
          this.router.navigate(['menu/forms']);
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

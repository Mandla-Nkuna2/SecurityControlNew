import { Injectable, EventEmitter } from '@angular/core';
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  public transaction: EventEmitter<any>;
  trans;

  constructor(private store: InAppPurchase2, private platform: Platform, private alertCtrl: AlertController,
    private http: HTTP, private afs: AngularFirestore, private functions: AngularFireFunctions) {
    this.transaction = new EventEmitter()
  }

  register(my_product_id) {
    return new Promise<void>((resolve, reject) => {
      this.platform.ready().then(() => {
        //this.store.verbosity = this.store.DEBUG; 
        this.store.register({
          id: my_product_id,
          type: this.store.PAID_SUBSCRIPTION,
        });
        this.store.refresh();
        resolve();
      });
    });
  }

  getProducts() {
    return new Promise<any>((resolve, reject) => {
      var products = this.store.products
      resolve(products)
    });
  }

  registerHandlers(productId) {
    let self = this.store;
    this.store.when(productId).updated(function (product) {
      if (product.loaded && product.valid && product.state === self.APPROVED && product.transaction != null) {
        product.finish();
      }
      // this.alertMsg('Loaded')
    });
    this.store.when(productId).registered((product: IAPProduct) => {
      // alert(` owned ${product.owned}`);
    });

    this.store.when(productId).owned((product: IAPProduct) => {
      // console.log('Owned in reg')
      product.finish();
    });

    this.store.when(productId)
      .approved((p: IAPProduct) => {
        this.verify(p).then((data) => {
          console.log('Data: ', data)
          if (data === 'complete') {
            p.finish();
            this.transaction.emit(p);
          }
        })
      })

    this.store.when(productId).refunded((product: IAPProduct) => {
      //alert('Refunded');
    });
    this.store.when(productId).expired((product: IAPProduct) => {
      //alert('Expired');
    });

    this.store.when(productId).cancelled((product: IAPProduct) => {
      console.log('Cancelled')
    });

    // Overall Store Error
    this.store.error((err) => {
      console.log(err)
      this.alertMsg('We\'re sorry! This purchase failed. Please try again')
    });
  }


  verify(p) {
    return new Promise<any>((resolve, reject) => {
      console.log(p)

      const callable = this.functions.httpsCallable('validatePurchase');
      const obs = callable(p);
      obs.subscribe(async res => {
        console.log('Resp: ' , res);
        if (res.verified == true) {
          resolve('complete')
        }
        else {
          reject(res.error);
        }
      });

      // this.http.post('https://us-central1-security-control-app.cloudfunctions.net/validatePurchase', {}, {}).then((res) => {
      //   if (res.status == 200) {
      //     resolve('complete')
      //   }
      //   else {
      //     reject(res.error);
      //   }
      // }).catch((error) => {
      //   reject(error);
      // })
    })
  }

  async alertMsg(item) {
    const alert = await this.alertCtrl.create({
      header: `${item}`,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
          }
        }
      ],
    })
    return alert.present();
  }

  async buy(prod) {
    let product = this.store.get(prod.id);
    let order = await this.store.order(prod.id);
  }
}

// var newObj: any = {};
      // console.log('Trans: ', p)
      // newObj = p;
      // newObj.deferred = 'undefined';
      // newObj.transaction.developerPayload = 'undefined'
      // var trans = {
      //   acknowledged: true,
      //   additionalData: { applicationUsername: '' },
      //   alias: "standard_membership",
      //   billingPeriod: 1,
      //   billingPeriodUnit: "Month",
      //   canPurchase: false,
      //   countryCode: null,
      //   currency: "ZAR",
      //   deferred: false,
      //   description: "Get the standard access to Security Control",
      //   discounts: [],
      //   downloaded: false,
      //   downloading: false,
      //   group: "default",
      //   id: "standard_membership",
      //   ineligibleForIntroPrice: null,
      //   introPrice: "",
      //   introPriceMicros: "",
      //   introPriceNumberOfPeriods: 2,
      //   introPricePaymentMode: "FreeTrial",
      //   introPricePeriod: 2,
      //   introPricePeriodUnit: "Week",
      //   introPriceSubscriptionPeriod: "Week",
      //   loaded: true,
      //   owned: true,
      //   price: "R 4,59",
      //   priceMicros: 4590000,
      //   renewalIntent: "Renew",
      //   state: "owned",
      //   title: "Standard Membership",
      //   transaction: {
      //     developerPayload: "undefined",
      //     id: "GPA.3357-8223-4720-16451",
      //     purchaseState: 0,
      //     purchaseToken: "knojhcmadgabnnlelogflcdn.AO-J1OxryMesUpK3jpdhRhCqtsgcR3pAa2KZsxYtSh-cdhvZvFH27iV4FfBrsf2H0rO3CRmZxQq9dHqBV5vq7WidAZW4l5ZeHxQw8z_yMgareh5uqJNKOaQ",
      //     receipt: "{\"orderId\":\"GPA.3357-8223-4720-16451\",\"packageName\":\"com.innovativethinking.adminforms\",\"productId\":\"standard_membership\",\"purchaseTime\":1632923404016,\"purchaseState\":0,\"purchaseToken\":\"knojhcmadgabnnlelogflcdn.AO-J1OxryMesUpK3jpdhRhCqtsgcR3pAa2KZsxYtSh-cdhvZvFH27iV4FfBrsf2H0rO3CRmZxQq9dHqBV5vq7WidAZW4l5ZeHxQw8z_yMgareh5uqJNKOaQ\",\"autoRenewing\":true,\"acknowledged\":false}",
      //     signature: "W6BQXGTusj/pW/+Mkc2Jl9hwu6BtNTOhM4io2V3UgDoXQax+5n56h+0sy9yDvi9iRn7M4SXkzBorhIUi25X4JZP7wQN3EOOeCAOVA1Zp0dX4yXbVx3p1Mdy6BOJnlpBoyNVBZREL3VmmuXQlxjf3ejrqgj1MT8EBrLICsMD46E0A28lGTPYtkumOugK1NGKgiq0vmuI8lBh7EtAb1tFicl444CUamcCQjMTTPDyXMv51guDG+A21RHPlzSZqZAmFkpfsmsBLZJc9dpeZos/nPuhuT0LCBm33G0jgSRbAtb95mH1x6Zo+d8FIftG+h1mrXHpk5dVkiSYHlxyUk0GWTw==",
      //     type: "android-playstore"
      //   },
      //   trialPeriod: null,
      //   trialPeriodUnit: null,
      //   type: "paid subscription",
      //   valid: true
      // };

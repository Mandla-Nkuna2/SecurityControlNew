import { Injectable, EventEmitter } from '@angular/core';
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
import { AlertController } from '@ionic/angular';
import { AngularFireFunctions } from '@angular/fire/functions';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  public transaction: EventEmitter<any>;
  trans;

  constructor(private store: InAppPurchase2, private alertCtrl: AlertController,
    private functions: AngularFireFunctions, private loading: LoadingService) {
    this.transaction = new EventEmitter()
  }

  register(productIDs) {
    return new Promise<void>((resolve, reject) => {
      productIDs.forEach(productId => {
        this.store.register({
          id: productId,
          type: this.store.PAID_SUBSCRIPTION,
          alias: productId
        });
      });
      this.store.refresh();
      resolve();
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
      this.loading.present('Validating, Please Wait...').then(() => {
        const callable = this.functions.httpsCallable('validatePurchase');
        const obs = callable(p);
        obs.subscribe(async res => {
          console.log('Resp: ' , res);
          if (res == true) {
            resolve('complete')
          }
          else {
            reject(res);
          }
        });
      })
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

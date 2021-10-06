import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';

const FUNCTIONS_HOST = "https://us-central1-security-control-app.cloudfunctions.net/";

@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private storage: Storage
  ) { }

  startMembership(companyKey, chosenTier, customerCode, planCode, authCode, email) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'startSubscription', {
        companyKey: companyKey,
        tier: chosenTier,
        customerCode: customerCode,
        planCode: planCode,
        authCode: authCode,
        email: email
      }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse)
      }, onError => {
        console.log(onError)
        reject(onError)
      })
    })
  }

  startTrial(companyKey, chosenTier, customerCode, authCard, firstCharge, planCode, tier) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'startTrial', {
        companyKey: companyKey,
        chosenTier: chosenTier,
        customerCode: customerCode,
        firstCharge: firstCharge,
        authCard: authCard,
        planCode: planCode,
        tier: tier
      }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse)
      }, onError => {
        console.log(onError)
        reject(onError)
      })
    })
  }

  saveCardAuth(userKey, cardAuth) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'saveCardAuth', {
        key: userKey,
        auth: cardAuth
      }).pipe(take(1)).subscribe((onSaveResponse) => {
        resolve("DONE")
      }, onError => reject(onError))
    })
  }

  initializePayment(email, amount: number) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'initializePayment', {
        email: email,
        amount: amount,
        currency: "ZAR"
      }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse)
      }, onError => reject(onError))
    })
  }

  getMainCardAuth(userKey) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'getMainCardAuth', { key: userKey }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse)
      }, onError => reject(onError))
    })
  }

  chargeCardAuth(email, amount, authCode) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'chargeAuthorization', {
        email: email,
        amount: amount,
        authCode: authCode
      }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse)
      }, (onError) => reject(onError));
    })
  }

  checkForCardAuth(userKey) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'checkForCardAuth', { key: userKey }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse)
      }, (onError) => reject(onError));
    })
  }

  createCustomer(email, firstName, lastName) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'createCustomer', {
        email,
        firstName,
        lastName
      }).pipe(take(1)).subscribe((onResponse) => {
        resolve(onResponse);
      }, (onError) => reject(onError))
    })
  }
  public getCompany(companyId: string) {
    return new Promise((resolve, reject) => {
      this.afs.collection('companies').doc(companyId).ref.get().then((companyDoc) => {
        resolve(companyDoc.data());
      }).catch((error) => {
        reject(error);
      })
    })
  }
  public getMembershipPackages() {
    return new Promise((resolve, reject) => {
      this.afs.collection('membershipPackages').ref.orderBy('title').get().then((packages) => {
        let allPackages = [];
        packages.docs.forEach((packageDoc) => {
          allPackages.push(packageDoc.data());
        });
        resolve(allPackages);
      }).catch((error) => {
        reject(error);
      })
    })
  }
  public setEnterpriseInquiry(companyId: string, inquiry: any) {
    return new Promise((resolve, reject) => {
      this.afs.collection('enterpriseInquiry').doc(companyId).set(inquiry).then(() => {
        resolve('saved');
      }).catch((error) => {
        reject(error);
      })
    })
  }
  public setSubscriptions(companyId: string, subscription: any) {
    return new Promise((resolve, reject) => {
      this.afs.collection('subscriptions').doc(companyId).ref.set(subscription).then(() => {
        resolve('complete')
      }).catch((error) => {
        reject(error);
      })
    });
  }
  public updateCompany(user: any, updateData: any) {
    return new Promise((resolve, reject) => {
      if (user.openedSubscription === false) {
        console.log('New comp')
        var company = {
          key: user.companyId,
          name: user.company,
          accessType: updateData.accessType,
          access: true,
          email: user.email,
          rep: user.name
        }
        this.afs.collection('companies').doc(company.key).set(company).then(() => {
          this.afs.collection('users').doc(user.key).update({ openedSubscription: true });
          user.openedSubscription = true;
          this.storage.set('user', user);
          resolve('complete')
        }).catch((error) => {
          reject(error);
        })
      } else {
        this.afs.collection('companies').doc(user.companyId).update(updateData).then(() => {
          resolve('complete')
        }).catch((error) => {
          reject(error);
        })
      }
    });
  }
}

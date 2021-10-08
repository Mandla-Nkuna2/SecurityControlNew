import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';

const FUNCTIONS_HOST = "https://us-central1-security-control-app.cloudfunctions.net/";

@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private storage: Storage
  ) { }

  startMembership(companyKey, chosenTier, customerCode, planCode, authCode, email, price) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'startSubscription', {
        companyKey: companyKey,
        tier: chosenTier,
        customerCode: customerCode,
        planCode: planCode,
        authCode: authCode,
        email: email,
        firstChargeAmount: price*100
      }).pipe(take(1)).subscribe((onResponse:any) => {
        resolve(onResponse)
      }, onError => {
        console.log(onError)
        reject(onError)
      })
    })
  }

  startTrial(companyKey, customerCode, authCode, firstCharge, planCode, tier) {
    return new Promise((resolve, reject) => {
      console.log(`${companyKey} ${customerCode} ${authCode} ${firstCharge} ${planCode} ${tier} `)
      this.http.post(FUNCTIONS_HOST + 'startTrial', {
        companyKey: companyKey,
        customerCode: customerCode,
        firstCharge: firstCharge,
        authCode: authCode,
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

  getMembershipDetails(companyKey){
    return new Promise((resolve, reject) => {
      this.firestore.collection('memberships').doc(companyKey).ref.get().then((onFulfilled)=>{
        if(onFulfilled.exists){
          resolve(onFulfilled.data())
        }else{
          resolve(null)
        }
      }).catch(onError=>reject(onError))
    })
  }

  subToPaymentEvent(reference){
    return new Promise((resolve, reject) => {
      let match = null;
      let timeout = setTimeout(() => {
        if (!match) {
          sub.unsubscribe();
          resolve(null)
          clearTimeout(timeout);
        }
      }, 60000)
      let sub = this.firestore.collection('paymentEvents').valueChanges().subscribe((onResponse) => {
        onResponse.forEach((doc: any) => {
          if (reference == doc.data.reference && doc.event == "charge.success") {
            match = doc;
          }
        })
        if (match) {
          clearTimeout(timeout);
          sub.unsubscribe();
          resolve(match)
        }
      }, (onError) => {
        console.log(onError)
        reject(onError)
      })
    })
  }

  saveCardAuth(userKey, cardAuth) {
    return new Promise((resolve, reject) => {
      this.http.post<any>(FUNCTIONS_HOST + 'saveCardAuth', {
        key: userKey,
        auth: cardAuth
      }).pipe(take(1)).subscribe((onSaveResponse) => {
        console.log("SAVED")
        console.log(onSaveResponse)
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
      this.firestore.collection('companies').doc(companyId).ref.get().then((companyDoc) => {
        resolve(companyDoc.data());
      }).catch((error) => {
        reject(error);
      })
    })
  }
  public getMembershipPackages() {
    return new Promise((resolve, reject) => {
      this.firestore.collection('membershipPackages').ref.orderBy('title').get().then((packages) => {
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
      this.firestore.collection('enterpriseInquiry').doc(companyId).set(inquiry).then(() => {
        resolve('saved');
      }).catch((error) => {
        reject(error);
      })
    })
  }
  public setSubscriptions(companyId: string, subscription: any) {
    return new Promise((resolve, reject) => {
      this.firestore.collection('subscriptions').doc(companyId).ref.set(subscription).then(() => {
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
        this.firestore.collection('companies').doc(company.key).set(company).then(() => {
          this.firestore.collection('default-forms').ref.get().then(forms => {
            forms.forEach((form: any) => {
              var key = '-' + (form.data().name.toLowerCase()).replaceAll(' ', '-');
              this.firestore.collection(`companies/${company.key}/forms`).doc(key).set(form.data());
            })
            this.firestore.collection('users').doc(user.key).update({ openedSubscription: true });
            user.openedSubscription = true;
            this.storage.set('user', user);
            resolve('complete')
          })
        }).catch((error) => {
          reject(error);
        })
      } else {
        this.firestore.collection('companies').doc(user.companyId).update(updateData).then(() => {
          resolve('complete')
        }).catch((error) => {
          reject(error);
        })
      }
    });
  }
  cancelSubscription(subCode, emailToken) {
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST+'cancelSubscription', {
        code: subCode, 
        emailToken: emailToken
      }).pipe(take(1)).subscribe((response)=>{
          resolve(response);
      }, (onError)=>reject(onError))
    })
  }
}

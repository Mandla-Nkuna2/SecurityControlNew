import { MembershipService } from './membership.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormServiceService } from './form-service.service';

@Injectable()
export class AuthenticationService {

  authState = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private storage: Storage,
    private platform: Platform,
    public toastController: ToastController,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private membershipService: MembershipService,
    private formService: FormServiceService
  ) {
    this.platform.ready().then(() => {
      this.ifLoggedIn();
    });
  }

  ifLoggedIn() {

    this.storage.get('user').then((user) => {
      if (user) {
        this.authState.next(true);
      }
    })
  }

  isAuthenticated() {
    return this.authState.value;
  }

  reset(email) {

    return new Promise<any>((resolve, reject) => {
      this.afAuth.sendPasswordResetEmail(email).then(() => {
        resolve(true)
      }),
        err => reject(err)
    })
  }

  updateCompany(company) {
    return new Promise<any>((resolve, reject) => {
      this.afs.collection('companys').doc(company.key).update(company).then(() => {
        this.authState.next(true);
        this.router.navigate(['menu']).then(() => {
          resolve(true)
        })
      })
    })
  }

  register(user) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
        .then(
          res =>
            this.afAuth.authState.pipe(take(1)).subscribe(auth => {
              if (auth && auth.uid) {
                this.membershipService.createCustomer(user.email, user.name, user.companyName).then((onResponse: any)=>{
                  const newUser = {
                    key: auth.uid,
                    name: user.name,
                    email: user.email,
                    companyId: user.companyId,
                    company: user.companyName,
                    type: 'Account Admin',
                    permission: 'Admin',
                    process: 'New',
                    site: '',
                    siteId: '',
                    contact: 0,
                    password: user.password,
                    customerCode: onResponse.data.customer_code,
                    openedSubscription: false
                  }
                  this.afs.collection('users').doc(auth.uid).set(newUser).then(() => {
                    this.storage.set('user', newUser).then(() => {
                      this.authState.next(true);
                      this.router.navigate(['menu'])
                      resolve(res)
                    })
                  })
                }).catch((onError)=>reject(onError))
              }
            }),
          err => reject(err))
    })
  }

  login(email, password) {
    return new Promise<any>((resolve, reject) => {

      this.afAuth.signInWithEmailAndPassword(email, password)
        .then(
          res =>
            this.afAuth.authState.pipe(take(1)).subscribe(auth => {
              if (auth && auth.uid) {

                this.afs.firestore.collection('users').doc(auth.uid).get().then((doc) => {
                  this.formService.retrieveForms(doc.data().companyId).then(() => {
                    this.storage.set('user', doc.data()).then(() => {
                      this.authState.next(true);
                      if (doc.data().type === 'Technician') {
                        this.router.navigate(['work-orders']);
                      } else {
                        this.router.navigate(['menu']);
                      }
                      resolve(res)
                    });
                  })
                });
              }
            }),
          err => reject(err))
    })
  }

  logout() {
    return new Promise((resolve, reject) => {
      if (this.afAuth.currentUser) {
        this.storage.clear().then(() => {
          this.router.navigate(['login']).then(() => {
            this.afAuth.signOut().then(() => {
              this.authState.next(false);
              resolve(true);
            }).catch((error) => {
              reject(error);
            })
          })
        })
      }
    })
  }

  checkCompanyAccess(user) {
    return this.afs.collection('companies').doc(user.companyId).ref.get().then(comp => {
      var company: any = comp.data();
      if (company) {
        console.log(company.key)
        this.storage.set('access', company.access);
        this.storage.set('accessType', company.accessType);
        return company.access
      }
    })
  }

}

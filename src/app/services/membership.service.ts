import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const FUNCTIONS_HOST = "https://us-central1-security-control-app.cloudfunctions.net/"; 

@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  constructor(
    private http: HttpClient
  ) { }

  startMembership(companyKey, chosenTier, customerCode, planCode, authCode, email){
    return new Promise((resolve, reject)=>{
      this.http.post(FUNCTIONS_HOST + 'startSubscription', { 
        companyKey: companyKey, 
        tier: chosenTier,
        customerCode: customerCode,
        planCode: planCode,
        authCode: authCode,
        email: email
      }).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse)
      }, onError=>{
        console.log(onError)
        reject(onError)
      })
    })
  }

  startTrial(companyKey, chosenTier, customerCode, authCard ,firstCharge, planCode, tier){
    return new Promise((resolve, reject)=>{
      this.http.post(FUNCTIONS_HOST + 'startTrial', { 
        companyKey: companyKey, 
        chosenTier: chosenTier,
        customerCode: customerCode,
        firstCharge: firstCharge,
        authCard: authCard,
        planCode: planCode,
        tier: tier
      }).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse)
      }, onError=>{
        console.log(onError)
        reject(onError)
      })
    })
  }

  saveCardAuth(userKey, cardAuth){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST+ 'saveCardAuth', {
        key: userKey,
        auth: cardAuth
      }).pipe(take(1)).subscribe((onSaveResponse)=>{
        resolve("DONE")
      }, onError=>reject(onError))
    })
  }

  initializePayment(email, amount: number){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST+'initializePayment', {
        email: email,
        amount: amount,
        currency: "ZAR"
      }).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse)
      }, onError=>reject(onError))
    })
  }

  getMainCardAuth(userKey){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'getMainCardAuth', {key : userKey}).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse)
      }, onError=>reject(onError))
    })
  }

  chargeCardAuth(email, amount, authCode){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'chargeAuthorization', {
        email: email,
        amount: amount,
        authCode: authCode
      }).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse)
      }, (onError)=>reject(onError));
    })
  }

  checkForCardAuth(userKey){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'checkForCardAuth', {key: userKey}).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse)
      }, (onError)=>reject(onError));
    })
  }

  createCustomer(email, firstName, lastName){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST+ 'createCustomer', {
        email,
        firstName,
        lastName
      }).pipe(take(1)).subscribe((onResponse)=>{
        resolve(onResponse);
      }, (onError)=>reject(onError))  
    })
  }
}
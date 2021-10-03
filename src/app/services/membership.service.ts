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

  startMembership(companyKey, chosenTier){
    return new Promise((resolve, reject)=>{
      this.http.post(FUNCTIONS_HOST + 'startSubscription', { companyKey: companyKey, chosenTier: chosenTier}).subscribe((onResponse)=>{
        resolve("DONE")
      }, onError=>{
        console.log(onError)
        reject(onError)
      })
    })
  }

  startTrial(companyKey, chosenTier){
    return new Promise((resolve, reject)=>{
      this.http.post(FUNCTIONS_HOST + 'startTrial', { companyKey: companyKey, chosenTier: chosenTier}).subscribe((onResponse)=>{
        resolve("DONE")
      }, onError=>{
        console.log(onError)
        reject(onError)
      })
    })
  }

  addCardAuth(){

  }

  getMainCardAuth(userKey){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'getMainCardAuth', {key : userKey}).pipe(take(1)).subscribe((onResponse)=>{
        console.log(onResponse)
        resolve('')
      })
    })
  }

  chargeCardAuth(){

  }

  checkForCardAuth(userKey){
    return new Promise((resolve, reject) => {
      this.http.post(FUNCTIONS_HOST + 'checkForCardAuth', {key: userKey}).pipe(take(1)).subscribe((onResponse)=>{
        console.log(onResponse);
        resolve('')
      })
    })
  }
}

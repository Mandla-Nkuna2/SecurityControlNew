import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  constructor(private firebaseX: FirebaseX, private afs: AngularFirestore, private platform: Platform) { }

  getToken(user) {
    if (this.platform.is('cordova')) {
      // if (this.platform.is("ios")) {
      //   this.firebaseX.grantPermission().then(() => {
      //     this.firebaseX.getToken().then((token) => {
      //       this.afs.collection("users").doc(user.key).update({
      //         token: token,
      //         platform: 'iOS'
      //       });
      //     })
      //   })
      // } else {
      //   var permissionGranted = this.firebaseX.grantPermission();
      //   this.firebaseX.grantPermission();
      //   if (permissionGranted) {
      //     console.log("Permission granted");
      //     this.firebaseX.getToken().then((token) => {
      //       this.afs.collection("users").doc(user.key).update({
      //         token: token,
      //         platform: 'Android'
      //       });
      //     }).then(() => {
      //     }).catch((err) => {
      //       console.error(err);
      //     });
      //   } else {
      //     console.warn("Permission denied");
      //   }
      // }
    } else {
      console.log('In browser')
    }
  }
}

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {

  constructor(private afs: AngularFirestore, private storage: Storage) { }

  getUser() {
    return new Promise<any>((resolve, reject) => {
      this.storage.get('user').then(user => {
        resolve(user)
      })
    })
  }

  public getSupportChat(user) {
    return new Observable((s) => {
      this.afs.collection(`chats/${user.key}/messages`).valueChanges().subscribe((messages) => {
        let allMessages: any = [];
        messages.forEach((message) => {
          allMessages.push(message);
        });
        s.next(allMessages);
      })
    })
  }

  public getSalesChat(user) {
    return new Observable((s) => {
      this.afs.collection(`chats/${user.key}/sales-messages`).valueChanges().subscribe((messages) => {
        let allMessages: any = [];
        messages.forEach((message) => {
          allMessages.push(message);
        });
        s.next(allMessages);
      })
    })
  }

  sendSalesChat(user, msg, attachment) {
    return new Promise<void>((resolve, reject) => {
      let currentTime = moment().format('YYYY-MM-DD HH:mm:ss').toString();
      currentTime = currentTime.replace(' ', '@');
      currentTime = currentTime.replace(':', '$');
      var newMsg = {
        key: currentTime,
        userId: user.key,
        user: user.name,
        companyId: user.companyId,
        date: moment(new Date()).format('YYYY/MM/DD'),
        time: moment(new Date()).format('HH:mm'),
        timeStamp: moment(new Date()).format('YYYY/MM/DD HH:mm'),
        message: msg,
        attachment: attachment,
        read: false
      }
      this.afs.collection(`chats/${user.key}/sales-messages`).doc(newMsg.key).set(newMsg);
      resolve();
    })
  }
}

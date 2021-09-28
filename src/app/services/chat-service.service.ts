import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
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
      var newUser = {
        key: user.key,
        name: user.name
      }
      this.afs.collection(`chats`).doc(user.key).set(newUser, { merge: true });
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
        read: false,
        fromUser: true
      }
      this.afs.collection(`chats/${user.key}/sales-messages`).doc(newMsg.key).set(newMsg);
      resolve();
    })
  }

  getSalesCount(user) {
    return new Observable((s) => {
      this.afs.collection(`chats/${user.key}/sales-messages`).valueChanges().subscribe((messages) => {
        let count = 0;
        messages.forEach((message: any) => {
          if (message.fromUser === false && message.read === false) {
            count = count + 1;
          }
        });
        s.next(count);
        })
    })
  }
  
  sendSupportChat(user, msg, attachment) {
    return new Promise<void>((resolve, reject) => {
      var newUser = {
        key: user.key,
        name: user.name
      }
      this.afs.collection(`chats`).doc(user.key).set(newUser, { merge: true });
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
        read: false,
        fromUser: true
      }
      this.afs.collection(`chats/${user.key}/messages`).doc(newMsg.key).set(newMsg);
      resolve();
    })
  }

  public readSalesChats(userId) {
    this.afs.collection(`chats/${userId}/sales-messages`).ref.where('fromUser', '==', false).where('read', '==', false).get().then(msgs => {
      msgs.forEach((msg: any) => {
        this.afs.collection(`chats/${userId}/sales-messages`).doc(msg.data().key).update({
          read: true
        })
      })
    })
  }

  getSupportCount(user) {
    return new Observable((s) => {
      this.afs.collection(`chats/${user.key}/messages`).valueChanges().subscribe((messages) => {
        let count = 0;
        messages.forEach((message: any) => {
          if (message.fromUser === false && message.read === false) {
            count = count + 1;
          }
        });
        s.next(count);
      })
    })
  }
  
  public readSupportChats(userId) {
    this.afs.collection(`chats/${userId}/messages`).ref.where('fromUser', '==', false).where('read', '==', false).get().then(msgs => {
      msgs.forEach((msg: any) => {
        this.afs.collection(`chats/${userId}/messages`).doc(msg.data().key).update({
          read: true
        })
      })
    })
  }
}

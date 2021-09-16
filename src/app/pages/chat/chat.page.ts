import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { NavController, IonContent, ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {


  chatsCollection: AngularFirestoreCollection<any>;
  chats: Observable<any[]>;

  chat = { key: '', userId: '', user: '', companyId: '', createdAt: 0, message: '', photo: '', attachment: '', status: 'unread' };
  currentUser = '';
  now;

  user = { photo: '' };
  app = true;

  fileName = '';

  online = false;
  statusType;
  msg;
  class;

  @ViewChild(IonContent) content: IonContent;

  constructor(public alertCtrl: AlertController, private camera: Camera, public actionCtrl: ActionSheetController,
    public modalController: ModalController, private afs: AngularFirestore, private storage: Storage, public navCtrl: NavController) { }

  ngOnInit() {
    this.now = new Date().getTime();
    this.storage.get('user').then(user => {
      this.afs.collection('chats').doc(user.key).set({ new: false, userId: user.key });
      this.afs.collection(`chats/${user.key}/messages`).ref.get().then(messages => {
        messages.forEach((message: any) => {
          if (message.data().status === 'unread' && message.data().support === true) {
            this.afs.collection(`chats/${user.key}/messages`).doc(message.data().key).update({ status: 'read' });
          }
        });
      });
      this.user.photo = user.photo;
      this.chat.userId = user.key;
      this.chat.user = user.name;
      this.currentUser = user.name;
      this.chat.companyId = user.companyId;
      this.chatsCollection = this.afs.collection(`chats/${this.chat.userId}/messages`, ref => ref.orderBy('createdAt'));
      this.chats = this.chatsCollection.valueChanges();
      this.chats.subscribe(snapshot => {
        if (snapshot.length > 0) {
          setTimeout(() => {
            this.content.scrollToBottom();
          }, 1000);
        }
      });
    });
    this.afs.collection('status').doc('online-status').ref.get().then((status: any) => {
      if (status.data().online === true) {
        this.online = true;
      } else {
        this.online = false;
      }
    });
    if (window.innerWidth >= 769) {
      this.app = false;
    } else {
      this.app = true;
    }
  }

  status() {
    if (this.online) {
      this.statusType = 'Online';
      this.class = 'great';
      this.msg = 'Our Support Team are online. Send us a message...';
      return this.statusAlert(this.statusType, this.msg);
    } else {
      this.statusType = 'Offline';
      this.class = 'alert';
      this.msg = 'Our Support Team are currently offline. Send us a message and one of our support team will respond to you shortly.';
      return this.statusAlert(this.statusType, this.msg);
    }
  }

  async statusAlert(status, msg) {
    const prompt = await this.alertCtrl.create({
      header: `${status} Status`,
      message: msg,
      cssClass: this.class,
      buttons: [
        {
          text: 'OKAY',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

  close() {
    this.modalController.dismiss();
  }

  fileChangeEvent(event: any): void {
    const files = event.target.files;
    const file = files[0];
    this.fileName = file.name;

    if (files && file) {
      const reader = new FileReader();

      reader.onload = this._handleReaderLoaded.bind(this);

      reader.readAsBinaryString(file);
    }
  }

  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.chat.attachment = 'data:image/png;base64,' + btoa(binaryString);
  }

  remove() {
    this.chat.attachment = '';
  }

  async attach() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Photo Type',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera',
          handler: () => {
            this.captureImage(false);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'images',
          handler: () => {
            this.captureImage(true);
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  async captureImage(useAlbum: boolean) {
    const options: CameraOptions = {
      quality: 90,
      targetWidth: 300,
      targetHeight: 300,
      allowEdit: false,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      mediaType: this.camera.MediaType.PICTURE,
      ...useAlbum ? { sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM } : {}
    };
    return await this.camera.getPicture(options).then((imageData => {
      this.chat.attachment = 'data:image/jpeg;base64,' + imageData;
    })).catch((err => {
      alert('Error: ' + err);
    }));
  }

  sendMessage() {
    this.chat.key = UUID.UUID();
    this.chat.createdAt = new Date().getTime();
    this.afs.collection(`chats/${this.chat.userId}/messages`).doc(this.chat.key).set(this.chat).then(() => {
      this.chat.message = '';
      this.chat.attachment = '';
      this.content.scrollToBottom();
    });
  }

}


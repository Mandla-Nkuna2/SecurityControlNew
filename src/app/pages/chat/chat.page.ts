import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ActionSheetController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import moment from 'moment';
import { ChatServiceService } from 'src/app/services/chat-service.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  user;
  chats = [];
  app = false;
  firstMsg = {
    message: 'Hello! Welcome to Security Control! What can we help you with?',
  };
  newMsg = '';
  attachment = '';
  messagesSub: Subscription;
  fileName = '';
  today = moment(new Date()).format('YYYY/MM/DD');

  @ViewChild(IonContent, { static: false }) ionContent: IonContent;

  constructor(private chatService: ChatServiceService, private platform: Platform, private camera: Camera, private actionCtrl: ActionSheetController, private toast: ToastService) { }

  ngOnInit() {
    if (this.platform.is('mobile')) {
      this.app = true;
    } else {
      this.app = false;
    }
    this.chats = [];
    this.chatService.getUser().then(user => {
      this.user = user;
      this.getChatSub(user);
    })
  }

  getChatSub(user) {
    this.messagesSub = this.chatService.getSupportChat(this.user).subscribe((res: any[]) => {
      if (res.length > 0) {
        let newMessages = res.filter(x => this.chats.filter(s => s.key == x.key).length == 0);
        this.chats.push(...newMessages);
        this.chatService.readSupportChats(user.key);
        let oldMessages = res.filter(x => this.chats.filter(s => s.key == x.key).length !== 0);
        for (let i = 0; i < oldMessages.length; i++) {
          var foundIndex = this.chats.findIndex(x => x.key == oldMessages[i].key);
          this.chats[foundIndex] = oldMessages[i];
        }
      }
    })
  }

  ionViewDidEnter() {
    this.scrollPage();
  }

  scrollPage() {
    setTimeout(() => {
      this.ionContent.scrollToBottom(300);
    }, 500);
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
    this.attachment = 'data:image/png;base64,' + btoa(binaryString);
  }

  remove() {
    this.attachment = '';
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
      this.attachment = 'data:image/jpeg;base64,' + imageData;
    })).catch((err => {
      alert('Error: ' + err);
    }));
  }

  sendMsg() {
    if (this.newMsg !== '') {
      this.chatService.sendSupportChat(this.user, this.newMsg, this.attachment).then(() => {
        this.ionContent.scrollToBottom(300);
        this.newMsg = '';
        this.attachment = '';
        this.toast.show('Message Send');
      })
    }
  }

  viewAttachment(attachment) {

  }

  ionViewWillLeave() {
    this.messagesSub.unsubscribe();
  }

}


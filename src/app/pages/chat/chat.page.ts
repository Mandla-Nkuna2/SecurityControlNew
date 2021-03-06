import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ActionSheetController, Platform, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import moment from 'moment';
import { ChatServiceService } from 'src/app/services/chat-service.service';
import { ToastService } from 'src/app/services/toast.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

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

  access = false;
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;

  constructor(private analyticsService: AnalyticsService, private chatService: ChatServiceService, private platform: Platform, private camera: Camera, private actionCtrl: ActionSheetController, private toast: ToastService, private storage: Storage, private alertCtrl: AlertController, private router: Router) { }

  ngOnInit() {
    if (window.innerWidth > 1024) {
      this.app = false;
    } else {
      this.app = true;
    }
    this.storage.get('accessType').then(accessType => {
      if (accessType !== 'Basic' && accessType !== undefined && accessType !== null) {
        this.access = true;
        this.chats = [];
        this.chatService.getUser().then(user => {
          this.user = user;
          this.getChatSub(user);
        })
      } else {
        this.access = false;
      }
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
    if (this.access) {
      if (this.newMsg !== '') {
        this.chatService.sendSupportChat(this.user, this.newMsg, this.attachment).then(() => {
          this.ionContent.scrollToBottom(300);
          this.newMsg = '';
          this.attachment = '';
          this.toast.show('Message Send');
        })
      }
    } else {
      this.noAccessAlert();
    }
  }

  async noAccessAlert() {
    var alert = await this.alertCtrl.create({
      header: 'Invalid Request',
      message: 'You do not have access to this functionality. Please upgrade if you wish to access it. Or you can contact our sales team',
      buttons: [
        {
          text: 'CANCEL',
          handler: () => {
          }
        },
        {
          text: 'Talk To Sales',
          handler: () => {
            this.router.navigate(['chat-sales'])
          }
        },
      ]
    })
    return alert.present()
  }

  viewAttachment(attachment) {

  }

  ionViewWillLeave() {
    this.messagesSub.unsubscribe();
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Support Chat',
        screen_class: 'SupportChatPage'
      });
    })
  }

}


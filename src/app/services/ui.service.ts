import { PaymentComponent } from './../components/payment/payment.component';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { ToastController, ActionSheetController, Platform, PopoverController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SigniturePadComponent } from '../components/signiture-popover/signiture-popover.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  popover;
  modal;
  constructor(
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private camera: Camera,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private modalController: ModalController
  ) { }
  loader: any;

  async showToaster(msg, clr, duration?, position?) {
    const toast = await this.toastController.create({
      message: msg,
      duration: duration ? duration : 2000,
      color: clr,
      position: position ? position : 'bottom'
    });
    await toast.present();
  }

  modalDismissal(): Promise<any>{
    return this.modal.onDidDismiss();
  }

  async openPaymentModal(user){
     this.modal = await this.modalController.create({
      component: PaymentComponent,
      componentProps: {
        user: user
      }
    });
    return await this.modal.present();
  }

  dismissModal(options?){
    this.modalController.dismiss(options?options:null);
  }

  async openActionSheet(useAlbum: boolean) {
    return new Promise(async (resolve, reject) => {
      let actionSheet = await this.actionSheetController.create({
        header: 'Option',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Take photo',
            role: 'destructive',
            icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
            handler: () => {
              this.captureImage(useAlbum).then((imageString) => {
                resolve(imageString)
              }).catch(onError => reject(onError)); //false
            }
          },
          {
            text: 'Choose photo from Gallery',
            icon: !this.platform.is('ios') ? 'images-outline' : null,
            handler: () => {
              this.captureImage(useAlbum).then((imageString) => {
                resolve(imageString)
              }).catch(onError => reject(onError)) //true
            }
          },
        ]
      });
      return await actionSheet.present();
    })
  }

  async openConfirmationAlert(msg, confirmBtnText?, cancelBtnText?) {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        message: msg,
        buttons: [
          {
            text: confirmBtnText ? confirmBtnText : 'Confirm',
            handler: () => {
              resolve(true)
            }
          },
          {
            text: cancelBtnText ? cancelBtnText : 'Cancel',
            handler: () => {
              resolve(false)
            }
          }
        ]
      })
      await alert.present();
    })
  }

  async openSignaturePopover(fieldName: string) {
    this.popover = await this.popoverController.create({
      component: SigniturePadComponent,
      componentProps: {
        fieldName: fieldName
      },
      translucent: true,
      backdropDismiss: false
    })
    return await this.popover.present();
  }

  getPopoverDismissal() {
    return new Promise((resolve, reject) => {
      if (!this.popover) {
        reject("Popover undefined")
      }
      this.popover.onDidDismiss().then((items) => {
        resolve(items)
      });
    })
  }

  dismissPopover(items) {
    this.popover.dismiss(items)
  }

  captureImage(useAlbum: boolean) {
    return new Promise((resolve, reject) => {
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
      this.camera.getPicture(options).then((imageData) => {
        resolve('data:image/jpeg;base64,' + imageData);
      }).catch((error) => {
        console.log(error)
        reject(error);
      })
    })
  }

  async showLoading(message: string) {
    this.loader = await this.loadingCtrl.create({
      message: 'Loading...',
      translucent: true
    }).catch(err => console.log(err));

    return await this.loader.present();
  }

  async dismissLoading() {
    if (this.loader) {
      return await this.loader.dismiss();
    }
    else {
      console.log("popup-helper: dismissLoading called with no loader!");
    }
  }
}

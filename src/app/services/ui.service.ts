import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { ToastController, ActionSheetController, Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor(
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private camera: Camera
  ) { }

  async showToaster(msg, clr, duration?, position?){
    const toast = await this.toastController.create({
      message: msg,
      duration: duration ? duration: 2000,
      color: clr,
      position: position ? position:'bottom'
    });
    await toast.present();
  }

  async openActionSheet(useAlbum: boolean){
    return new Promise(async (resolve, reject)=>{
      let actionSheet = await this.actionSheetController.create({
        header: 'Option',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Take photo',
            role: 'destructive',
            icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
            handler: () => {
              this.captureImage(useAlbum).then((imageString)=>{
                resolve(imageString)
              }).catch(onError=>reject(onError)); //false
            }
          },
          {
            text: 'Choose photo from Gallery',
            icon: !this.platform.is('ios') ? 'images-outline' : null,
            handler: () => {
              this.captureImage(useAlbum).then((imageString)=>{
                resolve(imageString)
              }).catch(onError=>reject(onError)) //true
            }
          },
        ]
      });
      return await actionSheet.present();
    })
  }

  captureImage(useAlbum: boolean){
    return new Promise((resolve, reject)=>{
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
      this.camera.getPicture(options).then((imageData)=>{
        resolve('data:image/jpeg;base64,'+imageData);
      }).catch((error)=>{
        console.log(error)
        reject(error);
      })
    })
  }
}

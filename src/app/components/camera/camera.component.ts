import { ActionSheetController, Platform } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {

  @Output() imageString: EventEmitter<string>;
  @ViewChild('picture') picture: ElementRef;
  isApp:boolean;
  

  constructor(
    private camera: Camera,
    private actionSheetController: ActionSheetController,
    private platform: Platform
  ) { 
    this.imageString = new EventEmitter();
  }

  ngOnInit() {
    if (document.URL.indexOf('http://localhost') === 0 || document.URL.indexOf('ionic') === 0 || document.URL.indexOf('https://localhost') === 0) {
      this.isApp = true;
    }
    else {
      this.isApp = false;
    }
  }

  async openImageActionSheet() {
    let actionSheet = await this.actionSheetController.create({
      header: 'Option',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'ios-camera-outline' : null,
          handler: () => {
            this.captureImage(false).then((imageData: string)=>{
              this.imageString.emit(imageData)
            }).catch(onError=>console.log(onError));
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: !this.platform.is('ios') ? 'images-outline' : null,
          handler: () => {
            this.captureImage(true).then((imageData: string)=>{
              this.imageString.emit(imageData)
            }).catch(onError=>console.log(onError));
          }
        },
      ]
    });
    return await actionSheet.present();
  }

  selectImage(event){
    const file = (event.target as HTMLInputElement).files[0];

    const reader = new FileReader();

    reader.onload = () => {
      this.imageString.emit(reader.result.toString());
    }

    reader.readAsDataURL(file);
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

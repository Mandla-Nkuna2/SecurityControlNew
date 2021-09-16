import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(public loadingCtrl: LoadingController) { }

  async present(message: string) {
    const loading = await this.loadingCtrl.create({
      duration: 20000,
      message: message,
      translucent: true
    });
    return await loading.present();
  }

  async dismiss() {
    return await this.loadingCtrl.dismiss()
  }
}


import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  constructor(
    private toastController: ToastController
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
}

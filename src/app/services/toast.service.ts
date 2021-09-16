import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';


@Injectable()
export class ToastService {

    constructor( private toastCtrl: ToastController) {}

    async show(message: string) {
        const toast = await this.toastCtrl.create({
          message: message,
          duration: 2000
        });
        return await toast.present();
      }
}


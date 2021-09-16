import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { AlertController, NavController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.page.html',
  styleUrls: ['./job-card.page.scss'],
})
export class JobCardPage implements OnInit {

  order: any = {};
role;
  data;
  
  

  
 


  constructor(public popoverController:PopoverController,public activatedRoute: ActivatedRoute, private afs: AngularFirestore, private storage: Storage, public alertCtrl: AlertController,
    public navCtrl: NavController, public loading: LoadingService, public toast: ToastService) { }

  ngOnInit() {
    this.order.key = this.activatedRoute.snapshot.paramMap.get('id');
    this.afs.collection('work-orders').doc(this.order.key).ref.get().then(order => {
      this.data = order.data();
      if (this.data) {
        this.order = this.data;
      }
      this.storage.get('user').then(user => {
        this.order.actionDate = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
        this.order.actionTime = moment(new Date().toISOString()).locale('en').format('HH:mm');
        this.order.techSig = '';
        this.order.custSig = '';
      });
    });
  }

  

  
  async openPOP(mm: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        items: mm
      },
      translucent: true,
    });

    await popover.present();
    this.role = await popover.onDidDismiss();

    this.order[`${this.role.data.for}`] = this.role.data.out
  }


  async exit() {
    let prompt = await this.alertCtrl.create({
      header: 'Exit Form',
      message: 'Are you sure you want to Exit?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'EXIT',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    return await prompt.present();
  }

  update() {
    this.afs.collection('work-orders').doc(this.order.key).update({ status: 'In Progress' });
  }

  save() {
    this.loading.present('Saving, Please Wait...').then(() => {
      this.order.status = 'Closed';
      this.afs.collection('work-orders').doc(this.order.key).update(this.order);
      this.navCtrl.pop().then(() => {
        this.loading.dismiss();
        this.toast.show('Saved Successfully');
      });
    });
  }

}

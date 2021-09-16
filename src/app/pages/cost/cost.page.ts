import { Router } from '@angular/router';import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.page.html',
  styleUrls: ['./cost.page.scss'],
})
export class CostPage implements OnInit {

  constructor( private afs:AngularFirestore, private router:Router, private alertCtrl:AlertController) { }
  tier1:any={};
  tier2:any={};
  tier3:any={};
  tier4:any={};

  ngOnInit() {

    this.afs.firestore.collection('charges').get().then((cost:any)=>{
      cost.forEach((charge:any)=>{
        console.log(charge.data())
        
        if(charge.data()['name'] == 'Tier 1'){
          this.tier1 = charge.data()}
         if(charge.data()['name'] == 'Tier 2'){
          this.tier2 = charge.data()
        } if(charge.data()['name'] == 'Tier 3'){
          this.tier3 = charge.data()
        } if(charge.data()['name'] == 'Tier 4'){
          this.tier4 = charge.data()
        }
      })
    })
  }

  
  
  async subscribe() {
    let prompt = await this.alertCtrl.create({
      header: 'Please Select A Payment Method',
      cssClass: 'info',
      inputs: [
        {
          name: 'Google Play',
          type: 'radio',
          label: 'Google Play',
          value: 'Google Play',
        },
        {
          name: 'PayFast',
          type: 'radio',
          label: 'PayFast',
          value: 'PayFast',
        },
        {
          name: 'Other',
          type: 'radio',
          label: 'Other',
          value: 'Other',
        },
      ],
      buttons: [
        {
          text: 'CONFIRM',
          handler: data => {

            if (data == 'PayFast') {
              this.router.navigate(['payfast']);

            }
            else if (data == 'Google Play') {
              //////
            }
            else if (data == 'Other') {
             ///////
            }
          }
        }
      ],
      backdropDismiss: false
    });
    return await prompt.present();
  }


  // async subscribe(option){
  //   const prompt = await this.alertCtrl.create({
  //     header: `Payment for ${option}`,
  //     cssClass: 'alert',
  //     message: "Please choose a payment menthod below:",
  //     buttons: [
  //       {
  //         text: 'Google Play',
  //         handler: data => {
  //         }
  //       },
  //       {
  //         text: 'PayFast',
  //         handler: data => {
  //         }
  //       },
        
  //     ]
  //   });
  //   await prompt.present();
  // }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';

import moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-extinguisher-checklist',
  templateUrl: './extinguisher-checklist.page.html',
  styleUrls: ['./extinguisher-checklist.page.scss'],
})
export class ExtinguisherChecklistPage implements OnInit {


  
view;
 
  constructor( public popoverController:PopoverController, public pdf:PdfService, public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute) {
      this.id = this.activatedRoute.snapshot.paramMap.get('id'); // offline 1/6

  }
  id;
  
 

  role;
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

    this.appeal[`${this.role.data.for}`] = this.role.data.out
  }


  async before() { 
    const actionSheet = await this.actionCtrl.create({
      header: ``,
      mode: 'ios',
      cssClass: 'actionSheet',
      buttons: [
        {
          text: 'SAVE',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
                  this.save()

          },

        },
        {
          text: 'SAVE & DOWNLOAD',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
            this.pdf.download(this.appeal).then(()=>{
                            this.save()
                          })
          },

        }
      ]
    });
    await actionSheet.present();
  }

   appeal = {
    report: 'extinguisher-checklist',
    supervisorSign:'',
    by:'',
    key: '',
    site:[],
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    area: '',
    compnum:''
  
  }

  compnum = true
  by=true
  supervisorSign=true
  
  ngOnInit() {
  if (this.id === 'new') {
    this.storage.get('user').then((user) => {
      this.appeal.by = this.appeal.user = user.name;
       this.appeal.userKey = user.key;
       this.appeal.userEmail =  user.email;
       this.appeal.company = user.company;
       this.appeal.companyId = user.companyId;
       this.appeal.key = UUID.UUID();
       this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
     });
    } else {
      this.storage.get(this.id).then((visit) => {
        this.appeal = visit;
      });
    }

  }

add(){
    this.appeal.site.push({})
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

async invalidActionSheet() { // offline 6/6
  const actionSheet = await this.actionCtrl.create({
    header: `Incomplete Form: Complete the highlighted in order to save`,
    mode: 'ios',
    cssClass: 'actionSheet',
    buttons: [
      {
        text: 'OK',
        // icon: 'save',
        // cssClass: 'successAction',
        handler: () => {
        },

      },
      {
        text: 'SAVE & EXIT',
        // icon: 'save',
        // cssClass: 'successAction',
        handler: () => {
          this.storage.set(this.appeal.key, this.appeal).then(() => {
            this.navCtrl.pop();
          })
        },

      }
    ]
  });
  await actionSheet.present();
}


  check() {
  
    if (this.appeal.compnum == '') { this.compnum = false } else { this.compnum = true }
    if (this.appeal.supervisorSign == '') { this.supervisorSign = false } else { this.supervisorSign = true }
    if (this.appeal.by == '') { this.by = false } else { this.by = true }
      if (this.compnum == true && this.by == true && this.supervisorSign == true) { this.before() }
    else { this.invalidActionSheet() }
  }
  

  save() {
  

    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////

    this.loading.present('Saving').then(()=>{
      this.afs.collection('extinguisher').doc(this.appeal.key).set(this.appeal).then(()=>{
        this.loading.dismiss()
        this.toast.show('Saved')
        


      this.storage.remove(this.appeal.key).then(() => { 
        this.router.navigate(['forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Saved Successfully!');
          });
        });
      });
    })
      })
    })
  }







}
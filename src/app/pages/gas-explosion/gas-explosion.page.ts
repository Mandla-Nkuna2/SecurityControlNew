import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { map, take } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { PdfService } from 'src/app/services/pdf.service';
import { ToastService } from 'src/app/services/toast.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-gas-explosion',
  templateUrl: './gas-explosion.page.html',
  styleUrls: ['./gas-explosion.page.scss'],
})
export class GasExplosionPage implements OnInit {


role;
  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  


  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;



  

  constructor( public popoverController:PopoverController, public pdf:PdfService, private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
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

  this.appeal[`${this.role.data.for}`] = this.role.data.out
}



  appeal
  = {
    report:'gas-explosion',
    key: '',
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    area: '',
  at: '',
  add:'',
      report2: '',
      by : '',
      from: '',
      cause: '',
      sap: '',
      brigade: '',
      tenant: '',
    shutdown: '',
    instituted: '',
    other: '',
    compile: '',
    supsign : '',
    supervisorSign:'',
    saptime:'', 
    brigadetime:'',
    tenanttime:'',
    areatime:'',
    shutdowntime:'',
    institutedtime:'',
    othertime:'',

      
  
  }
  area = true
  tenant= true
  shutdown= true
  instituted= true
  other= true
  compile= true
  supsign = true
  report2= true
  at= true
  by = true
  from= true
  cause= true
  sap= true
  brigade= true
  add=true
  

  
  ngOnInit() {
   

    if (this.id === 'new') {
      

    this.storage.get('user').then((user) => {
      this.appeal.user = user.name;
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


  check() {
    if (this.appeal.add== '') { this.add= false } else { this.add= true }
    if (this.appeal.tenant== '') { this.tenant= false } else { this.tenant= true ; this.appeal.tenanttime = moment(this.appeal.tenanttime).format('HH:mm')}
    if (this.appeal.area == '') { this.area = false } else { this.area = true ; this.appeal.areatime = moment(this.appeal.areatime).format('HH:mm')}
    if (this.appeal.shutdown== '') { this.shutdown= false } else { this.shutdown= true ; this.appeal.shutdowntime = moment(this.appeal.shutdowntime).format('HH:mm')}
    if (this.appeal.instituted== '') { this.instituted= false } else { this.instituted= true; this.appeal.institutedtime = moment(this.appeal.institutedtime).format('HH:mm') }
    if (this.appeal.compile== '') { this.compile= false } else { this.compile= true }
    if (this.appeal.supsign == '') { this.supsign = false } else { this.supsign = true }
    if (this.appeal.at== '') { this.at= false } else { this.at= true }
    if (this.appeal.report2== '') { this.report2= false } else { this.report2= true; this.appeal.report2 = moment(this.appeal.report2).format('YYYY/MM/DD') }
    if (this.appeal.by == '') { this.by = false } else { this.by = true }
    if (this.appeal.from== '') { this.from= false } else { this.from= true }
    if (this.appeal.cause== '') { this.cause= false } else { this.cause= true }
    if (this.appeal.sap== '') { this.sap= false } else { this.sap= true ; this.appeal.saptime = moment(this.appeal.saptime).format('HH:mm')}
    if (this.appeal.brigade== '') { this.brigade= false } else { this.brigade= true ; this.appeal.brigadetime = moment(this.appeal.brigadetime).format('HH:mm')}     
     if (this.add==true && this.tenant== true && this.area == true && this.shutdown== true && this.instituted== true && this.other== true && this.compile== true && this.supsign == true && this.at== true && this.report2== true && this.by == true && this.from== true && this.cause== true && this.sap== true && this.brigade== true) { this.before() }
    else { this.invalidActionSheet() }
  }
  

  save() {
  


    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////


    this.appeal.othertime =moment(this.appeal.othertime).format('HH:mm');
    this.appeal.supervisorSign = this.appeal.supsign
    this.loading.present('Saving').then(()=>{
      this.afs.collection('explosion').doc(this.appeal.key).set(this.appeal).then(()=>{
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
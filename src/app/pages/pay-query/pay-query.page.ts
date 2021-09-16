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
  selector: 'app-pay-query',
  templateUrl: './pay-query.page.html',
  styleUrls: ['./pay-query.page.scss'],
})
export class PayQueryPage implements OnInit {

  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  


  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;



  

  constructor(public popoverController:PopoverController,private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController, public pdf:PdfService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
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


  appeal
    = {
      report:'pay-query',
      key: '',
      site: '',
      date: '',
      user: '',
      userKey: '',
      userEmail: '',
      company: '',
      companyId: '',
      supsign: '',
      employeeName: '',
      companyNumber: '',
      reason: '',
      supervisorName: '',
      empSig:''
    }


  employeeName = true
  supsign = true
  companyNumber = true
  site = true
  reason = true
  supervisorName = true

  ngOnInit() {
    
   
     
    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        this.appeal.supervisorName= this.appeal.user = user.name;
        this.appeal.userKey = user.key;
        this.appeal.userEmail = user.email;
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

  // add() {
  //   this.appeal.site.push({ compNumber: '', site: '', temp: '' })
  // }

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

    if (this.appeal.supsign == '') { this.supsign = false } else { this.supsign = true }
    if (this.appeal.employeeName == '') { this.employeeName = false } else { this.employeeName = true }
    if (this.appeal.companyNumber == '') { this.companyNumber = false } else { this.companyNumber = true }
    if (this.appeal.site == '') { this.site = false } else { this.site = true }
    if (this.appeal.reason == '') { this.reason = false } else { this.reason = true }
    if (this.appeal.supervisorName == '') { this.supervisorName = false } else { this.supervisorName = true }
    if (this.appeal.supsign == '') { this.supsign = false } else { this.supsign = true }
    if (this.supsign == true && this.employeeName == true && this.companyNumber == true && this.site == true && this.reason == true && this.supervisorName == true && this.supsign == true) { this.before() }
    else { this.invalidActionSheet() }
  }


  save() {
    this.appeal.empSig = this.appeal.supsign
    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////
 this.loading.present('Saving').then(()=>{
      this.afs.collection('payQuery').doc(this.appeal.key).set(this.appeal).then(()=>{
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
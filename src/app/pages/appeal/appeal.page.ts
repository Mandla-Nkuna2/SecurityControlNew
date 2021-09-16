
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';

import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-appeal',
  templateUrl: './appeal.page.html',
  styleUrls: ['./appeal.page.scss'],
})
export class AppealPage implements OnInit {



  
  isDrawing2 =false;
view;
 


  constructor(public actionCtrl: ActionSheetController,private popoverController:PopoverController,
    public PdfService:PdfService, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id'); 
  }

   appeal = {
    report: 'appeal', // offline 2/6 in prog
    key: '',
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    sigUser: '',
    employeeName: '',
    employeeNumber: '',
    employeePosition: '',
    grounds: '',
    hearingDate: '',
    actionTaken: '',
    reasons: '',
    relieve: '',
    manSig: '',
    witSig:''

  }

  id; 
  witSig=true
  sigUser = true
  employeeName = true
  employeeNumber = true
  employeePosition = true
  grounds = true
  hearingDate = true
  actionTaken = true
  reasons = true
  relieve = true


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


  ngOnInit() {

   

    if (this.id === 'new') { 
      this.appeal.report = 'appeal'
      this.storage.get('user').then((user) => {
        if (user.key) {
          var id = user.key;
        }
        this.appeal.key = UUID.UUID();
        this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY-MM-DD');
        // this.appeal.time = moment(new Date().toISOString()).locale('en').format('HH:mm');

      })
      this.storage.get('user').then((user) => {
        this.appeal.user = user.name;
        this.appeal.userKey = user.key;
        this.appeal.userEmail =   user.email;
        this.appeal.company = user.company;
        this.appeal.companyId = user.companyId;

      });
    } else {
      this.storage.get(this.id).then((visit) => {
        this.appeal = visit;
      });
    }




  }



  async invalidActionSheet() { 
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
            this.PdfService.download(this.appeal).then(()=>{
                            this.save()
                          })
          },

        }
      ]
    });
    await actionSheet.present();
  }



 
  


  check() { 

    if (this.appeal.sigUser == '') { this.sigUser = false } else { this.sigUser = true }
    if (this.appeal.witSig == '') { this.witSig = false } else { this.witSig = true }
    if (this.appeal.employeeName == '') { this.employeeName = false } else { this.employeeName = true }
    if (this.appeal.employeeNumber == '') { this.employeeNumber = false } else { this.employeeNumber = true }
    if (this.appeal.employeePosition == '') { this.employeePosition = false } else { this.employeePosition = true }
    if (this.appeal.grounds == '') { this.grounds = false } else { this.grounds = true }
    if (this.appeal.hearingDate == '') { this.hearingDate = false } else { this.hearingDate = true }
    if (this.appeal.actionTaken == '') { this.actionTaken = false } else { this.actionTaken = true }
    if (this.appeal.reasons == '') { this.reasons = false } else { this.reasons = true }
    if (this.appeal.relieve == '') { this.relieve = false } else { this.relieve = true }
    if (this.sigUser == true && this.employeeName == true && this.employeeNumber == true && this.employeePosition == true && this.grounds == true && this.hearingDate == true && this.actionTaken == true && this.relieve == true && this.reasons == true) { this.before() }
    else { this.invalidActionSheet() }
  }


  save() {

    this.storage.set(this.appeal.key, this.appeal).then(() => { 
      this.appeal.hearingDate = moment(this.appeal.hearingDate).format('YYYY/MM/DD');
      this.appeal.manSig = this.appeal.sigUser
      this.loading.present('Saving').then(() => { 
        this.afs.collection('appealForms').doc(this.appeal.key).set(this.appeal).then(() => {
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

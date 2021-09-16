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
  selector: 'app-resignation',
  templateUrl: './resignation.page.html',
  styleUrls: ['./resignation.page.scss'],
})
export class ResignationPage implements OnInit {


  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  
  isDrawing2 =false

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;



  

  constructor(private popoverController:PopoverController, public pdf:PdfService, private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
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
  
  

   appeal = {
    report: 'resignation',
    key: '',
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    employeeName: '',
    companyNumber: '',
    position: '',
    notice: '',
    site: '',
    last: '',
    place : '',
    employeeSign: '',
    supervisorSign: '',empSig:''
   
  
  }

  employeeName = true
  position= true
  companyNumber= true
  notice= true
  site= true
  last= true
  place = true
  employeeSign= true
  supervisorSign= true

  dat(){
    this.appeal.last =moment(this.appeal.last).format('YYYY/MM/DD');

  }
  
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
    if (this.appeal.companyNumber== '') { this.companyNumber= false } else { this.companyNumber= true }
    if (this.appeal.position== '') { this.position= false } else { this.position= true }
    if (this.appeal.notice== '') { this.notice= false } else { this.notice= true }
    if (this.appeal.site== '') { this.site= false } else { this.site= true }
    if (this.appeal.last== '') { this.last= false } else { this.last= true }
    if (this.appeal.place == '') { this.place = false } else { this.place = true }
    if (this.appeal.employeeSign== '') { this.employeeSign= false } else { this.employeeSign= true }
    if (this.appeal.supervisorSign== '') { this.supervisorSign= false } else { this.supervisorSign= true }
    if (this.appeal.employeeName == '') { this.employeeName = false } else { this.employeeName = true }
      if (this.employeeName == true && this.companyNumber== true && this.position== true && this.notice== true && this.site== true && this.last== true && this.place == true && this.employeeSign== true && this.supervisorSign== true) { this.before() }
    else { this.invalidActionSheet() }
  }
  

  save() {
   

    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////


    this.appeal.empSig = this.appeal.employeeSign
    this.loading.present('Saving').then(()=>{
      this.afs.collection('resign').doc(this.appeal.key).set(this.appeal).then(()=>{
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
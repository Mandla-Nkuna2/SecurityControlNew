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
  selector: 'app-grievance',
  templateUrl: './grievance.page.html',
  styleUrls: ['./grievance.page.scss'],
})
export class GrievancePage implements OnInit {

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



  

  constructor(public popoverController:PopoverController,public pdf:PdfService, private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
      this.id = this.activatedRoute.snapshot.paramMap.get('id'); // offline 1/6

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



////

empSig=true

  appeal
  = {
    report:'grievance',
    key: '',
    //site:[],
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    employeeName: '',
        employeePosition : '',
        employeeNumber : '',
        managerName : '',
        managerPosition : '',
        site : '',
        grievanceDate : '',
        grievanceNature : '',
settlement: '',
interpreter : '',
rep : '',
supsign : '',
manSig:'',
recieved: '',
designation : '',
empSig:''
  
  }
designation = true
recieved= true
interpreter = true
settlement= true
rep = true
supsign = true
  supervisorSign=true
  employeePosition = true
  employeeName= true
  employeeNumber = true
  managerName = true
  managerPosition = true
  site = true
  grievanceDate = true
  grievanceNature = true
  
  
  ngOnInit() {
      
    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        this.appeal.recieved=  this.appeal.user = user.name;
       this.appeal.userKey = user.key;
       this.appeal.userEmail =  user.email;
       this.appeal.company = user.company;
       this.appeal.companyId = user.companyId;
       this.appeal.key = UUID.UUID();
      this.appeal.grievanceDate= this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
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
    if (this.appeal.empSig== '') { this.empSig= false } else { this.empSig= true }
    if (this.appeal.supsign== '') { this.supsign= false } else { this.supsign= true }

    if (this.appeal.recieved== '') { this.recieved= false } else { this.recieved= true }
    if (this.appeal.designation == '') { this.designation = false } else { this.designation = true }
    if (this.appeal.settlement== '') { this.settlement= false } else { this.settlement= true }
    if (this.appeal.interpreter == '') { this.interpreter = false } else { this.interpreter = true }
    if (this.appeal.rep == '') { this.rep = false } else { this.rep = true }
    if (this.appeal.employeeName== '') { this.employeeName= false } else { this.employeeName= true }
    if (this.appeal.employeePosition == '') { this.employeePosition = false } else { this.employeePosition = true }
    if (this.appeal.employeeNumber == '') { this.employeeNumber = false } else { this.employeeNumber = true }
    if (this.appeal.managerName == '') { this.managerName = false } else { this.managerName = true }
    if (this.appeal.managerPosition == '') { this.managerPosition = false } else { this.managerPosition = true }
    if (this.appeal.site == '') { this.site = false } else { this.site = true }
    // if (this.appeal.grievanceDate == '') { this.grievanceDate = false } else { this.grievanceDate = true }
    if (this.appeal.grievanceNature == '') { this.grievanceNature = false } else { this.grievanceNature = true }
    if (this.recieved== true && this.designation == true && this.settlement== true && this.interpreter == true && this.rep == true && this.employeeName== true && this.employeePosition == true && this.employeeNumber == true && this.managerName == true && this.managerPosition == true && this.site == true && this.grievanceDate == true && this.grievanceNature == true) { this.before() }
    else { this.invalidActionSheet() 
    
     }
  }
  

  save() {

       this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////

    this.appeal.manSig = this.appeal.supsign
    this.loading.present('Saving').then(()=>{
      this.afs.collection('grievance').doc(this.appeal.key).set(this.appeal).then(()=>{
        this.loading.dismiss()
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
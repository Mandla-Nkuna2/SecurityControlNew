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
  selector: 'app-performance-appraisal',
  templateUrl: './performance-appraisal.page.html',
  styleUrls: ['./performance-appraisal.page.scss'],
})

export class PerformanceAppraisalPage implements OnInit {

  

 


  constructor(private popoverController:PopoverController,public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, public PdfService:PdfService, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute) {
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
            this.PdfService.download(this.appeal).then(()=>{
                            this.save()
                          })
          },

        }
      ]
    });
    await actionSheet.present();
  }
view;

  id;
  appeal = {
    report2: '',
    report:'performance-appraisal',
    key: '',
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    sigUser: '',
    employeeName: '',
    employeePosition: '',
    companyNumber: '',
    dateStarted: '',
    site: '',
    appraisalDate: '',
    acmaterial: '',
    acvisitor: '',
    acdeclare: '',
    acpatrol: '',
    acvehicle: '',
    incident: '',
    audit: '',
    conformance: '',
    handover: '',
    patrolling: '',
    participation: '',
    radio: '',
    document: '',
    emergency: '',
    search: '',
    arrest: '',
    conflict: '',
    relate: '',
    chain: '',
    duty: '',
    policy: '',
    initiative: '',
    confidence: '',
    hours: '',
    cooperate: '',
    neatness: '',
    approve: '',
    recommendation: '',
    rosters: '',
    supervisorSign: '',
    other:''
  }

  recommendation = true
  approve = true
  radio = true
  participation = true
  document = true
  emergency = true
  search = true
  arrest = true
  conflict = true
  relate = true
  duty = true
  chain = true
  policy = true
  initiative = true
  confidence = true
  hours = true
  cooperate = true
  neatness = true
  sigUser = true
  employeeName = true
  employeePosition = true
  companyNumber = true
  dateStarted = true
  site = true
  appraisalDate = true
  acmaterial = true
  acvisitor = true
  acdeclare = true
  acvehicle = true
  acpatrol = true
  report2 = true
  incident = true
  audit = true
  conformance = true
  handover = true
  patrolling = true
  rosters = true

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
      this.storage.get('user').then((user) => {
        this.appeal.user = user.name;
        this.appeal.userKey = user.key;
        this.appeal.userEmail = user.email;
        this.appeal.company = user.company;
        this.appeal.companyId = user.companyId;
        this.appeal.key = UUID.UUID();
        this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY-MM-DD');
        // this.appeal.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
      })
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
    if (this.appeal.rosters == '') { this.rosters = false } else { this.rosters = true }
    if (this.appeal.approve == '') { this.approve = false } else { this.approve = true }
    if (this.appeal.recommendation == '') { this.recommendation = false } else { this.recommendation = true }
    if (this.appeal.sigUser == '') { this.sigUser = false } else { this.sigUser = true }
    if (this.appeal.employeeName == '') { this.employeeName = false } else { this.employeeName = true }
    if (this.appeal.employeePosition == '') { this.employeePosition = false } else { this.employeePosition = true }
    if (this.appeal.companyNumber == '') { this.companyNumber = false } else { this.companyNumber = true }
    if (this.appeal.dateStarted == '') { this.dateStarted = false } else { this.dateStarted = true }
    if (this.appeal.site == '') { this.site = false } else { this.site = true }
    if (this.appeal.appraisalDate == '') { this.appraisalDate = false } else { this.appraisalDate = true }
    if (this.appeal.acmaterial == '') { this.acmaterial = false } else { this.acmaterial = true }
    if (this.appeal.acvisitor == '') { this.acvisitor = false } else { this.acvisitor = true }
    if (this.appeal.acdeclare == '') { this.acdeclare = false } else { this.acdeclare = true }
    if (this.appeal.acpatrol == '') { this.acpatrol = false } else { this.acpatrol = true }
    if (this.appeal.acvehicle == '') { this.acvehicle = false } else { this.acvehicle = true }
    if (this.appeal.report2 == '') { this.report2 = false } else { this.report2 = true }
    if (this.appeal.incident == '') { this.incident = false } else { this.incident = true }
    if (this.appeal.audit == '') { this.audit = false } else { this.audit = true }
    if (this.appeal.conformance == '') { this.conformance = false } else { this.conformance = true }
    if (this.appeal.handover == '') { this.handover = false } else { this.handover = true }
    if (this.appeal.patrolling == '') { this.patrolling = false } else { this.patrolling = true }
    if (this.appeal.participation == '') { this.participation = false } else { this.participation = true }
    if (this.appeal.radio == '') { this.radio = false } else { this.radio = true }
    if (this.appeal.document == '') { this.document = false } else { this.document = true }
    if (this.appeal.emergency == '') { this.emergency = false } else { this.emergency = true }
    if (this.appeal.search == '') { this.search = false } else { this.search = true }
    if (this.appeal.arrest == '') { this.arrest = false } else { this.arrest = true }
    if (this.appeal.conflict == '') { this.conflict = false } else { this.conflict = true }
    if (this.appeal.relate == '') { this.relate = false } else { this.relate = true }
    if (this.appeal.chain == '') { this.chain = false } else { this.chain = true }
    if (this.appeal.duty == '') { this.duty = false } else { this.duty = true }
    if (this.appeal.policy == '') { this.policy = false } else { this.policy = true }
    if (this.appeal.initiative == '') { this.initiative = false } else { this.initiative = true }
    if (this.appeal.confidence == '') { this.confidence = false } else { this.confidence = true }
    if (this.appeal.hours == '') { this.hours = false } else { this.hours = true }
    if (this.appeal.cooperate == '') { this.cooperate = false } else { this.cooperate = true }
    if (this.appeal.neatness == '') { this.neatness = false } else { this.neatness = true }


    if (this.rosters == true && this.approve == true && this.recommendation == true && this.chain == true && this.duty == true && this.policy == true && this.initiative == true && this.confidence == true && this.hours == true && this.cooperate == true && this.neatness == true && this.participation == true && this.radio == true && this.document == true && this.emergency == true && this.search == true && this.arrest == true && this.conflict == true && this.relate == true && this.acpatrol == true && this.acvehicle == true && this.report2 == true && this.incident == true && this.audit == true && this.conformance == true && this.handover == true && this.patrolling == true && this.companyNumber == true && this.dateStarted == true && this.site == true && this.appraisalDate == true && this.acmaterial == true && this.acvisitor == true && this.acdeclare == true && this.sigUser == true && this.employeeName == true && this.employeePosition == true) { this.before() }
    else { this.invalidActionSheet() }

  }


  save() {
    this.appeal.appraisalDate = moment(this.appeal.appraisalDate).format('YYYY/MM/DD');
    this.appeal.dateStarted = moment(this.appeal.dateStarted).format('YYYY/MM/DD');
    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////
  this.appeal.supervisorSign = this.appeal.sigUser
    console.log(this.appeal);

    this.loading.present('Saving').then(() => {
      this.afs.collection('performanceAppraisal').doc(this.appeal.key).set(this.appeal).then(() => {
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
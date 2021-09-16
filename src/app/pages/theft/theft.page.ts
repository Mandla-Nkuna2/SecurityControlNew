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
  selector: 'app-theft',
  templateUrl: './theft.page.html',
  styleUrls: ['./theft.page.scss'],
})
export class TheftPage implements OnInit {



  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  
  isDrawing4=false
role;

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;



  

  constructor(public popoverController:PopoverController, public pdf:PdfService, private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
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

  appeal
    = {
      report: 'theft',
      user: '',
      userkey: '',
      email: '',
      company: '',
      companyId: '',
      key: '',
      date: '',
      full: '',
      add: '',
      cell: '',
      ob: '',
      description: '',
      location: '',
      suspect: '',
      arrest: '',
      userKey: '',
      userEmail: '',
      value: '',
      outcome: '',
      cause: '',
      witSig: '',
      sigUser: '',
      empSig: '',
      place: '',
      witnessesName: '',
      sigOfficer:'',
      sapsnom:''

    }

  outcome = true
  value = true
  cause = true
  sigUser = true
  add = true
  full = true
  cell = true
  ob = true
  description = true
  location = true
  suspect = true
  arrest = true


  area = true

  ngOnInit() {

    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        this.appeal.user = user.name;
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


  witSig = true
  empSig = true
  place = true
  witnessesName = true
  check() {
    if (this.appeal.place == '') { this.place = false } else { this.place = true }

    if (this.appeal.value == '') { this.value = false } else { this.value = true }
    if (this.appeal.outcome == '') { this.outcome = false } else { this.outcome = true }
    if (this.appeal.cause == '') { this.cause = false } else { this.cause = true }
    if (this.appeal.sigUser == '') { this.sigUser = false } else { this.sigUser = true }
    if (this.appeal.witSig == '') { this.witSig = false } else { this.witSig = true }
    if (this.appeal.empSig == '') { this.empSig = false } else { this.empSig = true }
    if (this.appeal.full == '') { this.full = false } else { this.full = true }
    if (this.appeal.add == '') { this.add = false } else { this.add = true }
    if (this.appeal.cell == '') { this.cell = false } else { this.cell = true }
    if (this.appeal.ob == '') { this.ob = false } else { this.ob = true }
    if (this.appeal.description == '') { this.description = false } else { this.description = true }
    if (this.appeal.location == '') { this.location = false } else { this.location = true }
    if (this.appeal.suspect == '') { this.suspect = false } else { this.suspect = true }
    if (this.appeal.witnessesName == '') { this.witnessesName = false } else { this.witnessesName = true }
    if (this.appeal.arrest == '') { this.arrest = false } else { this.arrest = true }
    if (this.witnessesName == true && this.place == true && this.witSig == true && this.empSig == true && this.sigUser == true && this.value == true && this.outcome == true && this.cause == true && true && this.full == true && this.add == true && this.cell == true && this.ob == true && this.description == true && this.location == true && this.suspect == true && this.arrest == true) { this.before() }
    else { this.invalidActionSheet() }
  }


  save() {
    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////
      this.loading.present('Saving').then(() => {
        this.afs.collection('theft').doc(this.appeal.key).set(this.appeal).then(() => {
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
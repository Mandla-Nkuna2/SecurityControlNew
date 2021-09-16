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
  selector: 'app-injury',
  templateUrl: './injury.page.html',
  styleUrls: ['./injury.page.scss'],
})
export class InjuryPage implements OnInit {





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
    private actionCtrl: ActionSheetController, public pdf:PdfService ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
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
      key: '',
      site: [],
      date: '',
      user: '',
      userKey: '',
      userEmail: '',
      company: '',
      companyId: '',
      casualties: '',
      casualtiestime: '',
      kin: '',
      kintime: '',
      other: '',
      othertime: '',
      compile: '',
      add: '',
      supsign: '',
      at: '',
      result: '',
      report: 'injury',
      from: '',
      ambulance: '',
      ambulancetime: '',
      tenanttime: '',
      tenant: '',
      est: '',
      esttime: '',
      hospital: '',
      hospitaltime: '',
      supervisorSign: '',
      aid: '',
      aidtime: '',
      report2:''

    }


    
  result = true
  at = true
  report2= true
  from = true
  ambulance = true
  tenant = true
  est = true
  hospital = true
  kin = true
  casualties = true
  other = true
  compile = true
  add = true
  supsign = true
  aid = true



  ngOnInit() {



    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        this.appeal.compile = this.appeal.user = user.name;
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
    console.log(this.appeal);

    if (this.appeal.casualties == '') { this.casualties = false } else { this.casualties = true; this.appeal.casualtiestime = moment(this.appeal.casualtiestime).format('HH:mm'); }
    if (this.appeal.aid == '') { this.aid = false } else { this.aid = true; this.appeal.aidtime = moment(this.appeal.aidtime).format('HH:mm'); }
    if (this.appeal.kin == '') { this.kin = false } else { this.kin = true; this.appeal.kintime = moment(this.appeal.kintime).format('HH:mm'); }
    if (this.appeal.compile == '') { this.compile = false } else { this.compile = true }
    if (this.appeal.add == '') { this.add = false } else { this.add = true }
    if (this.appeal.supsign == '') { this.supsign = false } else { this.supsign = true }
    if (this.appeal.at == '') { this.at = false } else { this.at = true; }
    if (this.appeal.result == '') { this.result = false } else { this.result = true }
    if (this.appeal.report2== '') { this.report2= false } else { this.report2= true; this.appeal.report2= moment(this.appeal.report2).format('YYYY/MM/DD'); }
    if (this.appeal.from == '') { this.from = false } else { this.from = true }
    if (this.appeal.ambulance == '') { this.ambulance = false } else { this.ambulance = true; this.appeal.ambulancetime = moment(this.appeal.ambulancetime).format('HH:mm'); }
    if (this.appeal.tenant == '') { this.tenant = false } else { this.tenant = true; this.appeal.tenanttime = moment(this.appeal.tenanttime).format('HH:mm'); }
    if (this.appeal.est == '') { this.est = false } else { this.est = true; this.appeal.esttime = moment(this.appeal.esttime).format('HH:mm'); }
    if (this.appeal.hospital == '') { this.hospital = false } else { this.hospital = true; this.appeal.hospitaltime = moment(this.appeal.hospitaltime).format('HH:mm'); }
    if (this.casualties == true && this.aid && this.kin == true && this.other == true && this.compile == true && this.add == true && this.supsign == true && this.at == true && this.result == true && this.report2== true && this.from == true && this.ambulance == true && this.tenant == true && this.est == true && this.hospital == true) { this.before() }
    else { this.invalidActionSheet() }
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



  save() {
     //this.PdfService.download(this.appeal)


    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////


      this.appeal.othertime = moment(this.appeal.othertime).format('HH:mm');
      this.appeal.supervisorSign = this.appeal.supsign
      this.loading.present('Saving').then(() => {
        this.afs.collection('injury').doc(this.appeal.key).set(this.appeal).then(() => {
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
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
  selector: 'app-polygraph',
  templateUrl: './polygraph.page.html',
  styleUrls: ['./polygraph.page.scss'],
})
export class PolygraphPage implements OnInit {

  

  appeal = {
    report: 'polygraph',
    key: '',
    date: '',
    employeeName: '',
    polydate: '',
    polytime: '',
    empsign: '',
    place: '',
    supername: '',
    supsign: '',
    witnessname: '',
    witsign: '',
    supervisorSign: '',
    witSig: '',
    empSig: '',
    userEmail: '',
    companyId: '',
    companyEmail: ''

  }

  polydate = true
  employeeName = true
  polytime = true
  empsign = true
  place = true
  supername = true
  supsign = true
  witnessname = true
  witsign = true
  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  
  
  




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


  getSites(id) {
    this.sitesCollection = this.afs.collection(`users/${id}/sites`, ref => ref.orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
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



  getSiteDetails(appeal) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', appeal.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    // this.siteDetails.subscribe(sites => {
    //   sites.forEach(site => {
    //     this.appeal.siteName = site.name;
    //     this.appeal.siteKey = site.key;
    //     if (site.recipient) {
    //       this.appeal.recipient = site.recipient;
    //     }
    //     if (site.email !== undefined) {
    //       this.appeal.clientEmail = site.email;
    //     }
    //   });
    // });
  }


  ngOnInit() {

    if (this.id === 'new') {
      this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.appeal.supername = user.name;
          this.appeal.userEmail =  user.email;
          this.appeal.companyId = user.companyId;
          this.appeal.key = UUID.UUID();
        
        });
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

  getUrlData() {
    return new Promise<any>((resolve, reject) => {
      this.activatedRoute.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.data = this.router.getCurrentNavigation().extras.state.data;
          resolve(this.data);
        }
      });
    });
  }
isDrawinig = true;
  check() {

    if (this.appeal.employeeName == '') { this.employeeName = false } else { this.employeeName = true }
    if (this.appeal.witsign == '') { this.witsign = false } else { this.witsign = true }
    if (this.appeal.polydate == '') { this.polydate = false } else { this.polydate = true }
    if (this.appeal.polytime == '') { this.polytime = false } else { this.polytime = true }
    if (this.appeal.empsign == '') { this.empsign = false } else { this.empsign = true }
    if (this.appeal.place == '') { this.place = false } else { this.place = true }
    if (this.appeal.supername == '') { this.supername = false } else { this.supername = true }
    if (this.appeal.supsign == '') { this.supsign = false } else { this.supsign = true }
    if (this.appeal.witnessname == '') { this.witnessname = false } else { this.witnessname = true }

    if (
      this.witsign == true && this.employeeName == true && this.polydate == true && this.polytime == true && this.empsign == true && this.place == true && this.supername == true && this.supsign == true && this.witnessname == true
    ) {
      this.before()

    }
    else {
      this.invalidActionSheet()
    }
  }

  save() {


    this.storage.set(this.appeal.key, this.appeal).then(() => { 

      this.appeal.polytime = moment(this.appeal.polytime).format('HH:mm');
      this.appeal.polydate = moment(this.appeal.polydate).format('YYYY/MM/DD');
      this.appeal.supervisorSign = this.appeal.supsign
      this.appeal.witSig = this.appeal.witsign
      this.appeal.empSig = this.appeal.empsign
      this.loading.present('Saving')
      this.afs.collection('polygraph').doc(this.appeal.key).set(this.appeal).
        then(() => {
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



}
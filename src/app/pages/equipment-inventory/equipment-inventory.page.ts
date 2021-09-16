
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
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

@Component({
  selector: 'app-equipment-inventory',
  templateUrl: './equipment-inventory.page.html',
  styleUrls: ['./equipment-inventory.page.scss'],
})
export class EquipmentInventoryPage implements OnInit {




  equipment = {
    siteName: '',
    date: '',
    baseRadio: { make: '', model: '', serial: '', controlWork: '', micWork: '' },
    handRadio: [{ make: '', model: '', serial: '', controlWork: '', micWork: '' }],
    panicButtonTotal: '',
    panicButtonWork: '',
    panicButtonNot: '',
    panicButtonTest: '',
    panicButtonOB: '',
    panicInPosition: '',
    panicInPositionRemark: '',
    phoneModel: '',
    recipient:'',
    userEmail: '',
    phoneWork: '',
    phoneCharge: '',
    airtime: '',
    airtimeAmount: '',
    torchType: '',
    torchTotal: '',
    torchNot: '',
    torchWork: '',
    torchTest: '',
    torchCharger: '',
    pepperSpray: '',
    handCuff: '',
    baton: '',
    umbrella: '',
    generalRemark: '',
    supervisorSign: '',
    supervisorName: '',
    companyEmail:'',
    supervisorKey: '',
    key: '',
    clientEmail: '',
    siteKey: '',
    companyId: '',
    supervisorCompany: ''
  }

  sitesValues: boolean;
  torchWV = true
  batonV = true
  umbrellaV = true
  pepperV = true
  handV = true
  gremark = true
  supsign = true
  torchNV = true
  torchTV = true
  panicRV = true
  torchCV = true
  torchSV = true
  airtimeAV = true
  airtimeV = true
  torchTCV = true
  chargeV = true;
  phoneMV = true
  phoneWV = true
  siteValue = true;
  bmakeV = true
  bmodelV = true
  bserialV = true;
  borderV = true
  bmicV = true
  panicV = true
  panicWV = true
  panicNV = true;
  panicTV = true
  panicOBV = true
  panicGV = true

  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  


  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;



  

  constructor( public popoverController:PopoverController,private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }


  addRadio() {
    this.equipment.handRadio.push({ make: '', model: '', serial: '', controlWork: '', micWork: '' })
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

    this.equipment[`${this.role.data.for}`] = this.role.data.out
  }



  getSiteDetails(equipment) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', equipment.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.equipment.siteName = site.name;
        this.equipment.siteKey = site.key;
        if (site.recipient) {
          this.equipment.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.equipment.clientEmail =  site.email;
        }
      });
    });
  }


  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.equipment.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');

          if (user.key) {
            var id = user.key;
            this.searchSites(id);          }
          this.equipment.supervisorName = user.name;
          this.equipment.supervisorKey = user.key;
          this.equipment.userEmail = user.email
          this.equipment.supervisorCompany = user.company;
          this.equipment.companyId = user.companyId;      
          this.equipment.key = UUID.UUID();
          this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
            if (company.data().notification !== '' && company.data().notification !== undefined) {
              this.equipment.companyEmail = company.data().notification;
            }
          });          
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      // this.getUrlData().then(() => {
      //   this.afs.collection('ncrs').doc(this.data.key).ref.get().then((ncr) => {
      //     this.passedForm = ncr.data();
      //     if (this.passedForm) {
      //       this.ncr = this.passedForm;
      //     }
      //   });
      // });
    }
    
  }


  searchSites(id) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...');
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.getSites(id).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
        this.sitesValues = true;
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

  check() {
    if (this.equipment.siteName == '') { this.siteValue = false } else  { this.siteValue = !false }
    if (this.equipment.panicButtonTotal == '') { this.panicV = false } else { this.panicV = !false }
    if (this.equipment.panicButtonWork == '') { this.panicWV = false } else { this.panicWV = !false } 
    if (this.equipment.panicButtonNot == '') { this.panicNV = false } else { this.panicNV = !false } 
    if (this.equipment.panicButtonTest == '') { this.panicTV = false } else { this.panicTV = !false }
    if (this.equipment.panicButtonOB == '') { this.panicOBV = false } else { this.panicOBV = !false }
    if (this.equipment.panicInPosition == '') { this.panicGV = false } else { this.panicGV = !false }
    if (this.equipment.panicInPositionRemark == '') { this.panicRV = false } else { this.panicRV = !false }
    if (this.equipment.phoneModel == '') { this.phoneMV = false } else  { this.phoneMV = !false }
    if (this.equipment.phoneWork == '') { this.phoneWV = false } else { this.phoneWV = !false } 
    if (this.equipment.phoneCharge == '') { this.chargeV = false } else  { this.chargeV = !false }
    if (this.equipment.airtime == '') { this.airtimeV = false } else { this.airtimeV = !false }
    if (this.equipment.airtimeAmount == '') { this.airtimeAV = false } else { this.airtimeAV = !false }
    if (this.equipment.torchType == '') { this.torchTV = false } else { this.torchTV = !false }
    if (this.equipment.torchTotal == '') { this.torchSV = false } else { this.torchSV = !false } 
    if (this.equipment.torchNot == '') { this.torchNV = false } else { this.torchNV = !false }
    if (this.equipment.torchWork == '') { this.torchWV = false } else { this.torchWV = !false } 
    if (this.equipment.torchTest == '') { this.torchTCV = false } else { this.torchTCV = !false }
    if (this.equipment.torchCharger == '') { this.torchCV = false } else { this.torchCV = !false }
    if (this.equipment.pepperSpray == '') { this.pepperV = false } else { this.pepperV = !false } 
    if (this.equipment.handCuff == '') { this.handV = false } else { this.handV = !false }
    if (this.equipment.baton == '') { this.batonV = false } else { this.batonV = !false }
    if (this.equipment.umbrella == '') { this.umbrellaV = false } else { this.umbrellaV = !false }
    if (this.equipment.generalRemark == '') { this.gremark = false } else { this.gremark = !false }
    if (this.equipment.supervisorSign == '') { this.supsign = false } else { this.supsign = !false }
    if (this.equipment.baseRadio.make == '') { this.bmakeV = false } else { this.bmakeV = !false }
    if (this.equipment.baseRadio.model == '') { this.bmodelV = false } else  { this.bmodelV = !false }
    if (this.equipment.baseRadio.micWork == '') { this.bmicV = false } else { this.bmicV = !false }
    if (this.equipment.baseRadio.make == '') { this.bserialV = false } else { this.bserialV = !false }
    if (this.equipment.baseRadio.controlWork == '') { this.borderV = false } else { this.borderV = !false }


    if (
      this.supsign == true &&
      this.gremark == true &&
      this.torchWV == true &&
      this.batonV == true &&
      this.umbrellaV == true &&
      this.pepperV == true &&
      this.handV == true &&
      this.torchNV == true &&
      this.torchTV == true &&
      this.torchCV == true &&
      this.torchSV == true &&
      this.airtimeAV == true &&
      this.airtimeV == true &&
      this.torchTCV == true &&
      this.chargeV == true &&
      this.phoneMV == true &&
      this.panicRV == true &&
      this.phoneWV == true &&
      this.siteValue == true &&
      this.bmakeV == true &&
      this.bmodelV == true &&
      this.bserialV == true &&
      this.borderV == true &&
      this.bmicV == true &&
      this.panicV == true &&
      this.panicWV == true &&
      this.panicNV == true &&
      this.panicTV == true &&
      this.panicOBV == true &&
      this.panicGV == true
    ) {
       this.save()
        
    }
    else {
      this.incomplete()
    }
  }

  save() {
    this.loading.present('Saving')
    this.afs.collection('equipmentInventory').doc(this.equipment.key).set(this.equipment).
      then(() => {
        this.loading.dismiss()
        this.toast.show('Saved')
        this.equipment = {
          siteName: '',
          recipient:'',
          companyEmail:'',
          userEmail:'',
          date: '',
          baseRadio: { make: '', model: '', serial: '', controlWork: '', micWork: '' },
          handRadio: [{ make: '', model: '', serial: '', controlWork: '', micWork: '' }],
          panicButtonTotal: '',
          panicButtonWork: '',
          panicButtonNot: '',
          panicButtonTest: '',
          panicButtonOB: '',
          panicInPosition: '',
          panicInPositionRemark: '',
          phoneModel: '',
          phoneWork: '',
          phoneCharge: '',
          airtime: '',
          airtimeAmount: '',
          torchType: '',
          torchTotal: '',
          torchNot: '',
          torchWork: '',
          torchTest: '',
          torchCharger: '',
          pepperSpray: '',
          handCuff: '',
          baton: '',
          umbrella: '',
          generalRemark: '',
          supervisorSign: '',
          supervisorName: '',
          supervisorKey: '',
          key: '',
          clientEmail: '',
          siteKey: '',
          companyId: '',
          supervisorCompany: ''
        }
       
        
      })

  }
  async incomplete() {
    let prompt = await this.alertCtrl.create({
      header: 'Incomplete Form',
      message: 'Please complete all fields before submitting.',
      cssClass: 'alert',
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        }
        
      ]
  });
    return await prompt.present();
  }



}

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
  selector: 'app-incident-report',
  templateUrl: './incident-report.page.html',
  styleUrls: ['./incident-report.page.scss'],
})
export class IncidentReportPage implements OnInit {
  sitesValues: boolean;
  // incidentV=true;
  suspectsV = true;
  alarmV = true;
  obV = true;
  roleV = true;
  signV = true;
  entryV = true;
  injuryV = true;
  takenV = true;
  cctvV = true;
  discoveryV = true;
  crimeV = true;
  panicV = true;
  policeV = true;
  clientV = true;
  guardV = true;
  incidentTimeV = true;
  incidentDateV = true;
  typeV = true;
  reportV = true;
  siteV = true;


  incident = {
    reportedBy: '',
    clientEmail: '',
    recipient:'',
    reportDate: '',
    role: '',
    userEmail:'',
    incidentOB: '',
    type: '',
    incidentDate: '',
    companyEmail: '',
    siteName: '',
    incidentTime: '',
    guardLocation: '',
    alarmSystem: '',
    clientNotify: '',
    suspectsNumber: '',
    siteKey: '',
    policeNotify: '',
    panicButtonPressed: '',
    crimeScene: '',
    discoveryMethod: '',
    cctv: '',
    taken: '',
    injuries: '',
    EntryPoint: '',
    supervisorName: '',
    // supervisorDate:'',
    supervisorSign: '',
    key: '',
    companyId: ''
  };

  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;
  

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;

  
  
  role;

  constructor(public popoverController:PopoverController,
    private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }


  ngOnInit() {

    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            var id = user.key;
            // this.displayUser(id);
            this.searchSites(id);
          }
          // console.log('user', user);
          this.incident.userEmail = user.email;
          this.incident.supervisorName = user.name
          this.incident.companyId = user.companyId
          this.incident.key = UUID.UUID();
          this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().incidentGen !== '' && company.data().incidentGen !== undefined) {
          this.incident.companyEmail = company.data().incidentGen;
        }
      });
          this.incident.reportDate = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
        });

      });
    } else if (this.id === 'view') {
      this.view = true;
    }
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

    this.incident[`${this.role.data.for}`] = this.role.data.out
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


    if (this.incident.reportedBy == "") { this.reportV = false } else { this.reportV = true }
    if (this.incident.role == "") { this.roleV = false } else { this.roleV = true }
    if (this.incident.incidentOB == "") { this.obV = false } else { this.obV = true }
    if (this.incident.type == "") { this.typeV = false } else { this.typeV = true }
    if (this.incident.incidentDate == "") { this.incidentDateV = false } else { this.incidentDateV = !false }
    if (this.incident.siteKey == "") { this.siteV = false } else { this.siteV = !false }
    if (this.incident.incidentTime == "") { this.incidentTimeV = false } else { this.incidentTimeV = !false }
    if (this.incident.suspectsNumber == "") { this.suspectsV = false } else { this.suspectsV = !false }
    if (this.incident.supervisorSign == "") { this.signV = false } else { this.signV = !false }
    if (this.incident.EntryPoint == "") { this.entryV = false } else { this.entryV = !false }
    if (this.incident.injuries == "") { this.injuryV = false } else { this.injuryV = !false }
    if (this.incident.taken == "") { this.takenV = false } else { this.takenV = !false }
    if (this.incident.cctv == "") { this.cctvV = false } else { this.cctvV = !false }
    if (this.incident.discoveryMethod == "") { this.discoveryV = false } else { this.discoveryV = !false }
    if (this.incident.crimeScene == "") { this.crimeV = false } else { this.crimeV = !false }
    if (this.incident.panicButtonPressed == "") { this.panicV = false } else { this.panicV = !false }
    if (this.incident.policeNotify == "") { this.policeV = false } else { this.policeV = !false }
    if (this.incident.clientNotify == "") { this.clientV = false } else { this.clientV = !false }
    if (this.incident.guardLocation == "") { this.guardV = false } else { this.guardV = !false }
    if (this.incident.incidentTime == "") { this.incidentTimeV = false } else { this.incidentTimeV = !false }
    if (this.incident.type == "") { this.typeV = false } else { this.typeV = !false }
    if (this.incident.alarmSystem == "") { this.alarmV = false } else { this.alarmV = !false }


    if (
      this.suspectsV == true &&
      this.alarmV == true &&
      this.obV == true &&
      this.roleV == true &&
      this.signV == true &&
      this.entryV == true &&
      this.injuryV == true &&
      this.takenV == true &&
      this.cctvV == true &&
      this.discoveryV == true &&
      this.crimeV == true &&
      this.panicV == true &&
      this.policeV == true &&
      this.clientV == true &&
      this.guardV == true &&
      this.incidentTimeV == true &&
      this.incidentDateV == true &&
      this.typeV == true &&
      this.reportV == true &&
      this.siteV == true
    ) {
      this.formatDate();
      this.save()

    }
    else { this.incomplete() }


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

  getSites(id) {
    this.sitesCollection = this.afs.collection(`users/${id}/sites`, ref => ref.orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
  }


  getSiteDetails(incident) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', incident.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.incident.siteName = site.name;
        this.incident.siteKey = site.key;
        if (site.email !== undefined) {
          this.incident.clientEmail = site.email;
                }
        if (site.recipient) {
          this.incident.recipient = site.recipient;
        }
      
      });
    });
  }

  formatDate() {
    this.incident.incidentDate = moment(this.incident.incidentDate).locale('en').format('YYYY/MM/DD');
    this.incident.incidentTime = moment(this.incident.incidentTime).locale('en').format('HH:mm');
  }


  save() {
    this.loading.present('Saving')
    this.afs.collection('incidentReport').doc(this.incident.key).set(this.incident).
      then(() => {
        this.loading.dismiss()
        this.toast.show('Saved');
        this.incident = {
          reportedBy: '',
          clientEmail: '',
          recipient:'',
          reportDate: '',
          userEmail: '',
          companyEmail: '',
          role: '',
          incidentOB: '',
          type: '',
          incidentDate: '',
          siteName: '',
          incidentTime: '',
          guardLocation: '',
          alarmSystem: '',
          clientNotify: '',
          suspectsNumber: '',
          siteKey: '',
          policeNotify: '',
          panicButtonPressed: '',
          crimeScene: '',
          discoveryMethod: '',
          cctv: '',
          taken: '',
          injuries: '',
          EntryPoint: '',
          supervisorName: '',
          supervisorSign: '',
          key: '',
          companyId: ''
        };
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

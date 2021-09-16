import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { map, take } from 'rxjs/operators';
import { AddEmailPage } from '../add-email/add-email.page';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  company = {
    name: '',
    address: '',
    country: '',
    lat: '',
    lng: '',
    vat: '',
    contact: null,
    email: '',
    rep: '',
    logo: '',
    key: '',
    sites: null,
    workDays: null,
    companyLeave: null,
    visit: '',
    visitUser: false,
    visitClient: '',
    meeting: '',
    meetingUser: false,
    meetingClient: '',
    uniform: '',
    uniformUser: false,
    uniformClient: '',
    incident: '',
    incidentUser: false,
    incidentClient: '',
    vehicle: '',
    vehicleUser: false,
    vehicleClient: '',
    disciplinary: '',
    disciplinaryUser: false,
    disciplinaryClient: '',
    training: '',
    trainingUser: false,
    trainingClient: '',
    transparency: '',
    transparencyUser: false,
    transparencyClient: '',
    ec: '',
    ecUser: false,
    ecClient: '',
    incidentGen: '',
    incidentGenUser: false,
    incidentGenClient: '',
    leave: '',
    leaveUser: false,
    leaveClient: '',
    arVisit: '',
    arVisitUser: false,
    arVisitClient: '',
    ob: '',
    obUser: false,
    obClient: '',
    assessment: '',
    assessmentUser: false,
    assessmentClient: '',
    tenant: '',
    tenantUser: false,
    tenantClient: '',
    instruction: '',
    instructionUser: false,
    instructionClient: '',
    notification: '',
    notificationUser: false,
    notificationClient: '',
  };

  report;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companysCollection: AngularFirestoreCollection<any>;
  companys: Observable<any[]>;

  constructor(public modalCtrl: ModalController, public loadingCtrl: LoadingController, private afs: AngularFirestore,
    public navCtrl: NavController, public router: Router, private storage: Storage) { }


  ngOnInit() {
    this.storage.get('user').then((user) => {
      if (user.key) {
        var id = user.key;
      }
      this.usersCollection = this.afs.collection('users', ref => ref.where('key', '==', id));
      this.users = this.usersCollection.snapshotChanges().pipe(map(changes => {
        return changes.map((a: any) => { 
          const info = a.payload.doc.data();
          const key = a.payload.doc.id;
          return { key, ...info };
        });
      }));
      this.users.subscribe(users => {
        users.forEach(user => {
          this.user.type = user.type;
          this.user.companyId = user.companyId;
          this.companysCollection = this.afs.collection('companies', ref => ref.where('key', '==', `${this.user.companyId}`));
          this.companys = this.companysCollection.snapshotChanges().pipe(map(changes => {
            return changes.map((a: any) => { 
              const info = a.payload.doc.data();
              const key = a.payload.doc.id;
              return { key, ...info };
            });
          }));
          this.companys.subscribe(companys => {
            companys.forEach(company => {
              this.company.key = company.key;
              this.company.visit = company.visit;
              this.company.uniform = company.uniform;
              this.company.meeting = company.meeting;
              this.company.incident = company.incident;
              this.company.vehicle = company.vehicle;
              this.company.disciplinary = company.disciplinary;
              this.company.training = company.training;
              this.company.transparency = company.transparency;
              this.company.ec = company.ec;
              this.company.incidentGen = company.incidentGen;
              this.company.leave = company.leave;
              this.company.arVisit = company.arVisit;
              this.company.ob = company.ob;
              this.company.assessment = company.assessment;
              this.company.tenant = company.tenant;
              this.company.notification = company.notification;
              this.company.instruction = company.instruction;
            });
          });
        });
      });
    });
  }

  async editVisit() {
    this.report = {
      name: 'SITE VISIT REPORT',
      email: this.company.visit,
      key: this.company.key,
      user: this.company.visitUser,
      client: this.company.visitClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editIncident() {
    this.report = {
      name: 'INCIDENT REPORT',
      email: this.company.incident,
      key: this.company.key,
      user: this.company.incidentUser,
      client: this.company.incidentClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editMeeting() {
    this.report = {
      name: 'MEETING REPORT',
      email: this.company.meeting,
      key: this.company.key,
      user: this.company.meetingUser,
      client: this.company.meetingClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editUnifom() {
    this.report = {
      name: 'UNIFORM ORDER',
      email: this.company.uniform,
      key: this.company.key,
      user: this.company.uniformUser,
      client: this.company.uniformClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editTraining() {
    this.report = {
      name: 'TRAINING FORM',
      email: this.company.training,
      key: this.company.key,
      user: this.company.trainingUser,
      client: this.company.trainingClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editVehicle() {
    this.report = {
      name: 'VEHICLE INSPECTION',
      email: this.company.vehicle,
      key: this.company.key,
      user: this.company.vehicleUser,
      client: this.company.vehicleClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editDisciplinary() {
    this.report = {
      name: 'DISCIPLINARY NOTICE',
      email: this.company.disciplinary,
      key: this.company.key,
      user: this.company.disciplinaryUser,
      client: this.company.disciplinaryClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editTransparency() {
    this.report = {
      name: 'TRANSPARENCY REPORT',
      email: this.company.transparency,
      key: this.company.key,
      user: this.company.transparencyUser,
      client: this.company.transparencyClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editIncGen() {
    this.report = {
      name: 'GENERAL INCIDENT REPORT',
      email: this.company.incidentGen,
      key: this.company.key,
      user: this.company.incidentGenUser,
      client: this.company.incidentGenClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editLeave() {
    this.report = {
      name: 'LEAVE APPLICATION',
      email: this.company.leave,
      key: this.company.key,
      user: this.company.leaveUser,
      client: this.company.leaveClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editArVisit() {
    this.report = {
      name: 'AR VISIT',
      email: this.company.arVisit,
      key: this.company.key,
      user: this.company.arVisitUser,
      client: this.company.arVisitClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editOBEntry() {
    this.report = {
      name: 'OB ENTRY',
      email: this.company.ob,
      key: this.company.key,
      user: this.company.obUser,
      client: this.company.obClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editAssessment() {
    this.report = {
      name: 'RISK ASSESSMENT',
      email: this.company.assessment,
      key: this.company.key,
      user: this.company.assessmentUser,
      client: this.company.assessmentClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editTenant() {
    this.report = {
      name: 'TENANT VISIT',
      email: this.company.tenant,
      key: this.company.key,
      user: this.company.tenantUser,
      client: this.company.tenantClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editInstruction() {
    this.report = {
      name: 'CLIENT INSTRUCTION',
      email: this.company.instruction,
      key: this.company.key,
      user: this.company.instructionUser,
      client: this.company.instructionClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

  async editNotification() {
    this.report = {
      name: 'INCIDENT NOTIFICATION',
      email: this.company.notification,
      key: this.company.key,
      user: this.company.notificationUser,
      client: this.company.notificationClient
    };
    const modal = await this.modalCtrl.create({
      component: AddEmailPage,
      componentProps: { report: this.report }
    });
    return await modal.present();
  }

}


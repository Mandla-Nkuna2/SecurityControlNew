import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
import moment from 'moment';
import { LoadingService } from './loading.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  form = { key: 'sitevisits' };
  pdfDoc = { name: '', date: '' };
  siteId;
  reportTypeCollection: AngularFirestoreCollection<void>;
  reportTypes: Observable<any[]>;
  reportCollection: AngularFirestoreCollection<void>;
  reports: Observable<any[]>;
  registersCollection: AngularFirestoreCollection<void>;
  registers: Observable<any[]>;

  manSig;
  supervisorSign
  clientSig;
  empSig;
  witSig;
  signature;
  guardSig;
  sigUser;
  sigClient;
  sigOfficer;
  supSig;
  actionSig;
  verifiedSig;

  color;
  header;
  pdfObj = null;
  image;
  row1;
  row2;
  row3;
  row4;
  row5;
  row6;
  row7;
  body = [];
  body1 = [];
  body2 = [];
  body3 = [];
  body4 = [];
  body5 = [];

  formValue = true;

  constructor(public alertCtrl: AlertController, public loading: LoadingService, public platform: Platform, public file: File, public fileopener: FileOpener,
    private storage: Storage, private afs: AngularFirestore) { }

  ngOnInit() {
    this.reportCollection = this.afs.collection('visits', ref => ref.where('siteId', '==', this.siteId).orderBy('date', 'desc').limit(10));
    this.reports = this.reportCollection.valueChanges();
    this.reports.subscribe(snapshot => {
      if (snapshot.length === 0) {
        this.formValue = false;
      }
    });
  }

  getCompanyInfo() {
    return new Promise<void>((resolve, reject) => {
      this.storage.get('user').then((user) => {
        this.siteId = user.siteId;
        this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
          if (company.data().base64 !== '' && company.data().base64 !== undefined) {
            this.header = company.data().base64;
            // console.log(this.header);
          } else {
            this.afs.collection('companies').doc('62370402-ecae-a16e-6f5a-5fe7c4d5532d').ref.get().then((control: any) => {
              this.header = control.data().base64;
              console.log('Company logo not found: use SC logo');
            });
          }
          this.color = company.data().color;
          resolve();
        });
      });
    });
  }

  checkSig(report) {
    return new Promise<void>((resolve, reject) => {
      if (report.manSig !== '' && report.manSig !== undefined) {
        this.manSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.manSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.manSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }
      if (report.clientSig !== '' && report.clientSig !== undefined) {
        this.clientSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.clientSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.clientSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }
      if (report.empSig !== '' && report.empSig !== undefined) {
        this.empSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.empSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.empSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.supSig !== '' && report.supSig !== undefined) {
        this.supSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.supSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.supSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.witSig !== '' && report.witSig !== undefined) {
        this.witSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.witSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.witSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.supervisorSign !== '' && report.supervisorSign !== undefined) {
        this.supervisorSign = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.supervisorSign,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.supervisorSign = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }


      if (report.signature !== '' && report.signature !== undefined) {
        this.signature = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.signature,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.signature = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.guardSig !== '' && report.guardSig !== undefined) {
        this.guardSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.guardSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.guardSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.sigUser !== '' && report.sigUser !== undefined) {
        this.sigUser = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.sigUser,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.sigUser = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.sigClient !== '' && report.sigClient !== undefined) {
        this.sigClient = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.sigClient,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.sigClient = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.sigOfficer !== '' && report.sigOfficer !== undefined) {
        this.sigOfficer = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.sigOfficer,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.sigOfficer = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.actionSig !== '' && report.actionSig !== undefined) {
        this.actionSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.actionSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.actionSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }

      if (report.verifiedSig !== '' && report.verifiedSig !== undefined) {
        this.verifiedSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          image: report.verifiedSig,
          width: 150,
          alignment: 'center',
        };
      } else {
        this.verifiedSig = {
          border: [false, false, false, true],
          margin: [0, 70, 0, 0],
          text: '',
          alignment: 'center',
        };
      }
      resolve();
    });
  }

  runFix(report, Report) {
    this.afs.collection(Report).doc(report.key).update({ fix: true }).then(() => {
      this.alertUser();
    });
  }

  async alertUser() {
    let prompt = await this.alertCtrl.create({
      header: 'Report is being updated',
      message: 'This Report is being updated... Please try again in 2 Minutes',
      cssClass: 'alert',
      buttons: [
        {
          text: 'OKAY',
          handler: data => {
          }
        },
      ]
    });
    return await prompt.present();
  }

  download(report) {
    console.log(report.report)
    if (report.report === 'Site Visit Gen') { var Report = 'sitevisits' };
    if (report.report === 'Site Visit') { var Report = 'sitevisits' };
    if (report.report === 'Vehicle Inspection') { var Report = 'vehicles' };
    if (report.report === 'Uniform Order') { var Report = 'uniforms' };
    if (report.report === 'Transparency Report') { var Report = 'transparencys' };
    if (report.report === 'Training Form') { var Report = 'trainings' };
    if (report.report === 'Tenant Survey') { var Report = 'tenant' };
    if (report.report === 'Risk Assessment') { var Report = 'assessments' };
    if (report.report === 'PnP Site Visit') { var Report = 'pnpvisit' };
    if (report.report === 'AOD') { var Report = 'AOD' };
    if (report.report === 'Employee form') { var Report = 'Employee Performance Evaluation Form' };
    if (report.report === 'NCR') { var Report = 'NCR' }

    // else { var Report = report.report }

    return new Promise<void>((resolve, reject) => {
      if (report.manSig) {
        const manSignature = report.manSig;
        if (manSignature.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.empSig) {
        const empSignature = report.empSig;
        if (empSignature.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.supSig) {
        const supSignature = report.empSig;
        if (supSignature.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.guardSig) {
        const guardSignature = report.guardSig;
        if (guardSignature.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo) {
        const photoImage = report.photo;
        if (photoImage.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo1) {
        const photoImage1 = report.photo1;
        if (photoImage1.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo2) {
        const photoImage2 = report.photo2;
        if (photoImage2.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo3) {
        const photoImage3 = report.photo3;
        if (photoImage3.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo4) {
        const photoImage4 = report.photo4;
        if (photoImage4.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo5) {
        const photoImage5 = report.photo5;
        if (photoImage5.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      if (report.photo6) {
        const photoImage6 = report.photo6;
        if (photoImage6.startsWith('http')) {
          return this.runFix(report, Report);
        }
      }
      this.loading.present('Downloading Please Wait...').then(() => {
        this.pdfDoc.date = report.date;

        if (report.report === 'Site Visit') {
          this.pdfDoc.name = 'Site_Visit_Report';
          return this.downloadSITE(report);
        }
        else if (report.report === 'Site Visit Gen') {
          this.pdfDoc.name = 'Site_Visit_Report';
          return this.downloadGenSite(report);
        }
        else if (report.report === 'Incident Notification') {
          this.pdfDoc.name = 'Incident_Notification';
          return this.downloadIncidentNot(report);
        }
        else if (report.report === 'Incident Report') {
          this.pdfDoc.name = 'General_Incident_Report';
          return this.downloadGenInc(report);
        }
        else if (report.report === 'OB Entry') {
          this.pdfDoc.name = 'OB_Entry';
          return this.downloadOB(report);
        }
        else if (report.report === 'Tenant Survey') {
          this.pdfDoc.name = 'Tenant_Survey';
          return this.downloadTenant(report);
        }
        else if (report.report === 'Training Form') {
          this.pdfDoc.name = 'Training_Form';
          return this.downloadTrain(report);
        }
        else if (report.report === 'Vehicle Inspection') {
          this.pdfDoc.name = 'Vehicle_Inspection';
          return this.downloadVehInspec(report);
        }
        else if (report.report === 'Crime Incident Report') {
          this.pdfDoc.name = 'Crime_Incident_Report';
          return this.downloadCrimeInc(report);
        }
        else if (report.report === 'Leave Application') {
          this.pdfDoc.name = 'Leave_Application';
          return this.downloadLeave(report);
        }
        else if (report.report === 'Disciplinary Report') {
          this.pdfDoc.name = 'Disciplinary_Report';
          return this.downloadDisc(report);
        }
        else if (report.report === 'Client Meeting') {
          this.pdfDoc.name = 'Client_Meeting';
          return this.downloadMeeting(report);
        }
        else if (report.report === 'Client Instruction') {
          this.pdfDoc.name = 'Client_Instruction';
          return this.downloadClientInstruc(report);
        }
        else if (report.report === 'Risk Assessment') {
          this.pdfDoc.name = 'Risk_Assessment';
          return this.downloadRiskAss(report);
        }
        else if (report.report === 'Uniform Order') {
          this.pdfDoc.name = 'Uniform_Order';
          return this.downloadUniform(report);
        }
        else if (report.report === 'Transparency Report') {
          this.pdfDoc.name = 'Transparency_Report';
          return this.downloadTrans(report);
        }
        else if (report.report === 'PnP Site Visit') {
          this.pdfDoc.name = 'PnP_Site_Visit';
          return this.downloadPNP(report);
        }
        else if (report.report === 'AOD') {
          this.pdfDoc.name = 'AOD';
          return this.downloadAOD(report);
        }
        else if (report.report === 'Employee form') {
          this.pdfDoc.name = 'Employee Performance Evaluation Form';
          return this.downloadEMP(report);
        }
        else if (report.report === 'NCR') {
          this.pdfDoc.name = 'Non-Conformance Report';
          return this.downloadNCR(report);
        }
        else if (report.report === 'extinguisher-checklist') {
          this.pdfDoc.name = 'Extinguisher Checklist Report';
          return this.extinguisherChecklist(report);
        }

        else if (report.report === 'gas-explosion') {
          this.pdfDoc.name = 'gas-explosion Report';
          return this.gasExplosion(report);
        }

        else if (report.report === 'pay-query') {
          this.pdfDoc.name = 'pay query Report';
          return this.payquery(report);
        }

        else if (report.report === 'fence-inspection') {
          this.pdfDoc.name = 'fence-inspection Report';
          return this.fenceinspection(report);
        }

        else if (report.report === 'performance-appraisal') {
          this.pdfDoc.name = 'performance-appraisal Report';
          return this.performanceappraisal(report);
        }
        else if (report.report === 'site-temperature') {
          this.pdfDoc.name = 'site-temperature Report';
          return this.sitetemperature(report);
        }

        else {
          var fun = this.pdfDoc.name = report.report;
          return this[fun](report);
        }
      });
      resolve();
    });
  }

  async generatePDF(docDefinition) {
    this.pdfObj = await pdfMake.createPdf(docDefinition);
    if (this.platform.is('cordova')) {
      this.pdfObj.getBuffer((buffer) => {
        var blob = new Blob([buffer], { type: 'application/pdf' });
        this.file.writeFile(this.file.dataDirectory, 'report.pdf', blob, { replace: true }).then(fileEntry => {
          this.fileopener.open(this.file.dataDirectory + 'report.pdf', 'application/pdf');
          this.loading.dismiss().then(() => {
            this.body = [];
            this.body1 = [];
            this.body2 = [];
            this.body3 = [];
            this.body4 = [];
          });
        }).catch(err => {
          alert('Error: ' + err);
        });
      });
    } else {
      this.pdfObj.download(this.pdfDoc.name + '-' + this.pdfDoc.date + '.pdf');
      this.loading.dismiss().then(() => {
        this.body = [];
        this.body1 = [];
        this.body2 = [];
        this.body3 = [];
        this.body4 = [];
      });
    }
  }

  // Report Photos

  getPhoto(report) {
    return new Promise<void>((resolve, reject) => {
      var columns = [{ text: 'No', style: 'headLabel', alignment: 'center' }, { text: 'Photo', style: 'headLabel', alignment: 'center' }];
      this.body.push(columns);
      if (report.photo1 !== '' && report.photo1 !== undefined) {
        this.body.push([{ text: '1', style: 'headLabel', alignment: 'center' }, { image: report.photo1, width: 100, alignment: 'center' }]);
        if (report.photo2 !== '' && report.photo2 !== undefined) {
          this.body.push([{ text: '2', style: 'headLabel', alignment: 'center' },
          { image: report.photo2, width: 100, alignment: 'center' }]);
          if (report.photo3 !== '' && report.photo3 !== undefined) {
            this.body.push([{ text: '3', style: 'headLabel', alignment: 'center' },
            { image: report.photo3, width: 100, alignment: 'center' }]);
            if (report.photo4 !== '' && report.photo4 !== undefined) {
              this.body.push([{ text: '4', style: 'headLabel', alignment: 'center' },
              { image: report.photo4, width: 100, alignment: 'center' }]);
              if (report.photo5 !== '' && report.photo5 !== undefined) {
                this.body.push([{ text: '5', style: 'headLabel', alignment: 'center' },
                { image: report.photo5, width: 100, alignment: 'center' }]);
                if (report.photo6 !== '' && report.photo6 !== undefined) {
                  this.body.push([{ text: '6', style: 'headLabel', alignment: 'center' },
                  { image: report.photo6, width: 100, alignment: 'center' }]);
                } else {
                  resolve();
                }
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      } else {
        this.body.push([{ text: 'No Photos Taken', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
        resolve();
      }
    });
  }

  getPhoto2(report) {
    return new Promise<void>((resolve, reject) => {
      var columns = [{ text: 'Photo of Spare Wheel, Jack & Spanner:', style: 'headLabel', alignment: 'center' }];
      this.body.push(columns);
      if (report.photo1 !== '' && report.photo1 !== undefined) {
        this.body.push([{ image: report.photo1, width: 100, alignment: 'center' }]);
      } else {
        this.body.push([{ text: 'No Photo Taken', style: 'headLabel', alignment: 'center' }]);
      }
      var columns2 = [{ text: 'Photo of Damage Found:', style: 'headLabel', alignment: 'center' }];
      this.body1.push(columns2);
      if (report.photo2 !== '' && report.photo2 !== undefined) {
        report.photo2.forEach((element) => {
          this.body1.push([{ image: element, width: 100, alignment: 'center' }]);
        });
        resolve();
      } else {
        this.body1.push([{ text: 'No Photo Taken', style: 'headLabel', alignment: 'center' }]);
        resolve();
      }
    });
  }


  crimeIncBody1(report) {
    return new Promise<void>((resolve, reject) => {
      var columns3 = [{ text: 'PERSONAL DETAILS/ VICTIM/ SECURITY OFFICER', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}];
      this.body2.push(columns3);
      this.body2.push([{ text: 'Was there a person/ victim / security officer involved?', style: 'headLabel' }, { text: report.person }]);
      if (report.person === 'YES') {
        this.body2.push([{ text: 'Title ', style: 'headLabel' }, { text: report.title }]);
        this.body2.push([{ text: 'First Name ', style: 'headLabel' }, { text: report.name }]);
        this.body2.push([{ text: 'Surname ', style: 'headLabel' }, { text: report.surname }]);
        this.body2.push([{ text: 'Address ', style: 'headLabel' }, { text: report.address }]);
        this.body2.push([{ text: 'Contact Number ', style: 'headLabel' }, { text: report.contact }]);
        this.body2.push([{ text: 'Email Address ', style: 'headLabel' }, { text: report.email }]);
        this.body2.push([{ text: 'Employer ', style: 'headLabel' }, { text: report.employer }]);
        this.body2.push([{ text: 'Type of Injury Sustained ', style: 'headLabel' }, { text: report.injury }]);
        resolve();
      } else {
        resolve();
      }
    });
  }
  crimeIncBody2(report) {
    return new Promise<void>((resolve, reject) => {
      var columns4 = [{ text: 'SAPS INFORMATION', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}];
      this.body3.push(columns4);
      this.body3.push([{ text: 'Was the incident reported to the SAPS?', style: 'headLabel' }, { text: report.reported }]);
      if (report.reported === 'YES') {
        this.body3.push([{ text: 'Time Reported to SAPS', style: 'headLabel' }, { text: report.sapsRepTime }]);
        this.body3.push([{ text: 'SAPS Arrival Time', style: 'headLabel' }, { text: report.sapsArrTime }]);
        this.body3.push([{ text: 'SAPS Officer ', style: 'headLabel' }, { text: report.officer }]);
        this.body3.push([{ text: 'Case Number ', style: 'headLabel' }, { text: report.case }]);
        this.body3.push([{ text: 'SAPS Station Details ', style: 'headLabel' }, { text: report.saps }]);
        this.body3.push([{ text: 'Metro/ Traffic Police Details ', style: 'headLabel' }, { text: report.metro }]);
        this.body3.push([{ text: 'Ambulance/ Emergency Service Details ', style: 'headLabel' }, { text: report.ambulance }]);
        this.body3.push([{ text: 'Fire Brigade Details ', style: 'headLabel' }, { text: report.fire }]);
        resolve();
      } else {
        resolve();
      }
    });
  }

  leavePhoto(report) {
    return new Promise<void>((resolve, reject) => {
      if (report.type === 'FAMILY RESPONSIBILITY' || report.type === 'SICK LEAVE') {
        if (report.photo !== '' && report.photo !== undefined) {
          this.body.push([{ text: 'PHOTO OF PROOF - DOCTORS NOTE/ CERTIFICATE', style: 'headLabel', alignment: 'center' }]);
          this.body.push([{ image: report.photo, width: 100, alignment: 'center' }]);
          resolve();
        } else {
          this.body.push([{ text: 'PHOTO OF PROOF - DOCTORS NOTE/ CERTIFICATE', style: 'headLabel', alignment: 'center' }]);
          this.body.push([{ text: 'No Photo Taken', alignment: 'center' }]);
        }
      } else {
        this.body.push([]);
        resolve();
      }
    });
  }

  getUniform(report) {
    return new Promise<void>((resolve, reject) => {
      this.body.push([{ text: 'Item', style: 'headLabel' }, { text: 'Is it required?', style: 'headLabel' }]);
      this.body.push([{ text: 'Trousers', style: 'headLabel' }, { text: report.trousers }]);
      if (report.trousers === 'Yes') {
        this.body.push([{ text: 'Trouser Size', style: 'headLabel' }, { text: report.trouserSize }]);
        this.body.push([{ text: 'Qty Trousers', style: 'headLabel' }, { text: report.qty1 }]);
      }
      this.body.push([{ text: 'Shirt', style: 'headLabel' }, { text: report.shirt }]);
      if (report.shirt === 'Yes') {
        this.body.push([{ text: 'Shirt Size', style: 'headLabel' }, { text: report.shirtSize }]);
        this.body.push([{ text: 'Qty Shirts', style: 'headLabel' }, { text: report.qty2 }]);
      }
      this.body.push([{ text: 'Jacket', style: 'headLabel' }, { text: report.jacket }]);
      if (report.jacket === 'Yes') {
        this.body.push([{ text: 'Jacket Size', style: 'headLabel' }, { text: report.jacketSize }]);
        this.body.push([{ text: 'Qty Jackets', style: 'headLabel' }, { text: report.qty3 }]);
      }
      this.body.push([{ text: 'Jersey', style: 'headLabel' }, { text: report.jersey }]);
      if (report.jersey === 'Yes') {
        this.body.push([{ text: 'Jersey Size', style: 'headLabel' }, { text: report.jerseySize }]);
        this.body.push([{ text: 'Qty Jerseys', style: 'headLabel' }, { text: report.qty4 }]);
      }
      this.body.push([{ text: 'Boots', style: 'headLabel' }, { text: report.boots }]);
      if (report.boots === 'Yes') {
        this.body.push([{ text: 'Boot Size', style: 'headLabel' }, { text: report.bootSize }]);
        this.body.push([{ text: 'Qty Boots', style: 'headLabel' }, { text: report.qty5 }]);
      }
      this.body.push([{ text: 'Beanie', style: 'headLabel' }, { text: report.beanie }]);
      if (report.beanie === 'Yes') {
        this.body.push([{ text: 'Qty Beanies', style: 'headLabel' }, { text: report.qty6 }]);
      }
      this.body.push([{ text: 'Tie', style: 'headLabel' }, { text: report.tie }]);
      if (report.tie === 'Yes') {
        this.body.push([{ text: 'Qty Ties', style: 'headLabel' }, { text: report.qty7 }]);
      }
      this.body.push([{ text: 'Cap', style: 'headLabel' }, { text: report.cap }]);
      if (report.cap === 'Yes') {
        this.body.push([{ text: 'Qty Caps', style: 'headLabel' }, { text: report.qty8 }]);
      }
      this.body.push([{ text: 'Belt', style: 'headLabel' }, { text: report.belt }]);
      if (report.belt === 'Yes') {
        this.body.push([{ text: 'Belt Size', style: 'headLabel' }, { text: report.beltSize }]);
        this.body.push([{ text: 'Qty Belts', style: 'headLabel' }, { text: report.qty9 }]);
      }
      this.body.push([{ text: 'Rainsuit', style: 'headLabel' }, { text: report.rainsuit }]);
      if (report.rainsuit === 'Yes') {
        this.body.push([{ text: 'Rainsuit Size', style: 'headLabel' }, { text: report.rainsuitSize }]);
        this.body.push([{ text: 'Qty Rainsuits', style: 'headLabel' }, { text: report.qty10 }]);
        resolve();
      } else {
        resolve();
      }
    });
  }

  getRisk(report) {
    return new Promise<void>((resolve, reject) => {
      this.body.push([{ text: 'PERIMETER', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Perimeter Type', style: 'headLabel' }, { text: report.type }]);
      this.body.push([{ text: 'Perimeter Description ', style: 'headLabel' }, { text: report.description }]);
      this.body.push([{ text: 'Perimeter Height ', style: 'headLabel' }, { text: report.height }]);
      this.body.push([{ text: 'Any Vulnerable or Damaged Area Risks?', style: 'headLabel' }, { text: report.vulnerable }]);
      if (report.vulnerable === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.vulnerableDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.vulnerableLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.vulnerableRec }]);
        if (report.photo1 !== '' && report.photo1 !== undefined) {
          this.body.push([{ text: 'Photo 1', style: 'headLabel', alignment: 'center' }, { image: report.photo1, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Perimeter Alarms Related Risks?', style: 'headLabel' }, { text: report.palarms }]);
      if (report.palarms === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.palarmsDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.palarmsLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.palarmsRec }]);
        if (report.photo2 !== '' && report.photo2 !== undefined) {
          this.body.push([{ text: 'Photo 2', style: 'headLabel', alignment: 'center' }, { image: report.photo2, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Electric Fence Related Risks?', style: 'headLabel' }, { text: report.elecfence }]);
      if (report.elecfence === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.elecfenceDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.elecfenceLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.elecfenceRec }]);
        if (report.photo3 !== '' && report.photo3 !== undefined) {
          this.body.push([{ text: 'Photo 3', style: 'headLabel', alignment: 'center' }, { image: report.photo3, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Risks Related to Trees & Vegetation?', style: 'headLabel' }, { text: report.trees }]);
      if (report.trees === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.treesDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.treesLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.treesRec }]);
        if (report.photo4 !== '' && report.photo4 !== undefined) {
          this.body.push([{ text: 'Photo 4', style: 'headLabel', alignment: 'center' }, { image: report.photo4, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Risks Related to Perimeter Lighting?', style: 'headLabel' }, { text: report.perimLight }]);
      if (report.perimLight === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.perimLightDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.perimLightLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.perimLightRec }]);
        if (report.photo5 !== '' && report.photo5 !== undefined) {
          this.body.push([{ text: 'Photo 5', style: 'headLabel', alignment: 'center' }, { image: report.photo5, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'PREMISES AND HOUSEKEEPING', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Any High Risk Area’s the Premises?', style: 'headLabel' }, { text: report.areas }]);
      if (report.areas === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.areasDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.areasLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.areasRec }]);
        if (report.photo6 !== '' && report.photo6 !== undefined) {
          this.body.push([{ text: 'Photo 6', style: 'headLabel', alignment: 'center' }, { image: report.photo6, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Risks with Storage of Dangerous Items?', style: 'headLabel' }, { text: report.danger }]);
      if (report.danger === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.dangerDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.dangerLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.dangerRec }]);
        if (report.photo7 !== '' && report.photo7 !== undefined) {
          this.body.push([{ text: 'Photo 7', style: 'headLabel', alignment: 'center' }, { image: report.photo7, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Risks with stacked items against walls/fences or buildings?', style: 'headLabel' }, { text: report.stacked }]);
      if (report.stacked === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.stackedDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.stackedLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.stackedRec }]);
        if (report.photo8 !== '' && report.photo8 !== undefined) {
          this.body.push([{ text: 'Photo 8', style: 'headLabel', alignment: 'center' }, { image: report.photo8, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any High Risk Area’s in the Surroundings?', style: 'headLabel' }, { text: report.surround }]);
      if (report.surround === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.surroundDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.surroundLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.surroundRec }]);
        if (report.photo9 !== '' && report.photo9 !== undefined) {
          this.body.push([{ text: 'Photo 9', style: 'headLabel', alignment: 'center' }, { image: report.photo9, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Premises Lighting Risks?', style: 'headLabel' }, { text: report.premLight }]);
      if (report.premLight === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.premLightDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.premLightLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.premLightRec }]);
        if (report.photo10 !== '' && report.photo10 !== undefined) {
          this.body.push([{ text: 'Photo 10', style: 'headLabel', alignment: 'center' }, { image: report.photo10, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'ENTRANCES / EXITS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Entry / Exit Type', style: 'headLabel' }, { text: report.method }]);
      this.body.push([{ text: 'Entrance/ Exit Description', style: 'headLabel' }, { text: report.entrance }]);
      this.body.push([{ text: 'Is Entry/ Exit Monitored & Documented?', style: 'headLabel' }, { text: report.monitored }]);
      this.body.push([{ text: 'Are Vehicles Searched on Entry/ Exit?', style: 'headLabel' }, { text: report.searched }]);
      this.body.push([{ text: 'Are Staff & Contractors Searched on Exit?', style: 'headLabel' }, { text: report.staff }]);
      this.body.push([{ text: 'Any Risks with Entrances / Exits?', style: 'headLabel' }, { text: report.entry }]);
      if (report.entry === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.entryDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.entryLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.entryRec }]);
        if (report.photo11 !== '' && report.photo11 !== undefined) {
          this.body.push([{ text: 'Photo 11', style: 'headLabel', alignment: 'center' }, { image: report.photo11, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Risks Related to Entrance / Exit Lighting?', style: 'headLabel' }, { text: report.entryLight }]);
      if (report.entryLight === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.entryLightDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.entryLightLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.entryLightRec }]);
        if (report.photo12 !== '' && report.photo12 !== undefined) {
          this.body.push([{ text: 'Photo 12', style: 'headLabel', alignment: 'center' }, { image: report.photo12, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'DOORS & WINDOWS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Doors & Windows Burglar Proofed?', style: 'headLabel' }, { text: report.doors }]);
      this.body.push([{ text: 'Doors & Windows Lockable?', style: 'headLabel' }, { text: report.lock }]);
      this.body.push([{ text: 'Doors & Windows Alarmed?', style: 'headLabel' }, { text: report.armed }]);
      this.body.push([{ text: 'Any Risks with Doors & Windows?', style: 'headLabel' }, { text: report.doorsRisk }]);
      if (report.doorsRisk === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.doorsRiskDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.doorsRiskLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.doorsRiskRec }]);
        if (report.photo13 !== '' && report.photo13 !== undefined) {
          this.body.push([{ text: 'Photo 13', style: 'headLabel', alignment: 'center' }, { image: report.photo13, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'ALARMS, CCTV & PANIC BUTTONS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Does the Premises have an alarm/s?', style: 'headLabel' }, { text: report.alarms }]);
      this.body.push([{ text: 'Does the Premises have Panic Button/s?', style: 'headLabel' }, { text: report.panic }]);
      this.body.push([{ text: 'Are the Alarms/ Panics Linked to Armed Response?', style: 'headLabel' }, { text: report.response }]);
      this.body.push([{ text: 'Are the Alarms Regularly Tested?', style: 'headLabel' }, { text: report.tested }]);
      this.body.push([{ text: 'Who is the Armed Response Company?', style: 'headLabel' }, { text: report.arcompany }]);
      this.body.push([{ text: 'Does the Premises have CCTV?', style: 'headLabel' }, { text: report.cams }]);
      this.body.push([{ text: 'If Yes, Are the Cameras Monitored?', style: 'headLabel' }, { text: report.monitoredcams }]);
      this.body.push([{ text: 'Is CCTV Coverage Sufficient?', style: 'headLabel' }, { text: report.cctvsuf }]);
      this.body.push([{ text: 'Any Risks with Alarms & CCTV?', style: 'headLabel' }, { text: report.cctv }]);
      if (report.cctv === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.cctvDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.cctvLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.cctvRec }]);
        if (report.photo14 !== '' && report.photo14 !== undefined) {
          this.body.push([{ text: 'Photo 14', style: 'headLabel', alignment: 'center' }, { image: report.photo14, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'GUARDING & EQUIPMENT', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'How Many Guards are Currently Posted on Site?', style: 'headLabel' }, { text: report.guards }]);
      this.body.push([{ text: 'Is there a GuardRoom Available?', style: 'headLabel' }, { text: report.room }]);
      this.body.push([{ text: 'Is there a Patrolling System in use?', style: 'headLabel' }, { text: report.patrol }]);
      this.body.push([{ text: 'What kind of System is in Place?', style: 'headLabel' }, { text: report.system }]);
      this.body.push([{ text: 'List of Equipment in Place:', style: 'headLabel' }, { text: report.equipment }]);
      this.body.push([{ text: 'Any Risks with Guarding & Equipment?', style: 'headLabel' }, { text: report.guard }]);
      if (report.guard === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.guardDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.guardLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.guardRec }]);
        if (report.photo15 !== '' && report.photo15 !== undefined) {
          this.body.push([{ text: 'Photo 15', style: 'headLabel', alignment: 'center' }, { image: report.photo15, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'GENERAL HEALTH & SAFETY', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Is there Fire Equipment Available?', style: 'headLabel' }, { text: report.fire }]);
      this.body.push([{ text: 'Fire Equipment Regulary Inspected & Serviced?', style: 'headLabel' }, { text: report.serviced }]);
      this.body.push([{ text: 'Is there First Aid Equipment Available?', style: 'headLabel' }, { text: report.aid }]);
      this.body.push([{ text: 'Is there Adequate H&S Signage displayed?', style: 'headLabel' }, { text: report.signs }]);
      this.body.push([{ text: 'Are there Emergency Evac Plans in place?', style: 'headLabel' }, { text: report.evac }]);
      this.body.push([{ text: 'Is there an Emergency Assembly Point/s?', style: 'headLabel' }, { text: report.assembly }]);
      this.body.push([{ text: 'Any Health & Safety Risks Identified?', style: 'headLabel' }, { text: report.health }]);
      if (report.health === 'Yes') {
        this.body.push([{ text: 'Risk Description', style: 'headLabel' }, { text: report.healthDesc }]);
        this.body.push([{ text: 'Risk Level', style: 'headLabel' }, { text: report.healthLevel }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.healthRec }]);
        if (report.photo16 !== '' && report.photo16 !== undefined) {
          this.body.push([{ text: 'Photo 16', style: 'headLabel', alignment: 'center' }, { image: report.photo16, width: 100, alignment: 'center' }]);
        }
      }

      this.body.push([{ text: 'FINAL NOTES', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Final Assessment Summary', style: 'headLabel' }, { text: report.notes }]);
      this.body.push([{ text: 'Email to Client?', style: 'headLabel' }, { text: report.emailToClient }]);
      resolve();
    });
  }

  processTrans(report) {
    return new Promise<void>((resolve, reject) => {
      this.body.push([{ text: 'SNAG REPORT & FINDINGS', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      if (report.photo1 !== '' && report.photo1 !== undefined) {
        this.body.push([{ text: 'Snag Photo 1', style: 'headLabel', alignment: 'center' }, { image: report.photo1, width: 100, alignment: 'center' }]);
        this.body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details1 }]);
        this.body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions1 }]);
        this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations1 }]);
        if (report.photo2 !== '' && report.photo2 !== undefined) {
          this.body.push([{ text: 'Snag Photo 2', style: 'headLabel', alignment: 'center' }, { image: report.photo2, width: 100, alignment: 'center' }]);
          this.body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details2 }]);
          this.body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions2 }]);
          this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations2 }]);
          if (report.photo3 !== '' && report.photo3 !== undefined) {
            this.body.push([{ text: 'Snag Photo 3', style: 'headLabel', alignment: 'center' }, { image: report.photo3, width: 100, alignment: 'center' }]);
            this.body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details3 }]);
            this.body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions3 }]);
            this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations3 }]);
            if (report.photo4 !== '' && report.photo4 !== undefined) {
              this.body.push([{ text: 'Snag Photo 4', style: 'headLabel', alignment: 'center' }, { image: report.photo4, width: 100, alignment: 'center' }]);
              this.body.push([{ text: 'Details of Findings', style: 'headLabel' }, { text: report.details4 }]);
              this.body.push([{ text: 'Actions Taken', style: 'headLabel' }, { text: report.actions4 }]);
              this.body.push([{ text: 'Recommendations', style: 'headLabel' }, { text: report.recommendations4 }]);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      } else {
        this.body.push([{ text: 'No Photos Taken', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
        resolve();
      }
    });
  }


  processGenSite(report) {
    return new Promise<void>((resolve, reject) => {
      if (report.photo1 !== '' && report.photo1 !== undefined) {
        this.body.push([{ text: 'Photo of site' }, { image: report.photo1, width: 100, alignment: 'center' }]);
      } else {
        this.body.push([{ text: 'No site photo taken', colSpan: 2, alignment: 'center' }, {}]);
      }
      this.body1.push([{ text: 'STAFF MEMBER INSPECTION', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      if (report.numSo === 0) {
        this.body1.push([{ text: 'Number of Staff on Duty', style: 'headLabel' }, { text: report.numSo }]);
      } else {
        if (report.photo2 !== '' && report.photo2 !== undefined) {
          this.body1.push([{ text: 'Number of Staff on Duty', style: 'headLabel' }, { text: report.numSo }]);
          this.body1.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: report.so }]);
          this.body1.push([{ text: 'Photo of the Staff Member', style: 'headLabel' }, { image: report.photo2, width: 100, alignment: 'center' }]);
          this.body1.push([{ text: 'Staff Member Post', style: 'headLabel' }, { text: report.soPost }]);
          this.body1.push([{ text: 'Is the Staff Members uniform neat and Serviceable?', style: 'headLabel' }, { text: report.uniforms }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com1 }]);
          this.body1.push([{ text: 'Is the guardroom neat and tidy?', style: 'headLabel' }, { text: report.guardroom }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com2 }]);
          this.body1.push([{ text: 'Is the O.B book completed?', style: 'headLabel' }, { text: report.obComplete }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com3 }]);
          this.body1.push([{ text: 'Are all registers in use and up to date?', style: 'headLabel' }, { text: report.registers }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com4 }]);
          if (report.guardSig !== '' && report.guardSig !== undefined) {
            this.body1.push([{ text: 'Staff Member Signature', style: 'headLabel' }, { image: report.guardSig, width: 100, alignment: 'center' }]);
          }
        } else {
          this.body1.push([{ text: 'Number of Staff on Duty', style: 'headLabel' }, { text: report.numSo }]);
          this.body1.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: report.so }]);
          this.body1.push([{ text: 'Photo of the Staff Member', style: 'headLabel' }, { text: 'No photo taken' }]);
          this.body1.push([{ text: 'Staff Member Post', style: 'headLabel' }, { text: report.soPost }]);
          this.body1.push([{ text: 'Is the Staff Members uniform neat and Serviceable?', style: 'headLabel' }, { text: report.uniforms }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com1 }]);
          this.body1.push([{ text: 'Is the guardroom neat and tidy?', style: 'headLabel' }, { text: report.guardroom }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com2 }]);
          this.body1.push([{ text: 'Is the O.B book completed?', style: 'headLabel' }, { text: report.obComplete }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com3 }]);
          this.body1.push([{ text: 'Are all registers in use and up to date?', style: 'headLabel' }, { text: report.registers }]);
          this.body1.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com4 }]);
          if (report.guardSig !== '' && report.guardSig !== undefined) {
            this.body1.push([{ text: 'Staff Member Signature', style: 'headLabel' }, { image: report.guardSig, width: 100, alignment: 'center' }]);
          }
        }
      }
      resolve();
    });
  }

  processPNP(report) {
    return new Promise<void>((resolve, reject) => {

      this.body.push([{ text: 'Number of Officers on Duty' }, { text: report.duty, alignment: 'center' }]);
      if (report.duty !== 0) {
        if (report.so !== '' && report.so !== undefined) {
          this.body.push([{ text: '1) Security Officer on Duty' }, { text: report.so }]);
          if (report.so2 !== '' && report.so2 !== undefined) {
            this.body.push([{ text: '2) Security Officer on Duty' }, { text: report.so2 }]);
            if (report.so3 !== '' && report.so3 !== undefined) {
              this.body.push([{ text: '3) Security Officer on Duty' }, { text: report.so3 }]);
              if (report.so4 !== '' && report.so4 !== undefined) {
                this.body.push([{ text: '4) Security Officer on Duty' }, { text: report.so4 }]);
                if (report.so5 !== '' && report.so5 !== undefined) {
                  this.body.push([{ text: '5) Security Officer on Duty' }, { text: report.so5 }]);
                  if (report.so6 !== '' && report.so6 !== undefined) {
                    this.body.push([{ text: '6) Security Officer on Duty' }, { text: report.so6 }]);
                    if (report.so7 !== '' && report.so7 !== undefined) {
                      this.body.push([{ text: '7) Security Officer on Duty' }, { text: report.so7 }]);
                      if (report.so8 !== '' && report.so8 !== undefined) {
                        this.body.push([{ text: '8) Security Officer on Duty' }, { text: report.so8 }]);
                        if (report.so9 !== '' && report.so9 !== undefined) {
                          this.body.push([{ text: '9) Security Officer on Duty' }, { text: report.so9 }]);
                          if (report.so10 !== '' && report.so10 !== undefined) {
                            this.body.push([{ text: '10) Security Officer on Duty' }, { text: report.so10 }]);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      this.body1.push([{ text: 'Any Incidents Reported Since Last Visit?' }, { text: report.incidents, alignment: 'center' }]);
      if (report.incidents === 'Yes') {
        this.body1.push([{ text: 'INCIDENT DETAILS', alignment: 'center', colSpan: 2 }, {}]);
        this.body1.push([{ text: 'Type of Incident' }, { text: report.incType, alignment: 'center' }]);
        this.body1.push([{ text: 'Date' }, { text: report.incDateTime, alignment: 'center' }]);
        this.body1.push([{ text: 'Reports Submitted?' }, { text: report.incReported, alignment: 'center' }]);
        this.body1.push([{ text: 'Follow-up Actions Taken?' }, { text: report.incActions, alignment: 'center' }]);
      }

      this.body2.push([{ text: 'Risk Detected During Site Visit?' }, { text: report.risk, alignment: 'center' }]);
      if (report.risk === 'Yes') {
        if (report.riskDesc1 !== '' && report.riskDesc1 !== undefined) {
          this.body2.push([{ text: 'Risk 1', alignment: 'center', colSpan: 2 }, {}]);
          if (report.photo1 !== '' && report.photo1 !== undefined) {
            this.body2.push([{ text: 'Photo 1' }, { image: report.photo1, width: 100, alignment: 'center' }]);
          }
          this.body2.push([{ text: 'Risk Detected' }, { text: report.riskDesc1 }]);
          this.body2.push([{ text: 'Recommendation' }, { text: report.riskRec1 }]);
        }
        if (report.riskDesc2 !== '' && report.riskDesc2 !== undefined) {
          this.body2.push([{ text: 'Risk 2', alignment: 'center', colSpan: 2 }, {}]);
          if (report.photo2 !== '' && report.photo2 !== undefined) {
            this.body2.push([{ text: 'Photo 2' }, { image: report.photo2, width: 100, alignment: 'center' }]);
          }
          this.body2.push([{ text: 'Risk Detected' }, { text: report.riskDesc2 }]);
          this.body2.push([{ text: 'Recommendation' }, { text: report.riskRec2 }]);
        }
        if (report.riskDesc3 !== '' && report.riskDesc3 !== undefined) {
          this.body2.push([{ text: 'Risk 3', alignment: 'center', colSpan: 2 }, {}]);
          if (report.photo3 !== '' && report.photo3 !== undefined) {
            this.body2.push([{ text: 'Photo 3' }, { image: report.photo3, width: 100, alignment: 'center' }]);
          }
          this.body2.push([{ text: 'Risk Detected' }, { text: report.riskDesc3 }]);
          this.body2.push([{ text: 'Recommendation' }, { text: report.riskRec3 }]);
        }
      }

      resolve();
    });
  }

  // Report Functions

  downloadPNP(report) {
    this.processPNP(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve, reject) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 500,
                  alignment: 'center'
                },
                { text: 'PNP SITE VISIT REPORT', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                      [{ text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' },
                      {}, {}],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body1
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body2
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['60%', '20%', '20%'],
                    body: [
                      [{ text: 'CHECKLIST INSPECTION', alignment: 'center', style: 'headLabel', colSpan: 3 }, {}, {}],
                      [{ text: 'Condition', style: 'headLabel' }, { text: 'Yes/No/NA', style: 'headLabel', alignment: 'center' }, { text: 'Comments', style: 'headLabel' }],

                      [{ text: 'Are any cameras not working?', style: 'headLabel' }, { text: report.alarms, alignment: 'center' },
                      { text: report.com1 }],
                      [{ text: 'Are there any decorations obstructing the cameras?', style: 'headLabel' }, { text: report.uniforms, alignment: 'center' },
                      { text: report.com2 }],
                      [{ text: 'Are the daily reviews done?', style: 'headLabel' }, { text: report.guardroom, alignment: 'center' },
                      { text: report.com3 }],
                      [{ text: 'Are all monitors working?', style: 'headLabel' }, { text: report.obComplete, alignment: 'center' },
                      { text: report.com4 }],
                      [{ text: 'Is the telephone working and available?', style: 'headLabel' }, { text: report.registers, alignment: 'center' },
                      { text: report.com5 }],
                      [{ text: 'Is the control room neat and tidy?', style: 'headLabel' }, { text: report.radios, alignment: 'center' },
                      { text: report.com6 }],
                      [{ text: 'Are the hand radios in working order?', style: 'headLabel' }, { text: report.panic, alignment: 'center' },
                      { text: report.com7 }],
                      [{ text: 'Have there been any arrests since the last visit?', style: 'headLabel' }, { text: report.phone, alignment: 'center' },
                      { text: report.com8 }],
                      [{ text: 'Have there been any preventions since the last visit?', style: 'headLabel' }, { text: report.patrol, alignment: 'center' },
                      { text: report.com9 }],
                      [{ text: 'Have there been any recoveries since the last visit?', style: 'headLabel' }, { text: report.torch, alignment: 'center' },
                      { text: report.com10 }],
                      [{ text: 'Was the panic button tested since the last visit?', style: 'headLabel' }, { text: report.elec, alignment: 'center' },
                      { text: report.com11 }],
                      [{ text: 'Are the 80/20 report completed?', style: 'headLabel' }, { text: report.cameras, alignment: 'center' },
                      { text: report.com12 }],
                      [{ text: 'Do the controllers have any issues?', style: 'headLabel' }, { text: report.cont, alignment: 'center' },
                      { text: report.com13 }],
                      [{ text: 'Is the cash in transit officers monitored while on site?', style: 'headLabel' }, { text: report.cash, alignment: 'center' },
                      { text: report.com14 }],
                      [{ text: 'Is the Occurance book completed?', style: 'headLabel' }, { text: report.compl, alignment: 'center' },
                      { text: report.com15 }],
                      [{ text: 'Is the duty roster on site?', style: 'headLabel' }, { text: report.dutyRoster, alignment: 'center' },
                      { text: report.com16 }],
                      [{ text: 'Are all entrances monitored by CCTV cameras?', style: 'headLabel' }, { text: report.cctv, alignment: 'center' },
                      { text: report.com17 }],
                      [{ text: 'Are all entrances to the store monitored by CCTV cameras?', style: 'headLabel' }, { text: report.monitored, alignment: 'center' },
                      { text: report.com18 }],
                      [{ text: 'Can you clearly identify customers entering the store?', style: 'headLabel' }, { text: report.store, alignment: 'center' },
                      { text: report.com19 }],
                      [{ text: 'Is the cash office monitored by CCTV cameras?', style: 'headLabel' }, { text: report.office, alignment: 'center' },
                      { text: report.com20 }],
                      [{ text: 'Are there sufficient coverage in the cash office?', style: 'headLabel' }, { text: report.coverage, alignment: 'center' },
                      { text: report.com21 }],
                      [{ text: 'Are there sufficient cameras placed in strategic areas?', style: 'headLabel' }, { text: report.strategic, alignment: 'center' },
                      { text: report.com22 }],
                      [{ text: 'Do we have any blind spots in the store? ', style: 'headLabel' }, { text: report.blind, alignment: 'center' },
                      { text: report.com23 }],
                      [{ text: 'Are all hot products on 24 hour power supply?', style: 'headLabel' }, { text: report.hot, alignment: 'center' },
                      { text: report.com24 }],
                      [{ text: 'Does electricity saving process affect video recording at night?', style: 'headLabel' }, { text: report.video, alignment: 'center' },
                      { text: report.com25 }],
                      [{ text: 'Does control room review high risk areas every morning?', style: 'headLabel' }, { text: report.review, alignment: 'center' },
                      { text: report.com26 }],
                      [{ text: 'Does control room provide footage to management on request?', style: 'headLabel' }, { text: report.request, alignment: 'center' },
                      { text: report.com27 }],
                      [{ text: 'Is there limited authorized access to the control room?', style: 'headLabel' }, { text: report.limited, alignment: 'center' },
                      { text: report.com28 }],
                      [{ text: 'Is the control room permanently manned?', style: 'headLabel' }, { text: report.manned, alignment: 'center' },
                      { text: report.com29 }],
                      [{ text: 'Is the ingate monitored by CCTV cameras?', style: 'headLabel' }, { text: report.ingate, alignment: 'center' },
                      { text: report.com30 }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [{ text: 'CLIENT MEETING', alignment: 'center', style: 'headLabel', colSpan: 2 }, {}],
                      [{ text: 'Client Name ', style: 'headLabel' }, { text: report.client, alignment: 'center' }],
                      [{ text: 'Client Discussion', style: 'headLabel' }, { text: report.discussion, alignment: 'center' }],
                      [{ text: 'Does the client have any issues with the service?', style: 'headLabel' }, { text: report.issues, alignment: 'center' }]
                    ]
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.clientSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'CLIENT SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadGenSite(report) {
    this.processGenSite(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve, reject) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 500,
                  alignment: 'center'
                },
                { text: 'GENERAL SITE VISIT REPORT', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                      [{ text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' },
                      { text: 'SHIFT:', style: 'headLabel' }, { text: report.shift, alignment: 'center' }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body1
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['60%', '20%', '20%'],
                    body: [
                      [{ text: 'SITE CHECKLIST INSPECTION', alignment: 'center', style: 'headLabel', colSpan: 3 }, {}, {}],
                      [{ text: 'Condition', style: 'headLabel' }, { text: 'Yes/No/NA', style: 'headLabel', alignment: 'center' }, { text: 'Comments', style: 'headLabel' }],

                      [{ text: 'Are alarms functional?', style: 'headLabel' }, { text: report.alarms, alignment: 'center' },
                      { text: report.com5 }],
                      [{ text: 'Are all radios in working order?', style: 'headLabel' }, { text: report.radios, alignment: 'center' },
                      { text: report.com6 }],
                      [{ text: 'Is the panic buttons available and in working order during the visit?', style: 'headLabel' }, { text: report.panic, alignment: 'center' },
                      { text: report.com7 }],
                      [{ text: 'Is the site phone available and operational?', style: 'headLabel' }, { text: report.phone, alignment: 'center' },
                      { text: report.com8 }],
                      [{ text: 'Is the guard patrol system operational and in use?', style: 'headLabel' }, { text: report.patrol, alignment: 'center' },
                      { text: report.com9 }],
                      [{ text: 'Is the torch available and working?', style: 'headLabel' }, { text: report.torch, alignment: 'center' },
                      { text: report.com10 }],
                      [{ text: 'Are the Electric Fence & Energizer in working order?', style: 'headLabel' }, { text: report.elec, alignment: 'center' },
                      { text: report.com11 }],
                      [{ text: 'Are all cameras in working order?', style: 'headLabel' }, { text: report.cameras, alignment: 'center' },
                      { text: report.com12 }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    body: [
                      [{ text: 'CLIENT MEETING', alignment: 'center', style: 'headLabel', colSpan: 2 }, {}],
                      [{ text: 'Client Name ', style: 'headLabel' }, { text: report.client, alignment: 'center' }],
                      [{ text: 'Client Discussion', style: 'headLabel' }, { text: report.discussion, alignment: 'center' }],
                      [{ text: 'Does the client have any issues with the service?', style: 'headLabel' }, { text: report.issues, alignment: 'center' }]
                    ]
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.clientSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'CLIENT SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadTrans(report) {
    this.processTrans(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve, reject) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 500,
                  alignment: 'center'
                },
                { text: 'TRANSPARENCY REPORT', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                      [{ text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' },
                      {}, {}],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.guardSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'GUARD SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadRiskAss(report) {
    this.getRisk(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve, reject) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 500,
                  alignment: 'center'
                },
                { text: 'RISK ASSESSMENT', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadUniform(report) {
    this.getUniform(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve, reject) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 500,
                  alignment: 'center'
                },
                { text: 'UNIFORM ORDER REPORT', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                    ]
                  },
                },
                {
                  style: 'table2',
                  table: {
                    widths: ['50%', '50%'],
                    height: 100,
                    body: [
                      [{ text: 'Name of Employee :', style: 'headLabel' }, { text: report.so }],
                      [{ text: 'Company Number:', style: 'headLabel' }, { text: report.companyNumber }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: this.body
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadClientInstruc(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'CLIENT INSTRUCTION REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Client Name :', style: 'headLabel' }, { text: report.client }],
                    [{ text: 'Details of Instruction:', style: 'headLabel' }, { text: report.details }],
                    [{ text: 'Person Responsible:', style: 'headLabel' }, { text: report.responsible }],
                    [{ text: 'Action By Date:', style: 'headLabel' }, { text: report.action }],
                  ]
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigClient,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'CLIENT SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadMeeting(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'CLIENT MEETING REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Client Name:', style: 'headLabel' }, { text: report.client }],
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
                    [{ text: 'Meeting Agenda:', style: 'headLabel' }, { text: report.reason }],
                    [{ text: 'Attendees:', style: 'headLabel' }, { text: report.attendees }],
                    [{ text: 'Apologies:', style: 'headLabel' }, { text: report.apologies }],
                    [{ text: 'Notes Arising from Previous Meeting Minutes:', style: 'headLabel' }, { text: report.prev }],
                    [{ text: 'Meeting Minutes:', style: 'headLabel' }, { text: report.minutes }],
                  ]
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigClient,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'CLIENT SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadDisc(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'DISCIPLINARY REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Name of Employee:', style: 'headLabel' }, { text: report.so }],
                    [{ text: 'Nature of Transgression:', style: 'headLabel' }, { text: report.nature }],
                    [{ text: 'Warning Type:', style: 'headLabel' }, { text: report.type }],
                    [{ text: 'Disciplinary Action:', style: 'headLabel' }, { text: report.action }],
                  ]
                },
              },
              '\nTHE SIGNATURE OF THE EMPLOYEE SIGNIFIES THAT THE EMPLOYEE RECEIVED THE NOTICE OF THE DISCIPLINARY ACTION, WHETHER OR NOT THE EMPLOYEE AGREES WITH THE ACTION \n\n IF THE EMPLOYEE REFUSED TO SIGN, I AS THE MANAGER/ SUPERVISOR HEREBY SIGN ACKNOWLEDGEMENT THAT THE CONTENTS OF THIS DISCIPLINARY WERE EXPLAINED TO HIM/ HER.\n',
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Witness:', style: 'headLabel' }, { text: report.witness }],
                  ]
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.empSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'EMPLOYEE SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.witSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'WITNESS / TRANSLATOR SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.manSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER / SUPERVISOR SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadLeave(report) {
    this.leavePhoto(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve, reject) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 300,
                  alignment: 'center'
                },
                { text: 'LEAVE APPLICATION', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                    ]
                  },
                },
                {
                  style: 'table2',
                  table: {
                    widths: ['50%', '50%'],
                    height: 100,
                    body: [
                      [{ text: 'Name of Employee:', style: 'headLabel' }, { text: report.so }],
                      [{ text: 'Type of Leave:', style: 'headLabel' }, { text: report.type }],
                      [{ text: 'Previously Accrued Leave:', style: 'headLabel' }, { text: report.accruedLeave }],
                      [{ text: 'Current Accrued Leave:', style: 'headLabel' }, { text: report.available }],
                      [{ text: 'Current Used Leave:', style: 'headLabel' }, { text: report.usedLeave }],
                      [{ text: 'Available Leave:', style: 'headLabel' }, { text: report.availableLeave }],
                      [{ text: 'From Date:', style: 'headLabel' }, { text: report.from }],
                      [{ text: 'To Date:', style: 'headLabel' }, { text: report.to }],
                      [{ text: 'Days Requested / Taken:', style: 'headLabel' }, { text: report.days }],
                      [{ text: 'Remaining Leave (If Approved):', style: 'headLabel' }, { text: report.remainingLeave }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['100%'],
                    headerRows: 1,
                    body: this.body
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.guardSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'SECURITY OFFICERS SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadCrimeInc(report) {
    return new Promise<void>((resolve, reject) => {
      this.getPhoto(report).then(() => {
        this.crimeIncBody1(report).then(() => {
          this.crimeIncBody2(report).then(() => {
            this.processCrimeInc(report);
            resolve();
          });
        });
      });
    });
  }

  processCrimeInc(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'CRIME INCIDENT REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.company, alignment: 'center' },
                    { text: 'MANAGER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
                    [{ text: 'Incident Date:', style: 'headLabel' }, { text: report.incDate }],
                    [{ text: 'Incident Time:', style: 'headLabel' }, { text: report.incTime }],
                    [{ text: 'Incident Category:', style: 'headLabel' }, { text: report.category }],
                    [{ text: 'Incident Type:', style: 'headLabel' }, { text: report.type }],
                    [{ text: 'Brief Details:', style: 'headLabel' }, { text: report.details }],
                  ]
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  headerRows: 1,
                  body: this.body2
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  headerRows: 1,
                  body: this.body3
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Estimated Value of Loss:', style: 'headLabel' }, { text: report.value }],
                    [{ text: 'Were any arrests made?', style: 'headLabel' }, { text: report.arrests }],
                    [{ text: 'Arrest Details:', style: 'headLabel' }, { text: report.arrestDetails }],
                    [{ text: 'Has Management been informed?', style: 'headLabel' }, { text: report.management }],
                    [{ text: 'Has the client been informed?', style: 'headLabel' }, { text: report.client }],
                    [{ text: 'Was an OB done?', style: 'headLabel' }, { text: report.obDone }],
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.incOb }],
                    [{ text: 'Reason no OB was done?', style: 'headLabel' }, { text: report.noOb }],
                  ]
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['30%', '70%'],
                  headerRows: 1,
                  body: this.body
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.manSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER / SUPERVISOR SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }


  downloadVehInspec(report) {
    return new Promise<void>((resolve, reject) => {
      this.getPhoto2(report).then(() => {
        this.processVehInspec(report);
        resolve();
      });
    });
  }

  processVehInspec(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'VEHICLE INSPECTION REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'COMPANY:', style: 'headLabel' }, { text: report.company, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.inspector, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                    [{ text: 'Registration:', style: 'headLabel' }, { text: report.registration, alignment: 'center' },
                    { text: 'Odometer Reading:', style: 'headLabel' }, { text: report.odometer, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['70%', '30%'],
                  height: 100,
                  body: [
                    [{ text: 'Vehicle Exterior', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}],
                    [{ text: 'Are the tyres in an acceptable condition?', style: 'headLabel' }, { text: report.tires, alignment: 'center' }],
                    [{ text: 'Are the Windscreen Wipers working correctly?', style: 'headLabel' }, { text: report.wipers, alignment: 'center' }],
                    [{ text: 'Are the Headlights Working Correctly?', style: 'headLabel' }, { text: report.headlights, alignment: 'center' }],
                    [{ text: 'Are the Tail and Break Lights Working?', style: 'headLabel' }, { text: report.tail, alignment: 'center' }],
                    [{ text: 'Are the Indicators Working Correctly?', style: 'headLabel' }, { text: report.indicators, alignment: 'center' }],
                    [{ text: 'Are the Hazard Lights Working Correctly?', style: 'headLabel' }, { text: report.hazards, alignment: 'center' }],
                    [{ text: 'Are the Number Plates Correct and Undamaged?', style: 'headLabel' }, { text: report.plates, alignment: 'center' }],
                    [{ text: 'Is the License Disc Still Valid?', style: 'headLabel' }, { text: report.disc, alignment: 'center' }],
                    [{ text: 'Are the Oil and Water Levels Sufficient?', style: 'headLabel' }, { text: report.oil, alignment: 'center' }],
                    [{ text: 'Is the Exterior Clean and Undamaged?', style: 'headLabel' }, { text: report.exterior, alignment: 'center' }],

                    [{ text: 'Vehicle Interior', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}],
                    [{ text: 'Are the Brakes Working Correctly?', style: 'headLabel' }, { text: report.breaks, alignment: 'center' }],
                    [{ text: 'Is the Handbrake Working Correctly?', style: 'headLabel' }, { text: report.handbreak, alignment: 'center' }],
                    [{ text: 'Is the Clutch Working Correctly?', style: 'headLabel' }, { text: report.clutch, alignment: 'center' }],
                    [{ text: 'Are the Mirrors Correct and Undamaged?', style: 'headLabel' }, { text: report.mirrors, alignment: 'center' }],
                    [{ text: 'Is the Hooter Working Correctly?', style: 'headLabel' }, { text: report.hooter, alignment: 'center' }],
                    [{ text: 'Are the Interior Lights Working Correctly?', style: 'headLabel' }, { text: report.lights, alignment: 'center' }],
                    [{ text: 'Are the Safety Belts Working Correctly?', style: 'headLabel' }, { text: report.belts, alignment: 'center' }],
                    [{ text: 'Is the Spair Wheel Available and in Good Condition?', style: 'headLabel' }, { text: report.spare, alignment: 'center' }],
                    [{ text: 'Are the Spanner & Jack Available?', style: 'headLabel' }, { text: report.jack, alignment: 'center' }],
                    [{ text: 'Is the Interior Clean and Undamaged?', style: 'headLabel' }, { text: report.interior, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['100%'],
                  headerRows: 1,
                  body: this.body
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['100%'],
                  headerRows: 1,
                  body: this.body1
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.signature,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'INSPECTOR SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadTrain(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'TRAINING FORM', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
                    [{ text: 'Shift:', style: 'headLabel' }, { text: report.shift }],
                    [{ text: 'Name of Employee:', style: 'headLabel' }, { text: report.so }],
                    [{ text: 'Type of Training:', style: 'headLabel' }, { text: report.type }],
                    [{ text: 'Reason For Training:', style: 'headLabel' }, { text: report.reason }],
                    [{ text: 'How long has the Employee been on Site:', style: 'headLabel' }, { text: report.length }],
                    [{ text: 'Is the Employee fit for the Duties of this Site:', style: 'headLabel' }, { text: report.fit }],
                    [{ text: 'Is there a Job Description on Site:', style: 'headLabel' }, { text: report.jd }],
                    [{ text: 'Did the Employee Sign the Job Description:', style: 'headLabel' }, { text: report.signJD }],
                    [{ text: 'Does he/ she understand the site Procedures:', style: 'headLabel' }, { text: report.procedures }],
                    [{ text: 'Summary of Training:', style: 'headLabel' }, { text: report.summary }],
                  ]
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'TRAINER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigOfficer,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'EMPLOYEE SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadTenant(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'TENANT VISIT REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Tenant Business Name:', style: 'headLabel' }, { text: report.name }],
                    [{ text: 'Tenant Representative:', style: 'headLabel' }, { text: report.rep }],
                    [{ text: 'Type of Locks & Handle:', style: 'headLabel' }, { text: report.locks }],
                    [{ text: 'Hasp & Staple (Moon Lock):', style: 'headLabel' }, { text: report.hasp }],
                    [{ text: 'Lock up Safes:', style: 'headLabel' }, { text: report.safes }],
                    [{ text: 'Lock up & Closing Time Procedures:', style: 'headLabel' }, { text: report.procedures }],
                    [{ text: 'Panic Buttons connected to Security:', style: 'headLabel' }, { text: report.panic }],
                    [{ text: 'Does the Tenant have CCTV Cameras:', style: 'headLabel' }, { text: report.cctv }],
                    [{ text: 'Are the Cameras Working:', style: 'headLabel' }, { text: report.working }],
                    [{ text: 'Does the Tenant have Alarms:', style: 'headLabel' }, { text: report.alarms }],
                    [{ text: 'Are the Alarms Working:', style: 'headLabel' }, { text: report.aworking }],
                    [{ text: 'Have the Alarms been Tested:', style: 'headLabel' }, { text: report.tested }],
                    [{ text: 'Is there in-store Security:', style: 'headLabel' }, { text: report.security }],
                    [{ text: 'Action Items:', style: 'headLabel' }, { text: report.action }],
                    [{ text: 'Action By:', style: 'headLabel' }, { text: report.by }],
                    [{ text: 'Rating:', style: 'headLabel' }, { text: report.rating }],
                    [{ text: 'Comments:', style: 'headLabel' }, { text: report.comments }],
                  ]
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigClient,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'TENANT REP SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadOB(report) {
    return new Promise<void>((resolve, reject) => {
      this.getPhoto(report).then(() => {
        this.processOB(report);
        resolve();
      });
    });
  }

  processOB(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'OB ENTRY REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Occurence Date:', style: 'headLabel' }, { text: report.incDate }],
                    [{ text: 'Occurence Time:', style: 'headLabel' }, { text: report.incTime }],
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.number }],
                    [{ text: 'Category:', style: 'headLabel' }, { text: report.category }],
                    [{ text: 'Type:', style: 'headLabel' }, { text: report.type }],
                    [{ text: 'Occurence Description:', style: 'headLabel' }, { text: report.description }],
                  ]
                },
              },
              { text: 'Photos', style: 'subheader', pageBreak: 'before' },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  headerRows: 1,
                  body: this.body
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              subheader: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }


  downloadGenInc(report) {
    return new Promise<void>((resolve, reject) => {
      this.getPhoto(report).then(() => {
        this.processGenInc(report);
        resolve();
      });
    });
  }

  processGenInc(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'GENERAL INCIDENT REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Incident Date:', style: 'headLabel' }, { text: report.incDate }],
                    [{ text: 'Incident Time:', style: 'headLabel' }, { text: report.incTime }],
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
                    [{ text: 'Type of Incident:', style: 'headLabel' }, { text: report.type }],
                    [{ text: 'Description of Incident:', style: 'headLabel' }, { text: report.description }],
                    [{ text: 'Action Taken:', style: 'headLabel' }, { text: report.action }],
                    [{ text: 'Recommendations:', style: 'headLabel' }, { text: report.recommendations }],
                  ]
                },
              },
              { text: 'Photos', style: 'subheader', pageBreak: 'before' },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  headerRows: 1,
                  body: this.body
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              subheader: {
                fontSize: 14,
                bold: true,
                alignment: 'center',
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadIncidentNot(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve, reject) => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'INCIDENT NOTIFICATION REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: report.user, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table2',
                table: {
                  widths: ['50%', '50%'],
                  height: 100,
                  body: [
                    [{ text: 'Incident Date:', style: 'headLabel' }, { text: report.incDate }],
                    [{ text: 'Incident Time:', style: 'headLabel' }, { text: report.incTime }],
                    [{ text: 'OB Number:', style: 'headLabel' }, { text: report.ob }],
                    [{ text: 'Incident Type:', style: 'headLabel' }, { text: report.type }],
                    [{ text: 'Reported By:', style: 'headLabel' }, { text: report.by }],
                    [{ text: 'Reported To:', style: 'headLabel' }, { text: report.to }],
                    [{ text: 'Nature of Incident:', style: 'headLabel' }, { text: report.description }],
                  ]
                },
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.sigUser,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  downloadSITE(report) {
    this.checkSig(report).then(() => {
      return new Promise<void>((resolve) => {
        this.getCompanyInfo().then(() => {
          var incidentHeader;
          var incidentTable;
          var guard;
          var riskHeader;
          var riskBody;
          var riskBody2;
          var riskBody3;
          var guardHeader;
          var clientSig;
          const incDate = moment(report.incDateTime).format('DD/MM/YYYY');
          var manSig;
          var gHead;

          var garr = []

          if (report.manSig !== '') {
            manSig = {
              border: [false, false, false, true],
              margin: [0, 70, 0, 0],
              image: report.manSig,
              width: 150,
              alignment: 'center',
            }
          } else {
            manSig = '';
          }


          if (report.duty > 0) {
            gHead = {
              style: 'table',
              table: {
                widths: ['100%'],
                body: [
                  [{ text: 'SECURITY OFFICER ON DUTY', bold: true, alignment: 'center', fillColor: '#969696' }],
                ]
              },
            }

              report.guards.forEach((element) => {

                garr.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: element.guardName }]);

                if (element.guardPhoto !== '' && element.guardPhoto !== undefined) {
                  garr.push([{ text: 'Photo of Staff Member', style: 'headLabel', alignment: 'center' }, { image: element.guardPhoto, width: 100, alignment: 'center' }]);
                }
                if (element.guardSig !== '' && element.guardSig !== undefined) {
                  garr.push([{ text: 'Guard Signature', style: 'headLabel' },
                  { image: element.guardSig, width: 100, alignment: 'center' }]);
                }

              });

          }
          if (report.clientSig !== '') {
            clientSig = {
              border: [false, false, false, true],
              margin: [0, 70, 0, 0],
              image: report.clientSig,
              width: 150,
              alignment: 'center',
            }
          } else {
            clientSig = '';
          }
          if (report.incidents === 'Yes') {
            incidentHeader = {
              style: 'table',
              table: {
                widths: ['100%'],
                body: [
                  [{ text: 'INCIDENT DETAILS', bold: true, alignment: 'center', fillColor: '#969696' }],
                ]
              },
            }
            incidentTable = {
              style: 'table',
              table: {
                widths: ['30%', '70%'],
                body: [
                  [{ text: 'TYPE OF INCIDENT:', style: 'headLabel' }, { text: report.incType, alignment: 'center' }],
                  [{ text: 'DATE OF INCIDENT:', style: 'headLabel' }, { text: incDate, alignment: 'center' }],
                  [{ text: 'REPORT SUBMITTED?', style: 'headLabel' }, { text: report.incReported, alignment: 'center' }],
                  [{ text: 'FOLLOW-UP ACTION TAKEN:', style: 'headLabel' }, { text: report.incActions, alignment: 'center' }],
                ]
              },
            }
          }
          if (report.risk === 'Yes') {
            riskHeader = {
              style: 'table',

              table: {
                widths: ['100%'],
                body: [
                  [{ text: 'IDENTIFIED RISKS', bold: true, alignment: 'center', fillColor: '#969696' }],
                ]
              },
            }
          }
          if (report.risk === 'Yes' && report.photo1 !== '' && report.photo2 === '') {
            riskBody = {
              style: 'table',
              pageBreak: 'after',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [{ image: report.photo1, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskDesc1 }],
                  [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskRec1, rowSpan: 7 }],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                ]
              }
            }
          }
          if (report.risk === 'Yes' && report.photo1 !== '' && report.photo2 !== '' && report.photo3 === '') {
            riskBody = {
              style: 'table',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [{ image: report.photo1, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskDesc1 }],
                  [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskRec1, rowSpan: 7 }],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                ]
              }
            }
            riskBody2 = {
              style: 'table',
              pageBreak: 'after',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [{ image: report.photo2, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskDesc2 }],
                  [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskRec2, rowSpan: 7 }],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                ]
              }
            }
          }
          if (report.risk === 'Yes' && report.photo1 !== '' && report.photo2 !== '' && report.photo3 !== '') {
            riskBody = {
              style: 'table',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [{ image: report.photo1, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskDesc1 }],
                  [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskRec1, rowSpan: 7 }],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                ]
              }
            }
            riskBody2 = {
              style: 'table',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [{ image: report.photo2, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskDesc2 }],
                  [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskRec2, rowSpan: 7 }],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                ]
              }
            }
            riskBody3 = {
              style: 'table',
              pageBreak: 'after',
              table: {
                widths: ['50%', '50%'],
                body: [
                  [{ image: report.photo3, fit: [250, 250], alignment: 'center', rowSpan: 10 }, { text: 'RISK DETECTED:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskDesc3 }],
                  [{}, { text: 'RECOMMENDATION:', bold: true, alignment: 'center' }],
                  [{}, { text: report.riskRec3, rowSpan: 7 }],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                  [{}, {}],
                ]
              }
            }
          }
          var docDefinition = {
            pageSize: 'A4',
            pageMargins: [10, 10, 10, 10],
            content: [
              {
                image: this.header,
                width: 480,
                alignment: 'center'
              },
              { text: 'SITE VISIT REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'DATE & TIME & DURATION:', style: 'headLabel' }, { text: report.date + ' ' + report.time + ' ' + report.timeStamp, alignment: 'center' }, { text: 'OB NUMBER:', style: 'headLabel' }, { text: report.ob, alignment: 'center' }],
                    [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' }, { text: 'MANAGER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                    [{ text: 'ANY INCIDENTS REPORTED SINCE LAST VISIT?', style: 'headLabel', colSpan: 3 }, {}, {}, { text: report.incidents, alignment: 'center' }],
                  ]
                },
              },
              incidentHeader,
              incidentTable,
              gHead,
              guardHeader,
              {
                style: 'table',
                table: {
                    widths: ['50%', '50%'],
                    headerRows: 1,
                    body: garr
                },
            },
              // guard,
              riskHeader,
              riskBody,
              riskBody2,
              riskBody3,
              {
                style: 'table',
                table: {
                  widths: ['100%'],
                  body: [
                    [{ text: 'SITE INSPECTION CHECKLIST', bold: true, alignment: 'center', fillColor: '#969696' }],
                  ]
                },
              },
              {
                style: 'table5',
                table: {
                  widths: ['70%', '30%'],
                  body: [
                    [{ text: 'ARE ALL PARKING LIGHTS WORKING?', bold: true }, { text: report.parking, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com0, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE THERE JOB DESCRIPTIONS ON SITE?', bold: true }, { text: report.jobDesc, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com13, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE DUTY ROSTER ON SITE?', bold: true }, { text: report.dutyRost, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com14, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE GUARDS SHCEDULED FOR TRAINING?', bold: true }, { text: report.trainingShed, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com15, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE ALL ALARMS FUNCTIONAL?', bold: true }, { text: report.alarms, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com1, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE SECURITY OFFICERS UNIFORM NEAT AND SERVICEABLE?', bold: true }, { text: report.uniforms, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com2, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE GUARDROOM NEAT AND TIDY?', bold: true }, { text: report.guardroom, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com3, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE OB BOOK COMPLETED?', bold: true }, { text: report.obComplete, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com4, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE ALL REGISTERS IN USE AND UP-TO-DATE?', bold: true }, { text: report.registers, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com5, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE ALL RADIOS IN WORKING ORDER?', bold: true }, { text: report.radios, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com6, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE PANIC BUTTONS AVAILABLE AND IN WORKING ORDER?', bold: true }, { text: report.panic, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com7, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE SITE PHONE AVAILABLE AND OPERATIONAL?', bold: true }, { text: report.phone, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com8, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE GUARD PATROL SYSTEM OPERATIONAL AND IN USE?', bold: true }, { text: report.patrol, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com9, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE TORCH AVAILABLE ANDWORKING?', bold: true }, { text: report.torch, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com10, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'ARE ALL CAMERAS IN WORKING ORDER?', bold: true }, { text: report.cameras, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com12, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'IS THE ELECTRICAL FENCE & ENERGIZER IN WORKING ORDER?', bold: true }, { text: report.elec, alignment: 'center' }],
                    [{ text: 'COMMENTS', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.com11, colSpan: 2, color: '#ff0000' }],
                    [{ text: 'WHEN LAST WAS THE ELECTRICAL FENCE TESTED?', bold: true }, { text: report.elecTested, alignment: 'center' }],
                    [{ text: 'WHAT WAS THE RESPONSE TIME?', bold: true }, { text: report.responseTime, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['100%'],
                  body: [
                    [{ text: 'CLIENT MEETING', bold: true, alignment: 'center', fillColor: '#969696' }],
                  ]
                },
              },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [{ text: 'CLIENT NAME:', bold: true }, { text: report.client, alignment: 'center' }],
                    [{ text: 'CLIENT DISCUSSION:', bold: true, alignment: 'center', colSpan: 2 }, {}],
                    [{ text: report.discussion, rowSpan: 10, colSpan: 2 }, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{}, {}],
                    [{ text: 'DOES THE CLIENT HAVE ANY ISSUES WITH THE SERVICE?', bold: true }, { text: report.status, alignment: 'center' }],
                  ]
                },
              },
              {
                style: 'table',
                table: {
                  widths: [150, 200, 150],
                  body: [
                    [
                      manSig,
                      {
                        border: [false, false, false, false],
                        text: ''
                      },
                      clientSig,
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'USER SIGNATURE',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: ''
                      },
                      {
                        border: [false, false, false, false],
                        text: 'CLIENT SIGNATURE',
                        alignment: 'center',
                      }
                    ],
                  ]
                }
              }
            ],
            styles: {
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 5, 0, 5]
              },
              subheader: {
                alignment: 'center',
                fontSize: 18,
                bold: true,
                margin: [0, 5, 0, 5]
              },
              headLabel: {
                bold: true
              },
              table: {
                margin: [0, 5, 0, 5]
              },
              table5: {
                fontSize: 10,
              },
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }


  downloadSiteVisit(report) {
    this.body = [];
    this.manSig = {};
    this.clientSig = {};
    console.log(report.key)
    return new Promise<void>((resolve, reject) => {
      this.getSiteVisit(report).then(() => {
        this.processSiteVisit(report);
        resolve();
      });
    });
  }

  getSiteVisit(report) {
    if (report.manSig !== '' && report.manSig !== undefined && !report.manSig.startsWith('http')) {
      this.manSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.manSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      this.manSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }
    if (report.clientSig !== '' && report.clientSig !== undefined && !report.manSig.startsWith('http')) {
      this.clientSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        image: report.clientSig,
        width: 150,
        alignment: 'center',
      };
    } else {
      this.clientSig = {
        border: [false, false, false, true],
        margin: [0, 70, 0, 0],
        text: '',
        alignment: 'center',
      };
    }
    return new Promise<void>((resolve, reject) => {
      this.body.push([{ text: 'OB Number', style: 'headLabel' }, { text: report.ob }]);
      this.body.push([{ text: 'Number of Officers on Duty:', style: 'headLabel' }, { text: report.duty }]);
      if (report.duty > 0) {
        this.body.push([{ text: 'Staff Member on Duty', style: 'headLabel' }, { text: report.so }]);
        if (report.photo !== '' && report.photo !== undefined) {
          this.body.push([{ text: 'Photo of Staff Member', style: 'headLabel', alignment: 'center' },
          { image: report.photo, width: 100, alignment: 'center' }]);
        }
        if (report.guardSig !== '' && report.guardSig !== undefined) {
          this.body.push([{ text: 'Guard Signature', style: 'headLabel' },
          { image: report.guardSig, width: 100, alignment: 'center' }]);
        }
      }
      this.body.push([{ text: 'Any Incidents Reported Since Last Visit?', style: 'headLabel' }, { text: report.incidents }]);
      if (report.incidents === 'Yes') {
        this.body.push([{ text: 'Type of Incident', style: 'headLabel' }, { text: report.incType }]);
        this.body.push([{ text: 'Date', style: 'headLabel' }, { text: report.incDateTime }]);
        this.body.push([{ text: 'Reports Submitted?', style: 'headLabel' }, { text: report.incReported }]);
        this.body.push([{ text: 'Follow-up Actions Taken?', style: 'headLabel' }, { text: report.incActions }]);
      }
      this.body.push([{ text: 'Risk Detected During Site Visit?', style: 'headLabel' }, { text: report.risk }]);
      if (report.risk === 'Yes') {
        if (report.photo1 !== '' && report.photo1 !== undefined) {
          this.body.push([{ text: 'RISK 1', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
          this.body.push([{ text: 'Risk 1 Photo', style: 'headLabel', alignment: 'center' },
          { image: report.photo1, width: 100, alignment: 'center' }]);
          this.body.push([{ text: 'Risk Detected', style: 'headLabel' }, { text: report.riskDesc1 }]);
          this.body.push([{ text: 'Recommendation', style: 'headLabel' }, { text: report.riskRec1 }]);
        }
        if (report.photo2 !== '' && report.photo2 !== undefined) {
          this.body.push([{ text: 'RISK 2', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
          this.body.push([{ text: 'Risk 2 Photo', style: 'headLabel', alignment: 'center' },
          { image: report.photo2, width: 100, alignment: 'center' }]);
          this.body.push([{ text: 'Risk Detected', style: 'headLabel' }, { text: report.riskDesc2 }]);
          this.body.push([{ text: 'Recommendation', style: 'headLabel' }, { text: report.riskRec2 }]);
        }
        if (report.photo3 !== '' && report.photo3 !== undefined) {
          this.body.push([{ text: 'RISK 3', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
          this.body.push([{ text: 'Risk 3 Photo', style: 'headLabel', alignment: 'center' },
          { image: report.photo3, width: 100, alignment: 'center' }]);
          this.body.push([{ text: 'Risk Detected', style: 'headLabel' }, { text: report.riskDesc3 }]);
          this.body.push([{ text: 'Recommendation', style: 'headLabel' }, { text: report.riskRec3 }]);
        }
      }
      this.body.push([{ text: 'CHECKLIST INSPECTION', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Are all parking lights working?', style: 'headLabel' }, { text: report.parking }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com0 }]);
      this.body.push([{ text: 'Job Description on Site?', style: 'headLabel' }, { text: report.jobDesc }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com13 }]);
      this.body.push([{ text: 'Duty Roster on Site?', style: 'headLabel' }, { text: report.dutyRost }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com14 }]);
      this.body.push([{ text: 'Guards Scheduled for Training?', style: 'headLabel' }, { text: report.trainingShed }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com15 }]);
      this.body.push([{ text: 'Are alarms Functional?', style: 'headLabel' }, { text: report.alarms }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com1 }]);
      this.body.push([{ text: 'Is the Security officer’s uniform neat and Serviceable?', style: 'headLabel' }, { text: report.uniforms }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com2 }]);
      this.body.push([{ text: 'Is the guardroom neat and tidy?', style: 'headLabel' }, { text: report.guardroom }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com3 }]);
      this.body.push([{ text: 'Is the O.B book completed?', style: 'headLabel' }, { text: report.obComplete }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com4 }]);
      this.body.push([{ text: 'Is all registers in use and up to date?', style: 'headLabel' }, { text: report.registers }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com5 }]);
      this.body.push([{ text: 'Are all radios in working order?', style: 'headLabel' }, { text: report.radios }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com6 }]);
      this.body.push([{ text: 'Is the panic buttons Available and in working order during the visit?', style: 'headLabel' },
      { text: report.panic }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com7 }]);
      this.body.push([{ text: 'Is the site phone available and operational?', style: 'headLabel' }, { text: report.phone }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com8 }]);
      this.body.push([{ text: 'Is the Guard patrol system operational and in use?', style: 'headLabel' }, { text: report.patrol }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com9 }]);
      this.body.push([{ text: 'Is the torch available and working?', style: 'headLabel' }, { text: report.torch }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com10 }]);
      this.body.push([{ text: 'Is the Electric Fence & Energizer in working order?', style: 'headLabel' }, { text: report.elec }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com11 }]);
      this.body.push([{ text: 'When was the last time the Electric Fence Tested?', style: 'headLabel' }, { text: report.elecTested }]);
      this.body.push([{ text: 'What was the response time?', style: 'headLabel' }, { text: report.responseTime }]);
      this.body.push([{ text: 'Are all cameras in working order?', style: 'headLabel' }, { text: report.cameras }]);
      this.body.push([{ text: 'Comments', style: 'headLabel' }, { text: report.com12 }]);

      this.body.push([{ text: 'CLIENT MEETING', style: 'headLabel', colSpan: 2, alignment: 'center' }, {}]);
      this.body.push([{ text: 'Client Name ', style: 'headLabel' }, { text: report.client }]);
      this.body.push([{ text: 'Client Discussion', style: 'headLabel' }, { text: report.discussion }]);
      this.body.push([{ text: 'Does the client have any Issues with the Service?', style: 'headLabel' }, { text: report.issues }]);
      resolve();
    });
  }

  processSiteVisit(report) {
    this.getSiteVisit(report).then(() => {
      this.checkSig(report).then(() => {
        return new Promise<void>((resolve) => {
          this.getCompanyInfo().then(() => {
            var docDefinition = {
              content: [
                {
                  image: this.header,
                  width: 300,
                  alignment: 'center'
                },
                { text: 'SITE VISIT REPORT', style: 'header' },
                {
                  style: 'table',
                  table: {
                    widths: ['25%', '25%', '25%', '25%'],
                    body: [
                      [{ text: 'SITE:', style: 'headLabel' }, { text: report.site, alignment: 'center' },
                      { text: 'USER:', style: 'headLabel' }, { text: report.manager, alignment: 'center' }],
                      [{ text: 'DATE:', style: 'headLabel' }, { text: report.date, alignment: 'center' },
                      { text: 'TIME:', style: 'headLabel' }, { text: report.time, alignment: 'center' }],
                      [{ text: 'END TIME:', style: 'headLabel' }, { text: report.timeEnd, alignment: 'center' },
                      { text: 'VISIT DURATION:', style: 'headLabel' }, { text: report.timeStamp, alignment: 'center' }],
                    ]
                  },
                },
                {
                  style: 'table',
                  table: {
                    widths: ['50%', '50%'],
                    headerRows: 0,
                    body: this.body
                  },
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.manSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'MANAGER SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
                {
                  style: 'table3',
                  table: {
                    widths: [150, 1],
                    body: [
                      [
                        this.clientSig,
                        {}
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: 'CLIENT SIGNATURE',
                          alignment: 'center',
                        },
                        {}
                      ],
                    ]
                  },
                  layout: {
                    defaultBorder: false,
                  }
                },
              ],
              styles: {
                headLabel: {
                  color: this.color,
                  bold: true
                },
                header: {
                  fontSize: 18,
                  bold: true,
                  alignment: 'center',
                  margin: [0, 20, 0, 20]
                },
                notes: {
                  margin: [0, 20, 0, 20]
                },
                subheader: {
                  alignment: 'center',
                  color: this.color,
                  fontSize: 14,
                  bold: true,
                  margin: [0, 15, 0, 5]
                },
                table: {
                  margin: [0, 5, 0, 15]
                },
                table2: {
                  fontSize: 10,
                },
                table3: {
                  margin: [0, 10, 0, 10]
                },
                tableHeader: {
                  bold: true,
                  fontSize: 13,
                  color: 'black'
                }
              },
              defaultStyle: {
                // alignment: 'justiSfy'
              }
            };
            this.generatePDF(docDefinition);
            resolve();
          });
        });
      });
    });
  }

  downloadAllVisits(finalSites) {
    return new Promise<void>((resolve, reject) => {
      this.body = [];
      this.pdfDoc.name = 'Site Visit Summary';
      this.pdfDoc.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');

      this.body.push([{ text: 'Site Visit Date', style: 'headLabel' }, { text: 'Site Visit completed by', style: 'headLabel' },
      { text: 'Site', style: 'headLabel' }, { text: 'Company', style: 'headLabel' }, { text: 'Status', style: 'headLabel' },
      { text: 'Risks Identified', style: 'headLabel' }]);

      finalSites.forEach(site => {
        this.popVisits(site);
      });
      setTimeout(() => {
        this.processVisits(finalSites).then(() => {
          resolve();
        });
      }, 3000);
    });
  }

  popVisits(visit) {
    return new Promise<void>((resolve, reject) => {
      this.body.push([{ text: visit.date }, { text: visit.recipient }, { text: visit.site }, { text: visit.company },
      { text: visit.status }, { text: visit.risks }]);
      resolve();
    });
  }

  processVisits(finalVisits) {
    return new Promise<void>((resolve, reject) => {
      this.getCompanyInfo().then(() => {
        var docDefinition = {
          pageSize: 'A4',
          margin: [0, 1, 0, 1],
          pageOrientation: 'landscape',
          content: [
            {
              image: this.header,
              width: 500,
              alignment: 'center'
            },
            { text: 'SITE VISIT SUMMARY', style: 'header' },
            {
              style: 'matrix',
              alignment: 'center',
              table: {
                headerRows: 1,
                body: this.body
              },
            },
          ],
          styles: {
            matrix: {
              fontSize: 7,
              margin: [0, 5, 0, 5]
            },
            headLabel: {
              color: this.color,
              bold: true
            },
            header: {
              fontSize: 18,
              bold: true,
              alignment: 'center',
              margin: [0, 20, 0, 20]
            },
            notes: {
              margin: [0, 20, 0, 20]
            },
            table: {
              margin: [0, 5, 0, 15]
            },
            table2: {
              fontSize: 10,
            },
            table3: {
              margin: [0, 10, 0, 10]
            },
            tableHeader: {
              bold: true,
              fontSize: 13,
              color: 'black'
            }
          },
          defaultStyle: {
            // alignment: 'justiSfy'
          }
        };
        this.generatePDF(docDefinition);
        resolve();
      });
    });
  }

  checkImages(report) {
    return new Promise<void>((resolve, reject) => {
      // Company Logo/Header
      if (this.header !== '' && this.header !== undefined) {
        if ((this.header.startsWith('https'))) {

        }
      } else {
        resolve();
      }
    });
  }

  downloadAOD(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'ACKNOWLEDGEMENT OF DEBT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['35%', '15%', '40%', '10%'],
                  body: [
                    [{ text: `I the undersigned (full name)`, style: 'headLabel', colSpan: 2 }, {}, { text: `                      ${report.name}                   `, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: 'Identification number ', style: 'headLabel', colSpan: 2 }, {}, { text: `               ${report.id}              `, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: 'Residential address: ', style: 'headLabel', colSpan: 2 }, {}, { text: `             ${report.address}             \n\n`, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: 'Hereby acknowledge being indebted to Thompsons Security Group in the sum of, R ', style: 'headLabel', colSpan: 3 }, {}, {}, { text: report.sum, style: 'headLabel', decoration: 'underline' }],
                    [{ text: '(in words) ', style: 'headLabel' }, { text: `                ${report.sumWords}                    \n\n`, style: 'headLabel', colSpan: 3, decoration: 'underline' }, {}, {}],
                    [{ text: 'Being the capital sum for ', style: 'headLabel', colSpan: 2 }, {}, { text: `             ${report.capital}             \n\n`, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: 'I agree to repay the said sum R  ', style: 'headLabel' }, { text: report.repay, style: 'headLabel', decoration: 'underline' }, { text: 'in monthly instalments of R ', style: 'headLabel' }, { text: report.instal, style: 'headLabel', decoration: 'underline' }],
                    [{ text: '(amount in words) ', style: 'headLabel' }, { text: `                   ${report.instalWords}                    `, style: 'headLabel', colSpan: 3, decoration: 'underline' }, {}, {}],
                    [{ text: 'Commencing from date ', style: 'headLabel' }, { text: `    ${report.date}      `, style: 'headLabel', decoration: 'underline' }, { text: 'and to this end hereby authorize and empower', style: 'headLabel', colSpan: 2 }, {}],
                    [{ text: 'Thompsons Security Group to deduct each month from the numeration due to me. The said months an instalment until the full sum has been fully repaid.', style: 'headLabel', colSpan: 4 }, {}, {}, {}],
                    [{ text: 'The debt incurred is in respect of', style: 'headLabel', colSpan: 2 }, {}, { text: `               ${report.respect}               \n\n`, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: 'I authorize and empower Thompsons Security Group to deduct from any amount owing to Thompsons Security Group by me the full balance of any sum still Payable under the said debt upon termination of employment.\n', style: 'headLabel', colSpan: 3 }, {}, {}, {}],

                  ]
                },
                layout: 'noBorders'
              },
              {
                style: 'table',
                table: {
                  widths: ['30%', '15%', '5%', '5%', '15%', '30%'],
                  body: [
                    [{ text: `This done and signed at`, style: 'headLabel' }, { text: `${report.time}`, decoration: 'underline', style: 'headLabel', }, { text: `this`, style: 'headLabel' }, { text: `${report.day}`, style: 'headLabel', decoration: 'underline' }, { text: `day of`, style: 'headLabel' }, { text: ` ${report.month}`, decoration: 'underline', style: 'headLabel', }],

                  ]
                },
                layout: 'noBorders'
              },
              {
                style: 'table3',
                table: {
                  widths: [250, 1, 250, 1],
                  body: [
                    [
                      this.signature,
                      {},
                      this.witSig,
                      {},
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'SIGNATURE',
                        alignment: 'center',
                      },
                      {},
                      {
                        border: [false, false, false, false],
                        text: 'WITNESS',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15],
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  //////////
  injury(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'INJURY / CASUALTY', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 345],
                  body: [
                    ['CASUALTIES AT:', `${report.at}`],
                    ['AS A RESULT OF', `${report.result}`],
                    ['REPORTED ON :', `${report.report2}`],
                    ['FROM:', `${report.from}`],
                    ['DATE OF REPORT:', `${report.date}`],
                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 60, 285],
                  body: [
                    ['Notified Ambulance Service:', `${report.ambulancetime}`, `${report.ambulance}`],
                    ['Activated first aid team (specify):', `${report.aidtime}`, `${report.aid}`],
                    ['Alerted Tenants in area:', `${report.tenanttime}`, `${report.tenant}`],
                    ['Established casualty section, Specify where :', `${report.esttime}`, `${report.est}`],
                    ['Nearest Provincial Hospital Notified:', `${report.hospitaltime}`, `${report.hospital}`],
                    ['Number of casualties evacuated:', `${report.casualtiestime}`, `${report.casualties}`],
                    ['Next of kin notified:', `${report.kintime}`, `${report.kin}`],
                    ['Any other items (specify):', `${report.othertime}`, `${report.other}`],

                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [
                    [{ text: `ADDITIONAL INFORMATION: `, bold: true }],
                    [`${report.add}`],

                  ]
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.supervisorSign,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Signature',
                        alignment: 'center',
                      },
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Compiled by: ${report.compile}`,
                        alignment: 'center',
                      },
                      {}
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                // color: color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  appeal(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          let equipBody = []
          report.grounds.forEach((element) => {
            equipBody.push([element]) // 100, 200, 300
          });

          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              {
                style: 'tableExample',
                table: {
                  widths: [115, 125, 100, 120],
                  body: [
                    ['Employee', `${report.employeeName}`, 'Date', `${report.date}`],
                    ['Employee no', `${report.employeeNumber}`, 'position', `${report.employeePosition}`]
                  ]
                }
              },

              { text: 'Grounds for Appeal', style: 'subheader' },

              {
                style: 'tableExample',
                table: {
                  widths: [460],

                  body: equipBody
                }
              },
              {
                style: 'tableExample',
                table: {
                  widths: [460],

                  body: [
                    [{
                      text: 'Details for Appeal:', style: 'subheader', alignment: 'center'
                    }],

                  ]
                }
              },


              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [
                    [{ text: 'Date of disciplinary hearing:', bold: true }], [`${report.hearingDate}`],
                    [{ text: 'Nature of disciplinary action taken: ', bold: true }], [`${report.actionTaken}`],
                    [{ text: 'Give your reasons for lodging the appeal:', bold: true }], [`${report.reasons}`],
                    [{ text: 'Relieve sought: ', bold: true }], [`${report.relieve}`],
                  ]
                }
              },


              { text: 'Recieved by employeer', style: 'subheader' },


              {
                style: 'table3',
                table: {
                  widths: [150, 150],
                  body: [
                    [
                      this.manSig,
                      this.witSig
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Supervisor Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'Employee Signature',
                        alignment: 'center',
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Supervisor Name: ${report.user}`,
                        alignment: 'center',
                      },

                      {
                        border: [false, false, false, false],
                        text: `Employee Name: ${report.employeeName}`,
                        alignment: 'center',
                      },
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  sitetemperature(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          let equipBody = [[{ text: 'Comp #', bold: true }, { text: 'Site', bold: true }, { text: 'Temperatiure', bold: true }]]

          report.site.forEach((element) => {
            equipBody.push([element.compNumber, element.site, element.temp]) /// 100, 200, 300
          });


          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              {
                style: 'tableExample',
                table: {
                  widths: [115, 300],
                  body: [
                    [{ text: 'Ops Area', bold: true }, `${report.area}`],
                    [{ text: 'Supervisor', bold: true }, `${report.user}`],
                    [{ text: 'Date', bold: true }, `${report.date}`]
                  ]
                }
              },
              {
                style: 'tableExample',
                table: {
                  widths: [115, 210, 90],
                  body: equipBody
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  performanceappraisal(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'Performance Appraisal Report', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 115, 115, 115],
                  body: [
                    ['Employee Name:', `${report.employeeName}`, 'Company Number', `${report.companyNumber}`],
                    ['Appraisal Date:', `${report.appraisalDate}`, 'Date Started:', `${report.dateStarted}`],
                    ['Site:', `${report.site}`, 'Job Title:', `Security Guard`],
                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [230, 230],
                  body: [
                    [{ text: 'Area', bold: true }, { text: `Performance`, bold: true }],
                    [`1.	Access control: `, ``],
                    [`1.1	Verification and authorisation of material removal pass`, `${report.acmaterial}`],
                    [`1.2 	Verification and authorisation of visitors pass `, `${report.acvisitor}`],
                    [`1.3	Verification and authorisation of declaration pass `, `${report.acdeclare}`],
                    [`1.4	Verification and authorisation of patrol routes `, `${report.acpatrol}`],
                    [`1.5	Verification and authorisation of vehicle audit after hours `, `${report.acvehicle}`],
                    [`2.	Reporting: `, ``],
                    [`2.1	Daily shift reporting`, `${report.report2}`],
                    [`2.2	Incident reporting `, `${report.incident}`],
                    [`2.3	Audit finding reporting `, `${report.audit}`],
                    [`2.4	Non-conformance reporting `, `${report.conformance}`],
                    [`2.5	Completion of handover documentation `, `${report.handover}`],
                    [`3.	Patrolling `, `${report.patrolling}`],
                    [`4.	Internal and client property audits participation `, `${report.participation}`],
                    [`5.	Radio communication	 `, `${report.radio}`],
                    [`6.	Documentation control / admin `, `${report.document}`],
                    [`7.	Emergency procedures `, `${report.emergency}`],
                    [`8.	Searching procedures `, `${report.search}`],
                    [`9.	Arrest procedures  `, `${report.arrest}`],
                    [`10.	Conflict management `, `${report.conflict}`],
                    [`11.	Public relations `, `${report.relate}`],
                    [`12.	Follow chain of command `, `${report.chain}`],
                    [`13.	Ad hoc duties as per instructions `, `${report.duty}`],
                    [`14. 	Adherence to Company Polices and Procedures `, `${report.policy}`],
                    [`15.	Taking initiative `, `${report.initiative}`],
                    [`16.	Self confidence `, `${report.confidence}`],
                    [`17.	Willingness to work extended hours `, `${report.hours}`],
                    [`18.	Willingness to cooperate `, `${report.cooperate}`],
                    [`19.	Neatness `, `${report.neatness}`],
                    [`20.	Compliance to shift rosters / attendance `, `${report.rosters}`],
                    [`21.    Other `, `${report.other}`],

                  ]
                },
              },

              {
                style: 'tableExample',
                table: {
                  widths: [460, 460],
                  body: [
                    [{ text: `Recommendation: \n `, bold: true, alignment: 'center' }], [` ${report.recommendation}`]
                  ]
                },
              },
              {
                style: 'tableExample',
                table: {
                  widths: [230, 230],
                  body: [
                    ['Performance acknowledgement:', `${report.approve}`],

                  ]
                }
              },


              {
                style: 'table3',
                table: {
                  widths: [150, 150, 150],
                  body: [
                    [
                      this.supervisorSign,
                      '',
                      ''
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Manager Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'HR Manager Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'Employee Signature',
                        alignment: 'center',
                      }
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `User Name: ${report.user}`,
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: `HR Manager Name: `,
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: `Employee Name: ${report.employeeName}`,
                        alignment: 'center',
                      },
                    ],

                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  fenceinspection(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          const equipBody = [[{ text: 'LACE/ZONE', bold: true }, { text: 'VOLTAGE', bold: true }, { text: 'KV READING', bold: true }]]
          // dynamic array table
          report.site.forEach((element) => {
            equipBody.push([element.site, element.voltage, element.kv]) // 100, 200, 300
          });

          var docDefinition = {

            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },


              { text: 'FENCE INSPECTION', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 115, 115, 115],
                  body: [
                    ['Inspection By:', `${report.by}`, 'Date', `${report.date}`],
                    ['Start:', `${report.start}`, 'Finish:', `${report.finish}`],
                    ['Ocurance Book Number:', `${report.book}`, 'Time:', `${report.time}`],
                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [230, 115, 115],
                  body: equipBody
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [230, 230],
                  body: [
                    [{ text: 'OBSERVATION & FEEDBACK', bold: true }, { text: 'COMMENT', bold: true }],
                    ['Fence cleared from all vegetation', `${report.vegetation}`],
                    ['Bobbins/ Insulators all in place and spaced correctly', `${report.bob}`],
                    ['Strands/ wires tensioned correctly', `${report.wire}`],
                    ['All fence brackets in place', `${report.brackets}`],
                    ['All fence posts secured properly', `${report.posts}`],
                    ['Siren working', `${report.siren}`],
                    ['Energizer box locked', `${report.energizer}`],
                    ['Three earth spikes around energizer boxes', `${report.spikes}`],
                    ['Earth spikes every 30 meters from energizer box', `${report.thirtymeter}`],
                    ['Condition of danger signs', `${report.danger}`],
                    ['Danger signs displayed every 10 meters', `${report.tenmeter}`],
                    ['Fence signal transmitted to armed reaction', `${report.signal}`],
                    ['South Fence signal transmitted to armed reaction', `${report.south}`],
                    ['Fence signal transmitted to guard room on Mimic Base', `${report.mimic}`],

                  ]
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150, 150],
                  body: [
                    [
                      this.sigUser,
                      ''
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Supervisor Signature',
                        alignment: 'center',
                      },
                      ''
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Supervisor Name: ${report.user}`,
                        alignment: 'center',
                      }, ''
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },


            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  grievance(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'Stage 1: LODGMENT OF A GRIEVANCE', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 115, 115, 115],
                  body: [
                    ['Employee Name:', `${report.employeeName}`, 'Manager’s Name: ', `${report.managerName}`],
                    ['Employee Position:', `${report.employeePosition}`, 'Manager’s Position:', `${report.managerPosition}`],
                    ['Employee Number:', `${report.employeeNumber}`, '', ''],
                    ['Company / Site:', `${report.site}`, 'Date:', `${report.date}`]

                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 345],
                  body: [
                    ['DATE OF GRIEVANCE: ', `${report.date}`],
                    ['NATURE OF GRIEVANCE:', `${report.grievanceNature}`],
                    ['SETTLEMENT DESIRED:', `${report.settlement}`],
                  ]
                }
              },
              {
                style: 'tableExample',
                table: {
                  body: [
                    [`DO YOU REQUIRE AN INTERPRETER?: ${report.interpreter}`],
                    [`NAME OF REPRESENTATIVE (IF REQUIRED; LIMITED TO A FELLOW EMPLOYEE): ${report.rep}`],
                    [`DESIGNATION: ${report.designation}`],

                  ]
                }
              },

              {
                style: 'table3',
                table: {
                  widths: [150, 50, 150],
                  body: [
                    [
                      this.manSig, '',
                      this.empSig
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Supervisor Signature',
                        alignment: 'center',
                      }, '',
                      {
                        border: [false, false, false, false],
                        text: 'Employee Signature',
                        alignment: 'center',
                      }
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Supervisor Name: ${report.user}`,
                        alignment: 'center',
                      }, ' ',
                      {
                        border: [false, false, false, false],
                        text: `Employee Name: ${report.employeeName}`,
                        alignment: 'center',
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  polygraph(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'NOTICE TO ATTEND A POLYGRAPH TEST', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 345],
                  body: [
                    ['EMPLOYEE NAME:', `${report.employeeName}`],
                    ['DATE:', `${report.date}`]
                  ]
                }
              },


              {
                text: [`You are hereby informed that a polygraph test is going to be conducted on `, { text: `${report.polydate}`, bold: true }, ` at `, { text: `${report.polytime}`, bold: true }, `. You are required to attend and have a polygraph test conducted on yourself at EBS Security Admin Head Office, 1040 Clifton Court, Clifton Avenue, Lyttelton.
              Please report at least 30 minutes prior to the time scheduled for the test to be conducted.
              `]
              },

              {
                text: [`I, `, { text: `${report.employeeName}`, bold: true }, ` hereby confirm that I have read and understand that I have to attend a polygraph test on `, { text: `${report.polydate}`, bold: true }, ` at `, { text: `${report.polytime}`, bold: true }, `.
              Signed at `, { text: `${report.place}`, bold: true }, ` on `, { text: `${report.date}`, bold: true }, `.
              `]
              },

              {
                style: 'table3',
                table: {
                  widths: [150, 150, 150],
                  body: [
                    [
                      this.supervisorSign,
                      this.witSig,
                      this.empSig
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Supervisor Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'Witness Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'Employee Signature',
                        alignment: 'center',
                      }
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Supervisor Name: ${report.supername}`,
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: `Witness Name: ${report.witnessname}`,
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: `Employee Name: ${report.employeeName}`,
                        alignment: 'center',
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  payquery(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'Pay Query Form', style: 'header' },
              { text: '  ALL PAY QUERIES MUST BE SUBMITTED TO AREA SUPERVISORS OR  MANAGERS BY THE 7TH OF EACH MONTH. ALL RECTIFICATIONS WILL BE DEPOSITED ON THE FOLLOWING PAY CYCLE.' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 345],
                  body: [
                    ['Name & Surname:', `${report.employeeName}`],
                    ['Company Number', `${report.companyNumber}`],
                    ['Site Posted', `${report.site}`]
                  ]
                }
              },
              { text: 'Particulars of Query ', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [
                    [`${report.reason}`,],

                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [230, 230],
                  body: [
                    [`Date submitted: ${report.date}`, `Submitted to: ${report.supervisorName}`],

                  ]
                }
              },
              {
                style: 'tableExample',
                table: {
                  widths: [230],
                  body: [
                    [this.empSig],
                    [{ text: `Employee Signature: ${report.employeeName}`, alignment: 'center' }],


                  ]
                }
              },



              { text: 'For office use only ', style: 'header' },
              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [
                    ['Date Received at Head Office:'], ['Name of Manager:'],


                  ]
                }
              },
              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  heights: [150, 20],
                  body: [
                    ['Feedback on Query:'], ['(Please include supporting documentation)']

                  ]
                }
              },


              {
                style: 'tableExample',
                table: {
                  heights: [20, 20, 20, 50, 20],

                  widths: [230, 230],
                  body: [
                    ['Date Resolved', ` `],
                    ['Amount to be paid', ''],
                    ['Checked by HR Manager', 'Approved by Managing Director'],
                    [
                      '',
                      ''
                    ],
                    [
                      {
                        text: 'HR Manager Signature'
                      },
                      {
                        text: 'Managing Director Signature'
                      }
                    ]

                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  resignation(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'Voluntary Resignation Letter', style: 'header' },
              { text: `Date: ${report.date}`, style: 'header' },


              {
                text: [`I, `, { text: `${report.employeeName}`, bold: true }, ` with company number:  `, { text: `${report.companyNumber}`, bold: true }, ` herewith notify you that I am resigning from my position as (Position held in company) `, { text: `${report.position}`, bold: true }, ` at (Site name) `, { text: `${report.site}`, bold: true }, `.  
                My last day of employment will be `, { text: `${report.last}`, bold: true }, `. 
                `]
              },
              {
                text: `I appreciate the opportunities I have been given during my time with your company, as well as your professional guidance and support.
                  I wish you and the company all the best of success in the future.
                  `
              }
              ,
              { text: `${report.notice}`, bold: true },

              { text: [`Thus resignation signed at `, { text: `${report.place}`, bold: true }, ` on `, { text: `${report.date}`, bold: true },] }

              ,
              {
                style: 'table3',
                table: {
                  widths: [150],
                  body: [
                    [
                      this.empSig
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Employee Signature',
                        alignment: 'center',
                      }
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Employee Name: ${report.employeeName}`,
                        alignment: 'center',
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              { text: [`Thus accept and signed at `, { text: `${report.place}`, bold: true }, ` on `, { text: `${report.date}`, bold: true }] },
              {
                style: 'table3',
                table: {
                  widths: [150],
                  body: [
                    [
                      this.supervisorSign
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Supervisor Signature',
                        alignment: 'center',
                      }
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Supervisor Name: ${report.user}`,
                        alignment: 'center',
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },

            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  fire(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'FIRE SITUATIONS', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 345],
                  body: [
                    ['FIRE AT:', `${report.at}`],
                    ['REPORTED ON', `${report.reporttime}, ${report.report}`],
                    ['REPORTED BY :', `${report.by}`],
                    ['FROM:', `${report.from}`],
                  ]
                }
              },



              {
                style: 'tableExample',
                table: {
                  widths: [115, 60, 285],
                  body: [
                    ['Notify Fire Department:', `${report.firetime}`, `${report.fire}`],
                    ['Alerted Tenants in area:', `${report.tenanttime}`, `${report.tenant}`],
                    ['Affected Area Specify where:', `${report.affectedtime}`, `${report.affected}`],
                    ['Floor(s) Above:', `${report.floorabovetime}`, `${report.floorabove}`],
                    ['Floor(s) Below:', `${report.floorbelowtime}`, `${report.floorbelow}`],
                    ['Evacuated affected floor area:', `${report.evacuatedtime}`, `${report.evacuated}`],
                    ['If necessary, evacuated lower:', `${report.lowtime}`, `${report.low}`],
                    ['If necessary, evacuated higher floor (s):', `${report.hightime}`, `${report.high}`],
                    ['If necessary instituted emergency shutdown:', `${report.shutdowntime}`, `${report.shutdown}`],
                    ['Emergency shutdown completed:', `${report.completetime}`, `${report.complete}`],
                    ['Any other items (specify):', `${report.othertime}`, `${report.other}`],

                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [
                    [{ text: `ADDITIONAL INFORMATION: `, bold: true }],
                    [`${report.add}`],

                  ]
                }
              },

              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.supervisorSign,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Signature',
                        alignment: 'center',
                      },
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Compiled by: ${report.user}`,
                        alignment: 'center',
                      },
                      {}
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  gasExplosion(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },
              { text: 'Gas Explosion', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [115, 345],
                  body: [
                    ['REPORTED AT :', `${report.at}`],
                    ['REPORTED ON', `${report.report}`],
                    ['REPORTED BY :', `${report.by}`],
                    ['FROM:', `${report.from}`],
                    ['CAUSE OF EXPLOSION KNOWN?:', `${report.cause}`],
                  ]
                }
              },



              {
                style: 'tableExample',
                table: {
                  widths: [115, 60, 285],
                  body: [
                    ['SAP Notified:', `${report.saptime}`, `${report.sap}`],
                    ['Fire Brigade notified:', `${report.brigadetime}`, `${report.brigade}`],
                    ['Alerted Tenants in area:', `${report.tenanttime}`, `${report.tenant}`],
                    ['Areas Evacuated:', `${report.areatime}`, `${report.area}`],
                    ['Emergency shutdown instituted:', `${report.shutdowntime}`, `${report.shutdown}`],
                    ['Emergency shutdown completed:', `${report.institutedtime}`, `${report.instituted}`],
                    ['Any other items (specify):', `${report.othertime}`, `${report.other}`],

                  ]
                }
              },

              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [
                    [{ text: `ADDITIONAL INFORMATION: `, bold: true }],
                    [`${report.add}`]
                  ]
                }
              },


              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.supervisorSign,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Signature',
                        alignment: 'center',
                      },
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Compiled by: ${report.user}`,
                        alignment: 'center',
                      },
                      {}
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  extinguisherChecklist(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          let equipBody = [[{ text: 'LOCATION', bold: true }, { text: 'FIRE EXT. NO.', bold: true }, { text: 'COMMENTS', bold: true }, { text: 'HOSE REEL NO.', bold: true }, { text: 'COMMENTS', bold: true }, { text: 'FIRE BOX NO.', bold: true }, { text: 'COMMENTS', bold: true }]]
          report.site.forEach((element) => {
            equipBody.push([element.location, element.fireNum, element.fireComm, element.hoseNum, element.hoseComm, element.boxNum, element.boxComm]) /// 100, 200, 300
          });

          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },

              { text: 'FIRE EXTINGUISHER & HOSE REEL CHECKLIST', style: `header` },
              // {text:'Check the following:'},
              // {text:'FIRE EXTINGUISHER & HOSE REEL CHECKLIST', style: `header`},

              {
                style: 'tableExample',
                table: {
                  widths: [80, 380],
                  body: [
                    [{ text: `Date: ` }, `${report.date}`,],
                    [{ text: `User: ` }, `${report.by}`,
                    ],

                    [{ text: `Company No. :` }, ` ${report.compnum}`,
                    ]
                  ]
                }
              },


              {
                style: 'tableExample',
                table: {
                  widths: [70, 55, 70, 60, 75, 60, 75],
                  body: equipBody
                }
              },
              {
                style: 'table3',
                table: {
                  widths: [150],
                  body: [
                    [
                      this.supervisorSign
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Supervisor Signature',
                        alignment: 'center',
                      }
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Supervisor Name: ${report.user}`,
                        alignment: 'center',
                      }
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  theft(report) {
    return new Promise<void>((resolve, reject) => {
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [ // add the content here of pdf
              {
                image: this.header,
                width: 300,
                alignment: 'center'
              },

              { text: 'THEFT REPORT', style: 'header' },

              {
                style: 'tableExample',
                table: {
                  widths: [150, 310],
                  body: [
                    [{ text: `DATE: `, bold: true }, `${report.date}`],
                    [{ text: `FULL NAME:`, bold: true }, ` ${report.full}`],
                    [{ text: `HOME ADDRESS: `, bold: true }, ` ${report.add}`
                    ], [{ text: `CONTACT TEL. NO: `, bold: true }, ` ${report.cell}`
                    ], [{ text: `OB NUMBER: `, bold: true }, ` ${report.ob}`
                    ],


                  ]
                }
              },
              {
                style: 'tableExample',
                table: {
                  widths: [460],
                  body: [

                    [{ text: `FULL DISCRIPTION OF THE INCIDENT: `, bold: true }], [` ${report.description}`
                    ],
                    [{ text: `DETAILED DESCRIPTION OF THE LOCATION WHEN THE INCIDENT OCCURRED:  `, bold: true }], [`${report.location}`
                    ],
                    [{ text: `DETAILED DESCRIPTION OF THE SUSPECT: `, bold: true }], [` ${report.suspect}`
                    ],
                    [{ text: `DESCRIPTION OF THE ARREST, IF APPLICABLE: `, bold: true }], [` ${report.arrest}`
                    ],
                    [{ text: `DESCRIPTION OF THE VALUE OF THE ITEMS TAKEN: `, bold: true }], [` ${report.value}`
                    ],
                    [{ text: `OUTCOME OF THE EVENT: `, bold: true }], [` ${report.outcome}`
                    ],
                    [{ text: `DO YOU WISH TO LAY A CHARGE AGAINST THE SUPECT WITH THE SAP? IF YES, PLEASE PROVIDE THE DETAILS AND CASE NUMBER PROVIDED BY THE SAPS: `, bold: true }], [` ${report.cause}`],


                  ]
                }
              },





              { text: `I FURTHER DECLARE THAT THIS STATEMENT IS TRUE TO THE BEST OF MY KNOWLEDGE AND BELIEVE THAT I HAVE MADE THIS STATEMENT KNOWING THAT, IF IT WERE TENDERED EVIDENCE, I WOULD BE LIABLE FOR PROSECUTION, IF I WILLFULLY STATED IN IT ANYTHING WHICH I KNEW TO BE FALSE, OR WHICH I DID NOT BELIEVE TO BE TRUE. I HAVE NO OBJECTION TO TAKING THE PRESCRIBED OATH. I CONSIDER THE PRESCRIBED OATH TO BE BINDING ON MY CONSCIENCE.` },

              {
                style: 'table3',
                table: {
                  widths: [150, 150],
                  body: [
                    [
                      this.empSig,
                      this.sigUser
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'User Signature',
                        alignment: 'center',
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Name: ${report.full}`,
                        alignment: 'center',
                      },

                      {
                        border: [false, false, false, false],
                        text: `User Name: ${report.user}`,
                        alignment: 'center',
                      },
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },


              {
                style: 'table3',
                table: {
                  widths: [150, 150],
                  body: [
                    [
                      this.witSig,
                      this.sigOfficer
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'Witness Signature',
                        alignment: 'center',
                      },
                      {
                        border: [false, false, false, false],
                        text: 'SAPS Signature',
                        alignment: 'center',
                      },
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: `Witness Name: ${report.witnessesName}`,
                        alignment: 'center',
                      },

                      {
                        border: [false, false, false, false],
                        text: `SAPS Name: ${report.sapsnom} `,
                        alignment: 'center',
                      },
                    ]
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },

              { text: [`THE ABOVE WAS SIGNED AT `, { text: `${report.place}`, bold: true }, ` ON`, { text: ` ${report.date}`, bold: true }] },
            ],
            styles: {
              headLabel: {
                color: this.color,
                bold: true
              },
              tableExample: {
                alignment: 'left',
                margin: [0, 5, 0, 15],
                widths: [200, 200]

              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              header1: {
                fontSize: 18,
                bold: true,
                alignment: 'left',
                margin: [0, 20, 0, 20]
              },

              subheader: {
                alignment: 'center',
                color: this.color,
                fontSize: 14,
                bold: true,
                margin: [0, 15, 0, 5]
              },
              table: {
                margin: [0, 5, 0, 15]
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
              tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
              }
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          }
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }


  downloadEMP(report) {
    return new Promise<void>((resolve, reject) => {
      console.log('In download')
      this.checkSig(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'EMPLOYEE PERFORMANCE EVALUATION FORM ', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: `Name: `, style: 'headLabel', colSpan: 2 }, {},
                    { text: `                      ${report.employee}                   `, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: `Evaluation Period: `, style: 'headLabel', colSpan: 2 }, {},
                    { text: `                      ${report.period}                   `, style: 'headLabel', colSpan: 2, decoration: 'underline' }, {}],
                    [{ text: `Employee Title: `, style: 'headLabel', colSpan: 2 }, { text: `               ${report.title}             `, style: 'headLabel', colSpan: 2, decoration: 'underline' },
                    { text: `Date: `, style: 'headLabel', colSpan: 2 }, { text: `      ${report.date}       `, style: 'headLabel', colSpan: 2, decoration: 'underline' }],
                  ]
                },
                layout: 'noBorders'
              },
              { text: 'Performance Rating Definitions ', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [{ text: 'The following ratings are used: ', style: 'headLabel', colSpan: 2 }, {}],
                    [{ text: 'Outstanding', style: 'headLabel' }, { text: 'Performance is consistently superior', style: 'headLabel' }],
                    [{ text: 'Exceeds Expectations', style: 'headLabel' }, { text: 'Performance is routinely above job requirements', style: 'headLabel' }],
                    [{ text: 'Meets Expectations', style: 'headLabel' }, { text: 'Performance is regularly competent and dependable', style: 'headLabel' }],
                    [{ text: 'Below Expectations', style: 'headLabel' }, { text: 'Performance fails to meet job requirements on a frequent basis', style: 'headLabel' }],
                    [{ text: 'Unsatisfactory', style: 'headLabel' }, { text: 'Performance is consistently unacceptable', style: 'headLabel' }],
                  ]
                },
                layout: 'noBorders'
              },
              { text: 'Note: Please add comments for: “Outstanding” OR “Below Expectations, and “Unsatisfactory” Performance\n', style: 'headLabel' },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [{ text: 'OB Reports:', style: 'headLabel' }, { text: `${report.ob}` }],
                    [{ text: 'Following Procedure', style: 'headLabel' }, { text: `${report.procedure}` }],
                    [{ text: 'Punctuality', style: 'headLabel' }, { text: `${report.punctuality}` }],
                    [{ text: 'Appearance', style: 'headLabel' }, { text: `${report.appearance}` }],
                    [{ text: 'Cleanliness', style: 'headLabel' }, { text: `${report.cleanliness}` }],
                    [{ text: 'Attitude', style: 'headLabel' }, { text: `${report.attitude}` }],
                    [{ text: 'Public Relations:', style: 'headLabel' }, { text: `${report.relations}` }],
                    [{ text: 'Dedication', style: 'headLabel' }, { text: `${report.dedication}` }],
                  ]
                },
              },
              { text: 'B. COMMENTS:  ', style: 'header' },
              { text: `${report.comments}`, style: 'headLabel' },
              { text: 'C. SIGNATURES:  ', style: 'header' },

              { text: `Employee:        ${report.employee}         Date:         ${report.date}`, style: 'headLabel' },
              { text: '(Signature does not necessarily denote agreement with official review and means only that the employee was given the opportunity to discuss the official review with the supervisor.)' },

              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.empSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'EMPLOYEE SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },
              { text: `Evaluated By:        ${report.supervisor}         Date:         ${report.date}`, style: 'headLabel' },
              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.supSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'SUPERVISOR SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },

              { text: `Reviewed  By:        ${report.manager}         Date:         ${report.date}`, style: 'headLabel' },

              {
                style: 'table3',
                table: {
                  widths: [150, 1],
                  body: [
                    [
                      this.manSig,
                      {}
                    ],
                    [
                      {
                        border: [false, false, false, false],
                        text: 'MANAGER SIGNATURE',
                        alignment: 'center',
                      },
                      {}
                    ],
                  ]
                },
                layout: {
                  defaultBorder: false,
                }
              },

            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15],
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }


  downloadNCR(report) {
    return new Promise<void>((resolve, reject) => {
      console.log('In download')
      this.getNCRBody(report).then(() => {
        this.getCompanyInfo().then(() => {
          var docDefinition = {
            content: [
              {
                image: this.header,
                width: 500,
                alignment: 'center'
              },
              { text: 'NON-CONFORMANCE REPORT', style: 'header' },
              {
                style: 'table',
                table: {
                  widths: ['50%', '50%'],
                  body: [
                    [{ text: 'ORIGIN OF NCR:', style: 'headLabel' }, { text: `${report.origin}\n${report.other}` }],
                  ]
                },
              },
              { text: 'PART 1: IDENTIFIED NON-CONFORMANCE REPORT', style: 'headLabel' },

              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: [
                    [{ text: 'Date of NCR', style: 'headLabel' }, { text: `${report.ncrDate}` }, { text: 'NCR Number:', style: 'headLabel' }, { text: `${report.ncrNum}` }],
                    [{ text: `Details of Non-conformance (Problem): \n\n ${report.details}`, style: 'headLabel', colSpan: 4 }, {}, {}, {}],
                    [{ text: `Identified by:    ${report.identifiedBy}  `, style: 'headLabel', colSpan: 2 }, {}, { text: `Date: ${report.identifiedDate}` }, { text: `Department:  ${report.department}` }],
                  ]
                },
              },

              { text: 'PART 2: RESOLUTION AND ACTION TAKEN', style: 'headLabel' },

              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: this.body1
                },
              },

              { text: 'PART 3: CLOSE OUT', style: 'headLabel' },

              {
                style: 'table',
                table: {
                  widths: ['25%', '25%', '25%', '25%'],
                  body: this.body2
                },
              },

            ],
            styles: {
              headLabel: {
                bold: true
              },
              header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 20, 0, 20]
              },
              notes: {
                margin: [0, 20, 0, 20]
              },
              table: {
                margin: [0, 5, 0, 15],
              },
              table2: {
                fontSize: 10,
              },
              table3: {
                margin: [0, 10, 0, 10]
              },
            },
            defaultStyle: {
              // alignment: 'justiSfy'
            }
          };
          this.generatePDF(docDefinition);
          resolve();
        });
      });
    });
  }

  getNCRBody(report) {
    return new Promise<void>((resolve, reject) => {
      this.body1 = [];
      this.body2 = [];
      this.body1.push([{ text: `Corrective Action taken: \n\n${report.action}`, style: 'headLabel', colSpan: 4 }, {}, {}, {}],)
      if (report.actionSig !== '') {
        this.body1.push([{ text: `Corrective Action implemented by: \n\n ${report.actionBy}`, style: 'headLabel' }, { image: `${report.actionSig}`, width: 100, alignment: 'center' }, { text: `Due Date\n\n${report.dueDate}`, style: 'headLabel' }, { text: `Actual Date\n\n${report.actualDate}`, style: 'headLabel' }],)
      } else {
        this.body1.push([{ text: `Corrective Action implemented by: \n\n ${report.actionBy}`, style: 'headLabel' }, { text: `Sign`, style: 'headLabel' }, { text: `Due Date\n\n${report.dueDate}`, style: 'headLabel' }, { text: `Actual Date\n\n${report.actualDate}`, style: 'headLabel' }],)
      }
      this.body1.push([{ text: `Preventive action:\n\n${report.prevAction}  `, style: 'headLabel', colSpan: 4 }, {}, {}, {}],
        [{ text: `The identified cause of the Non-Conformance: Ask Why? Why? Why? Why? Why? to identify root cause:\n\n    ${report.cause}  `, style: 'headLabel', colSpan: 4 }, {}, {}, {}])

      this.body2.push([{ text: `Confirmation of Implementation \n\n ${report.confirm}`, style: 'headLabel', colSpan: 4 }, {}, {}, {}],)
      if (report.verifiedSig !== '') {
        this.body2.push([{ text: `Verified By: \n\n ${report.verifiedBy}`, style: 'headLabel', colSpan: 2 }, {}, { image: `${report.verifiedSig}`, width: 100, alignment: 'center' }, { text: `Date\n\n${report.verifiedDate}`, style: 'headLabel' }],)
      } else {
        this.body2.push([{ text: `Verified By: \n\n ${report.verifiedBy}`, style: 'headLabel', colSpan: 2 }, {}, { text: 'Sign', style: 'headLabel' }, { text: `Date\n\n${report.verifiedDate}`, style: 'headLabel' }],)
      }
      this.body2.push([{ text: `The Corrective Action is inadequate:`, style: 'headLabel' }, { text: `${report.correct}`, style: 'headLabel' }, { text: `The CAR can be closed out:`, style: 'headLabel' }, { text: `${report.car}`, style: 'headLabel' }],
        [{ text: `Details of further action required: \n\n ${report.furtherAction}`, style: 'headLabel', colSpan: 4 }, {}, {}, {}])
      resolve();
    })
  }

  /*
         // Signatures
         else if (report.manSig !== '' && report.manSig !== undefined) {
           var sig = report.manSig;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.empSig !== '' && report.empSig !== undefined) {
           var sig = report.empSig;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.witSig !== '' && report.witSig !== undefined) {
           var sig = report.witSig;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.signature !== '' && report.signature !== undefined) {
           var sig = report.signature;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.guardSig !== '' && report.guardSig !== undefined) {
           var sig = report.guardSig;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.sigUser !== '' && report.sigUser !== undefined) {
           var sig = report.sigUser;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.sigClient !== '' && report.sigClient !== undefined) {
           var sig = report.sigClient;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.sigOfficer !== '' && report.sigOfficer !== undefined) {
           var sig = report.sigOfficer;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.clientSig !== '' && report.clientSig !== undefined) {
           var sig = report.clientSig;
           if ((sig.startsWith('https'))) {
             this.toDataURL(sig, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         // Photos
         else if (report.photo !== '' && report.photo !== undefined) {
           var photo = report.photo;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo1 !== '' && report.photo1 !== undefined) {
           var photo = report.photo1;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo2 !== '' && report.photo2 !== undefined) {
           var photo = report.photo2;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo3 !== '' && report.photo3 !== undefined) {
           var photo = report.photo3;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo4 !== '' && report.photo4 !== undefined) {
           var photo = report.photo4;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo5 !== '' && report.photo5 !== undefined) {
           var photo = report.photo5;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo6 !== '' && report.photo6 !== undefined) {
           var photo = report.photo6;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo7 !== '' && report.photo7 !== undefined) {
           var photo = report.photo7;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo8 !== '' && report.photo8 !== undefined) {
           var photo = report.photo8;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo9 !== '' && report.photo9 !== undefined) {
           var photo = report.photo9;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo10 !== '' && report.photo10 !== undefined) {
           var photo = report.photo10;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo11 !== '' && report.photo11 !== undefined) {
           var photo = report.photo11;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo12 !== '' && report.photo12 !== undefined) {
           var photo = report.photo12;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo13 !== '' && report.photo13 !== undefined) {
           var photo = report.photo13;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo14 !== '' && report.photo14 !== undefined) {
           var photo = report.photo14;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo15 !== '' && report.photo15 !== undefined) {
           var photo = report.photo15;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }
         else if (report.photo16 !== '' && report.photo16 !== undefined) {
           var photo = report.photo16;
           if ((photo.startsWith('https'))) {
             this.toDataURL(photo, function (dataUrl) {
               var base64ConvertedImage = dataUrl;
             });
           } else {
           }
         }

  resolve();
});
}
*/


}
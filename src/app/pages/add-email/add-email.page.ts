import { Component, OnInit } from '@angular/core';
import { NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-add-email',
  templateUrl: './add-email.page.html',
  styleUrls: ['./add-email.page.scss'],
})
export class AddEmailPage implements OnInit {

  report = {
    key: '',
    name: '',
    email: '',
    client: '',
    user: '',
  };

  update;
  public split;

  constructor(public alertCtrl: AlertController, public toast: ToastService, private afs: AngularFirestore,
    public loadingCtrl: LoadingController, public navParams: NavParams, public loading: LoadingService, 
    public modalCtrl: ModalController) {
      this.report = navParams.get('report');
  }

  ngOnInit() {
    
  }

  async save(report) {
    this.loading.present('Saving Please Wait...');
    setTimeout(() => {
      this.loading.dismiss();
    }, 10000);
    if (report.email === undefined || report.email === '') {
      report.email = '';
    }
    if (report.client === undefined || report.client === '') {
      report.client = '';
    }
    if (report.user === undefined || report.user === '') {
      report.user = false;
    }
    if (this.report.name === 'SITE VISIT REPORT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        visit: this.split,
        visitUser: report.user,
        visitClient: report.client
      };
    }
    if (this.report.name === 'INCIDENT REPORT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        incident: this.split,
        incidentUser: report.user,
        incidentClient: report.client
      };
    }
    if (this.report.name === 'MEETING REPORT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        meeting: this.split,
        meetingUser: report.user,
        meetingClient: report.client
      };
    }
    if (this.report.name === 'UNIFORM ORDER') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        uniform: this.split,
        uniformUser: report.user,
        uniformClient: report.client
      };
    }
    if (this.report.name === 'TRAINING FORM') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        training: this.split,
        trainingUser: report.user,
        trainingClient: report.client
      };
    }
    if (this.report.name === 'VEHICLE INSPECTION') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        vehicle: this.split,
        vehicleUser: report.user,
        vehicleClient: report.client
      };
    }
    if (this.report.name === 'DISCIPLINARY NOTICE') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        disciplinary: this.split,
        disciplinaryUser: report.user,
        disciplinaryClient: report.client
      };
    }
    if (this.report.name === 'TRANSPARENCY REPORT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        transparency: this.split,
        transparencyUser: report.user,
        transparencyClient: report.client
      };
    }
    if (this.report.name === 'GENERAL INCIDENT REPORT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        incidentGen: this.split,
        incidentGenUser: report.user,
        incidentGenClient: report.client
      };
    }
    if (this.report.name === 'LEAVE APPLICATION') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        leave: this.split,
        leaveUser: report.user,
        leaveClient: report.client
      };
    }
    if (this.report.name === 'AR VISIT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        arVisit: this.split,
        arVisitUser: report.user,
        arVisitClient: report.client
      };
    }
    if (this.report.name === 'OB ENTRY') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        ob: this.split,
        obUser: report.user,
        obClient: report.client
      };
    }
    if (this.report.name === 'RISK ASSESSMENT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        assessment: this.split,
        assessmentUser: report.user,
        assessmentClient: report.client
      };
    }
    if (this.report.name === 'TENANT VISIT') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        tenant: this.split,
        tenantUser: report.user,
        tenantClient: report.client
      };
    }
    if (this.report.name === 'CLIENT INSTRUCTION') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        instruction: this.split,
        instructionUser: report.user,
        instructionClient: report.client
      };
    }
    if (this.report.name === 'INCIDENT NOTIFICATION') {
      const str = report.email + '';
      this.split = str.split(/[ ,]+/).join(',');
      this.update = {
        notification: this.split,
        notificationUser: report.user,
        notificationClient: report.client
      };
    }
    this.afs.collection('companies').doc(this.report.key).update(this.update).then(() => {
      this.toast.show('Email Addresses Saved!');
      this.modalCtrl.dismiss();
      this.loading.dismiss();
    }).catch(async err => {
      this.loading.dismiss();
      let prompt = await this.alertCtrl.create({
        header: 'Error',
        message: err,
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      return await prompt.present();
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}


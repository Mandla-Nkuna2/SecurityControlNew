import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController, NavController, Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { LoadingService } from 'src/app/services/loading.service';
import { PdfService } from 'src/app/services/pdf.service';
import { ToastService } from 'src/app/services/toast.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-ncr',
  templateUrl: './ncr.page.html',
  styleUrls: ['./ncr.page.scss'],
})
export class NcrPage implements OnInit {

  ncr = {
    report: '', recipient: '', key: '', user: '', userKey: '', userEmail: '', company: '', companyId: '', logo: '',
    timeStamp: '', manager: '', date: '', time: '', companyEmail: '', supEmail: '',
    origin: '', other: '', ncrDate: '', ncrNum: '', details: '', identifiedBy: '', identifiedDate: '', department: '', action: '', actionBy: '', actionSig: '',
    dueDate: '', actualDate: '', prevAction: '', cause: '',
    confirm: '', verifiedBy: '', verifiedAction: '', verifiedDate: '', verifiedSig: '', correct: '', car: '',
    furtherAction: '',
  }

  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;

    
  
  

  constructor(public popoverController:PopoverController,private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.ncr.user = user.name;
          this.ncr.userKey = user.key;
          this.ncr.userEmail = user.email;
          this.ncr.userEmail = user.email;
          this.ncr.company = user.company;
          this.ncr.companyId = user.companyId;
          this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
            if (company.data().ncr !== '' && company.data().ncr !== undefined) {
              this.ncr.companyEmail = company.data().ncr;
              console.log(this.ncr.companyEmail);
            }
          });
          if (user.supEmail) {
            this.ncr.supEmail = user.supEmail;
          }
          this.ncr.key = UUID.UUID();
          this.ncr.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.ncr.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.ncr.report = 'NCR';
          this.ncr.timeStamp = this.ncr.date + ' at ' + this.ncr.time;
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('ncrs').doc(this.data.key).ref.get().then((ncr) => {
          this.passedForm = ncr.data();
          if (this.passedForm) {
            this.ncr = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((form) => {
        this.ncr = form;
        this.saved = true;
      });
    }
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

    this.ncr[`${this.role.data.for}`] = this.role.data.out
  }


  save(form) {
    this.storage.set(this.ncr.key, this.ncr).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Client form Saved Successfully!');
      });
    });
  }

  check() {
    this.ncr.ncrDate = moment(this.ncr.ncrDate).format('YYYY/MM/DD HH:mm')
    this.ncr.identifiedDate = moment(this.ncr.identifiedDate).format('YYYY/MM/DD HH:mm')
    this.ncr.dueDate = moment(this.ncr.dueDate).format('YYYY/MM/DD HH:mm')
    this.ncr.actualDate = moment(this.ncr.actualDate).format('YYYY/MM/DD HH:mm')
    this.ncr.verifiedDate = moment(this.ncr.verifiedDate).format('YYYY/MM/DD HH:mm')

    if (this.ncr.date !== '') {
      this.completeActionSheet();
    } else {
      this.invalidActionSheet();
    }
  }

  step2(form) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('ncrs').doc(this.ncr.key).set(this.ncr).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Client form Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.ncr.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.ncr).then(() => {
      this.afs.collection('ncrs').doc(this.ncr.key).set(this.ncr).then(() => {
        this.navCtrl.pop().then(() => {
          this.toast.show('Report Sent Successfully!');
        });
      });
    });
  }

  async completeActionSheet() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Options: ',
      cssClass: 'actionSheet',
      mode: 'ios',
      buttons: [
        {
          text: 'Submit and Exit',
          icon: 'paper-plane',
          cssClass: 'successAction',
          handler: () => {
            this.step2(this.ncr);
          }
        },
        {
          text: 'Download PDF Document',
          icon: 'download',
          cssClass: 'secondaryAction',
          handler: () => {
            this.downloadPdf();
          }
        },
        {
          text: 'Exit Inspection',
          icon: 'close',
          cssClass: 'dangerAction',
          handler: () => {
            this.exit();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }]
    });
    await actionSheet.present();
  }

  async viewActionSheet() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Options: ',
      cssClass: 'actionSheet',
      mode: 'ios',
      buttons: [
        {
          text: 'Download PDF Document',
          icon: 'download',
          cssClass: 'secondaryAction',
          handler: () => {
            this.PdfService.download(this.ncr);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.ncr);
          }
        },
        {
          text: 'Exit Inspection',
          icon: 'close',
          cssClass: 'dangerAction',
          handler: () => {
            this.exit();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }]
    });
    await actionSheet.present();
  }

  async delFunction(report) {
    let prompt = await this.alertCtrl.create({
      header: 'Delete Report',
      message: `Are you sure you want to Delete ${report.form}?`,
      cssClass: 'alert',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'DELETE',
          handler: () => {
            this.loading.present('Deleting Please Wait...').then(() => {
              this.afs.collection('ncrs').doc(report.key).delete().then(() => {
                this.router.navigate(['/forms']).then(() => {
                  this.loading.dismiss().then(() => {
                    this.toast.show('Report Successfully Deleted!');
                  });
                });
              });
            });
          }
        }
      ]
    });
    return await prompt.present();
  }

  async invalidActionSheet() {
    const actionSheet = await this.actionCtrl.create({
      header: 'Incomplete Form!',
      mode: 'ios',
      cssClass: 'actionSheet',
      buttons: [
        {
          text: 'Save and Exit',
          icon: 'save',
          cssClass: 'successAction',
          handler: () => {
            this.save(this.ncr);
          }
        },
        {
          text: 'Delete',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delete();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          handler: () => {
          }
        }]
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

}

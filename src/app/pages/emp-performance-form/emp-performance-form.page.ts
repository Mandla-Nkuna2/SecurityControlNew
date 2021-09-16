import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
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

@Component({
  selector: 'app-emp-performance-form',
  templateUrl: './emp-performance-form.page.html',
  styleUrls: ['./emp-performance-form.page.scss'],
})
export class EmpPerformanceFormPage implements OnInit {

  id;
  view: boolean = false;
  passedForm;
  data;
  saved = false;

  form = {
    key: '', recipient: '', userKey: '', companyId: '', userEmail: '', company: '', logo: '', user: '', date: '',
    time: '', timeStamp: '', report: 'Employee Performance Evaluation Form',
    companyEmail: '', supEmail: '', emailUser: true, emailClient: '',
    employee: '', empKey: '', period: '', title: '', ob: '', procedure: '', punctuality: '', appearance: '', cleanliness: '', attitude: '', relations: '', dedication: '',
    comments: '', empSig: '', supervisor: '', supSig: '', manager: '', manSig: '',
  }

  staff = [];

    
  
  

  

  constructor(public popoverController:PopoverController,private afs: AngularFirestore, private activatedRoute: ActivatedRoute, public platform: Platform, private storage: Storage, private router: Router,
    private alertCtrl: AlertController, private navCtrl: NavController, private toast: ToastService, private loading: LoadingService, private PdfService: PdfService,
    private actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }
role;
  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.form.user = user.name;
          this.form.userKey = user.key;
          this.form.userEmail = user.email;
          this.form.userEmail = user.email;
          this.form.company = user.company;
          this.form.companyId = user.companyId;
          this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
            if (company.data().form !== '' && company.data().form !== undefined) {
              this.form.companyEmail = company.data().form;
              console.log(this.form.companyEmail);
            }
          });
          if (user.supEmail) {
            this.form.supEmail = user.supEmail;
          }
          this.form.key = UUID.UUID();
          this.form.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.form.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.form.report = 'Employee form';
          this.form.timeStamp = this.form.date + ' at ' + this.form.time;
          this.afs.collection('guards').ref.where('companyId', '==', user.companyId).orderBy('name').get().then(guards => {
            guards.forEach(guard => {
              this.staff.push(guard.data());
            })
          })
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('evaluations').doc(this.data.key).ref.get().then((form) => {
          this.passedForm = form.data();
          if (this.passedForm) {
            this.form = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((form) => {
        this.form = form;
        this.saved = true;
      });
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

    this.form[`${this.role.data.for}`] = this.role.data.out
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

  getEmp(employee) {
    this.form.employee = employee.name;
    this.form.empKey = employee.Key
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

  async alertMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      cssClass: 'alert',
      message: "Please Note ALL fields marked with an '*' must be filled in to submit the form!",
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


  save(form) {
    this.storage.set(this.form.key, this.form).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Client form Saved Successfully!');
      });
    });
  }

  check() {
    if (this.form.employee !== '') {
      if (this.form.ob !== '') {
        if (this.form.procedure !== '') {
          if (this.form.punctuality !== '') {
            if (this.form.appearance !== '') {
              if (this.form.cleanliness !== '') {
                if (this.form.attitude !== '') {
                  if (this.form.relations !== '') {
                    if (this.form.dedication !== '') {
                      if (this.form.empSig !== '') {
                        if (this.form.supSig !== '') {
                          if (this.form.manSig !== '') {
                            this.completeActionSheet();
                          } else {
                            this.invalidActionSheet();
                          }
                        } else {
                          this.invalidActionSheet();
                        }
                      } else {
                        this.invalidActionSheet();
                      }
                    } else {
                      this.invalidActionSheet();
                    }
                  } else {
                    this.invalidActionSheet();
                  }
                } else {
                  this.invalidActionSheet();
                }
              } else {
                this.invalidActionSheet();
              }
            } else {
              this.invalidActionSheet();
            }
          } else {
            this.invalidActionSheet();
          }
        } else {
          this.invalidActionSheet();
        }
      } else {
        this.invalidActionSheet();
      }
    } else {
      this.invalidActionSheet();
    }
  }

  step2(form) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('evaluations').doc(this.form.key).set(this.form).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Client form Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.form.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.form).then(() => {
      this.afs.collection('evaluations').doc(this.form.key).set(this.form).then(() => {
        //this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Report Sent Successfully!');
          });
        });
      //});
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
            this.step2(this.form);
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
            this.PdfService.download(this.form);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.form);
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
              this.afs.collection('evaluations').doc(report.key).delete().then(() => {
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
            this.save(this.form);
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

}

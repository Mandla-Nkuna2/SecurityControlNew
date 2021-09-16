import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, IonSlides, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-training-form',
  templateUrl: './training-form.page.html',
  styleUrls: ['./training-form.page.scss'],
})
export class TrainingFormPage implements OnInit {

  training = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', report: '', companyId: '', userEmail: '', company: '', logo: '', user: '',
    date: '', time: '', timeStamp: '', type: '', so: '', soCoNo: '', soKey: '', ob: '', shift: '', grade: '', reason: '', length: '',
    fit: '', jd: '', signJD: '', procedures: '', summary: '', sigUser: '', sigOfficer: '', lat: 0, lng: 0, acc: 0, clientEmail: '',
    emailToClient: '', companyEmail: '', emailUser: true, emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  // guardsCollection: AngularFirestoreCollection<any>;
  guards = []
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  trainingCollection: AngularFirestoreCollection<any>;
  types: Observable<any[]>;



  siteValue: boolean = true;
  obValue: boolean = true;
  shiftValue: boolean = true;
  emailValue: boolean = true;

  soValue: boolean = true;
  typeValue: boolean = true;
  reasonValue: boolean = true;
  lengthValue: boolean = true;
  fitValue: boolean = true;
  jdValue: boolean = true;
  signJDValue: boolean = true;
  proceduresValue: boolean = true;
  summaryValue: boolean = true;
  sigValue: boolean = true;
  sig2Value: boolean = true;
  sitesValues: boolean = false;
  guardValues: boolean = false;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;
  public formData: any;
  history: boolean = false;

  update;
  emailOption: boolean;
  data;
  id;
  view: boolean = false;
  passedForm;
  saved = false;

  role;
  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;

  signaturePadOptions: Object = {
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  constructor(public popoverController: PopoverController, private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController, public loading: LoadingService,
    public router: Router, private storage: Storage, public activatedRoute: ActivatedRoute, public PdfService: PdfService,
    public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          if (user.key) {
            var id = user.key;
            this.searchSites(id);
            this.displayUser(id);
          }
          this.getLocation();
          this.training.key = UUID.UUID();
          this.training.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.training.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.training.report = 'Training Form';
          this.training.timeStamp = this.training.date + ' at ' + this.training.time;

          this.trainingCollection = this.afs.collection('trainingTypes');
          this.types = this.trainingCollection.valueChanges();

          this.view = false;

          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('trainings').doc(this.data.key).ref.get().then((training) => {
          this.passedForm = training.data();
          if (this.passedForm) {
            this.training = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((training) => {
        this.training = training;
        this.saved = true;
        this.view = false;
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

    this.training[`${this.role.data.for}`] = this.role.data.out
  }


  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.training.user = user.name;
      this.training.company = user.company;
      this.training.userEmail = user.email;
      this.training.userKey = user.key;
      this.training.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.training.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.training.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().training !== '' && company.data().training !== undefined) {
          this.training.companyEmail = company.data().training;
        }
      });
    });
  }

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.training.lat = position.coords.latitude;
        this.training.lng = position.coords.longitude;
        this.training.acc = position.coords.accuracy;
      }
    });
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

  async getSlideNumber() {
    this.slideNumber = await this.slides.getActiveIndex();
  }

  async prev() {
    this.nxtButton = true;
    this.slides.lockSwipes(false);
    this.getSlideNumber().then(() => {
      if (this.slideNumber === 1) {
        this.exitButton = true;
        this.prevButton = false;
      } else {
        this.prevButton = true;
        this.exitButton = false;
      }
      this.slides.slidePrev();
      this.content.scrollToTop().then(() => {
        this.slides.lockSwipes(true);
      });
    });
  }

  next() {
    this.getSlideNumber().then(() => {
      this.prevButton = true;
      this.exitButton = false;
      if (this.slideNumber > 0) {
        this.exitButton = false;
        this.prevButton = true;
      }
      this.slides.lockSwipes(false).then(() => {
        this.slides.slideNext().then(() => {
          this.content.scrollToTop().then(() => {
            this.slides.lockSwipes(true);
            if (this.slideNumber === 0) {
              this.nxtButton = false;
            }
          });
        });
      });
    });
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

  getSiteDetails(training) {
    var key = training.detail.value.key
    if (typeof (key) !== "string") {
      key = key.toString()
    }
    this.afs.collection('sites').doc(key).ref.get().then(doc => {
      var site = doc.data()
      if (site) {
        this.training.site = site['name'];
        this.training.siteKey = site['key'];
        if (site['recipient']) {
          this.training.recipient = site['recipient'];
        }
        if (site['email'] !== undefined) {
          this.training.clientEmail = site['email'];
        }
      }
      this.Guards(training.detail.value.key);


    })
  }

  Guards(key) {
    this.guards = []
    this.afs.firestore.collection(`guards`).where("siteId", '==', key).orderBy('name').get().then((officer) => {
      officer.forEach((guard: any) => {
        this.guards.push(guard.data())
      })
    })
  }



  guardDetails(training) {
    this.training.so = training.detail.value.name;
    this.training.soCoNo = training.detail.value.CoNo
    this.training.grade = training.detail.value.grade
    this.training.soKey = training.detail.value.Key

  }

  check(training) {
    if (this.training.siteKey !== undefined && this.training.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.training.ob !== undefined && this.training.ob !== '') {
      this.obValue = true;
    } else {
      this.obValue = false;
    }
    if (this.training.shift !== undefined && this.training.shift !== '') {
      this.shiftValue = true;
    } else {
      this.shiftValue = false;
    }
    if (this.training.so !== undefined && this.training.so !== '') {
      this.soValue = true;
    } else {
      this.soValue = false;
    }
    if (this.training.type !== undefined && this.training.type !== '') {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.training.reason !== undefined && this.training.reason !== '') {
      this.reasonValue = true;
    } else {
      this.reasonValue = false;
    }
    if (this.training.length !== undefined && this.training.length !== '') {
      this.lengthValue = true;
    } else {
      this.lengthValue = false;
    }
    if (this.training.fit !== undefined && this.training.fit !== '') {
      this.fitValue = true;
    } else {
      this.fitValue = false;
    }
    if (this.training.jd !== undefined && this.training.jd !== '') {
      this.jdValue = true;
    } else {
      this.jdValue = false;
    }
    if (this.training.signJD !== undefined && this.training.signJD !== '') {
      this.signJDValue = true;
    } else {
      this.signJDValue = false;
    }
    if (this.training.procedures !== undefined && this.training.procedures !== '') {
      this.proceduresValue = true;
    } else {
      this.proceduresValue = false;
    }
    if (this.training.summary !== undefined && this.training.summary !== '') {
      this.summaryValue = true;
    } else {
      this.summaryValue = false;
    }
    if (this.training.sigUser !== undefined && this.training.sigUser !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    if (this.training.sigOfficer !== undefined && this.training.sigOfficer !== '') {
      this.sig2Value = true;
    } else {
      this.sig2Value = false;
    }
    this.send(training);
  }

  send(training) {
    if (this.training.siteKey !== undefined && this.training.siteKey !== '') {
      this.siteValue = true;

      if (this.training.ob !== undefined && this.training.ob !== '') {
        this.obValue = true;

        if (this.training.shift !== undefined && this.training.shift !== '') {
          this.shiftValue = true;

          if (this.training.so !== undefined && this.training.so !== '') {
            this.soValue = true;

            if (this.training.type !== undefined && this.training.type !== '') {
              this.typeValue = true;

              if (this.training.reason !== undefined && this.training.reason !== '') {
                this.reasonValue = true;

                if (this.training.length !== undefined && this.training.length !== '') {
                  this.lengthValue = true;

                  if (this.training.fit !== undefined && this.training.fit !== '') {
                    this.fitValue = true;

                    if (this.training.jd !== undefined && this.training.jd !== '') {
                      this.jdValue = true;

                      if (this.training.signJD !== undefined && this.training.signJD !== '') {
                        this.signJDValue = true;

                        if (this.training.procedures !== undefined && this.training.procedures !== '') {
                          this.proceduresValue = true;

                          if (this.training.summary !== undefined && this.training.summary !== '') {
                            this.summaryValue = true;

                            if (this.training.sigUser !== undefined && this.training.sigUser !== '') {
                              this.sigValue = true;

                              if (this.training.emailClient === 'User Choice') {

                                if (this.training.emailToClient !== undefined && this.training.emailToClient !== '') {
                                  this.emailValue = true;

                                  if (this.view === false) {
                                    this.completeActionSheet();
                                  } else {
                                    this.viewActionSheet();
                                  }
                                } else {
                                  this.emailValue = false;
                                  this.invalidActionSheet();
                                }
                              } else {
                                if (this.view === false) {
                                  this.completeActionSheet();
                                } else {
                                  this.viewActionSheet();
                                }
                              }
                            } else {
                              this.sigValue = false;
                              this.invalidActionSheet();
                            }
                          } else {
                            this.summaryValue = false;
                            this.invalidActionSheet();
                          }
                        } else {
                          this.proceduresValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.signJDValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.jdValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.fitValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.lengthValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.reasonValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.typeValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.soValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.shiftValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.obValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2() {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('trainings').doc(this.training.key).set(this.training).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Training Form Sent Successfully!');
          });
        });
      });
    });
  }

  save(training) {
    this.storage.set(this.training.key, this.training).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Training Form Saved Successfully');
      });
    });
  }

  delete() {
    this.storage.remove(this.training.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.training).then(() => {
      this.afs.collection('trainings').doc(this.training.key).set(this.training).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Training Form Sent Successfully!');
          });
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
            this.step2();
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
            this.PdfService.download(this.training);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.training);
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
              this.afs.collection('trainings').doc(report.key).delete().then(() => {
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
            this.save(this.training);
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

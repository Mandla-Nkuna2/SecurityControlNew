import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform, IonSlides, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-disciplinary-report',
  templateUrl: './disciplinary-report.page.html',
  styleUrls: ['./disciplinary-report.page.scss'],
})
export class DisciplinaryReportPage implements OnInit {

  disciplinary = {
    key: '', recipient: '', userKey: '', report: '', companyId: '', userEmail: '', company: '', logo: '', user: '', date: '',
    time: '', timeStamp: null, so: '', soKey: '', soCoNo: '', manSig: '', nature: '', site: '', siteKey: '', action: '', witness: '',
    witSig: '', empSig: '', type: '', lat: null, lng: null, acc: null, clientEmail: '', emailToClient: '', emailClient: '',
    companyEmail: '', emailUser: true,
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  
  
  
  emailValue: boolean = true;
  sig1Value: boolean = true;
  sig2Value: boolean = true;
  sig3Value: boolean = true;


  soValue: boolean = true;
  placeValue: boolean = true;
  natureValue: boolean = true;
  actionValue: boolean = true;
  typeValue: boolean = true;
  sitesValues: boolean = false;
  history: boolean = false;
  isApp: boolean;

  data;
  id;
  view: boolean = false;
  passedForm;

  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0; public formData: any;
  update;
  emailOption: boolean;
  saved = false;

    @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;

  signaturePadOptions: Object = {
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  constructor(public popoverController:PopoverController,private storage: Storage, private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController,
    public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute, public PdfService: PdfService,
    public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          var id = user.key;
          this.displayUser(id);
          this.getSites(id);
          this.getLocation();
          this.disciplinary.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.disciplinary.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.disciplinary.report = 'Disciplinary Report';
          this.disciplinary.timeStamp = this.disciplinary.date + ' at ' + this.disciplinary.time;
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
          this.disciplinary.key = UUID.UUID();
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('disciplinarys').doc(this.data.key).ref.get().then((disciplinary) => {
          this.passedForm = disciplinary.data();
          if (this.passedForm) {
            this.disciplinary = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((disciplinary) => {
        this.disciplinary = disciplinary;
        this.saved = true;
      });
    }
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

    this.disciplinary[`${this.role.data.for}`] = this.role.data.out
  }


  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.disciplinary.user = user.name;
      this.disciplinary.company = user.company;
      this.disciplinary.userEmail = user.email;
      this.disciplinary.userKey = user.key;
      this.disciplinary.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.disciplinary.logo = user.logo;
      }
      else if (user.log === undefined) {
        this.disciplinary.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().disciplinary !== '' && company.data().disciplinary !== undefined) {
          this.disciplinary.companyEmail = company.data().disciplinary;
          console.log(this.disciplinary.companyEmail);
        }
      });
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

  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.disciplinary.lat = position.coords.latitude;
        this.disciplinary.lng = position.coords.longitude;
        this.disciplinary.acc = position.coords.accuracy;
        console.log(position.coords.accuracy);
      }
    });
  }

  getSites(id) {
    if (!this.sitesValues) {
      this.loading.present('Fetching Sites...').then(() => {
        setTimeout(() => {
          this.loading.dismiss();
        }, 30000);
        return this.allSites(id).pipe(take(1)).subscribe(() => {
          this.loading.dismiss();
          this.sitesValues = true;
        });
      });
    }
  }

  allSites(id) {
    this.sitesCollection = this.afs.collection(`users/${id}/sites`, ref => ref.orderBy('name'));
    return this.sites = this.sitesCollection.valueChanges();
  }

  getSiteDetails(disciplinary) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', disciplinary.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data() as any;
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.disciplinary.site = site.name;
        if (site.recipient) {
          this.disciplinary.recipient = site.recipient;
        }
        this.disciplinary.siteKey = site.key;
        if (site.email !== undefined) {
          this.disciplinary.clientEmail = site.email;
        }
      });
    });
    this.allGuards(disciplinary);
  }

  allGuards(disciplinary) {
    this.loading.present('Fetching Staff...').then(() => {
      setTimeout(() => {
        this.loading.dismiss();
      }, 30000);
      return this.getGuards(disciplinary).pipe(take(1)).subscribe(() => {
        this.loading.dismiss();
      });
    });
  }

  getGuards(disciplinary) {
    this.guardsCollection = this.afs.collection('guards', ref => ref.where('siteId', '==', disciplinary.siteKey).orderBy('name'));
    return this.guards = this.guardsCollection.valueChanges();
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

  

  guardDetails(disciplinary) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', disciplinary.soKey));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map     ((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.disciplinary.so = guard.name;
        if (guard.CoNo !== undefined) {
          this.disciplinary.soCoNo = guard.CoNo;
        }
        this.disciplinary.soKey = guard.Key;
      });
    });
  }

  slide1Valid() {
    if (this.disciplinary.siteKey !== undefined && this.disciplinary.siteKey !== '') {
      this.placeValue = true;

      if (this.disciplinary.soKey !== undefined && this.disciplinary.soKey !== '') {
        this.soValue = true;

        if (this.disciplinary.nature !== undefined && this.disciplinary.nature !== '') {
          this.natureValue = true;

          if (this.disciplinary.type !== undefined && this.disciplinary.type !== '') {
            this.typeValue = true;

            if (this.disciplinary.action !== undefined && this.disciplinary.action !== '') {
              this.actionValue = true;

              this.slides.lockSwipes(false);
              this.slides.slideNext();
              this.content.scrollToTop().then(() => {
                this.slides.lockSwipes(true);
                this.slides.lockSwipeToNext(true);
                this.slides.lockSwipeToPrev(true);
                this.nxtButton = false;
              });
            }
            else {
              this.actionValue = false;
              this.invalidActionSheet();
            }
          }
          else {
            this.typeValue = false;
            this.invalidActionSheet();
          }
        }
        else {
          this.natureValue = false;
          this.invalidActionSheet();
        }
      }
      else {
        this.soValue = false;
        this.invalidActionSheet();
      }
    }
    else {
      this.placeValue = false;
      this.invalidActionSheet();
    }
  }

  save(disciplinary) {
    this.storage.set(this.disciplinary.key, this.disciplinary).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Disciplinary Report Saved Successfully!');
      });
    });
  }

  check(disciplinary) {
    if (this.disciplinary.siteKey !== undefined && this.disciplinary.siteKey !== '') {
      this.placeValue = true;
    } else {
      this.placeValue = false;
    }
    if (this.disciplinary.soKey !== undefined && this.disciplinary.soKey !== '') {
      this.soValue = true;
    } else {
      this.soValue = false;
    }
    if (this.disciplinary.nature !== undefined && this.disciplinary.nature !== '') {
      this.natureValue = true;
    } else {
      this.natureValue = false;
    }
    if (this.disciplinary.type !== undefined && this.disciplinary.type !== '') {
      this.typeValue = true;
    } else {
      this.typeValue = false;
    }
    if (this.disciplinary.action !== undefined && this.disciplinary.action !== '') {
      this.actionValue = true;
    } else {
      this.actionValue = false;
    }
    if (this.disciplinary.empSig !== undefined && this.disciplinary.empSig !== '') {
      this.sig1Value = true;
    } else {
      this.sig1Value = false;
    }
    if (this.disciplinary.witSig !== undefined && this.disciplinary.witSig !== '') {
      this.sig2Value = true;
    } else {
      this.sig2Value = false;
    }
    if (this.disciplinary.manSig !== undefined && this.disciplinary.manSig !== '') {
      this.sig3Value = true;
    } else {
      this.sig3Value = false;
    }
    this.send(disciplinary);
  }

  send(disciplinary) {
    if (this.disciplinary.siteKey !== undefined && this.disciplinary.siteKey !== '') {
      this.placeValue = true;

      if (this.disciplinary.soKey !== undefined && this.disciplinary.soKey !== '') {
        this.soValue = true;

        if (this.disciplinary.nature !== undefined && this.disciplinary.nature !== '') {
          this.natureValue = true;

          if (this.disciplinary.type !== undefined && this.disciplinary.type !== '') {
            this.typeValue = true;

            if (this.disciplinary.manSig !== undefined && this.disciplinary.manSig !== '') {
              this.sig3Value = true;

              if (this.disciplinary.action !== undefined && this.disciplinary.action !== '') {
                this.actionValue = true;
                if (this.disciplinary.emailClient === 'User Choice') {
                  if (this.disciplinary.emailToClient !== undefined && this.disciplinary.emailToClient !== '') {
                    this.emailValue = true;

                    if (!this.view) {
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
                this.actionValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.sig3Value = false;
              this.invalidActionSheet();
            }
          } else {
            this.typeValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.natureValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.soValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.placeValue = false;
      this.invalidActionSheet();
    }
  }

  step2(disciplinary) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection(`disciplinarys`).doc(this.disciplinary.key).set(this.disciplinary).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Disciplinary Report Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.disciplinary.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.disciplinary).then(() => {
      this.afs.collection('disciplinarys').doc(this.disciplinary.key).set(this.disciplinary).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Report Sent Successfully!');
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
            this.step2(this.disciplinary);
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
            this.PdfService.download(this.disciplinary);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.disciplinary);
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
              this.afs.collection('disciplinarys').doc(report.key).delete().then(() => {
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
            this.save(this.disciplinary);
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

import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, IonSlides, LoadingController, IonContent, AlertController, Platform, IonSlide, ActionSheetController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ToastService } from '../../services/toast.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { PdfService } from 'src/app/services/pdf.service';
import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-client-instruction',
  templateUrl: './client-instruction.page.html',
  styleUrls: ['./client-instruction.page.scss'],
})
export class ClientInstructionPage implements OnInit {

  user = {
    key: '',
    companyId: '',
    password: '',
    name: '',
    permission: true,
    company: '',
    email: '',
    contact: '',
    type: '',
  };
role;
  instruction = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', report: '', companyId: '', userEmail: '', clientEmail: '',
    emailToClient: '', company: '', logo: '', user: '', date: '', time: '', timeStamp: '', client: '', details: '', responsible: '',
    action: '', sigUser: '', sigClient: '', lat: 0, lng: 0, acc: 0, companyEmail: '', supEmail: '', emailUser: true, emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;


  siteValue: boolean = true;
  clientValue: boolean = true;
  detailsValue: boolean = true;
  responsibleValue: boolean = true;
  dateValue: boolean = true;

  sitesValues: boolean = false;

  emailValue: boolean = true;
  sigValue: boolean = true;
  sig2Value: boolean = true;
  emailOption: boolean;
  tab: boolean;
  history: boolean = false;

  public formData: any;
  update;
  slideNum;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;

  rawId;
  data;
  id;
  view: boolean = false;
  passedForm;

  saved = false;

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;

  

  constructor(private popoverController:PopoverController, private loading: LoadingService, private router: Router, public platform: Platform,
    public geolocation: Geolocation, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController,
    private storage: Storage, public activatedRoute: ActivatedRoute, public PdfService: PdfService,
    public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.instruction.user = user.name;
          this.instruction.userKey = user.key;
          this.instruction.userEmail = user.email;
          this.instruction.site = user.site;
          this.instruction.siteKey = user.siteId;
          this.instruction.userEmail = user.email;
          this.instruction.company = user.company;
          this.instruction.companyId = user.companyId;
          this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
            if (company.data().instruction !== '' && company.data().instruction !== undefined) {
              this.instruction.companyEmail = company.data().instruction;
              console.log(this.instruction.companyEmail);
            }
          });
          if (user.supEmail) {
            this.instruction.supEmail = user.supEmail;
          }
          this.instruction.key = UUID.UUID();
          this.instruction.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.instruction.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
          this.instruction.report = 'Client Instruction';
          this.instruction.timeStamp = this.instruction.date + ' at ' + this.instruction.time;
          this.slides.lockSwipes(true);
          this.slides.lockSwipeToNext(true);
          this.sitesCollection = this.afs.collection(`users/${user.key}/sites`, ref => ref.orderBy('name'));
          this.sites = this.sitesCollection.valueChanges();
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('instructions').doc(this.data.key).ref.get().then((instruction) => {
          this.passedForm = instruction.data();
          if (this.passedForm) {
            this.instruction = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((instruction) => {
        this.instruction = instruction;
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

    this.instruction[`${this.role.data.for}`] = this.role.data.out
  }


  getLocation() {
    return this.geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }).then((position) => {
      if (position.coords.latitude) {
        this.instruction.lat = position.coords.latitude;
        this.instruction.lng = position.coords.longitude;
        this.instruction.acc = position.coords.accuracy;
        console.log(position.coords.accuracy);
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
            if (this.slideNumber === 1) {
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

  slide1Valid() {
    if (this.instruction.siteKey !== undefined && this.instruction.siteKey !== '') {
      this.siteValue = true;
      this.slides.lockSwipes(false);
      this.slides.slideNext();
      this.content.scrollToTop().then(() => {
        this.slides.lockSwipes(true);
        this.slides.lockSwipeToNext(true);
      });
    }
    else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  slide2Valid() {
    if (this.instruction.client !== undefined && this.instruction.client !== '') {
      this.clientValue = true;

      if (this.instruction.details !== undefined && this.instruction.details !== '') {
        this.detailsValue = true;

        if (this.instruction.responsible !== undefined && this.instruction.responsible !== '') {
          this.responsibleValue = true;

          if (this.instruction.action !== undefined && this.instruction.action !== '') {
            this.dateValue = true;

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
            this.dateValue = false;
            this.invalidActionSheet();
          }
        }
        else {
          this.responsibleValue = false;
          this.invalidActionSheet();
        }
      }
      else {
        this.detailsValue = false;
        this.invalidActionSheet();
      }
    }
    else {
      this.clientValue = false;
      this.invalidActionSheet();
    }
  }


  getSiteDetails(instruction) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', instruction.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => {
        const info = a.payload.doc.data() as any;
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.instruction.site = site.name;
        this.instruction.siteKey = site.key;
        if (site.recipient) {
          this.instruction.recipient = site.recipient;
        }
        if (site.email !== undefined) {
          this.instruction.clientEmail = site.email;
        }
      });
    });
  }

  save(instruction) {
    this.storage.set(this.instruction.key, this.instruction).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Client Instruction Saved Successfully!');
      });
    });
  }


  check(instruction) {
    if (this.instruction.siteKey !== undefined && this.instruction.siteKey !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.instruction.client !== undefined && this.instruction.client !== '') {
      this.clientValue = true;
    } else {
      this.clientValue = false;
    }
    if (this.instruction.details !== undefined && this.instruction.details !== '') {
      this.detailsValue = true;
    } else {
      this.detailsValue = false;
    }
    if (this.instruction.responsible !== undefined && this.instruction.responsible !== '') {
      this.responsibleValue = true;
    } else {
      this.responsibleValue = false;
    }
    if (this.instruction.action !== undefined && this.instruction.action !== '') {
      this.dateValue = true;
    } else {
      this.dateValue = false;
    }
    if (this.instruction.sigUser !== undefined && this.instruction.sigUser !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
    if (this.instruction.sigClient !== undefined && this.instruction.sigClient !== '') {
      this.sig2Value = true;
    } else {
      this.sig2Value = false;
    }
    this.instruction.action = moment(this.instruction.action).locale('en').format('YYYY/MM/DD');
    this.send(instruction);
  }

  send(instruction) {
    if (this.instruction.siteKey !== undefined && this.instruction.siteKey !== '') {
      this.siteValue = true;

      if (this.instruction.client !== undefined && this.instruction.client !== '') {
        this.clientValue = true;

        if (this.instruction.details !== undefined && this.instruction.details !== '') {
          this.detailsValue = true;

          if (this.instruction.responsible !== undefined && this.instruction.responsible !== '') {
            this.responsibleValue = true;

            if (this.instruction.action !== undefined && this.instruction.action !== '') {
              this.dateValue = true;

              if (this.instruction.sigUser !== undefined && this.instruction.sigUser !== '') {
                this.sigValue = true;

                if (this.instruction.emailClient === 'User Choice') {

                  if (this.instruction.emailToClient !== undefined && this.instruction.emailToClient !== '') {
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
                this.sigValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.dateValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.responsibleValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.detailsValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.clientValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }
  }

  step2(instruction) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('instructions').doc(this.instruction.key).set(this.instruction).then(() => {
        this.router.navigate(['/forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Client Instruction Sent Successfully!');
          });
        });
      });
    });
  }

  delete() {
    this.storage.remove(this.instruction.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
      });
    });
  }

  downloadPdf() {
    this.PdfService.download(this.instruction).then(() => {
      this.afs.collection('instructions').doc(this.instruction.key).set(this.instruction).then(() => {
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
            this.step2(this.instruction);
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
            this.PdfService.download(this.instruction);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.instruction);
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
              this.afs.collection('instructions').doc(report.key).delete().then(() => {
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
            this.save(this.instruction);
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


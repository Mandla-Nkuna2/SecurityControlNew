import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, IonContent, AlertController, Platform, IonSlides, ActionSheetController } from '@ionic/angular';
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
  selector: 'app-uniform-order',
  templateUrl: './uniform-order.page.html',
  styleUrls: ['./uniform-order.page.scss'],
})
export class UniformOrderPage implements OnInit {

  uniform = {
    key: '', recipient: '', userKey: '', siteKey: '', site: '', report: '', companyId: '', userEmail: '', company: '', logo: '', user: '',
    date: '', time: '', timeStamp: '', so: '', soCoNo: '', companyNumber:'', soKey: '', trousers: '', trouserSize: '', shirt: '', shirtSize: '', jacket: '',
    jacketSize: '', jersey: '', jerseySize: '', stepboots: '', boots: '', stepbootSize: 0, bootSize: 0, beanie: '', tie: '', rainsuit: '', rainsuitSize: '', cap: '',
    belt: '', beltSize: 0, manSig: '', qty1: 0, qty2: 0, qty3: 0, qty4: 0, shoes: '', shoeSize: 0, shoesqty5: 0, stepqty5: 0, qty5: 0, qty6: 0, qty7: 0, qty8: 0, qty9: 0, qty10: 0,
    lat: 0, lng: 0, acc: 0, clientEmail: '', emailToClient: '', companyEmail: '', emailUser: true, emailClient: '',
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;
  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  guardIdCollection: AngularFirestoreCollection<any>;
  guardId: Observable<any[]>;
  guardsCollection: AngularFirestoreCollection<any>;
  guards: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  

  siteValue: boolean = true;
  soValue: boolean = true;
  trouserValue: boolean = true;
  tsizeValue: boolean = true;
  shoesvalue: boolean = true;
  shoes: boolean = true;
  shirtValue: boolean = true;
  ssizeValue: boolean = true;
  jacketValue: boolean = true;
  jsizeValue: boolean = true;
  jerseyValue: boolean = true;
  jesizeValue: boolean = true;
  bootsValue: boolean = true;
  stepbsizeValue: boolean = true;
  stepbootsValue: boolean = true;
  bsizeValue: boolean = true;
  beanieValue: boolean = true;
  tieValue: boolean = true;
  capValue: boolean = true;
  beltValue: boolean = true;
  besizeValue: boolean = true;
  rainValue: boolean = true;
  rsizeValue: boolean = true;
  sigValue: boolean = true;
  proceed: boolean = true;
  submit: boolean = false;
  emailValue: boolean = true;
  slideNum = null;
  sitesValues: boolean = false;
  history: boolean = false;

  emailOption: boolean;
  public formData: any;
  update;
  isApp: boolean;
  nxtButton: boolean = true;
  prevButton: boolean = false;
  exitButton: boolean = true;
  slideNumber: number = 0;

  data;
  id;
  view: boolean = false;
  passedForm;
  saved = false;

  @ViewChild('slides') slides: IonSlides;
  @ViewChild('content') content: IonContent;

  signaturePadOptions: Object = {
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  constructor(public popoverController:PopoverController, private platform: Platform, public geolocation: Geolocation, public alertCtrl: AlertController, public toast: ToastService,
    public loadingCtrl: LoadingController, private afs: AngularFirestore, public navCtrl: NavController, public PdfService: PdfService,
    public loading: LoadingService, public router: Router, private activatedRoute: ActivatedRoute, private storage: Storage,
    public actionCtrl: ActionSheetController) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.ready().then(() => {
          this.storage.get('user').then((user) => {
            if (user.key) {
              var id = user.key;
              this.displayUser(id);
              this.searchSites(id);
            }
            this.getLocation();
            this.uniform.key = UUID.UUID();
            this.uniform.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
            this.uniform.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
            this.uniform.report = 'Uniform Order';
            this.uniform.timeStamp = this.uniform.date + ' at ' + this.uniform.time;
            this.slides.lockSwipes(true);
            this.slides.lockSwipeToNext(true);
          });
        });
        this.getLocation();
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('uniforms').doc(this.data.key).ref.get().then((uniform) => {
          this.passedForm = uniform.data();
          if (this.passedForm) {
            this.uniform = this.passedForm;
          }
        });
      });
    } else {
      this.storage.get(this.id).then((uniform) => {
        this.uniform = uniform;
        this.saved = true;
      });
    }
    if ((!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'))) {
      this.isApp = true;
    }
    else {
      this.isApp = false;
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

    this.uniform[`${this.role.data.for}`] = this.role.data.out
    console.log(this.uniform);
    
  }


  displayUser(id) {
    this.storage.get('user').then((user) => {
      this.uniform.user = user.name;
      this.uniform.company = user.company;
      this.uniform.userEmail = user.email;
      this.uniform.userKey = user.key;
      this.uniform.companyId = user.companyId;
      if (user.logo !== undefined) {
        this.uniform.logo = user.logo;
      }
      else if (user.logo === undefined) {
        this.uniform.logo = "https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/imageedit_7_3169327620.png?alt=media&token=b8388ba1-61a5-4f09-9547-74f7cbede557";
      }
      this.afs.collection('companies').doc(user.companyId).ref.get().then((company: any) => {
        if (company.data().uniform !== '' && company.data().uniform !== undefined) {
          this.uniform.companyEmail = company.data().uniform;
          console.log(this.uniform.companyEmail);
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
      if (position.coords.latitude !== undefined) {
        this.uniform.lat = position.coords.latitude;
        this.uniform.lng = position.coords.longitude;
        this.uniform.acc = position.coords.accuracy;
        console.log(position.coords.accuracy);
      }
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

  async exit() {
    let prompt = await this.alertCtrl.create({
      header: 'Exit Form',
      message: "Are you sure you want to Exit?",
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
  getSiteDetails(uniform) {
    this.siteDetailsCollection = this.afs.collection('sites', ref => ref.where('key', '==', uniform.siteKey));
    this.siteDetails = this.siteDetailsCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.siteDetails.subscribe(sites => {
      sites.forEach(site => {
        this.uniform.site = site.name;
        this.uniform.siteKey = site.key;
        if (site.recipient) {
          this.uniform.recipient = site.recipient;
        }
        if (site.email) {
          this.uniform.clientEmail = site.email;
        }
      });
    });
    this.loading.present('Fetching Staff...');
    setTimeout(() => {
      this.loading.dismiss();
    }, 30000);
    return this.getGuards(uniform).pipe(take(1)).subscribe(() => {
      this.loading.dismiss();
    });
  }

  getGuards(uniform) {
    this.guardsCollection = this.afs.collection('guards', ref => ref.where('siteId', '==', uniform.siteKey).orderBy('name'));
    return this.guards = this.guardsCollection.valueChanges();
  }

  guardDetails(uniform) {
    this.guardIdCollection = this.afs.collection(`guards`, ref => ref.where('Key', '==', uniform.soKey));
    this.guardId = this.guardIdCollection.snapshotChanges().pipe(map(changes => {
      return changes.map((a: any) => { 
        const info = a.payload.doc.data();
        const key = a.payload.doc.id;
        return { key, ...info };
      });
    }));
    this.guardId.subscribe(guards => {
      guards.forEach(guard => {
        this.uniform.so = guard.name;
        if (guard.CoNo !== undefined) {
          this.uniform.soCoNo = guard.CoNo;
        }
        this.uniform.soKey = guard.Key;
      });
    });
  }

  check(uniform) {

    if (this.uniform.site !== undefined && this.uniform.site !== '') {
      this.siteValue = true;
    } else {
      this.siteValue = false;
    }
    if (this.uniform.so !== undefined && this.uniform.so !== '') {
      this.soValue = true;
    } else {
      this.soValue = false;
    }
    if (this.uniform.shoes !== undefined && this.uniform.shoes !== '') {
      this.shoes = true;
    } else {
      this.shoes = false;
    }
    if (this.uniform.trousers !== undefined && this.uniform.trousers !== '') {
      this.trouserValue = true;
    } else {
      this.trouserValue = false;
    }
    if (this.uniform.shirt !== undefined && this.uniform.shirt !== '') {
      this.shirtValue = true;
    } else {
      this.shirtValue = false;
    }
    if (this.uniform.jacket !== undefined && this.uniform.jacket !== '') {
      this.jacketValue = true;
    } else {
      this.jacketValue = false;
    }
    if (this.uniform.jersey !== undefined && this.uniform.jersey !== '') {
      this.jerseyValue = true;
    } else {
      this.jerseyValue = false;
    }
    if (this.uniform.boots !== undefined && this.uniform.boots !== '') {
      this.bootsValue = true;
    } else {
      this.bootsValue = false;
    }
    if (this.uniform.stepboots !== undefined && this.uniform.stepboots !== '') {
      this.stepbootsValue = true;
    } else {
      this.stepbootsValue = false;
    }
    if (this.uniform.beanie !== undefined && this.uniform.beanie !== '') {
      this.beanieValue = true;
    } else {
      this.beanieValue = false;
    }
    if (this.uniform.tie !== undefined && this.uniform.tie !== '') {
      this.tieValue = true;
    } else {
      this.tieValue = false;
    }
    if (this.uniform.cap !== undefined && this.uniform.cap !== '') {
      this.capValue = true;
    } else {
      this.capValue = false;
    }
    if (this.uniform.belt !== undefined && this.uniform.belt !== '') {
      this.beltValue = true;
    } else {
      this.beltValue = false;
    }
    if (this.uniform.rainsuit !== undefined && this.uniform.rainsuit !== '') {
      this.rainValue = true;
    } else {
      this.rainValue = false;
    }
    if (this.uniform.manSig !== undefined && this.uniform.manSig !== '') {
      this.sigValue = true;
    } else {
      this.sigValue = false;
    }
   // console.log(this.uniform);

    this.send(uniform);
  }

  downloadPdf() {
    if( this.uniform.companyNumber == ''){this.uniform.companyNumber = 'N/A'}
    this.PdfService.download(this.uniform).then(() => {
      this.afs.collection('uniforms').doc(this.uniform.key).set(this.uniform).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Uniform Order Sent Successfully!');
          });
        });
      });
    });
  }

  send(uniform) {

    if (this.uniform.site !== undefined && this.uniform.site !== '') {
      this.siteValue = true;

      if (this.uniform.so !== undefined && this.uniform.so !== '') {
        this.soValue = true;

        if (this.uniform.trousers !== undefined && this.uniform.trousers !== '') {
          this.trouserValue = true;

          if (this.uniform.shirt !== undefined && this.uniform.shirt !== '') {
            this.shirtValue = true;

            if (this.uniform.jacket !== undefined && this.uniform.jacket !== '') {
              this.jacketValue = true;

              if (this.uniform.jersey !== undefined && this.uniform.jersey !== '') {
                this.jerseyValue = true;

                if (this.uniform.boots !== undefined && this.uniform.boots !== '') {
                  this.bootsValue = true;

                  if (this.uniform.beanie !== undefined && this.uniform.beanie !== '') {
                    this.beanieValue = true;

                    if (this.uniform.tie !== undefined && this.uniform.tie !== '') {
                      this.tieValue = true;

                      if (this.uniform.cap !== undefined && this.uniform.cap !== '') {
                        this.capValue = true;

                        if (this.uniform.belt !== undefined && this.uniform.belt !== '') {
                          this.beltValue = true;

                          if (this.uniform.rainsuit !== undefined && this.uniform.rainsuit !== '') {
                            this.rainValue = true;

                            if (this.uniform.manSig !== undefined && this.uniform.manSig !== '') {
                              this.sigValue = true;

                              if (this.uniform.shoes !== undefined && this.uniform.shoes !== '') {
                                this.shoes = true
                              } else { this.completeActionSheet() }
                              
                              if (this.uniform.emailClient === 'User Choice') {

                                if (this.uniform.emailToClient !== undefined && this.uniform.emailToClient !== '') {
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
                            this.rainValue = false;
                            this.invalidActionSheet();
                          }
                        } else {
                          this.beltValue = false;
                          this.invalidActionSheet();
                        }
                      } else {
                        this.capValue = false;
                        this.invalidActionSheet();
                      }
                    } else {
                      this.tieValue = false;
                      this.invalidActionSheet();
                    }
                  } else {
                    this.beanieValue = false;
                    this.invalidActionSheet();
                  }
                } else {
                  this.bootsValue = false;
                  this.invalidActionSheet();
                }
              } else {
                this.jerseyValue = false;
                this.invalidActionSheet();
              }
            } else {
              this.jacketValue = false;
              this.invalidActionSheet();
            }
          } else {
            this.shirtValue = false;
            this.invalidActionSheet();
          }
        } else {
          this.trouserValue = false;
          this.invalidActionSheet();
        }
      } else {
        this.soValue = false;
        this.invalidActionSheet();
      }
    } else {
      this.siteValue = false;
      this.invalidActionSheet();
    }

  }

  step2(uniform) {
    this.loading.present('Saving Please Wait...').then(() => {
      this.afs.collection('uniforms').doc(this.uniform.key).set(this.uniform).then(() => {
        this.navCtrl.pop().then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Uniform Order Sent Successfully!');
          });
        });
      });
    });
  }

  save(uniform) {
    this.storage.set(this.uniform.key, this.uniform).then(() => {
      this.navCtrl.pop().then(() => {
        this.toast.show('Uniform Order Saved Successfully');
      });
    });
  }

  edit() {
    this.view = true;
  }

  delete() {
    this.storage.remove(this.uniform.key).then(() => {
      this.router.navigate(['/forms']).then(() => {
        this.toast.show('Report Successfully Deleted!');
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
            this.step2(this.uniform);
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
            this.PdfService.download(this.uniform);
          }
        },
        {
          text: 'Delete Form',
          icon: 'trash',
          cssClass: 'dangerAction',
          handler: () => {
            this.delFunction(this.uniform);
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
              this.afs.collection('uniforms').doc(report.key).delete().then(() => {
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
            this.save(this.uniform);
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

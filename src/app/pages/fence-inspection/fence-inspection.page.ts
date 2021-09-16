import { PopoverComponent } from '../../components/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { Component,ViewChild, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';

import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-fence-inspection',
  templateUrl: './fence-inspection.page.html',
  styleUrls: ['./fence-inspection.page.scss'],
})

export class FenceInspectionPage implements OnInit {
  

 


  constructor(  public popoverController:PopoverController,public pdf:PdfService, public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute) { 
      this.id = this.activatedRoute.snapshot.paramMap.get('id'); // offline 1/6

    }

    async before() { 
      const actionSheet = await this.actionCtrl.create({
        header: ``,
        mode: 'ios',
        cssClass: 'actionSheet',
        buttons: [
          {
            text: 'SAVE',
            // icon: 'save',
            // cssClass: 'successAction',
            handler: () => {
                    this.save()
  
            },
  
          },
          {
            text: 'SAVE & DOWNLOAD',
            // icon: 'save',
            // cssClass: 'successAction',
            handler: () => {
              this.pdf.download(this.appeal).then(()=>{
                              this.save()
                            })
            },
  
          }
        ]
      });
      await actionSheet.present();
    }
  view;
    

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

    this.appeal[`${this.role.data.for}`] = this.role.data.out
  }




id;
  appeal
    = {
      sigUser:'',
      report:'fence-inspection',
      time: '',
      key: '',
      site: [],
      date: '',
      user: '',
      userKey: '',
      userEmail: '',
      company: '',
      companyId: '',
      by: '',
      book: '',
      start: '',
      finish: '',
      vegetation: '',
      bob: '',
      wire: '',
      brackets: '',
      posts: '',
      strobe: '',
      siren: '',
      energizer: '',
      spikes: '',
      thirtymeter: '',
      danger: '',
      tenmeter: '',
      south: '',
      mimic: '',
      signal: '',

    }
    sigUser=true
  time = true
  signal = true
  book = true
  by = true
  start = true
  finish = true
  vegetation = true
  bob = true
  wire = true
  brackets = true
  strobe = true
  posts = true
  siren = true
  energizer = true
  spikes = true
  thirtymeter = true
  south = true
  tenmeter = true
  mimic = true
  danger = true


  ngOnInit() {
   
    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        this.appeal.by= this.appeal.user = user.name;
         this.appeal.userKey = user.key;
         this.appeal.userEmail =  user.email;
         this.appeal.company = user.company;
         this.appeal.companyId = user.companyId;
         this.appeal.key = UUID.UUID();
         this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY-MM-DD');
         this.appeal.time = moment(new Date().toISOString()).locale('en').format('HH:mm');
       });
       } else {
      this.storage.get(this.id).then((visit) => {
        this.appeal = visit;
      });
    }

  }

  
  add() {
    this.appeal.site.push({ site: '', voltage: '', kv: '' })
  }

  async invalidActionSheet() { // offline 6/6
    const actionSheet = await this.actionCtrl.create({
      header: `Incomplete Form: Complete the highlighted in order to save`,
      mode: 'ios',
      cssClass: 'actionSheet',
      buttons: [
        {
          text: 'OK',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
          },

        },
        {
          text: 'SAVE & EXIT',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
            this.storage.set(this.appeal.key, this.appeal).then(() => {
              this.navCtrl.pop();
            })
          },

        }
      ]
    });
    await actionSheet.present();
  }


  check() {
    if (this.appeal.signal == '') { this.signal = false } else { this.signal = true }
    if (this.appeal.time == '') { this.time = false } else { this.time = true }
    if (this.appeal.sigUser == '') { this.sigUser = false } else { this.sigUser = true }
    if (this.appeal.south == '') { this.south = false } else { this.south = true }
    if (this.appeal.mimic == '') { this.mimic = false } else { this.mimic = true }
    if (this.appeal.by == '') { this.by = false } else { this.by = true }
    if (this.appeal.book == '') { this.book = false } else { this.book = true }
    if (this.appeal.start == '') { this.start = false } else { this.start = true;  }
    if (this.appeal.finish == '') { this.finish = false } else { this.finish = true;   }
    if (this.appeal.vegetation == '') { this.vegetation = false } else { this.vegetation = true }
    if (this.appeal.bob == '') { this.bob = false } else { this.bob = true }
    if (this.appeal.wire == '') { this.wire = false } else { this.wire = true }
    if (this.appeal.brackets == '') { this.brackets = false } else { this.brackets = true }
    if (this.appeal.posts == '') { this.posts = false } else { this.posts = true }
    if (this.appeal.strobe == '') { this.strobe = false } else { this.strobe = true }
    if (this.appeal.siren == '') { this.siren = false } else { this.siren = true }
    if (this.appeal.energizer == '') { this.energizer = false } else { this.energizer = true }
    if (this.appeal.spikes == '') { this.spikes = false } else { this.spikes = true }
    if (this.appeal.thirtymeter == '') { this.thirtymeter = false } else { this.thirtymeter = true }
    if (this.appeal.danger == '') { this.danger = false } else { this.danger = true }
    if (this.appeal.tenmeter == '') { this.tenmeter = false } else { this.tenmeter = true }

    if (this.sigUser== true && this.time == true && this.signal == true && this.tenmeter == true && this.south == true && this.mimic == true && this.posts == true && this.strobe == true && this.siren == true && this.energizer == true && this.spikes == true && this.thirtymeter == true && this.danger == true && this.by == true && this.book == true && this.start == true && this.finish == true && this.vegetation == true && this.bob == true && this.wire == true && this.brackets == true) {  this.before() }
    else { this.invalidActionSheet(); 
     }
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

  save() {
    this.appeal.start = moment(this.appeal.start).format('HH:mm')
    this.appeal.finish = moment(this.appeal.finish).format('HH:mm')
    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////
 this.loading.present('Saving').then(() => {
      this.afs.collection('fenceInspection').doc(this.appeal.key).set(this.appeal).then(() => {
        this.loading.dismiss()
        this.toast.show('Saved')
      this.storage.remove(this.appeal.key).then(() => { 
        this.router.navigate(['forms']).then(() => {
          this.loading.dismiss().then(() => {
            this.toast.show('Saved Successfully!');
          });
        });
      });
    })
      })
    })
  }







}


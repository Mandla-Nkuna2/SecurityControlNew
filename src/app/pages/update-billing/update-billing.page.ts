import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { ToastService } from '../../services/toast.service';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { map } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
declare var google;

@Component({
  selector: 'app-update-billing',
  templateUrl: './update-billing.page.html',
  styleUrls: ['./update-billing.page.scss'],
})

export class UpdateBillingPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: false,
    startDate: Date, endDate: Date
  };

  bill = {
    key: '', amount: null, month: '', exRate: null, incRate: null, status: '', dateStamp: Date, companyId: '', company: '',
    due: Date, invDate: '',
  };

  company = {
    name: '',
    address: '',
    country: '',
    lat: null,
    lng: null,
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

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  companys: Observable<any[]>;

  addressValid: boolean = true;
  companyValid: boolean = true;
  nameValid: boolean = true;
  telValid: boolean = true;
  emailValid: boolean = true;
  vatValid: boolean = true;
  update;


  @ViewChild('searchbar') searchbar: ElementRef;
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;

  addressElement: HTMLInputElement = null;

  error: any;

  constructor(public toast: ToastService, public loadingCtrl: LoadingController, public alertCtrl: AlertController,
    private afs: AngularFirestore, public navCtrl: NavController, private storage: Storage, public loading: LoadingService,
    public modalCtrl: ModalController) {
  }

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
          this.user.companyId = user.companyId;
          this.companyCollection = this.afs.collection('companies', ref => ref.where('key', '==', `${this.user.companyId}`));
          this.companys = this.companyCollection.snapshotChanges().pipe(map(changes => {
            return changes.map((a: any) => { 
              const info = a.payload.doc.data();
              const key = a.payload.doc.id;
              return { key, ...info };
            })
          }));
          this.companys.subscribe(companys => {
            companys.forEach(company => {
              this.company.name = company.name;
              this.company.contact = company.contact;
              this.company.address = company.address;
              this.company.email = company.email;
              this.company.vat = company.vat;
              this.company.rep = company.rep;
              this.company.country = company.country;
              this.company.key = company.key;
              this.company.lat = company.lat;
              this.company.lng = company.lng;
              if (this.company.vat === undefined) {
                this.company.vat = '';
              }
            });
          });
        });
      });
    });
  }

  public handleAddressChange(address: Address, ) {
    var add = address.formatted_address;
    this.company.address = add;
    var contact = address.formatted_phone_number;
    this.company.lat = address.geometry.location.lat();
    this.company.lng = address.geometry.location.lng();
    for (var i = 0; i < address.address_components.length; i++) {
      if (address.address_components[i].types[0] === 'country') {
        this.company.country = address.address_components[i].long_name;
      }
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async invalidMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
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

  save(company) {
    if (this.company.address !== undefined && this.company.address !== '') {
      this.addressValid = true;

      if (this.company.name !== undefined && this.company.name !== '') {
        this.nameValid = true;

        if (this.company.rep !== undefined && this.company.rep !== '') {
          this.nameValid = true;

          if (this.company.contact !== undefined && this.company.contact !== null) {
            this.telValid = true;

            if (this.company.email !== undefined && this.company.email !== '') {
              this.emailValid = true;

              this.loading.present('Saving Please Wait...');
              this.update = {
                address: company.address,
                name: company.name,
                rep: company.rep,
                contact: company.contact,
                email: company.email,
                country: company.country,
                lat: this.company.lat,
                lng: this.company.lng,
                vat: this.company.vat
              };
              this.afs.collection('companies').doc(this.company.key).update(this.update).then(() => {
                this.toast.show('Billing Details Successfully Updated!');
                this.modalCtrl.dismiss();
                this.loading.dismiss();
              });
              this.loading.dismiss();
            } else {
              this.emailValid = false;
              this.invalidMsg();
            }
          } else {
            this.telValid = false;
            this.invalidMsg();
          }
        } else {
          this.nameValid = false;
          this.invalidMsg();
        }
      } else {
        this.nameValid = false;
        this.invalidMsg();
      }
    } else {
      this.addressValid = false;
      this.invalidMsg();
    }
  }

}


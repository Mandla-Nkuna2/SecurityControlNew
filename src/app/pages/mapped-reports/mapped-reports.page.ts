import { NavController, LoadingController, ModalController, AlertController, Platform } from '@ionic/angular';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import 'leaflet';
declare let L;
import { MapReportDetailsPage } from '../map-report-details/map-report-details.page';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-mapped-reports',
  templateUrl: './mapped-reports.page.html',
  styleUrls: ['./mapped-reports.page.scss'],
})

export class MappedReportsPage implements OnInit {

  location = {
    report: '', site: '', qty: 20,
  };

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  company = {
    name: '', address: '', country: '', lat: '', lng: '', vat: '', contact: null, email: '', rep: '', logo: '', key: '',
    sites: null, workDays: null, companyLeave: null, visit: '', visitUser: false, visitClient: '', meeting: '', meetingUser: false,
    meetingClient: '', uniform: '', uniformUser: false, uniformClient: '', incident: '', incidentUser: false, incidentClient: '',
    vehicle: '', vehicleUser: false, vehicleClient: '', disciplinary: '', disciplinaryUser: false, disciplinaryClient: '',
    training: '', trainingUser: false, trainingClient: '', transparency: '', transparencyUser: false, transparencyClient: '',
    ec: '', ecUser: false, ecClient: '', incidentGen: '', incidentGenUser: false, incidentGenClient: '', leave: '', leaveUser: false,
    leaveClient: '', arVisit: '', arVisitUser: false, arVisitClient: '', ob: '', obUser: false, obClient: '', assessment: '',
    assessmentUser: false, assessmentClient: '', tenant: '', tenantUser: false, tenantClient: '', instruction: '',
    instructionUser: false, instructionClient: '', notification: '', notificationUser: false, notificationClient: '',
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  siteDetailsCollection: AngularFirestoreCollection<any>;
  siteDetails: Observable<any[]>;
  companysCollection: AngularFirestoreCollection<any>;
  companys: Observable<any[]>;

  visitsGroup: any;
  visitsAdded: boolean = false;
  visitsCollection: AngularFirestoreCollection<any>;
  visits: Observable<any[]>;

  visitsGenGroup: any;
  visitsGenAdded: boolean = false;
  visitsGenCollection: AngularFirestoreCollection<any>;
  visitsGen: Observable<any[]>;

  vehiclesGroup: any;
  vehiclesAdded: boolean = false;
  vehicleCollection: AngularFirestoreCollection<any>;
  vehicles: Observable<any[]>;

  trainingsGroup: any;
  trainingsAdded: boolean = false;
  trainingCollection: AngularFirestoreCollection<any>;
  training: Observable<any[]>;

  incidentsGroup: any;
  incidentsAdded: boolean = false;
  incidentCollection: AngularFirestoreCollection<any>;
  incidents: Observable<any[]>;

  incidentGenGroup: any;
  incidentGensAdded: boolean = false;
  incGenCollection: AngularFirestoreCollection<any>;
  incGen: Observable<any[]>;

  transGroup: any;
  transAdded: boolean = false;
  transsCollection: AngularFirestoreCollection<any>;
  trans: Observable<any[]>;

  uniformsGroup: any;
  uniformsAdded: boolean = false;
  uniCollection: AngularFirestoreCollection<any>;
  uni: Observable<any[]>;

  disciplinaryGroup: any;
  disciplinaryAdded: boolean = false;
  discCollection: AngularFirestoreCollection<any>;
  disc: Observable<any[]>;

  leaveGroup: any;
  leaveAdded: boolean = false;
  leaveCollection: AngularFirestoreCollection<any>;
  leave: Observable<any[]>;

  meetingsGroup: any;
  meetingsAdded: boolean = false;
  meetCollection: AngularFirestoreCollection<any>;
  meet: Observable<any[]>;

  sitesGroup: any;
  sitesAdded: boolean = false;
  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;

  arvisitsGroup: any;
  arvisitsAdded: boolean = false;
  arvisitsCollection: AngularFirestoreCollection<any>;
  arvisits: Observable<any[]>;

  pnpGroup: any;
  pnpAdded: boolean = false;
  pnpCollection: AngularFirestoreCollection<any>;
  pnps: Observable<any[]>;

  number: number;
  siteLat: any;
  siteLng: any;
  reportValue: boolean = true;
  typeValue: boolean = true;
  siteValue: boolean = true;
  qtyValue: boolean = true;

  map;
  first = true;

  main = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/marker-icon.png',
      shadowUrl: './assets/leaflet/leaflet-icons/marker-shadow.png',
    })
  };

  train = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/schools.png',
    })
  };

  vehicle = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/automotive.png',
    })
  };

  site = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/coffee.png',
    })
  };

  discipline = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/law.png',
    })
  };

  meeting = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/meetups.png',
    })
  };

  uniforms = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/clothings.png',
    })
  };

  visit = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/home.png',
    })
  };

  pnp = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/home.png',
    })
  };

  tour = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/tours.png',
    })
  };

  incident = {
    icon: L.icon({
      iconSize: [30, 41],
      iconAnchor: [13, 0],
      iconUrl: './assets/leaflet/leaflet-icons/engineering.png',
    })
  };


  constructor(public alertCtrl: AlertController, public modalCtrl: ModalController, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public navCtrl: NavController, private storage: Storage, public loading: LoadingService,
    private platform: Platform, private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.usersCollection = this.afs.collection('users', ref => ref.where('key', '==', user.key));
      this.users = this.usersCollection.valueChanges();
      this.users.subscribe(users => {
        users.forEach(user => {
          this.user.companyId = user.companyId;
          this.companysCollection = this.afs.collection('companies', ref => ref.where('key', '==', `${this.user.companyId}`));
          this.companys = this.companysCollection.valueChanges();
          this.companys.subscribe(companys => {
            companys.forEach(company => {
              this.company.lat = company.lat;
              this.company.lng = company.lng;
              this.company.address = company.address;
              this.loadMap();
              this.sitesCollection = this.afs.collection('sites', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('name'));
              this.sites = this.sitesCollection.valueChanges();
            });
          });
        });
      });
    });
  }

  loadMap() {

    const map = L.map('map').setView([this.company.lat, this.company.lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    this.setup(map);
  }

  setup(map) {
    this.groups(map);
    if (this.company.lat !== null && this.company.lat !== undefined) {
      const marker = L.marker([this.company.lat, this.company.lng], this.main)
        .on('click', async () => {
          let prompt = await this.alertCtrl.create({
            header: 'OFFICE',
            message: `${this.company.address}`,
            buttons: [
              {
                text: 'OK',
                handler: data => {
                }
              }
            ]
          });
          return await prompt.present();
        }).addTo(map);
    }
    this.sitesFunc(map);
  }

  groups(map) {
    this.sitesGroup = L.featureGroup().addTo(map);
    this.pnpGroup = L.featureGroup().addTo(map);
    this.visitsGroup = L.featureGroup().addTo(map);
    this.arvisitsGroup = L.featureGroup().addTo(map);
    this.vehiclesGroup = L.featureGroup().addTo(map);
    this.visitsGenGroup = L.featureGroup().addTo(map);
    this.trainingsGroup = L.featureGroup().addTo(map);
    this.incidentsGroup = L.featureGroup().addTo(map);
    this.incidentGenGroup = L.featureGroup().addTo(map);
    this.meetingsGroup = L.featureGroup().addTo(map);
    this.leaveGroup = L.featureGroup().addTo(map);
    this.transGroup = L.featureGroup().addTo(map);
    this.uniformsGroup = L.featureGroup().addTo(map);
    this.disciplinaryGroup = L.featureGroup().addTo(map);
  }

  filter(map, location) {
    console.log(location.report, location.site, location.qty);

    if (location.report !== undefined && location.report !== '') {
      this.reportValue = true;

      if (location.site !== undefined && location.site !== '') {
        this.siteValue = true;

        if (location.qty !== undefined && location.qty !== '') {
          this.qtyValue = true;

          var numReps = location.qty;
          location.qty = parseInt(numReps);
          this.checkMarkers(map);
        }
        else {
          this.qtyValue = false;
          this.alertMsg('Qty');
        }
      }
      else {
        this.siteValue = false;
        this.alertMsg('Site');
      }
    }
    else {
      this.reportValue = false;
      this.alertMsg('Report Type');
    }
  }

  async alertMsg(value) {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Filter',
      cssClass: 'alert',
      message: `Please Select a value for ${value}`,
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

  checkMarkers(map) {
    this.loading.present('Filtering, Please Wait...');
    setTimeout(() => {
      this.loading.dismiss();
    }, 1000);
    if (this.visitsAdded) {
      this.visitsGroup.clearLayers();
      this.visitsAdded = false;
    }
    if (this.arvisitsAdded) {
      this.arvisitsGroup.clearLayers();
      this.arvisitsAdded = false;
    }
    if (this.vehiclesAdded) {
      this.vehiclesGroup.clearLayers();
      this.vehiclesAdded = false;
    }
    if (this.visitsGenAdded) {
      this.visitsGenGroup.clearLayers();
      this.visitsGenAdded = false;
    }
    if (this.trainingsAdded) {
      this.trainingsGroup.clearLayers();
      this.trainingsAdded = false;
    }
    if (this.incidentsAdded) {
      this.incidentsGroup.clearLayers();
      this.incidentsAdded = false;
    }
    if (this.incidentGensAdded) {
      this.incidentGenGroup.clearLayers();
      this.incidentGensAdded = false;
    }
    if (this.meetingsAdded) {
      this.meetingsGroup.clearLayers();
      this.meetingsAdded = false;
    }
    if (this.leaveAdded) {
      this.leaveGroup.clearLayers();
      this.leaveAdded = false;
    }
    if (this.transAdded) {
      this.transGroup.clearLayers();
      this.transAdded = false;
    }
    if (this.uniformsAdded) {
      this.uniformsGroup.clearLayers();
      this.uniformsAdded = false;
    }
    if (this.disciplinaryAdded) {
      this.disciplinaryGroup.clearLayers();
      this.disciplinaryAdded = false;
    }
    if (this.sitesAdded) {
      this.sitesGroup.clearLayers();
      this.sitesAdded = false;
    }
    if (this.pnpAdded) {
      this.pnpGroup.clearLayers();
      this.pnpAdded = false;
    }
    this.filteredFunc(map, this.location);
  }

  filteredFunc(map, location) {
    if (this.location.report === 'SITES') {
      this.sitesFunc(map);
    }
    else if (this.location.report === 'SITE VISIT REPORTS') {
      this.visitsFunc(map, location);
    }
    else if (this.location.report === 'TRANSPARENCY REPORTS') {
      this.transFunc(map, location);
    }
    else if (this.location.report === 'SITE VISIT GEN') {
      this.visitsGenFunc(map, location);
    }
    else if (this.location.report === 'VEHICLE INSPECTIONS') {
      this.vehicleFunc(map, location);
    }
    else if (this.location.report === 'CRIME INCIDENTS') {
      this.incidentFunc(map, location);
    }
    else if (this.location.report === 'GENERAL INCIDENTS') {
      this.incidentsGenFunc(map, location);
    }
    else if (this.location.report === 'TRAINING FORMS') {
      this.trainingFunc(map, location);
    }
    else if (this.location.report === 'MEETINGS') {
      this.meetingsFunc(map, location);
    }
    else if (this.location.report === 'DISCIPLINARYS') {
      this.disciplinaryFunc(map, location);
    }
    else if (this.location.report === 'LEAVE APPS') {
      this.leaveFunc(map, location);
    }
    else if (this.location.report === 'UNIFORM ORDERS') {
      this.uniformFunc(map, location);
    }
    else if (this.location.report === 'AR SITE VISITS') {
      this.arsiteFunc(map, location);
    }
    else if (this.location.report === 'PNP') {
      this.pnpFunc(map, location);
    }
  }

  sitesFunc(map) {
    this.sitesCollection = this.afs.collection('sites', ref => ref.where('companyId', '==', `${this.user.companyId}`));
    this.sites = this.sitesCollection.valueChanges();
    this.sites.subscribe(sites => {
      sites.forEach(object => {
        if (object.companyId === this.user.companyId) {
          const marker = L.marker([object.lat, object.lng], this.site).addTo(this.sitesGroup)
            .on('click', async () => {
              let prompt = await this.alertCtrl.create({
                header: `SITE: ${object.name}`,
                message: `${object.address}` + '<br><br>' + `Client: ${object.client}`,
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
      });
    });
    if (this.sitesGroup !== undefined) {
      this.sitesAdded = true;
    } else {
      this.sitesAdded = false;
    }
  }

  visitsFunc(map, location) {
    if (location.site === 'ALL') {
      this.visitsCollection = this.afs.collection('sitevisits', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.visits = this.visitsCollection.valueChanges();
      this.visits.subscribe(visit => {
        visit.forEach(object => {
          if (object.lat !== null) {
            const marker = L.marker([object.lat, object.lng], this.visit)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.visitsGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.visitsCollection = this.afs.collection('sitevisits', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.visits = this.visitsCollection.valueChanges();
      this.visits.subscribe(visit => {
        visit.forEach(object => {
          if (object.lat !== null) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.visit)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.visitsGroup);
            }
          }
        });
      });
    }
    if (this.visitsGroup !== undefined) {
      this.visitsAdded = true;
    } else {
      this.visitsAdded = false;
    }
  }

  arsiteFunc(map, location) {
    if (location.site === 'ALL') {
      this.arvisitsCollection = this.afs.collection('arVisits', ref => ref.where('companyId', '==', `${this.user.companyId}`));
      this.arvisits = this.arvisitsCollection.valueChanges();
      this.arvisits.subscribe(visit => {
        visit.forEach(object => {
          if (object.lat !== null) {
            const marker = L.marker([object.lat, object.lng], this.visit)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.arvisitsGroup);
          }
        })
      })
    }
    else {
      this.arvisitsCollection = this.afs.collection('arVisits', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('name', '==', `${location.site}`));
      this.arvisits = this.arvisitsCollection.valueChanges();
      this.arvisits.subscribe(visit => {
        visit.forEach(object => {
          if (object.lat !== null) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.visit)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.arvisitsGroup);
            }
          }
        });
      });
    }
    if (this.arvisitsGroup !== undefined) {
      this.arvisitsAdded = true;
    } else {
      this.arvisitsAdded = false;
    }
  }

  vehicleFunc(map, location) {
    this.vehicleCollection = this.afs.collection('vehicles', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
    this.vehicles = this.vehicleCollection.valueChanges();
    this.vehicles.subscribe(vehicle => {
      vehicle.forEach(object => {
        if (object.lat !== null) {
          const marker = L.marker([object.lat, object.lng], this.vehicle)
            .on('click', async () => {
              this.loading.present('Opening Please Wait...');
              const modal = await this.modalCtrl.create({
                component: MapReportDetailsPage,
                componentProps: { report: object }
              });
              return await modal.present().then(() => {
                this.loading.dismiss();
              });
            }).addTo(this.vehiclesGroup);
        }
      });
    });
    if (this.vehiclesGroup !== undefined) {
      this.vehiclesAdded = true;
    } else {
      this.vehiclesAdded = false;
    }
  }

  visitsGenFunc(map, location) {
    if (location.site === 'ALL') {
      this.visitsGenCollection = this.afs.collection('visits', ref => ref.where('companyId', '==', `${this.user.companyId}`).limit(location.qty));
      this.visitsGen = this.visitsGenCollection.valueChanges();
      this.visitsGen.subscribe(visit => {
        visit.forEach(object => {
          if (object.lat !== null) {
            const marker = L.marker([object.lat, object.lng], this.visit)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.visitsGenGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.visitsGenCollection = this.afs.collection('visits', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).limit(location.qty));
      this.visitsGen = this.visitsGenCollection.valueChanges();
      this.visitsGen.subscribe(visit => {
        visit.forEach(object => {
          if (object.lat !== null) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.visit)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.visitsGenGroup);
            }
          }
        });
      });
    }
    if (this.visitsGenGroup !== undefined) {
      this.visitsGenAdded = true;
    } else {
      this.visitsGenAdded = false;
    }
  }

  trainingFunc(map, location) {
    if (location.site === 'ALL') {
      this.trainingCollection = this.afs.collection('trainings', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.training = this.trainingCollection.valueChanges();
      this.training.subscribe(train => {
        train.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.train)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.trainingsGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.trainingCollection = this.afs.collection('trainings', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.training = this.trainingCollection.valueChanges();
      this.training.subscribe(train => {
        train.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.train)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.trainingsGroup);
            }
          }
        });
      });
    }
    if (this.trainingsGroup !== undefined) {
      this.trainingsAdded = true;
    } else {
      this.trainingsAdded = false;
    }
  }

  incidentFunc(map, location) {
    if (location.site === 'ALL') {
      this.incidentCollection = this.afs.collection('incidents', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.incidents = this.incidentCollection.valueChanges();
      this.incidents.subscribe(incident => {
        incident.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.incident)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.incidentsGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.incidentCollection = this.afs.collection('incidents', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.incidents = this.incidentCollection.valueChanges();
      this.incidents.subscribe(incident => {
        incident.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.incident)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.incidentsGroup);
            }
          }
        });
      });
    }
    if (this.incidentsGroup !== undefined) {
      this.incidentsAdded = true;
    } else {
      this.incidentsAdded = false;
    }
  }

  incidentsGenFunc(map, location) {
    if (location.site === 'ALL') {
      this.incGenCollection = this.afs.collection('genIncidents', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.incGen = this.incGenCollection.valueChanges();
      this.incGen.subscribe(inc => {
        inc.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.incident)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.incidentGenGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.incGenCollection = this.afs.collection('genIncidents', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.incGen = this.incGenCollection.valueChanges();
      this.incGen.subscribe(inc => {
        inc.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.incident)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.incidentGenGroup);
            }
          }
        });
      });
    }
    if (this.incidentGenGroup !== undefined) {
      this.incidentGensAdded = true;
    } else {
      this.incidentGensAdded = false;
    }
  }

  meetingsFunc(map, location) {
    if (location.site === 'ALL') {
      this.meetCollection = this.afs.collection('meetings', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.meet = this.meetCollection.valueChanges();
      this.meet.subscribe(meeting => {
        meeting.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.meeting)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.meetingsGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.meetCollection = this.afs.collection('meetings', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.meet = this.meetCollection.valueChanges();
      this.meet.subscribe(meeting => {
        meeting.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.meeting)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.meetingsGroup);
            }
          }
        });
      });
    }
    if (this.meetingsGroup) {
      this.meetingsAdded = true;
    } else {
      this.meetingsAdded = false;
    }
  }

  leaveFunc(map, location) {
    if (location.site === 'ALL') {
      this.leaveCollection = this.afs.collection('leaveApps', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.leave = this.leaveCollection.valueChanges();
      this.leave.subscribe(leave => {
        leave.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.tour)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.leaveGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.leaveCollection = this.afs.collection('leaveApps', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.leave = this.leaveCollection.valueChanges();
      this.leave.subscribe(leave => {
        leave.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.tour)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.leaveGroup);
            }
          }
        });
      });
    }
    if (this.leaveGroup !== undefined) {
      this.leaveAdded = true;
    } else {
      this.leaveAdded = false;
    }
  }


  transFunc(map, location) {
    if (location.site === 'ALL') {
      this.transsCollection = this.afs.collection('transparencys', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.trans = this.transsCollection.valueChanges();
      this.trans.subscribe(tran => {
        tran.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.main)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.transGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.transsCollection = this.afs.collection('transparencys', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.trans = this.transsCollection.valueChanges();
      this.trans.subscribe(tran => {
        tran.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.main)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.transGroup);
            }
          }
        });
      });
    }
    if (this.transGroup) {
      this.transAdded = true;
    } else {
      this.transAdded = false;
    }
  }

  uniformFunc(map, location) {
    if (location.site === 'ALL') {
      this.uniCollection = this.afs.collection('uniforms', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.uni = this.uniCollection.valueChanges();
      this.uni.subscribe(uniform => {
        uniform.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.uniforms)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.uniformsGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.uniCollection = this.afs.collection('uniforms', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.uni = this.uniCollection.valueChanges();
      this.uni.subscribe(uniform => {
        uniform.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.uniforms)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.uniformsGroup);
            }
          }
        });
      });
    }
    if (this.uniformsGroup !== undefined) {
      this.uniformsAdded = true;
    } else {
      this.uniformsAdded = false;
    }
  }

  disciplinaryFunc(map, location) {
    if (location.site === 'ALL') {
      this.discCollection = this.afs.collection('disciplinarys', ref => ref.where('companyId', '==', `${this.user.companyId}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.disc = this.discCollection.valueChanges();
      this.disc.subscribe(disc => {
        disc.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            const marker = L.marker([object.lat, object.lng], this.discipline)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.disciplinaryGroup);
          }
        });
      });
    }
    else if (location.site !== 'ALL') {
      this.discCollection = this.afs.collection('disciplinarys', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('site', '==', `${location.site}`).orderBy('date', 'desc').orderBy('time', 'desc').limit(location.qty));
      this.disc = this.discCollection.valueChanges();
      this.disc.subscribe(disc => {
        disc.forEach(object => {
          if (object.lat !== null && object.lat !== undefined) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.discipline)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.disciplinaryGroup);
            }
          }
        });
      });
    }
    if (this.disciplinaryGroup !== undefined) {
      this.disciplinaryAdded = true;
    } else {
      this.disciplinaryAdded = false;
    }
  }

  pnpFunc(map, location) {
    if (location.site === 'ALL') {
      this.pnpCollection = this.afs.collection('pnpvisit', ref => ref.where('companyId', '==', `${this.user.companyId}`));
      this.pnps = this.pnpCollection.valueChanges();
      this.pnps.subscribe(pnp => {
        pnp.forEach(object => {
          if (object.lat !== null) {
            const marker = L.marker([object.lat, object.lng], this.pnp)
              .on('click', async () => {
                this.loading.present('Opening Please Wait...');
                const modal = await this.modalCtrl.create({
                  component: MapReportDetailsPage,
                  componentProps: { report: object }
                });
                return await modal.present().then(() => {
                  this.loading.dismiss();
                });
              }).addTo(this.pnpGroup);
          }
        });
      });
    }
    else {
      this.pnpCollection = this.afs.collection('pnpvisit', ref => ref.where('companyId', '==', `${this.user.companyId}`).where('name', '==', `${location.site}`));
      this.pnps = this.pnpCollection.valueChanges();
      this.pnps.subscribe(pnp => {
        pnp.forEach(object => {
          if (object.lat !== null) {
            if (object.site === location.site) {
              const marker = L.marker([object.lat, object.lng], this.pnp)
                .on('click', async () => {
                  this.loading.present('Opening Please Wait...');
                  const modal = await this.modalCtrl.create({
                    component: MapReportDetailsPage,
                    componentProps: { report: object }
                  });
                  return await modal.present().then(() => {
                    this.loading.dismiss();
                  });
                }).addTo(this.pnpGroup);
            }
          }
        });
      });
    }
    if (this.pnpGroup !== undefined) {
      this.pnpAdded = true;
    } else {
      this.pnpAdded = false;
    }
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Mapped Reports',
        screen_class: 'MappedReportsPage'
      });
    })
  }

}
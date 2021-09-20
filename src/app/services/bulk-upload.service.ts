import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';
import * as XLSX from 'xlsx';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {

  user;
  constructor(private storage: Storage, private http: HttpClient, private afs: AngularFirestore) { }

  onFileChange(ev) {
    return new Promise<any>((resolve, reject) => {
      let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          var data = initial
          resolve(data);
        }, {});
        const dataString = JSON.stringify(jsonData);
      }
      reader.readAsBinaryString(file);
    })
  }

  configure(data, selected) {
    return new Promise<any>((resolve, reject) => {
      var count = 0;
      var sheet: any = Object.values(data)[0]
      for (var c in sheet) {
        count = count + 1;
      }
      this.getUser().then(user => {
        var list = [];
        for (let i = 0; i < count; i++) {
          var item: any = Object.values(sheet)[i]
          if (selected === 'Sites') {
            this.assessSites(item).then((newItem) => {
              if (newItem.Address !== "") {
                this.getAddress(newItem.Address).then(newAddress => {
                  var formattedItem = {
                    key: UUID.UUID(),
                    companyId: user.companyId,
                    name: newItem.Name,
                    client: newItem.Client,
                    clientEmail: newItem.Client_Email,
                    address: newItem.Address,
                    lat: newAddress.lat,
                    lng: newAddress.lng,
                    contact: newItem.Site_Contact_Number,
                    email: newItem.Site_Contact_Email,
                    lastVisit: moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD'),
                    visitBy: user.name,
                    issues: '',
                    visitKey: '',
                    recipient: '',
                  }
                  list.push(formattedItem);
                })
              } else {
                var formattedItem = {
                  key: UUID.UUID(),
                  companyId: user.companyId,
                  name: newItem.Name,
                  client: newItem.Client,
                  clientEmail: newItem.Client_Email,
                  address: '',
                  lat: '',
                  lng: '',
                  contact: newItem.Site_Contact_Number,
                  email: newItem.Site_Contact_Email,
                  lastVisit: moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD'),
                  visitBy: user.name,
                  issues: '',
                  visitKey: '',
                  recipient: '',
                }
                list.push(formattedItem);
              }
            })
          } else {
            this.assessGuards(item).then((newItem) => {
              var formattedItem = {
                Key: UUID.UUID(),
                grade: newItem.Grade,
                photo: '',
                id: newItem.ID_Number,
                AssNo: newItem.PSIRA_Number,
                companyId: user.companyId,
                name: newItem.Full_Name,
                CoNo: newItem.Company_Number,
                cell: newItem.Cell_Number,
                annualUsed: null,
                annualAccrued: null,
                workDays: null,
                siteId: '',
                site: '',
                learnershipNo: '',
                learnershipDate: '',
              }
              list.push(formattedItem);
            })
          }
        }
        resolve(list);
      })
    });
  }

  getUser() {
    return new Promise<any>((resolve, reject) => {
      this.storage.get('user').then(user => {
        resolve(user);
      })
    })
  }

  assessSites(item) {
    return new Promise<any>((resolve, reject) => {
      if (item.Name === undefined) {
        item.Name = 'Site X';
      }
      if (item.Client === undefined) {
        item.Client = '';
      }
      if (item.Client_Email === undefined) {
        item.Client_Email = '';
      }
      if (item.Address === undefined) {
        item.Address = '';
      }
      if (item.Site_Contact_Number === undefined) {
        item.Site_Contact_Number = '';
      }
      if (item.Site_Contact_Email === undefined) {
        item.Site_Contact_Email = '';
      }
      resolve(item);
    })
  }

  async getAddress(address: Address) {
    return new Promise<any>(async (resolve, reject) => {
      this.getPosts(address).subscribe(
        (response: any) => {
          var latlng = {
            lat: response.results[0].geometry.location.lat,
            lng: response.results[0].geometry.location.lng
          }
          resolve(latlng)
        },
        (error) => {
          console.log(error);
        });
    })
  }

  getPosts(address) {
    var newAddress = address.replaceAll(' ', '+');
    var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${newAddress}&key=AIzaSyA7V48MzDIKUvfKm_1AjtRD2rXfyohBIJA`
    return this.http.get(url);
  }

  assessGuards(item) {
    return new Promise<any>((resolve, reject) => {
      if (item.Full_Name === undefined) {
        item.Full_Name = '';
      }
      if (item.Company_Number === undefined) {
        item.Company_Number = '';
      }
      if (item.ID_Number === undefined) {
        item.ID_Number = '';
      }
      if (item.PSIRA_Number === undefined) {
        item.PSIRA_Number = '';
      }
      if (item.Grade === undefined) {
        item.Grade = '';
      }
      if (item.Cell_Number === undefined) {
        item.Cell_Number = '';
      }
      resolve(item);
    })
  }

  getUserSites(user) {
    return new Promise<any>((resolve, reject) => {
      var allsites = [];
      this.afs.collection(`users/${user.key}/sites`).ref.orderBy('name').get().then(sites => {
        sites.forEach((site: any) => {
          allsites.push(site.data())
        })
        resolve(allsites);
      })
    })
  }

  setGuardSite(list, site) {
    return new Promise<any>((resolve, reject) => {
      var newList = [];
      list.forEach(guard => {
        guard.site = site.name;
        guard.siteId = site.key;
        newList.push(guard);
      });
      resolve(newList);
    });
  }

}

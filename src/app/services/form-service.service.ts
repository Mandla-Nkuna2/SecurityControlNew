import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { DynamicInput } from '../models/dynamic-input.model'
import * as moment from 'moment';
import { ActionSheetController } from '@ionic/angular';
import { PdfService } from './pdf.service';
@Injectable({
  providedIn: 'root'
})
export class FormServiceService {
  visit: DynamicInput[] = [
    {
      label: 'Date Toady',
      controlType: 'normal',
      fieldName: 'date',
      disabled: true,
      value: '@date',
      hidden: false,
      required: false,

    },
    {
      label: 'Reported at',
      controlType: "normal",
      fieldName: 'at',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },

    {
      label: 'Reported on: (date):',
      controlType: "date",
      fieldName: 'report2',
      disabled: false,
      hidden: false,
      required: true,
      inputType: '@date',
    }, 
    {
      label: 'Reported by:',
      controlType: "normal",
      fieldName: 'by',
      disabled: false,
      hidden: false,
      required: true,
      inputType: '@date',
    },
  

    {
      label: 'From (area/section)',
      controlType: "normal",
      fieldName: 'from',
      disabled: false,
      hidden: false,
      required: true,
      inputType: '@time',
    },
    {
      label: 'Cause of explosion known: :',
      controlType: "normal",
      fieldName: 'cause',
      disabled: false,
      hidden: false,
      required: true,
      inputType: '@date',
    },
   
    {
      label: 'SAP notified: time',
      controlType: "time",
      fieldName: 'saptime',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'SAP notified: details',
      controlType: "normal",
      fieldName: 'sap',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },

    {
      label: 'Fire Brigade notified: time',
      controlType: "time",
      fieldName: 'brigadetime',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'Fire Brigade notified: details',
      controlType: "brigade",
      fieldName: 'sap',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'Alerted Tenants in area: time',
      controlType: "time",
      fieldName: 'tenanttime',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'Alerted Tenants in area: details',
      controlType: "normal",
      fieldName: 'tenant',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },

    {
      label: 'Area Evacuated: time',
      controlType: "time",
      fieldName: 'areatime',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'Area Evacuated: details',
      controlType: "normal",
      fieldName: 'area',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },

    {
      label: 'Emergency shutdown instituted: time',
      controlType: "time",
      fieldName: 'shutdowntime',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'Emergency shutdown instituted: details',
      controlType: "normal",
      fieldName: 'shutdown',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },

    {
      label: 'Emergency shutdown completed: time',
      controlType: "time",
      fieldName: 'institutedtime',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
    {
      label: 'Emergency shutdown completed: details',
      controlType: "normal",
      fieldName: 'instituted',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    },
   
{
      label: 'Any other items (specify): time',
      controlType: "time",
      fieldName: 'othertime',
      disabled: false,
      hidden: false,
      required: false,
      inputType: 'text',
    },
    {
      label: 'Any other items (specify): details',
      controlType: "date",
      fieldName: 'other',
      disabled: false,
      hidden: false,
      required: false,
      inputType: 'text',
    },


    {
      label: 'Complied by',
      controlType: 'normal',
      fieldName: 'compile',
      disabled: true,
      value: '{name}',
      hidden: false,
      required: false,

    },
    {
      label: 'Additional Information',
      controlType: "normal",
      fieldName: 'add',
      disabled: false,
      hidden: false,
      required: false,
      inputType: 'text',
    },
    {
      label: 'Signature ',
      controlType: "signaturePad",
      fieldName: 'supsign',
      disabled: false,
      hidden: false,
      required: true,
      inputType: 'text',
    }


  ]
  constructor(
    private afs: AngularFirestore,
    private storage: Storage,
    public actionCtrl: ActionSheetController,
    private pdfService: PdfService
  ) { }

  public getCollection(link: string) {
    const promise = new Promise((resolve, reject) => {
      this.completeLink(link).then((newLink: string) => {
        this.afs.collection(newLink).ref.get().then((data) => {
          let collection = [];
          data.docs.forEach((doc) => {
            collection.push(doc.data());
          })
          resolve(collection);
        })
      })
    })
    return promise;
  }
  completeLink(link: string) {
    return new Promise((resolve, reject) => {
      this.getStorageData().then((user: any) => {
        if (link.includes('{')) {
          let s = link.substring(link.indexOf("{") + 1);
          s = s.substring(0, s.indexOf("}"));
          link = link.replace(`{${s}}`, user[s])
          resolve(link);
        }
        else {
          resolve(link);
        }

      })

    })



  }
  getStorageData() {
    const promise = new Promise((resolve, reject) => {
      this.storage.get('user').then((user) => {
        resolve(user);
      })
    })
    return promise;
  }

  retryInBackground(formName: string, uid: string, form: any) {
    setInterval(() => {
      this.afs.collection(formName).doc(uid).ref.set(form).then(() => {
      });
    }, 1000)
  }

  public getCollectionByFilter(link: string, option: string, value: string) {
    return new Promise((resolve, reject) => {
      this.completeLink(link).then(() => {
        this.afs.collection(link).ref.where(option, '==', value).get().then((collectionDocs) => {
          let collection: any = [];
          collectionDocs.docs.forEach((collectionDoc) => {
            collection.push(collectionDoc.data());
          })
          resolve(collection)
        })
      })
    })
  }
  generateRegex(type: string): string {
    let regex = {
      number: '/[^A-Za-z0-9]+/',
      tel: '^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$'
    }
    return regex[type];
  }
  checkValues(questions: DynamicInput[]): Promise<DynamicInput[]> {
    return new Promise((resolve, reject) => {
      let i = 0;
      questions.forEach(question => {
        if (question.value) {
          if (question.value.includes('@time')) {
            question.value = moment().format('HH: mm').toString();
          }
          else if (question.value.includes('@date')) {
            question.value = moment().format('YYYY-MM-DD').toString();
          }
          else if (question.value.includes('{')) {
            this.completeLink(question.value).then((val: string) => {
              question.value = val;
            });
          }
        }

        i = i + 1;
        if (i == questions.length) {
          resolve(questions)
        }
      });
    })
  }

  public saveForm(formName: string, uid: string, form: any) {
    return new Promise((resolve, reject) => {
      this.afs.collection(formName).doc(uid).ref.set(form).then(() => {
        resolve('compelte')
      }).catch((error) => {
        reject(error);
      })
    })
  }
  storeForm() {
    return new Promise((resolve, reject) => {

    })
  }
  async completeActionSheet(newFormObject: any) {
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
            // this.continue();
          }
        },
        {
          text: 'Download PDF Document',
          icon: 'download',
          cssClass: 'secondaryAction',
          handler: () => {
            // this.downloadPdf();
          }
        },
        {
          text: 'Exit Inspection',
          icon: 'close',
          cssClass: 'dangerAction',
          handler: () => {
            // this.exit();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }]
    });
    await actionSheet.present();
  }
  downloadPdf(newFormObj: any) {
    this.pdfService.download(newFormObj)
  }
}

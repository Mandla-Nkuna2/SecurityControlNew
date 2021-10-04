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

  visit: DynamicInput[] = []

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
  public getDocument(path: string, docId: string) {
    return new Promise((resolve, reject) => {
      this.completeLink(path).then((link: string) => {
        this.completeLink(docId).then((doc: string) => {
          this.afs.collection(link).doc(doc).ref.get().then((documentData) => {
            resolve(documentData.data());
          }).catch((error) => {
            reject(error);
          })
        })
      })
    })
  }
}

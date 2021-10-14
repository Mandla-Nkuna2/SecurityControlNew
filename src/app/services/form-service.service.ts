import { Injectable } from '@angular/core';
import { AngularFirestore, fromRef } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { DynamicInput } from '../models/dynamic-input.model'
import * as moment from 'moment';
import { ActionSheetController } from '@ionic/angular';
import { PdfService } from './pdf.service';
import { UUID } from 'angular2-uuid';
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
  checkValues(questions: DynamicInput[]) {
    return new Promise((resolve, reject) => {
      let i = 0;
      let saveObjects: any = {};
      let completeNumber = 0;

      questions.forEach(question => {
        i = i + 1;
        if (question.value) {
          if (question.value.includes('@time')) {
            question.value = moment().format('HH: mm').toString();
            saveObjects[question.fieldName] = question.value;
            completeNumber++;
          }
          else if (question.value.includes('@date')) {
            question.value = moment().format('YYYY-MM-DD').toString();
            saveObjects[question.fieldName] = question.value;
            completeNumber++;
          }
          else if (question.value.includes('{')) {
            this.completeLink(question.value).then((val: string) => {
              question.value = val;
              saveObjects[question.fieldName] = question.value;
              completeNumber++;
            });
          }
        }
        if (i == questions.length && (Object.values(saveObjects).length == completeNumber)) {
          setTimeout(() => {
            resolve(
              {
                questions,
                saveObjects
              }
            );
          }, 500);

        }
      });
    })
  }

  async retryInBackground(formName: string, uid: string, companyId: string, form: any) {
    setInterval(() => {
      let id = UUID.UUID();
      form['userId'] = uid;
      form['companyId'] = companyId;
      this.afs.collection(formName).doc(id).ref.set(form).then(() => {
      });
    }, 1000)
  }
  public saveForm(formName: string, uid: string, companyId: string, form: any) {
    return new Promise((resolve, reject) => {
      let id = UUID.UUID();
      form['userId'] = uid;
      form['companyId'] = companyId;
      this.afs.collection(formName).doc(id).ref.set(form).then(() => {
        resolve('compelte')
      }).catch((error) => {
        this.retryInBackground(formName, uid, companyId, form);

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
  public retrieveForms(companyId: string) {
    return new Promise((resolve, reject) => {
      this.afs.collection('companies').doc(companyId).collection('forms').ref.get().then((formsRef) => {
        if (formsRef.docs.length < 1) {
          resolve('no forms')
        }
        let loop = new Promise((resolveLoop) => {
          let forms: any = [];
          let i = fromRef.length;
          formsRef.docs.forEach((form) => {
            forms.push(form.data());
            i = i - 1;
            if (i == 0) {
              resolveLoop(forms);
            }
          })
        })
        loop.then((forms: any[]) => {
          this.storage.set('forms', forms).then(() => {
            this.getCompanyInfo(companyId);
            resolve('complete');
          })
        })
      }).catch((error) => {
        resolve('some error , moving on')
      })
    })
  }
  async getCompanyInfo(companyId: string) {
    this.afs.collection('companies').doc(companyId).ref.get().then((companyDoc) => {
      this.storage.set('company', companyDoc.data()).then(() => {
      })
    })
  }
  public getForms() {
    return new Promise((resolve, reject) => {
      this.storage.get('forms').then((forms: any[]) => {
        resolve(forms);
      })
    })
  }
  public getAssessmentEmails() {
    return new Promise((resolve, reject) => {
      this.storage.get('company').then((company: any) => {
        let emails = company.assessment;
        resolve({
          companyEmail: emails
        })
      })
    })
  }

  async checkForUpdates(companyId) {
    setInterval(() => {
      this.retrieveForms(companyId);
    }, 600000)
  }
  public saveFormRefToStorage(formName: string, inputs: DynamicInput[]) {
    return new Promise((resolve, reject) => {
      let form = {
        name: formName,
        form: inputs,
        date: moment().format('YYYY-MM-DDTHH:mm').toString()
      }
      if (formName.indexOf('@') == -1) {
        form.name = form.name + '@' + form.date
      }
      this.storage.get('savedForms').then((forms: any[]) => {
        if (forms) {
          let copy = forms.filter(x => x.name == formName)
          if (copy.length > 0) {
            let index = forms.indexOf(copy[0]);
            forms[index] = form
          }
          else {
            forms.push(form);
          }
          this.storage.set('savedForms', forms).then(() => {
            resolve(form.name);
          })
        }
        else {
          let newForms = [form]
          this.storage.set('savedForms', newForms).then(() => {
            resolve(form.name);
          })
        }
      })
    })
  }
  public getFormRefs() {
    return new Promise((resolve, reject) => {
      this.storage.get('savedForms').then((forms: any[]) => {
        if (forms) {
          resolve(forms);
        }
        else {
          reject('no saved forms');
        }
      })
    })
  }
  public removeFormStorage(name: string) {
    return new Promise((resolve, reject) => {
      this.storage.remove(name).then(() => {
        resolve('complete')
      })
    })
  }
  setFormRefStorage(forms: any[]) {
    return new Promise((resolve, reject) => {
      this.storage.set('savedForms', forms).then(() => {
        resolve('complete')
      })
    })

  }
}

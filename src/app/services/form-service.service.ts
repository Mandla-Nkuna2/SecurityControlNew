import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { DynamicInput } from '../models/dynamic-input.model'
import * as moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class FormServiceService {
  visit: DynamicInput[] = [
    {
      label: 'manager',
      fieldName: 'manager',
      required: true,
      controlType: "normal",
      items: [],
      value: '',
      hidden: false,
      link: '',
      itemsDisplayVal: '',
      itemsSaveVal: '',
      itemIsObject: false,
    }, {
      label: 'Number of Officers on Duty',
      fieldName: 'duty',
      required: true,
      controlType: "normal",
      items: [],
      value: '',
      hidden: false,

    },
    {
      label: 'Registration',
      fieldName: 'registration',
      required: true,
      controlType: "select",
      link: 'fleet',
      linkFilterName: 'companyId',
      linkFilterValue: '{companyId}',
      itemIsObject: true,
      itemsDisplayVal: 'registration',
      itemsSaveVal: 'key',
      items: [],
      value: '',
      hidden: false,

    },
    {
      label: 'Site Name',
      fieldName: 'site',
      required: true,
      controlType: "select",
      items: [],
      value: '',
      hidden: false,
      link: 'users/{key}/sites',
      itemsDisplayVal: 'name',
      itemsSaveVal: 'key',
      itemIsObject: true,
      populateQuestionItems: {
        questionKeyName: 'fieldName',
        questionKeyValue: 'staffMmeber',
        collectionPath: 'guards',
        collectionFilterName: 'siteId',
        collectionFilterValue: '$site'
      }
    },
    {
      label: 'Date',
      fieldName: 'date',
      required: true,
      controlType: "normal",
      value: '@date',
      hidden: false,
      disabled: true
    },
    {
      label: 'Manager',
      fieldName: 'managerName',
      required: true,
      controlType: "normal",
      value: '{name}',
      hidden: false,
      disabled: true
    },
    {
      label: 'OB Number',
      fieldName: 'ob',
      required: true,
      controlType: "normal",
      value: '',
      inputType: 'number',
      hidden: false,
    },
    {
      label: 'my pic',
      fieldName: 'pic1',
      required: true,
      controlType: "camera",
      value: '',
      hidden: false,
    },
    {
      label: 'my sig',
      fieldName: 'sig1',
      required: false,
      controlType: "signaturePad",
      hidden: false,
    },
    {
      label: 'managers sig',
      fieldName: 'mansig',
      required: true,
      controlType: "signaturePad",
      hidden: false,
    },
    {
      label: 'date seen',
      fieldName: 'date',
      required: true,
      controlType: "date",
      value: '',
      hidden: false,
    },
    {
      label: 'time checked',
      fieldName: 'time',
      required: true,
      controlType: "time",
      value: '',
      hidden: false,
    },
    {
      label: 'Staff Member on Duty',
      fieldName: 'staffMmeber',
      required: true,
      controlType: "select",
      items: [],
      value: '',
      hidden: false,
      itemsDisplayVal: 'name',
      itemsSaveVal: 'name',
      itemIsObject: true,
    },
    {
      label: 'Any Incidents Reported Since Last Visit?',
      fieldName: 'incidents',
      required: true,
      controlType: "normal",
      items: ["yes", "no"],
      value: '',
      hidden: false,
      link: '',
      itemsDisplayVal: '',
      itemsSaveVal: '',
      itemIsObject: false,
    },
    {
      label: 'Risk Detected During Site Visit?',
      fieldName: 'risk',
      required: true,
      controlType: "normal",
      items: ["Yes", "No"],
      value: '',
      hidden: false,
      link: '',
      itemsDisplayVal: '',
      itemsSaveVal: '',
      itemIsObject: false,
    },
    {
      label: 'Are all parking lights working? ',
      fieldName: 'parking',
      required: true,
      controlType: "select",
      items: ["Yes", "No", "Not Applicable"],
      value: '',
      hidden: false,
      link: '',
      itemsDisplayVal: '',
      itemsSaveVal: '',
      itemIsObject: false,
      onNewSlide: true
    }, {
      label: 'Comments ',
      fieldName: 'com1',
      required: false,
      controlType: "normal",
      items: ["Yes", "No", "Not Applicable"],
      value: '',
      hidden: false,
      condition: "$parking == 'Yes' "

    }, {
      label: 'Duty Roster on Site?',
      fieldName: 'dutyRost',
      required: true,
      controlType: "select",
      items: ["Yes", "No", "Not Applicable"],
      value: '',
      hidden: false
    }, {
      label: 'Comments ',
      fieldName: 'com2',
      required: false,
      controlType: "normal",
      items: ["Yes", "No", "Not Applicable"],
      value: '',
      hidden: false,
      condition: "$dutyRost == 'Yes' "

    }, {
      label: 'Job Description on Site?',
      fieldName: 'jobDesc',
      required: true,
      controlType: "select",
      items: ["Yes", "No", "Not Applicable"],
      value: '',
      hidden: false

    }, {
      label: 'Comments ',
      fieldName: 'com3',
      required: false,
      controlType: "normal",
      items: ["Yes", "No", "Not Applicable"],
      value: '',
      hidden: false,
      condition: "$jobDesc == 'Yes' "

    }
  ]
  constructor(
    private afs: AngularFirestore,
    private storage: Storage
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
  public storeForm() {
    return new Promise((resolve, reject) => {

    })
  }

}

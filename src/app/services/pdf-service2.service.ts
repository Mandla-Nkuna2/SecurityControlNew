import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import pdfMake from 'pdfmake/build/pdfmake';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
import { LoadingService } from './loading.service';
import { DynamicInput } from '../models/dynamic-input.model';
import { FormServiceService } from './form-service.service';
import * as moment from 'moment'
import { UiService } from './ui.service';

@Injectable()
export class pdfService2 {
  constructor(
    public platform: Platform,
    public file: File,
    public fileopener: FileOpener,
    private storage: Storage,
    public loading: LoadingService,
    private formService: FormServiceService,
    private uiService: UiService
  ) {
  }
  pdfObj = null;
  pdfDoc: any = {};

  async generatePDF(docDefinition) {
    try {
      this.pdfObj = await pdfMake.createPdf(docDefinition);
      if (this.platform.is('cordova')) {
        this.pdfObj.getBuffer((buffer) => {
          var blob = new Blob([buffer], { type: 'application/pdf' });
          this.file.writeFile(this.file.dataDirectory, 'report.pdf', blob, { replace: true }).then(fileEntry => {
            this.fileopener.open(this.file.dataDirectory + 'report.pdf', 'application/pdf');

          }).catch(err => {
            this.uiService.showToaster('Error: ' + err, 'red');
          });
        });
      } else {
        this.pdfObj.download('sss' + '-' + 'aw' + '.pdf');

      }
    } catch (error) {
      console.log(error);
    }

  }

  public downloadPdf(name: string, formTemplate: DynamicInput[], newFormObj: any) {
    try {
      let mainBody = [];
      let extraBodies = [];
      let signitures = [];
      let formTemplateCopy = Array.from(formTemplate);
      let lastTwo = formTemplateCopy.splice(-2, 2);
      if (lastTwo.filter(x => x.controlType == 'signaturePad').length > 0) {
        lastTwo.filter(x => x.controlType == 'signaturePad').forEach((signpad) => {
          let signitureDrawing = {
            style: 'table3',
            table: {
              widths: [150, 1],
              body: [
                [
                  {
                    border: [false, false, false, true],
                    margin: [0, 120, 0, 0],
                    image: newFormObj[signpad.fieldName],
                    width: 150,
                    alignment: 'center',
                  }, {}
                ],
                [
                  {
                    border: [false, false, false, false],
                    text: signpad.label,
                    alignment: 'center',
                  },
                  {}
                ],
              ]
            },
            layout: {
              defaultBorder: false,
            }
          }
          signitures.push(signitureDrawing);
          formTemplate.splice(formTemplate.indexOf(signpad), 1);

        })
        let blockNumber = 0;
        let pageLimit = 20;
        formTemplate.forEach(question => {
          if (question.controlType !== "camera" && (question.controlType !== "signaturePad")) {
            let row = [{ text: `${question.label} :`, style: 'headLabel' }, { text: newFormObj[question.fieldName] }];
            mainBody.push(row)
            blockNumber = blockNumber + 1
          }
          else {
            let row = [{ text: `${question.label} :`, style: 'headLabel' }, { image: newFormObj[question.fieldName], width: "100" }];
            mainBody.push(row)
            blockNumber = blockNumber + 5;
          }
          if (blockNumber >= pageLimit) {
            pageLimit = 30;
            blockNumber = 0;
            let table = {
              style: 'table',
              table: {
                widths: ['50%', '50%'],
                headerRows: 1,
                body: mainBody
              },
            }
            extraBodies.push(table);
            mainBody = [];
          }
        });
        if (extraBodies.length < 1) {
          let table = {
            style: 'table',
            table: {
              widths: ['50%', '50%'],
              headerRows: 1,
              body: mainBody
            },
          }
          extraBodies.push(table);
        }

        const prom = new Promise((resolve, reject) => {
          this.storage.get('user').then((user: any) => {
            if (!newFormObj.site) {
              resolve([
                [{ text: '', style: 'headLabel' }, { text: '', alignment: 'center' },
                { text: 'USER:', style: 'headLabel' }, { text: user.name, alignment: 'center' }],
                [{ text: 'DATE:', style: 'headLabel' }, { text: this.formatDate(newFormObj.date), alignment: 'center' },
                { text: 'TIME:', style: 'headLabel' }, { text: this.formatTime(newFormObj.time), alignment: 'center' }],
              ]);
            }
            else {
              this.formService.getDocument('sites', newFormObj.site).then((site: any) => {
                resolve(
                  [
                    [{ text: 'SITE:', style: 'headLabel' }, { text: site.name, alignment: 'center' },
                    { text: 'USER:', style: 'headLabel' }, { text: user.name, alignment: 'center' }],
                    [{ text: 'DATE:', style: 'headLabel' }, { text: this.formatDate(newFormObj.date), alignment: 'center' },
                    { text: 'TIME:', style: 'headLabel' }, { text: this.formatTime(newFormObj.time), alignment: 'center' }],
                  ]
                );
              })
            }
          })

        })
        prom.then((data: any) => {
          this.checkImage().then((image: string) => {
            this.populatePdf(name, data, image, extraBodies, signitures)
          })
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  populatePdf(name: string, header: any, image: string, extraBodies: any[], signitures: any[]) {
    try {
      var docDefinition = {
        content: [
          {
            image: image,
            width: 200,
            alignment: 'center'
          },
          { text: name.toUpperCase(), style: 'header' },
          {
            style: 'table',
            table: {
              widths: ['25%', '25%', '25%', '25%'],
              body: header
            },
          },

          ...extraBodies,
          ...signitures
        ],
        styles: {
          headLabel: {
            bold: true
          },
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 20]
          },
          notes: {
            margin: [0, 20, 0, 20]
          },
          table: {
            margin: [0, 5, 0, 15]
          },
          table2: {
            fontSize: 10,
          },
          table3: {
            margin: [0, 10, 0, 10]
          },
        },
        defaultStyle: {
          // alignment: 'justiSfy'
        }
      };
      this.generatePDF(docDefinition)
    } catch (error) {
      console.log(error);
    }
  }
  checkImage() {
    return new Promise((resolve, reject) => {
      this.storage.get('company').then((company: any) => {
        let image = 'data:image/jpeg;base64,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' //should be default logo
        if (company.accessType) {
          if (company.accessType == 'Enterprise') {
            image = company.logo;
          }
        }
        return resolve(image)
      })
    })
  }
  formatDate(date: string) {
    return moment(date).format('YYYY-MM-DD').toString();
  }
  formatTime(time: string) {
    return moment(time).format('HH: mm').toString();
  }
  getCurrentTime() {
    return moment().format('HH: mm').toString();
  }
  getCurrentDate() {
    return moment().format('YYYY-MM-DD').toString();
  }

}

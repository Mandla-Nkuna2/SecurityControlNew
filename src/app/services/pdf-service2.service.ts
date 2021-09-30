import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
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
  }

  public downloadPdf(formTemplate: DynamicInput[], newFormObj: any) {
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
        this.formService.getDocument('sites', newFormObj.site).then((site: any) => {
          this.storage.get('user').then((user: any) => {
            resolve({ site, user });
          })
        })
      })
      prom.then((data: any) => {
        this.populatePdf(data, newFormObj, extraBodies, signitures)
      })
    }
  }
  populatePdf(data: any, newFormObj: any, extraBodies: any[], signitures: any[]) {
    var docDefinition = {
      content: [
        {
          image: 'data:image/jpeg;base64,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',
          width: 200,
          alignment: 'center'
        },
        { text: 'UNIFORM ORDER REPORT', style: 'header' },
        {
          style: 'table',
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [{ text: 'SITE:', style: 'headLabel' }, { text: data.site.name, alignment: 'center' },
              { text: 'USER:', style: 'headLabel' }, { text: data.user.name, alignment: 'center' }],
              [{ text: 'DATE:', style: 'headLabel' }, { text: this.formatDate(newFormObj.date), alignment: 'center' },
              { text: 'TIME:', style: 'headLabel' }, { text: this.formatTime(newFormObj.time), alignment: 'center' }],
            ]
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

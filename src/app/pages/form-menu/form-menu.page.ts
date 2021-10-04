import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { NavController, NavParams } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { ParadePage } from '../parade/parade.page';

@Component({
  selector: 'app-forms',
  templateUrl: './form-menu.page.html',
  styleUrls: ['./form-menu.page.scss'],
})
export class FormMenuPage implements OnInit {

  sites = [];
  companyId;
  userKey;
  doc;
  // will eventually move to db  once we have the forms
  forms = [
    {
      name: ' SITE VISIT REPORT', icon: 'home',
      form: [
        {
          label: 'Date',
          controlType: 'normal',
          fieldName: 'date',
          disabled: true,
          value: '@date',
          hidden: false,
          required: false,

        },
        {
          label: 'Time',
          controlType: 'normal',
          fieldName: 'time',
          disabled: true,
          value: '@time',
          hidden: false,
          required: false,

        },
        {
          label: 'Manager',
          controlType: 'normal',
          fieldName: 'manager',
          disabled: true,
          value: '{name}',
          hidden: false,
          required: false,

        },
        {
          label: 'Site Name',
          controlType: 'select',
          fieldName: 'site',
          disabled: false,
          value: '{site}',
          hidden: false,
          required: true,
          link: 'users/{key}/sites',
          itemIsObject: true,
          itemsDisplayVal: 'name',
          itemsSaveVal: 'name',
          items: []
        },
        {
          label: 'OB number',
          controlType: 'normal',
          fieldName: 'ob',
          disabled: false,
          hidden: false,
          required: true,

        },
        {
          label: 'Number of Officers on duty',
          controlType: 'normal',
          fieldName: 'duty',
          disabled: false,
          inputType: 'number',
          hidden: false,
          required: true,

        },
        {
          label: 'Any incidents reported since last vivit',
          controlType: 'select',
          fieldName: 'incidents',
          disabled: true,
          value: '{name}',
          hidden: false,
          required: true,
          onNewSlide: true,
          items: ['Yes', 'No'],
          itemIsObject: false
        },
        {
          label: 'type of incident',
          controlType: 'normal',
          fieldName: 'incType',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
          condition: "$incidents == 'Yes'"
        },
        {

          label: 'Date',
          controlType: 'date',
          fieldName: 'incDateTime',
          value: '@date',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
          condition: "$incidents == 'Yes'"
        },
        {
          label: 'Reports submitted?',
          controlType: 'select',
          fieldName: 'incReported',
          disabled: false,
          hidden: false,
          required: true,
          items: ['Yes', 'No'],
          condition: "$incidents == 'Yes'"
        },
        {
          label: 'Folow up actions taken?',
          controlType: 'normal',
          fieldName: 'incActions',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
          condition: "$incidents == 'Yes'"
        },
        {
          label: 'Risk detected',
          controlType: 'select',
          fieldName: 'risk',
          disabled: false,
          items: ['Yes', 'No'],
          hidden: false,
          required: true,
          onNewSlide: true
        },
        {
          label: 'Risk Detected 1',
          controlType: 'camera',
          fieldName: 'photo1',
          disabled: false,
          hidden: false,
          required: true,
          condition: "$risk == 'Yes'"
        }, {
          label: 'Risk Detected 2',
          controlType: 'camera',
          fieldName: 'photo2',
          disabled: false,
          hidden: false,
          required: false,
          condition: "$photo1"
        },
        {
          label: 'Risk Detected 3',
          controlType: 'camera',
          fieldName: 'photo3',
          disabled: false,
          hidden: false,
          required: false,
          condition: "$photo2"
        },
        {
          label: 'Are all parking lights working?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'parking',
          disabled: false,
          inputType: 'text',
          hidden: false,
          onNewSlide: true,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com0',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: 'Job Description on Site',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'jobDesc',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com13',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: 'Duty Roster on Site?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'dutyRost',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com14',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: 'Guards Scheduled for Training',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'trainingShed',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com15',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: 'Are alarms Functional',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'alarms',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com1',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: "Is the Security Officer's uniform neat and Servicable",
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'uniforms',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com2',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: 'Is the guardroom neat and tidy?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'guardroom',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com3',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        {
          label: 'Is the O.B book completed?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'obComplete',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com4',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },
        /////////////
        {
          label: 'Is all registers in use and up to date?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'registers',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com5',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'Are all radios in working order?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'radios',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com6',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'Is the panic buttons Available and in working order during the visit? *',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'panic',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com7',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'Is the site phone available and operational?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'phone',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com8',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'Is the Guard patrol system operational and in use?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'patrol',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com9',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'Is the torch available and working?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'torch',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com10',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'Is the Electric Fence & Energizer in working order?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'elec',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com11',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        }, {
          label: 'When was the last time the Electric Fence Tested?',
          controlType: 'normal',
          fieldName: 'elecTested',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'What was the response time?',
          controlType: 'normal',
          fieldName: 'responseTime',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        }, {
          label: 'Are all cameras in working order?',
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'cameras',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Comments',
          controlType: 'normal',
          fieldName: 'com12',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
        },

        {
          label: 'Clients Name',
          controlType: 'normal',
          fieldName: 'client',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: false,
          onNewSlide: true
        },
        {
          label: 'Client Discussion',
          controlType: 'normal',
          fieldName: 'discussion',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: "Does the client have any issues witht the service?",
          controlType: 'select',
          items: ['Yes', 'No', 'Not Applicable'],
          fieldName: 'issues',
          disabled: false,
          inputType: 'text',
          hidden: false,
          required: true,
        },
        {
          label: 'Manager Signature',
          controlType: 'signaturePad',
          fieldName: 'mansig',
          disabled: false,
          hidden: false,
          required: true,
        },
        {
          label: 'Client Signature',
          controlType: 'signaturePad',
          fieldName: 'clisig',
          disabled: false,
          hidden: false,
          required: false,
        },
      ]
    },
    { name: ' SITE VISIT REPORT', icon: 'home' },
    { name: ' TRAINING FORM', icon: 'barcode' },
    {
      name: ' APPEAL FORM',
      icon: 'cube',
      form: [
        {
          label: 'Date',
          controlType: 'normal',
          fieldName: 'date',
          disabled: true,
          value: '@date',
          hidden: false,
          required: false,

        },

        {
          label: 'Manager',
          controlType: 'normal',
          fieldName: 'manager',
          disabled: true,
          value: '{name}',
          hidden: false,
          required: false,

        },

        {
          label: 'Employee Name',
          controlType: "normal",
          fieldName: 'employeeName',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },


        {
          label: 'Employee Number',
          controlType: "normal",
          fieldName: 'employeeNumber',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Employee Position',
          controlType: "normal",
          fieldName: 'employeePosition',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Grounds For Appeal',
          controlType: "select",
          items: ['The verdict of guilty was unfair', 'The transgression does not justify the sanction', 'New evidence or witnesses are available which may materially influence the decision of the hearing or enquiry', 'The disciplinary procedures were not adhered to'],
          fieldName: 'grounds',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Date of disciplinary hearing:',
          controlType: "date",
          fieldName: 'hearingDate',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Nature of disciplinary action taken:',
          controlType: "normal",
          fieldName: 'actionTaken',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Give your reasons for lodging the appeal:',
          controlType: "normal",
          fieldName: 'reasons',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Relieve sought:',
          controlType: "normal",
          fieldName: 'relieve',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },


        {
          label: 'Employee Signature',
          controlType: "signaturePad",
          fieldName: 'witSig',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },

        {
          label: 'Manager Signature ',
          controlType: "signaturePad",
          fieldName: 'sigUser',
          disabled: false,
          hidden: false,
          required: true,
          inputType: 'text',
        },
      ]
    },
    { name: ' SITE TEMPERATRURE', icon: 'thermometer' },
    { name: ' PERFORMANCE APPRAISAL', icon: 'bar-chart' },
    { name: ' FENCE INSPECTION', icon: 'apps' },
    { name: ' GRIEVANCE FORM', icon: 'sad' },
    { name: ' POLYGRAPH  ', icon: 'help' },
    { name: ' PAY QUERY', icon: 'wallet' },
    { name: ' RESIGNATION  ', icon: 'power' },
    { name: ' INJURY  ', icon: 'medkit' },
    { name: ' Fire  ', icon: 'flame' },
    { name: ' GAS EXPLOSION', icon: 'flower' },
    { name: ' CHECKLIST EXTINGUISHER', icon: 'clipboard' },
    { name: ' THEFT  REPORT', icon: 'people' },
    { name: ' UNIFORM ORDER', icon: 'shirt' },
    { name: ' VEHICLE INSPECTION', icon: 'car' },
    { name: ' CRIME INCIDENT REPORT', icon: 'eye' },
    { name: ' INCIDENT NOTIFICATION', icon: 'warning' },
    { name: ' RISK ASSESSMENT', icon: 'nuclear' },
    { name: ' GENERAL INCIDENT REPORT', icon: 'alert' },
    { name: ' LEAVE APPLICATION', icon: 'exit' },
    { name: ' DISCIPLINARY REPORT', icon: 'thumbs-down' },
    { name: ' MEETING REPORT', icon: 'cafe' },
    { name: ' CLIENT INSTRUCTION', icon: 'create' },
    { name: ' EQUIPMENT INVENTORY', icon: 'build' },
    { name: ' INCIDENT REPORT', icon: 'warning' },
    { name: ' EMPLOYEE PERFORMANCE EVALUATION FORM', icon: 'thumbs-up' },
    { name: ' NON-CONFORMANCE FORM', icon: 'card' },
    { name: ' OB ENTRY', icon: 'clipboard' },
    { name: ' PNP SITE VISIST', icon: 'home' },
    { name: ' TENANT VISIT', icon: 'home' },
    { name: ' TRANSPARENCY REPORT', icon: 'home' },
    { name: ' WORK ORDER ACKNOWLEDGEMENT', icon: 'clipboard' },
    { name: ' ACKNOWLEDGEMENT OF DEBT', icon: 'card' }
  ]

  constructor(
    private storage: Storage,
    public loading: LoadingService,
    private navController: NavController,

  ) { }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.userKey = user.key
    });
  }

  download() {
    this.loading.present('Downloading Please Wait...').then(() => {
      this.open(this.doc).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async open(doc) {
    await window.open('https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/DISCIPLINARY%20CODE%20OF%20OFFENCES.docx?alt=media&token=5c722397-1e50-4212-bf0c-35bf0e7f4913')
  }
  openForm(formName: string, form: any) {
    if (!form) {
      form = [];
    }
    const params: NavigationExtras = {
      state: { formName, form }

    }
    this.navController.navigateForward('/form', params)
  }

}


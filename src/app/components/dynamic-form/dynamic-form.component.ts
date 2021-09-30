import { DynamicFormErrorHandlerService } from './../../services/dynamic-form-error-handler.service';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { UiService } from './../../services/ui.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicInput } from 'src/app/models/dynamic-input.model';
import { FormServiceService } from '../../services/form-service.service'
import { pdfService2 } from 'src/app/services/pdf-service2.service';
@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {

  @Input() dynamicInputs: DynamicInput[];
  @Input() formTitle: string;
  @Input() staticFields: any;
  @Output() formObject: EventEmitter<any>;
  formAlias: string;

  newFormObj: any = {};
  formArray: FormArray;
  dynamicForm: FormGroup;
  slideIndex = 0;
  noOfSlides = 0;
  dynamicInputsSlides: DynamicInput[][] = [];
  allInputs: DynamicInput[] = [];
  imagesArray = [];
  signitureArray = [];
  signature;
  lastIndex = 0;
  show = false;

  constructor(
    private formBuilder: FormBuilder,
    private uiService: UiService,
    private formService: FormServiceService,
    private storage: Storage,
    private navController: NavController,
    private errorHandlingService: DynamicFormErrorHandlerService,
    private pdfService: pdfService2

  ) {
    this.formObject = new EventEmitter();
  }

  ngOnInit() {
    this.errorHandlingService.validateInputs(this.dynamicInputs);
    this.formArray = this.formBuilder.array([]);
    this.dynamicForm = new FormGroup({
      inputs: this.formArray
    });
    this.formService.checkValues(this.dynamicInputs).then((questions: DynamicInput[]) => {
      this.dynamicInputs = questions;
      this.allInputs = Array.from(this.dynamicInputs);
      this.checkSlides().then(() => {
        this.createInputs();
        this.dynamicInputs = this.dynamicInputsSlides[this.slideIndex];
        this.newFormObj = { ...this.staticFields };
        this.show = true;
      })
    })
    this.formAlias = this.convertTitleToAlias();
    this.storage.get(this.formAlias).then((newFormObject) => {
      if (newFormObject) {
        this.newFormObj = newFormObject
      }
    })
  }

  convertTitleToAlias() {
    let alias = this.formTitle;
    return alias.replace(/ +/g, "").replace(alias[0], alias[0].toLowerCase());
  }

  onExit() {
    this.uiService.openConfirmationAlert("Save this form to complete later?", "Yes", "No").then((shouldSave) => {
      if (shouldSave) {
        this.storage.set(this.formAlias, this.newFormObj).then(() => {
          this.navController.navigateRoot('welcome')
        }).catch(error => console.log(error))
      } else {
        this.navController.navigateRoot('welcome')
      }
    })
  }

  checkSlides() {
    return new Promise((resolve, reject) => {
      let newSlideIndicators = this.dynamicInputs.filter(x => x.onNewSlide);
      if (newSlideIndicators.length > 0) {
        this.noOfSlides = newSlideIndicators.length;
        newSlideIndicators.forEach(slideIndicator => {
          let index = this.dynamicInputs.indexOf(slideIndicator);
          this.dynamicInputsSlides.push(this.dynamicInputs.slice(0, index));
          this.dynamicInputs.splice(0, index)
        });
        this.dynamicInputsSlides.push(this.dynamicInputs)
        resolve('complete');
      }
      else {
        this.dynamicInputsSlides.push(this.dynamicInputs);
        resolve('complete');
      }
    })
  }


  createInputs() {
    this.allInputs.forEach((input) => {
      if (input.controlType == 'select') {//&& input.items
        if (input.required) {
          this.formArray.push(this.formBuilder.control('', Validators.required))
        }
        else {
          this.formArray.push(this.formBuilder.control(''))
        }
      }
      if (input.controlType == 'normal') {
        if (input.required) {
          this.formArray.push(this.formBuilder.control('', Validators.required))
        }
        else {
          this.formArray.push(this.formBuilder.control(''))
        }
      }
      if (input.controlType == 'date' || input.controlType == 'time') {
        if (input.required) {
          this.formArray.push(this.formBuilder.control('', Validators.required))
        }
        else {
          this.formArray.push(this.formBuilder.control(''));
        }
      }
      if (input.controlType == 'signaturePad') {
        this.formArray.push(this.formBuilder.control(''))
        if (input.required) {
          let signiturePad = {}
          signiturePad[input.fieldName] = ''
          this.signitureArray.push(signiturePad)
        }
      }
      if (input.controlType == 'camera') {
        this.formArray.push(this.formBuilder.control(''))
        if (input.required) {
          let image = {}
          image[input.fieldName] = '';
          this.imagesArray.push(image)
        }
      }
      if (input.value && input.value != '') {
        this.newFormObj[input.fieldName] = input.value;
      }
    })

  }

  hasErrors(index) {
    return this.dynamicForm.controls.inputs.get(`${index}`).errors && this.dynamicForm.controls.inputs.get(`${index}`).touched;
  }

  determineCondition(condition: string) {
    if (!condition) {
      return true;
    }
    else {
      if (condition.indexOf('$') > -1) {
        condition = condition.replace('$', 'this.newFormObj.');
      }
      return eval(condition);
    }
  }

  async populateQuestionItems(params: any) {
    if (!params) {
      return
    }
    if (params.collectionFilterName && params.collectionFilterValue) {
      let searchValue: string = params.collectionFilterValue;
      if (params.collectionFilterValue.indexOf('$') >= 0) {
        searchValue = this.newFormObj[params.collectionFilterValue.replace('$', '')];
      }
      this.formService.getCollectionByFilter(params.collectionPath, params.collectionFilterName, searchValue).then((items: any[]) => {
        let value: string = params.questionKeyValue;
        if (params.questionKeyValue.indexOf('$') >= 0) {
          value = this.newFormObj[params.questionKeyValue.replace('$', '')];
        }
        this.dynamicInputs.filter(x => x[params.questionKeyName] == value)[0].items = items;
      })
    }
    else {
      this.formService.getCollection(params.collectionPath).then((items: any[]) => {
        let value: string = params.questionKeyValue;
        if (params.questionKeyValue.indexOf('$') >= 0) {
          value = this.newFormObj[params.questionKeyValue.replace('$', '')];
        }
        this.dynamicInputs.filter(x => x[params.questionKeyName] == value)[0].items = items;
      })
    }
  }

  async onSign(fieldName: string) {
    this.uiService.openSignaturePopover(fieldName).then(() => {
      this.uiService.getPopoverDismissal().then((items: any) => {
        this.signature = items.data;
        this.newFormObj = { ...this.newFormObj, ... this.signature }
        if (this.signitureArray.filter(x => Object.keys(x).indexOf(fieldName) >= 0).length > 0) {
          this.signitureArray.filter(x => Object.keys(x).indexOf(fieldName) >= 0)[0][fieldName] = 'added';
        }
      })
    })
  }

  onImageEvent(event, fieldName) {
    let exists = false;

    if (!exists) {
      this.newFormObj[fieldName] = event
      if (this.imagesArray.filter(x => Object.keys(x).indexOf(fieldName) >= 0).length > 0) {
        this.imagesArray.filter(x => Object.keys(x).indexOf(fieldName) >= 0)[0][fieldName] = 'added';

      }
    }
  }

  nextSlide() {
    this.lastIndex = this.lastIndex + (this.dynamicInputs.length)
    this.slideIndex = this.slideIndex + 1;
    this.dynamicInputs = this.dynamicInputsSlides[this.slideIndex];
  }
  prevSlide() {
    this.slideIndex = this.slideIndex - 1;
    this.dynamicInputs = this.dynamicInputsSlides[this.slideIndex];
    this.lastIndex = this.lastIndex - (this.dynamicInputs.length)


  }

  onSubmit() {
    if (!this.isValid()) {
      return;
    }
    this.dynamicInputs.forEach((input, index) => {
      if (input.controlType !== "camera" && input.controlType !== "signaturePad") {
        this.newFormObj = { ...this.newFormObj, ...{ [`${input.fieldName}`]: this.dynamicForm.value.inputs[index] } }
      }
    })
    if (this.imagesArray.length > 0) {
      this.imagesArray.forEach((image: any) => {
        this.newFormObj = { ...this.newFormObj, ...image }
      })
    }
    this.formObject.emit(this.newFormObj);
  }
  isValid(): boolean {
    if (this.dynamicForm.invalid) {

      this.uiService.showToaster("Fill in all fields!", "danger", 2000, "bottom")
      return false;
    }
    if (this.imagesArray.length > 0) {
      if (this.imagesArray.filter(x => Object.values(x).indexOf('') >= 0).length > 0) {
        this.uiService.showToaster("Choose an Image!", "danger", 2000, "bottom")
        return false;
      }
    }
    if (this.signitureArray.length > 0) {
      if (this.signitureArray.filter(x => Object.values(x).indexOf('') >= 0).length > 0) {
        this.uiService.showToaster("Signature is required!", "danger", 2000, "bottom")
        return false;
      }
    }
    return true;
  }
  downloadPdf() {
    this.pdfService.downloadPdf(this.formTitle, this.allInputs, this.newFormObj);
  }

}

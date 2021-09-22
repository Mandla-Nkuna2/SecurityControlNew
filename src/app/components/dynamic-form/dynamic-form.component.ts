import { UiService } from './../../services/ui.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicInput } from 'src/app/models/dynamic-input.model';
import { FormServiceService } from '../../services/form-service.service'
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
    public formService: FormServiceService
  ) {
    this.formObject = new EventEmitter();
  }

  ngOnInit() {
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
      if (input.controlType == 'select' && input.items) {
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
    })
  }

  hasErrors(index) {
    return this.dynamicForm.controls.inputs.get(`${index}`).errors && this.dynamicForm.controls.inputs.get(`${index}`).touched;
  }



  determinCondition(condition: string) {
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
    console.log(this.lastIndex)
    console.log(this.dynamicInputs.length)
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
    console.log(this.newFormObj)
    this.dynamicInputs.forEach((input, index) => {
      if (input.controlType !== "camera" && input.controlType !== "signaturePad") {
        this.newFormObj = { ...this.newFormObj, ...{ [`${input.fieldName}`]: this.dynamicForm.value.inputs[index] } }
      }
    })
    this.formObject.emit(this.newFormObj);
  }
  isValid(): boolean {
    if (this.dynamicForm.invalid) {

      console.log(this.dynamicForm.errors)
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

}

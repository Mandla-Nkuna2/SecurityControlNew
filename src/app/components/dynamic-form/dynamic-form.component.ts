import { UiService } from './../../services/ui.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicInput } from 'src/app/models/dynamic-input.model';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {

  @Input() dynamicInputs: DynamicInput[];
  @Input() formTitle: string;
  @Output() formObject: EventEmitter<any>;
  imagesArray=[];
  newFormObj ={};
  formArray: FormArray;
  dynamicForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private uiService: UiService
  ) { 
    this.formObject = new EventEmitter();
  }

  ngOnInit() {
    this.formArray = this.formBuilder.array([]);
    this.dynamicForm = new FormGroup({
      inputs: this.formArray
    });
    this.createInputs();
  }

  createInputs(){
    this.dynamicInputs.forEach((input)=>{
      if(input.inputType == 'select' && input.items){
        if(input.required){
          this.formArray.push(this.formBuilder.control('', Validators.required))
        }
        else{
          this.formArray.push(this.formBuilder.control(''))
        }
      }
      if(input.inputType == 'normal'){
        if(input.required){
          this.formArray.push(this.formBuilder.control('', Validators.required))
        }
        else{
          this.formArray.push(this.formBuilder.control(''))
        }
      }
      if(input.inputType == 'signaturePad'){
        //assign to a variable, also should have a validation check
      }
      if(input.inputType == 'camera'){

      }
    })
  }

  onImageEvent(event, fieldName){
    let item = this.imagesArray.find(fieldName);
    if(!item){
      this.imagesArray.push({ [`${fieldName}`]: event })
    }
  }

  hasErrors(index) {
    return this.dynamicForm.controls.inputs.get(`${index}`).errors && this.dynamicForm.controls.inputs.get(`${index}`).touched;  
  }

  onSubmit(){
    if(this.dynamicForm.invalid){
      return this.uiService.showToaster("Fill in all fields!", "danger", 2000, "bottom")
    }
    this.dynamicInputs.forEach((input, index)=>{
      if(input.inputType !== "camera" && input.inputType !== "signaturePad"){
        this.newFormObj = {...this.newFormObj , ...{[`${input.fieldName}`] : this.dynamicForm.value.inputs[index]}}
      }
    })
    if(this.imagesArray.length>0){
      this.imagesArray.forEach((image: any)=>{
        this.newFormObj = {...this.newFormObj, ...image}
      })
    }
    this.formObject.emit(this.newFormObj);
  }

}

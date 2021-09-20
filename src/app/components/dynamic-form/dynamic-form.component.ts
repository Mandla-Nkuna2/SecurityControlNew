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
      }else{
        if(input.required){
          this.formArray.push(this.formBuilder.control('', Validators.required))
        }
        else{
          this.formArray.push(this.formBuilder.control(''))
        }
      }
    })
  }

  hasErrors(index) {
    return this.dynamicForm.controls.inputs.get(`${index}`).errors && this.dynamicForm.controls.inputs.get(`${index}`).touched;  
  }

  onSubmit(){
    if(this.dynamicForm.invalid){
      return this.uiService.showToaster("Fill in all fields!", "danger", 2000, "bottom")
    }
    this.dynamicInputs.forEach((input, index)=>{
      this.newFormObj = {...this.newFormObj , ...{[`${input.fieldName}`] : this.dynamicForm.value.inputs[index]}}
    })
    this.formObject.emit(this.newFormObj);
  }

}

import { DynamicInput } from './../models/dynamic-input.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormErrorHandlerService {

  constructor() { }

  validateInputs(dynamicInputs: DynamicInput[]){
    return new Promise((resolve, reject)=>{
      this.checkControlType(dynamicInputs).then(()=>{
        this.checkDuplicateFieldNames(dynamicInputs).then(()=>{
          this.checkInputTypes(dynamicInputs).then(()=>{
            this.checkInputItems(dynamicInputs).then(()=>{
              resolve(true)
            }).catch((onError)=>reject(onError))
          }).catch((onError)=>reject(onError))
        }).catch((onError)=>reject(onError))
      }).catch((onError)=>reject(onError))
    })
  }

  checkDuplicateFieldNames(dynamicInputs: DynamicInput[]){
    return new Promise((resolve, reject)=>{
      let previous='';
      let valid = true;
      dynamicInputs.forEach((input, index)=>{
        if(input.fieldName === previous){
          valid =false;
          reject("Duplicate Field Name : " + input.fieldName + "\n Dynamic Input at index : " + index)
        }
        previous = input.fieldName;
      })
      if(valid){
        resolve(true);
      }
    })
  }

  checkControlType(dynamicInputs: DynamicInput[]){
    return new Promise((resolve,reject)=>{
      let types = ['normal','select','date','time','signaturePad','camera'];
      let valid = true, match = false;
    
      dynamicInputs.forEach((input, index)=>{
        types.forEach((type)=>{
          if(type === input.controlType){
            match= true;
          }
        })
        if(input.controlType == "select" && !input.items){
          valid = false;
          reject("Items are required if you use a 'select' control type \n Dynamic input at index : " + index)
        }
        if(!match){
          valid = false;
          reject("Invalid control type : " + input.controlType + "\n Dynamic Input at index : " + index)
        }
      })
      if(valid){
        resolve(true)
      }
    })
  }

  checkInputItems(dynamicInputs: DynamicInput[]){
    return new Promise((resolve, reject)=>{
      let valid = true;
      dynamicInputs.forEach((input, index)=>{
        if(input.items && input.items.length>0){
          if(input.controlType !== "select"){
            valid = false;
            reject("Items should only be assigned to a 'select' control type, your type is : " + input.controlType + "\n Dynamic Input at index : " + index)
          }
          if(input.itemIsObject == undefined){ //falsey would be too vague in this case
            valid = false;
            reject("itemIsObject property is required when using a 'select' control type" + "\n Dynamic Input at index : " + index)
          }
          if(input.itemIsObject){
            input.items.forEach((item)=>{
              if((typeof item) !== "object"){
                valid = false;
                reject("Item is not an object : " + item + "\n Dynamic Input at index : " + index)              
              }
            })
          }else{
            input.items.forEach((item)=>{
              if((typeof item) !== "string"){
                valid = false;
                reject("Item is not a string : " + item + "\n Dynamic Input at index : " + index)              
              }
            })
          }
        }
      })
      if(valid){
        resolve(true);
      }
    })
  }

  checkInputTypes(dynamicInputs: DynamicInput[]){
    return new Promise((resolve, reject)=>{
      let types = ['text', 'number', 'tel', 'email', 'button', 'reset','date', 'datetime-local', 'file','checkbox', 'color', 'image', 'hidden', 
      'password', 'radio','search', 'submit', 'url', 'time', 'week', 'range', 'month']
      let match = false, exists = false, valid=true;

      dynamicInputs.forEach((input, index)=>{
        if(input.inputType){
          exists = true;
          types.forEach((type)=>{
            if(type === input.inputType){
              match = true;
            }
          })
        }else{
          exists = false;
        }
        if(exists && !match){
          valid = false;
          reject("Input type doesnt exist : " + input.inputType + "\n Dynamic Input at index : " + index)
        }
      })
      if(valid){
        resolve(true);
      }
    })
  }

}

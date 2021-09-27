# Dynamic Form Component

## Description

The dynamic form component takes in an array of dynamic inputs and generates a form based off of that array. This becomes very ideal in a projject that utilizes a lot of or multiple forms.


## Usage

Below is a description of the different properties that are usable on the component

## Properties

![images](../../../assets/imgs/inputsOutputs.png)

* formTitle 
    * Description - This is basically the title that will appear as a header on the generated Form
    * Attribute - formTitle
    * type - string
    * default - undefined  

* dynamicInputs
    * Description - This is an array of dynamic inputs that describes the how the form must be generated and its order. So the 1st object in the array will be the 1st inputControl to be displayed and so forth
    * Attribute - dynamicInputs
    * Type - DynamicInput [ ]
    * Default - undefined

### Output Events

* formObject
    * Description - This is the final form object that is outputted by the component after validation has been check (If there is any validation). If there isnt any validation then the object will still be outputted as normal.
    * Type - {} as any

## Dynamic Input Model

![images](../../../assets/imgs/model1.png)

* label - the label for the input
* fieldName - an object key that will be assigned a value by its input and appended to the form object eg if fieldName is car, and user inputs "vw" we get { car: "vw" }
* required - this adds null/empty validation checks to the input
* controlType - the type of control, one of 6 strings only "normal", "select", "camera", "signaturePad", "date", "time". Using other strings/words will result in errors
* disabled - an optional property which either enables or disables the form
* inputType - another input type that is "text" by default but can be overidden by the known input types eg, "email", "number"...
* items - an optional property that accepts an array of strings or objects, and these are used to populate the select inputs options.
* value - an optional defaut value for the input
* hidden - whether the input is hiden or not
* link - an optional property that accepts a path to a collection or document on firebase
* linkFilterName - an optional name/key value for the filter
* linkFilterValue - the value that corresponds to the linkFilterName
* itemsDisplayVal - an optional property that specifies which key to dispay from an array of objects eg if surname is passed and the array is [{ name: "Bob", surname: "Syko" },{ name: "Chuck", surname: "Norris" }], the surname values will be displayed
* itemsSaveVal -an optional property key of item to be saved from the array of select objects. 
* itemIsObject - an optional property that specifies if the array of items for the select input, is an array of strings or an array of objects 
* condition - an optional property
* onNewSlide - an optional property that specifies if this input and the proceeding ones, start on a new slide.
* populateQuestionItems - an optional property used to populate other questions items.
    * questionKeyName - the name of the key used for question population.
    * questionKeyValue - the value that accompanies the questionKeyName.
    * collectionPath - the path to the desired collection.
    * collectionFilterName - used to filter through the collection.
    * collectionFilterValue - the value that accompanies the collectionFilterName specified by a $ sign, eg $siteId, would get the siteId value from the new form object.

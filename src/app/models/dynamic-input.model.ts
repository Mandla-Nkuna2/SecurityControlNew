export class DynamicInput {
  label: string;
  fieldName: string;
  required: boolean;
  controlType: string;
  disabled?: boolean;
  inputType?: string;
  items?: any[];
  value?: string; //key values: @date, @time, for user storage use {}, eg {name} will get user from storage
  hidden: boolean;
  link?: string;
  linkFilterName?: string;
  linkFilterValue?: string;
  itemsDisplayVal?: string
  itemsSaveVal?: string;
  itemIsObject?: boolean;
  condition?: string;
  onNewSlide?: boolean;
  populateQuestionItems?: {
    questionKeyName: string;
    questionKeyValue: string;
    collectionPath: string; //forgot this one , i dont know where it disapeared too, its basically the link
    collectionFilterName?: string;
    collectionFilterValue?: string;
  }
}


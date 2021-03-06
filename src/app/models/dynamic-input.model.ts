export class DynamicInput {
  label: string;
  fieldName: string;
  required: boolean;
  controlType: string;
  disabled?: boolean;
  inputType?: string;
  items?: any[];
  value?: string;
  hidden: boolean;
  link?: string;
  linkFilterName?: string;
  linkFilterValue?: string;
  itemsDisplayVal?: string;
  itemsSaveVal?: string;
  itemIsObject?: boolean;
  condition?: string;
  onNewSlide?: boolean;
  code?: string;
  populateQuestionItems?: {
    questionKeyName: string;
    questionKeyValue: string;
    collectionPath: string;
    collectionFilterName?: string;
    collectionFilterValue?: string;
  }
}

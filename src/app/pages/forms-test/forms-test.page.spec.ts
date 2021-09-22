import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsTest } from './forms-test.page';

describe('FormsTest', () => {
  let component: FormsTest;
  let fixture: ComponentFixture<FormsTest>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormsTest],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormsTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

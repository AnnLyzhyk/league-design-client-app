import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectDesignerComponent } from './connect-designer.component';

describe('ConnectDesignerComponent', () => {
  let component: ConnectDesignerComponent;
  let fixture: ComponentFixture<ConnectDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectDesignerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

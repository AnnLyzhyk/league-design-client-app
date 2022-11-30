import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-connect-designer',
  templateUrl: './connect-designer.component.html',
  styleUrls: ['./connect-designer.component.sass']
})
export class ConnectDesignerComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<ConnectDesignerComponent>) { }

  email: string = ''
  ngOnInit(): void {
  }
  onNoClick(){
    this.dialogRef.close('');
  }

}

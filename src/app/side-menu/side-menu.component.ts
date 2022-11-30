import { Component, OnInit } from '@angular/core';
import { PanelService } from '../panel.service';

@Component({
  selector: 'side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.sass']
})
export class SideMenuComponent implements OnInit {

  constructor(private panelService: PanelService) { }

  ngOnInit(): void {
  }

  showPanel(panelName: string){
      this.panelService.changePanel(panelName);
  }

}

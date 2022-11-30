import { EventEmitter, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PanelService {

  panelChanged: EventEmitter<string> = new EventEmitter();

  constructor() { }

  changePanel(panelName: string) {
    this.panelChanged.emit(panelName);
  }

}

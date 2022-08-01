import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "src/app/data-service/data-service.service";
import { ProjectModel, ProjectPM } from "src/app/models/Enteties";



@Component({
  selector: 'add-pm-to-project-dialog',
  templateUrl: 'add-pm-to-project-dialog.html',
})
export class AddPmToProjectDialog {

  pmList: ProjectPM[] = [];
  selectedProjectManager: string = "";
  projectManagerPercent: number = 100;


  constructor(
    public dialogRef: MatDialogRef<AddPmToProjectDialog>,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: ProjectModel )
  {
    dataService.GetPmList().subscribe(list =>this.pmList = list)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCreateClick():void{
    var pm = this.pmList.find(t=> t.projectManagerId == this.selectedProjectManager) as ProjectPM
    this.data.projectManagers.push({
      projectManagerId: this.selectedProjectManager,
      projectManagerName: pm.projectManagerName,
      percent: this.projectManagerPercent,
      currentRate: pm.currentRate });
    this.dialogRef.close()
  }
}

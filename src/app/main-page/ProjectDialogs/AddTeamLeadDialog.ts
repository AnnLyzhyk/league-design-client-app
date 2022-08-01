import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "src/app/data-service/data-service.service";
import { ProjectModel, ProjectTeamLead } from "src/app/models/Enteties";



@Component({
  selector: 'add-teamLead-to-project-dialog',
  templateUrl: 'add-teamLead-to-project-dialog.html',
})
export class AddTeamLeadToProjectDialog {

  teamLeadList: ProjectTeamLead[] = [];
  selectedTeamLead: string = "";
  teamLeadPercent: number = 100;


  constructor(
    public dialogRef: MatDialogRef<AddTeamLeadToProjectDialog>,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: ProjectModel )
  {
    dataService.GetTeamLeadList().subscribe(list =>this.teamLeadList = list)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCreateClick():void{
    this.data.teamLeads.push({
      teamLeadId: this.selectedTeamLead,
      teamLeadName: (this.teamLeadList.find(t=> t.teamLeadId == this.selectedTeamLead) as ProjectTeamLead).teamLeadName,
      percent: this.teamLeadPercent });
    this.dialogRef.close()
  }

}

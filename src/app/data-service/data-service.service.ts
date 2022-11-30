import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BonusRateModel, Designer, DesignerEntity, DesignerInfo, ProjectInDesignerInfo, ProjectModel, ProjectPM, ProjectTeamLead, ProjectWeekData, SalaryBasesModel } from '../models/Enteties';

@Injectable({
  providedIn: 'root'
})
export class DataService {



 // private baseUrl = "http://localhost:5003/api/";
 private baseUrl = "https://ldsalaryapi.azurewebsites.net/api/";
  constructor(private http: HttpClient) { }


  checkIstimeLogsExists(month: number, year: number){
    return this.http.post<boolean>(this.baseUrl + "TimeLogs/IsExistsTilmeLogs",
              {month: month, year: year})
  }

  getLastTimeLogDate(month: number, year: number){
    return this.http.post<Date>(this.baseUrl + "TimeLogs/GetLastModifiedDateForMonth",
       {month: month, year: year})
  }

  refreshTimeLog(month: number, year: number){
    return this.http.post(this.baseUrl + "TimeLogs/RefreshTimeLog",
       {month: month, year: year})
  }

  GetWorkHours(month: number, year: number) {
    return this.http.post<number>(this.baseUrl + "SalaryCalculator/GetWorkHours",
       {month: month, year: year})
  }


  GetDesignersData(month: number, year: number) {
    return this.http.post<DesignerInfo[]>(this.baseUrl + "SalaryCalculator/GetDesignersSalary",
       {month: month, year: year})
  }

  GetDesignerProjectsData(month: number, year: number, designerId: string) {
    return this.http.post<ProjectInDesignerInfo[]>(this.baseUrl + "SalaryCalculator/GetDesignerSalary/" + designerId,
       {month: month, year: year})
  }

  GetAllProjects(month: number, year: number) {
    return this.http.post<ProjectModel[]>(this.baseUrl + "SalaryCalculator/GetProjectsInfo",
       {month: month, year: year})
  }

  GetTeamLeadList() {
    return this.http.get<ProjectTeamLead[]>(this.baseUrl + "SystemData/GetAllTeamLeadsForSelect")
  }

  GetPmList() {
    return this.http.get<ProjectPM[]>(this.baseUrl + "SystemData/GetAllPMsForSelect")
  }


  SaveProjectData(projectsData: ProjectModel[]) {
    return this.http.post(this.baseUrl + "SalaryCalculator/SaveProjectData", projectsData)
  }

  getSalesInfoByWeeks(month: number, year: number) {
    return this.http.post<ProjectWeekData[]>(this.baseUrl + "SalaryCalculator/GetSalesDataByWeek",
    {month: month, year: year});

  }


  getAllDesigners(){
    return this.http.get<DesignerEntity[]>(this.baseUrl + "SystemData/GetAllDesigners")
  }

  UpdateDesignersData(data: DesignerEntity[]) {
    return this.http.post(this.baseUrl + "SystemData/UpdateDesigners", data);
  }

  getIdByEmail(email: string){
    return this.http.get<string>(this.baseUrl + "SystemData/GetIdByEmail",{params: {email: email}} );
  }

  getBonusRates() {
    return this.http.get<BonusRateModel[]>(this.baseUrl + "SystemData/GetBonusRates")
  }

  getSalaryBases() {
    return this.http.get<SalaryBasesModel[]>(this.baseUrl + "SystemData/GetSalaryBases")
  }

  updateBonusRates(data: BonusRateModel[]) {
    return this.http.post(this.baseUrl + "SystemData/UpdateBonusRates", data);
  }

  updateSalaryBases(data: SalaryBasesModel[]) {
    return this.http.post(this.baseUrl + "SystemData/UpdateSalaryBases", data);
  }

}

import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { map, Observable } from 'rxjs';
import { ConnectDesignerComponent } from '../connect-designer/connect-designer.component';
import { DataService } from '../data-service/data-service.service';
import { CostFromDesigner, DesignerInfo, PmCostData, PmCostPerProject, ProjectInDesignerInfo, ProjectInTeamLeads, ProjectModel, ProjectPM, ProjectTeamLead, ProjectWeekData, TeamLeadCostData } from '../models/Enteties';
import { PanelService } from '../panel.service';
import { AddPmToProjectDialog } from './ProjectDialogs/AddPMDialog';
import { AddTeamLeadToProjectDialog } from './ProjectDialogs/AddTeamLeadDialog';


export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};



@Component({
  selector: 'main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.sass'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class MainPageComponent implements OnInit {





  constructor(private _formBuilder: FormBuilder, private dataService: DataService,
                public matDialog: MatDialog, private panelService: PanelService, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.panelService.panelChanged.subscribe(v=> this.activePanel = v);
    this.dataService.getAllDesigners()
      .subscribe(data=>{
        var desData = data.map(d=>{
          d.specialization != null ? d.specializationName = this.specializations[d.specialization] : null
          d.grade != null ? d.gradeName = this.grades[d.grade] : null
          d.isTeamLead = d.position == 'TeamLead' ? this.PositionTeamlead[1] : this.PositionTeamlead[0];
        })
        this.designersData = data;
        this.dataService.getCustomSalaryBases()
        .subscribe(data=>{
          data = data.map(d=>{
            const f = d as any;
            f.fullName = d.firstName + ' ' + d.lastName
            f.designer = this.designersData.find(d=> d.teamWorkId == f.teamWorkId)
             return f;
          })
          this.customSalaryBaseData = data;
        });
      });

    this.dataService.getBonusRates()
      .subscribe(data=>{
        const desData = data.map(d=>{
          d.specialization != null ? d.specializationName = this.specializations[d.specialization] : null
          d.grade != null ? d.gradeName = this.grades[d.grade] : null
          return d;
        })
        this.bonusRatesData = desData;
      });

      this.dataService.getSalaryBases()
      .subscribe(data=>{
        const desData = data.map(d=>{
          d.specialization != null ? d.specializationName = this.specializations[d.specialization] : null
          return d;
        })
        this.salaryBaseData = desData;
      });




  }

  /*
    First step
  */

  firstFormGroup: FormGroup = this._formBuilder.group({firstCtrl: ['']});
  date = new FormControl(moment());
  activePanel: string = 'calculate'


  setMonthAndYear(normalizedMonthAndYear: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  onMonthSelected(): void{
    const ctrlValue = this.date.value!;
    const month = ctrlValue.month() + 1;
    const year = ctrlValue.year();
    this.dataLoaded = this.dataService.checkIstimeLogsExists(month, year);
    this.dataLoaded.subscribe(result => {
      if(result){
        this.lastTimeLogDate = this.dataService.getLastTimeLogDate(month, year);
      }
    });
  }


   /*
    Second step
  */

  secondFormGroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});
  dataLoaded: Observable<boolean> | undefined;
  lastTimeLogDate: Observable<Date> | undefined;
  timeLogsLoading: boolean = false;


  loadedTimeLogs(): void{
    const ctrlValue = this.date.value!;
    const month = ctrlValue.month() + 1;
    const year = ctrlValue.year();
    this.timeLogsLoading = true;
    this.dataService.refreshTimeLog(month, year).subscribe(
      r=>{
        this.timeLogsLoading = false;
        this.dataLoaded = this.dataService.checkIstimeLogsExists(month, year);
        this.lastTimeLogDate = this.dataService.getLastTimeLogDate(month, year);
    })
  }

  showDesignerData(): void{
    const ctrlValue = this.date.value!;
    const month = ctrlValue.month() + 1;
    const year = ctrlValue.year();
    this.dataService.GetWorkHours(month, year)
      .subscribe(monthHours => {
          this.monthWorkHours = monthHours;
          this.dataService.GetDesignersData(month, year).subscribe(
              response =>{
                  response.forEach(d => {
                    (this as any)["projects_" + d.id ] = [] as ProjectInDesignerInfo[];
                    this.dataService.GetDesignerProjectsData(month, year, d.id)
                        .subscribe(resp =>{
                            (this as any)["projects_" + d.id ] = resp.map(p =>{
                                p.firstName = d.firstName;
                                p.grade = d.grade;
                                p.gradeLabel = d.gradeLabel;
                                p.bonusPerHour = d.bonus;
                                p.lastName = d.lastName;
                                p.realBonus = Number((p.bonusHours * d.bonus).toFixed(2));
                                p.realSalary = d.realSalary;
                                p.summary = d.summary;
                                return p;
                            });
                        })
                  });

                  this.designersList = response.map(d =>{
                    const coef = d.totalHours / monthHours;
                    d.realSalary = Number((d.salary * coef).toFixed(2));
                    d.realBonus = Number((d.bonus * d.bonusHours).toFixed(2));
                    d.summary = Number((d.realSalary  + d.realBonus).toFixed(2));
                    return d;
                  });

          });
    });

  }


  /*
    thirt step
  */
  thirdFormGroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});
  monthWorkHoursControl = new FormControl();
  monthWorkHours: number = 0;
  displayedColumns: string[] = ['firstName', 'lastName', 'gradeLabel', 'bonus','totalHours',  'realBonus', 'realSalary', 'summary']
  designersList: DesignerInfo[] = [];
  projectsInDesignerDisplayedColumns: string[] = ['firstName', 'lastName','gradeLabel', 'projectName', 'totalHours',
                'bonusPerHour',  'realBonus',  'realSalary', 'summary']
  projectsInDesignerSource: ProjectInDesignerInfo[] = [];

  onWorkHoursChange(): void{
    var monthHours = this.monthWorkHours;
    this.designersList = this.designersList.map(d =>{
      const coef = d.totalHours / monthHours;
      d.realSalary =  Number((d.salary * coef).toFixed(2));
      d.summary = Number((d.realSalary  + d.realBonus).toFixed(2));
      return d;
    });
    this.designersList.forEach(d=>{
      var source = ((this as any)["projects_" + d.id] as ProjectInDesignerInfo[])
      source = source.map(p =>{
        p.realSalary =   Number((d.realSalary).toFixed(2));
        p.summary =  Number((d.summary).toFixed(2));
        return p;
      })
    });

  }

  getDataSourse(designer: DesignerInfo): CdkTableDataSourceInput<any>{
    return (this as any)["projects_" + designer.id ];
  }

  getFooterData(columName: string, designerId: string): any {
    var source = ((this as any)["projects_" + designerId ] as ProjectInDesignerInfo[])
    if(source.length == 0){
      return "";
    }
    const stableColumns = ['firstName', 'lastName','grade', 'gradeLabel','bonusPerHour','realSalary', 'summary']
    if (stableColumns.includes(columName)){
      return (source[0] as any)[columName];
    }
    if(columName == 'projectName'){
      return '';
    }
    const sumColumns = ['totalHours', 'realBonus']
    if(sumColumns.includes(columName)){
        return Number(source
          .map(t => ((t as any)[columName] as number))
          .reduce((acc, value) => acc + value, 0).toFixed(2));
    }
  }

  showTeamLeadData(): void{
    const ctrlValue = this.date.value!;
    const month = ctrlValue.month() + 1;
    const year = ctrlValue.year();
    this.dataService.GetAllProjects(month, year)
        .subscribe(p => {
          this.projectsData = p.map(p => {
              const proj = new ProjectModel();
              proj.billibleHour = p.billibleHour;
              proj.projectId = p.projectId;
              proj.projectName = p.projectName;
              proj.rate = p.rate;
              proj.teamLeads = p.teamLeads;
              proj.projectManagers = p.projectManagers;
              proj.income = Number((p.rate * p.billibleHour).toFixed(2))
              return proj; })
      })
  }



  /*
    fourth step
  */
  fourthFormGroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});
  projectsData: ProjectModel[] = [];
  projectsDisplayedColumns: string[] = ['projectName','billibleHour', 'rate', 'income','teamLeads', 'projectManagers']

  teamLeadsList: ProjectTeamLead[] = []
  pmsList: ProjectPM[] = []

  onRateChange(project: ProjectModel){
    project.income = Number((project.billibleHour * project.rate).toFixed(2));
  }
  onIncomeChange(project: ProjectModel){
    console.log('onIncomeChange')
    project.rate = Number((project.income / project.billibleHour).toFixed(2));
  }

  removeTeamLeadfromProject(project: ProjectModel, teamLead: ProjectTeamLead){
    project.teamLeads = project.teamLeads.filter(t=> t.teamLeadId != teamLead.teamLeadId);
  }

  addTeamLeadToProject(project: ProjectModel): void{
    const dialogRef = this.matDialog.open(AddTeamLeadToProjectDialog, {
      width: '400px',
      data: project,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  removePMfromProject(project: ProjectModel, pm: ProjectPM){
    project.projectManagers = project.projectManagers.filter(t=> t.projectManagerId != pm.projectManagerId);
  }

  addPmToProject(project: ProjectModel): void{
    const dialogRef = this.matDialog.open(AddPmToProjectDialog, {
      width: '400px',
      data: project,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  saveIncomeProjectData(){
    this.dataService.SaveProjectData(this.projectsData).subscribe();

    this.calcProjectCostFromDesigners();
    this.calcProjectCostFromPMSalary();
  }


  calcProjectCostFromDesigners(){
    var costList: CostFromDesigner[] = []
    this.designersList
          .filter(d=> d.id != '388130')   // without  "Julia Lysenko"
          .forEach(d=>{
             var desProjects = (this as any)["projects_" + d.id ] as ProjectInDesignerInfo[];

            var comercialProject = desProjects.filter(p => !p.projectName.includes("Internal ") &&
                  !p.projectName.includes('Regular marketing activities'));
            var internalProject = desProjects.filter(p => p.projectName.includes("Internal ") ||
                  p.projectName.includes('Regular marketing activities'));

            var internalSumHours = internalProject.reduce((a, b) => a + b.totalHours, 0);
            var commercialSumHours  = comercialProject.reduce((a ,b)=> a + b.totalHours ,0);

            var internalPercent = internalSumHours / (internalSumHours + commercialSumHours);

            var internalSumBonus = internalProject.reduce((a, b) => a + b.realBonus, 0);

            comercialProject.forEach(p =>{
              var projectPart = p.totalHours / commercialSumHours;
              var projectTotalPart = p.totalHours / (commercialSumHours + internalSumHours)
              var isOnlyComercial = d.id == '593859' // Valentina Oparysheva

              costList.push({
                  projectId: p.projectId,
                  projectName: p.projectName,
                  designerName: d.lastName + " " + d.firstName,
                  projectPercent: projectPart * 100,
                  cost: p.realBonus + p.realSalary * projectTotalPart,
                  internalCost: isOnlyComercial ? 0 :
                      internalSumBonus * projectPart + p.realSalary * internalPercent * projectPart
              });
            });
    });

    this.projectsData.forEach(p =>{
        p.costFromDesigner = Number(costList
              .filter(pc => pc.projectId == p.projectId)
              .reduce((a ,c)=> a + c.cost + c.internalCost, 0).toFixed(2));
        p.profit = Number((p.income - p.costFromDesigner - p.costPMSalary ?? 0 - p.costAdditional?? 0 ).toFixed(2));
    });

  }

  calcProjectCostFromPMSalary(){
    var costFromPm : PmCostPerProject[] = []
    this.dataService.GetPmList().subscribe(pmsList => {
      pmsList.forEach(pm =>{
        var projects = this.projectsData.filter(p => p.projectManagers
                              .some(pr => pr.projectManagerId == pm.projectManagerId));
        var fullIncome = projects.reduce((a, p) => {
            var projectIncome = p.income * (p.projectManagers.filter(ppm => ppm.projectManagerId == pm.projectManagerId)
                    .reduce((a, m) => a + m.percent,0) / 100);
            return a + projectIncome;
        },0);

        projects.forEach(p =>{
            costFromPm.push({
              PmId : pm.projectManagerId,
              PmName : pm.projectManagerName,
              Projectid : p.projectId,
              ProjectCost : pm.currentRate * (p.income * (p.projectManagers.filter(ppm => ppm.projectManagerId == pm.projectManagerId)
                  .reduce((a, m) => a + m.percent,0) / 100) / fullIncome)
            } as PmCostPerProject);
        });




      })
      this.projectsData.forEach(p =>{
        p.costPMSalary = Number(costFromPm.filter(cpm => cpm.Projectid == p.projectId)
            .reduce((a,b) => a+ b.ProjectCost ,0).toFixed(2));
      })


    });
  }


  /*
    fifth step
  */
    fifthFormgroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});

    projectsCostDisplayedColumns: string[] = ['projectName', 'billibleHour','costFromDesigner', 'costPMSalary', 'costAdditional', 'profit']

    onCostChange(project: ProjectModel){
      project.profit = Number((project.income - project.costFromDesigner - project.costPMSalary - project.costAdditional).toFixed(2));
    }

    saveCostProjectData(){
      this.calcTeamleadsBonus();
    }


    /*
      sixth step

    */

    sixthFormGroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});
    teamLeadShortList: any[] = [];
    teamleadsBonusColumns: string[] = ['teamLeadName', 'projectName',
          'projectIncome', 'projectCosts', 'projectProfit', 'teamLeadPart', 'teamLeadBonus']


    calcTeamleadsBonus(){
      var teamLeads : TeamLeadCostData[] = [];
      this.projectsData
        .filter(p => p.teamLeads.length > 0)
        .reduce((tl, p) => {
            p.teamLeads.forEach(ptl =>{
              tl.push({
                  teamLeadId: ptl.teamLeadId,
                  teamLeadName: ptl.teamLeadName,
                  projectId: p.projectId!,
                  projectName: p.projectName!,
                  projectCosts: p.costAdditional + p.costFromDesigner + p.costPMSalary,
                  projectIncome: p.income,
                  projectProfit: p.profit,
                  teamLeadPart: ptl.percent,
                  teamLeadBonus: Number((p.profit * ptl.percent/100 * 0.05).toFixed(2))
              });
            });
            return tl;
        }, teamLeads);

      this.teamLeadShortList = Object.values(teamLeads.map<ProjectTeamLead>((t) => {
        return { teamLeadId: t.teamLeadId, teamLeadName: t.teamLeadName, percent: t.teamLeadPart};
      }).reduce((obj, i) => {
        obj[i.teamLeadId] = i;
        return obj; }, {} as any));

      this.teamLeadShortList.forEach(t => {
          (this as any)["tlProjects_" + t.teamLeadId] = teamLeads.filter(tls => tls.teamLeadId == t.teamLeadId);
      });
    }


    getTeamleadBonuSourse(t: any): CdkTableDataSourceInput<any>{
      return (this as any)["tlProjects_" + t.teamLeadId];
    }

    getTlBonusColumnFooterData(columName: string, tlId: string): any {
      var source = ((this as any)["tlProjects_" + tlId ] as TeamLeadCostData[])
      if(source.length == 0){
        return "";
      }
      if (columName === 'teamLeadName'){
        return (source[0] as any)[columName];
      }
      if(columName === 'teamLeadBonus'){
        return Number(source
          .map(t => ((t as any)[columName] as number))
          .reduce((acc, value) => acc + value, 0).toFixed(2));
      }
      return '';
    }


    /*
      seventh step

    */
      seventhFormGroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});
      pmsShortList: ProjectPM[] = [];
      pmsBonusColumns: string[] = ['pmName', 'projectName', 'projectIncome', 'projectCosts',
          'projectProfit', 'pmPart', 'pmBonus']


    calcPMsBonus(){
      var projectManagers : PmCostData[] = [];
      this.projectsData
        .filter(p => p.teamLeads.length > 0)
        .reduce((tl, p) => {
            p.projectManagers.forEach(ppm =>{
              tl.push({
                  pmId: ppm.projectManagerId,
                  pmName: ppm.projectManagerName,
                  projectId: p.projectId!,
                  projectName: p.projectName!,
                  projectCosts: p.costAdditional + p.costFromDesigner + p.costPMSalary,
                  projectIncome: p.income,
                  projectProfit: p.profit,
                  pmPart: ppm.percent,
                  pmBonus: Number((p.profit * ppm.percent/100 * 0.07).toFixed(2))
              });
            });
            return tl;
        }, projectManagers);

      this.pmsShortList = Object.values(projectManagers.map<ProjectPM>((p) => {
        return { projectManagerId: p.pmId, projectManagerName: p.pmName, percent: p.pmPart, currentRate: 0};
      }).reduce((obj, i) => {
        obj[i.projectManagerId] = i;
        return obj; }, {} as any));

      this.pmsShortList.forEach(t => {
          (this as any)["pmProjects_" + t.projectManagerId] =
              projectManagers.filter(pms => pms.pmId == t.projectManagerId);
      });
    }


    getPMBonusSourse(t: any): CdkTableDataSourceInput<any>{
      return (this as any)["pmProjects_" + t.projectManagerId];
    }

    getPmBonusColumnFooterData(columName: string, pmId: string): any {
      var source = ((this as any)["pmProjects_" + pmId ] as PmCostData[])
      if(source.length == 0){
        return "";
      }
      if (columName === 'pmName'){
        return (source[0] as any)[columName];
      }
      if(columName === 'pmBonus'){
        return Number(source
          .map(t => ((t as any)[columName] as number))
          .reduce((acc, value) => acc + value, 0).toFixed(2));
      }
      return '';
    }


    /*
      eightth step

    */
      eightthFormGroup: FormGroup = this._formBuilder.group({secondCtrl: ['']});

      hoursPerWeekData: ProjectWeekData[] = [];
      hoursPerWeekDataColumns: string[] = ['projectId', 'projectName','firstWeeks' , 'beforeLastWeek', 'lastWeek'];
      firstWeekCaption: string = ''
      beforeLastWeekCaption: string = ''
      lastWeekCaption: string = ''


      GetDataForSales(){
        const ctrlValue = this.date.value!;
        const month = ctrlValue.month() + 1;
        const year = ctrlValue.year();
        this.dataService.getSalesInfoByWeeks(month, year)
          .subscribe(p => {
            this.firstWeekCaption = p[0].firstWeekCaption;
            this.beforeLastWeekCaption = p[0].beforeLastWeekCaption;
            this.lastWeekCaption = p[0].lastWeekCaption;
            this.hoursPerWeekData = p;
          })

      }

      getDataForExel(){
        var temp: any[] = []
        this.designersList.forEach(d=>{
          var source = ((this as any)["projects_" + d.id] as ProjectInDesignerInfo[])
          temp.push(source)
        });
        this.dataService.getExcelData(temp).subscribe(r =>{
          const a = document.createElement('a');
          a.setAttribute('style', 'display:none;');
          document.body.appendChild(a);
          a.href = URL.createObjectURL(r);
          a.download = "Дані по дизайнерам.xlsx";
          a.target = '_blank';
          a.click();
          document.body.removeChild(a);
          this._snackBar.open("Файл завантажено", "", {duration: 3000})
        })
      }



      /// Designers


    designersData : any[] = []
    designersColumnsSchema: any[] = [
      { key: 'firstName', type: 'text', label: 'Ім\'я'},
      { key: 'lastName', type: 'text', label: 'Прізвище'},
      { key: 'specializationName', type: 'spec', label: 'Спеціалізація'},
      { key: 'gradeName', type: 'grade', label: 'Грейд'},
      { key: 'isTeamLead', type: 'position', label: 'Чи тімлід'},
      { key: "isEdit", type: "isEdit", label: "" }
    ]
    displayedDesignersColumns: string[] = this.designersColumnsSchema.map(col => col.key);

    grades = [ "Junior", "Junior Plus",  "Middle Minus", "Middle", "Middle Plus", "Senior Minus", "Senior","Senior Plus"]
    specializations = ["Web Design", "UI/UX Design", "Graph Design","Strategy", "Motion"]
    PositionTeamlead = ["Ні", "Так"]


    addNewDesigner(){
        const newRow = {
          id: this.designersData.reduce((a, c)=> a > c.id ? a : c.id, 0) + 1,
          firstName: "",
          lastName: "",
          position: "Designer",
          isTeamLead: 'Ні',
          grade: 0,
          gradeName: "Junior",
          specialization: 0,
          specializationName: "Web Design",
          teamWorkId: "",
          isEdit: true,

        };
        this.designersData = [newRow, ...this.designersData];
    }

    removeDesigner(id : number){
      this.designersData = this.designersData.filter((u) => u.id !== id);
    }

    connectDesiner(designer : any){
        this.matDialog.open(ConnectDesignerComponent)
        .afterClosed().subscribe(r=>{
          if(r == ''){
            return;
          }
          this.dataService.getIdByEmail(r).subscribe(id=>{ designer.teamWorkId = '' + id; console.log(designer); })
        })
    }

    saveDesignerChanges(){
      var data = this.designersData.map(d=>{
          d.grade = this.grades.findIndex(g=> g === d.gradeName)
          d.specialization = this.specializations.findIndex(s=> s == d.specializationName)
          d.position = d.isTeamLead == "Ні" ? "Designer" : "TeamLead"

          return d;
      })
      this.dataService.UpdateDesignersData(data).subscribe(v=>console.log(v));
    }

    //paymant
    bonusRatesData : any[] = []
    bonusRatesColumnsSchema: any[] = [
      { key: 'specializationName', type: 'label', label: 'Спеціалізація'},
      { key: 'gradeName', type: 'label', label: 'Грейд'},
      { key: 'base', type: 'number', label: 'Значення'},
      { key: "isEdit", type: "isEdit", label: "" }
    ]
    displayedBonusRatesColumns: string[] = this.bonusRatesColumnsSchema.map(col => col.key);


    salaryBaseData : any[] = []
    salaryBaseColumnsSchema: any[] = [
      { key: 'specializationName', type: 'label', label: 'Спеціалізація'},
      { key: 'base', type: 'number', label: 'Значення'},
      { key: "isEdit", type: "isEdit", label: "" }
    ]
    displayedsalaryBaseColumns: string[] = this.salaryBaseColumnsSchema.map(col => col.key);

    savePaymentData(){
      this.dataService.updateBonusRates(this.bonusRatesData).subscribe(v=>console.log(v));
      this.dataService.updateSalaryBases(this.salaryBaseData).subscribe(v=>console.log(v));
      this.dataService.updateCustomSalaryBases(this.customSalaryBaseData).subscribe(v=>console.log(v));
    }


    customSalaryBaseData : any[] = []
    customSalaryBaseColumnsSchema: any[] = [
      { key: 'fullName', type: 'label', label: 'fullName'},
      { key: 'base', type: 'number', label: 'Значення'},
      { key: "isEdit", type: "isEdit", label: "" }
    ]
    displayedCustomSalaryBaseColumns: string[] = this.customSalaryBaseColumnsSchema.map(col => col.key);

    addNewCustomItem(){
      const newRow = {
        firstName: "",
        lastName: "",
        fullName: "",
        designer: this.designersData[0],
        base: 0,
        teamWorkId: "",
        isEdit: true,

      };
      this.customSalaryBaseData = [newRow, ...this.customSalaryBaseData];
    }

    onCustomSalartBaseSave(el: any){
      el.fullName = el.designer.firstName + ' ' + el.designer.lastName;
      el.firstName = el.designer.firstName;
      el.lastName = el.designer.lastName;
      el.teamWorkId = el.designer.teamWorkId;

    }

    removeCustomBase(teamWorkId: string){
      this.customSalaryBaseData = this.customSalaryBaseData.filter((u) => u.teamWorkId !== teamWorkId);
    }
}




export interface Designer extends  Employee{
    specialization: Lookup | undefined;
    teamWorkId: string | undefined;
}

export interface Lookup{
    id: number
    name: string
}

export interface Employee{
  name: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  grade: Lookup | undefined;
  currentRate: Number | undefined;
}

export interface DesignerInfo{
  id: string;
  firstName: string,
  lastName: string,
  totalHours: number,
  bonusHours: number,
  salary: number,
  bonus: number,
  realSalary: number,
  realBonus: number,
  summary: number,
  grade: string,
  gradeLabel: string
}


export interface ProjectInDesignerInfo{
  firstName: string;
  lastName: string;
  grade: string;
  gradeLabel: string;
  projectId: string;
  projectName: string;
  totalHours: number;
  bonusHours: number;
  realBonus: number;
  bonusPerHour: number;
  realSalary: number;
  summary: number;
}

export class ProjectModel{
  projectId?: string;
  projectName?: string;
  rate: number = 0;
  billibleHour: number = 0;
  income: number = 0;
  teamLeads: ProjectTeamLead[] = [];
  projectManagers: ProjectPM[] = [];
  costFromDesigner: number = 0;
  costPMSalary: number = 0;
  costAdditional: number = 0;
  profit: number = 0;
}

export interface ProjectTeamLead{
  teamLeadId: string;
  teamLeadName: string;
  percent: number;
  projectId?: string;
}

export interface ProjectPM{
  projectManagerId: string;
  projectManagerName: string;
  percent: number;
  currentRate: number;
  projectId?: string;
}


export interface CostFromDesigner{
  projectId: string,
  projectName: string,
  cost: number,
  internalCost: number,
  projectPercent: number,
  designerName: string
}


export interface TeamLeadCostData{
  teamLeadId: string,
  teamLeadName: string,
  projectId: string;
  projectName: string;
  projectIncome: number,
  projectCosts: number,
  projectProfit: number,
  teamLeadPart: number,
  teamLeadBonus: number
}

export interface PmCostData{
  pmId: string,
  pmName: string,
  projectId: string;
  projectName: string;
  projectIncome: number,
  projectCosts: number,
  projectProfit: number,
  pmPart: number,
  pmBonus: number
}

export interface PmCostPerProject{
  PmId: string,
  PmName: string,
  Projectid: string,
  ProjectCost: number
}



export interface ProjectInTeamLeads extends ProjectInDesignerInfo{
      projectProfit: number
      bonus: number
}


export interface ProjectWeekData
{
  projectId: string
  projectName: string
  firstWeeks: number
  beforeLastWeek: number
  lastWeek: number

  firstWeekCaption: string
  beforeLastWeekCaption: string
  lastWeekCaption: string
}



export interface DesignerEntity
{
  id: number,
  firstName: string,
  lastName: string,
  position: string,
  grade: number,
  gradeName: string,
  specialization: number,
  specializationName: string,
  isTeamLead: string
  teamWorkId: string
}

export interface BonusRateModel
{
  grade: number,
  gradeName: string,
  specialization: number,
  specializationName: string,
  base: number
}

export interface SalaryBasesModel
{
  specialization: number,
  specializationName: string,
  base: number
}

export interface CustomSalaryBasesModel
{
  firstName: string,
  lastName: string,
  base: number,
  teamWorkId: string
}

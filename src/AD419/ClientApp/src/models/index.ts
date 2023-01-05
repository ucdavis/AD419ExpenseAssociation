export interface Organization {
  code: string;
  name: string;
}
export interface SFNRecord {
  sfn: string;
  description: string;
}

export interface Project {
  project: string;
  accession: string;
  pi: string;
}

export interface Association {
  project: string;
  accession: string;
  percent: number;
  spent: number;
  fte: number;
}

export interface Expense {
  chart: string;
  code: string;
  description: string;
  spent: number;
  fte: number;
  num: number;
  isAssociated: boolean;
}

export interface UngroupedExpense {
  expenseId: number;
  sfn: string;
  project: string;
  expenses: number;
  orgR: string;
  pi: string;
}

export interface ExpenseGrouping {
  grouping: string;
  showAssociated: boolean;
  showUnassociated: boolean;
}

export interface AssociationTotal {
  name: string;
  spent: number;
  fte: number;
  recs: number;
}

export interface ProjectInfo {
  accession: string;
  inv1: string;
  inv2?: string;
  inv3?: string;
  inv4?: string;
  inv5?: string;
  inv6?: string;
  beginDate: Date;
  termDate: Date;
  projTypeCd?: string;
  regionalProjNum?: string;
  statusCd: string;
  title: string;
}

export interface SFNSummary {
  groupDisplayOrder: number;
  lineDisplayOrder: number;
  lineTypeCode: string;
  lineDisplayDescriptor: string;
  sfn: string;
  total: number;
}

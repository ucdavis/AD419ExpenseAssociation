export interface Organization {
  code: string;
  name: string;
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

export interface ExpenseGrouping {
  grouping: string;
  showAssociated: boolean;
  showUnassociated: boolean;
}
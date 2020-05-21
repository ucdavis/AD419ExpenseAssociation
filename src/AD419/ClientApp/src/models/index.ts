export interface Organization {
  code: string;
  name: string;
}

export interface Project {
  project: string;
  accession: string;
  pi: string;
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

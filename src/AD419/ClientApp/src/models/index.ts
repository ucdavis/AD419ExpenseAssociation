export interface Organization {
  code: string;
  name: string;
}

export interface Project {
  number: string;
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

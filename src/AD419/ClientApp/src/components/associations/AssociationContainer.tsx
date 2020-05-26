import React, { useEffect, useState } from 'react';
import ExpenseRecordsContainer from './ExpenseRecordsContainer';
import ProjectsContainer from './ProjectsContainer';

import { Organization, ExpenseGrouping, Association } from '../../models';

export default function AssociationContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();

  // keep track of which groupings are selected in the expenses table
  const defaultExpenseGrouping: ExpenseGrouping = {
    expenses: [],
    grouping: 'Organization',
    showAssociated: false,
    showUnassociated: true,
  };
  const [expenseGrouping, setExpenseGrouping] = useState<ExpenseGrouping>(
    defaultExpenseGrouping
  );

  // fire only once to grab initial orgs
  useEffect(() => {
    const getDepartments = async (): Promise<void> => {
      // TODO: handle just getting orgs for current user
      // TODO: handle api errors and possibly login issue errors
      const result = await fetch('/Organization');
      const data = (await result.json()) as Organization[];

      if (data && data.length > 0) {
        setOrgs(data);
        setSelectedOrg(data[0]);
      }
    };

    getDepartments(); // go grab the depts
  }, []);

  // query for associations whenever the expense grouping changes
  useEffect(() => {
    const getAssociations = async (): Promise<void> => {
      // TODO: for now we are just going to use the first grouping
      // TODO: eventually we need to query by all selected grouped expenses
      const firstExpense = expenseGrouping.expenses[0];
      const result = await fetch(
        `/Association/ByGrouping?org=${selectedOrg?.code}&chart=${firstExpense.chart}&criterion=${firstExpense.code}&grouping=${expenseGrouping.grouping}`
      );
      const data = (await result.json()) as Association[];

      console.log('found association data', data);
    };

    if (expenseGrouping.expenses && expenseGrouping.expenses.length > 0) {
      getAssociations();
    }

  }, [selectedOrg, expenseGrouping]);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  // TODO: pass projects?  just accessions?
  const associate = (): Promise<void> => {
    console.log('associate');

    return Promise.resolve();
  };

  const unassociate = (): Promise<void> => {
    console.log('unassociate');

    return Promise.resolve();
  };

  return (
    <div>
      <div>
        Selected expense count {expenseGrouping.expenses?.length}
      </div>
      <select name='orgs' onChange={orgSelected}>
        {orgs.map((org) => (
          <option key={org.code} value={org.code}>
            {org.name}
          </option>
        ))}
      </select>
      {selectedOrg && selectedOrg.name}
      <div className='row'>
        <div className='col-sm'>
          <ExpenseRecordsContainer
            org={selectedOrg}
            expenseGrouping={expenseGrouping}
            setExpenseGrouping={setExpenseGrouping}
          ></ExpenseRecordsContainer>
        </div>
        <div className='col-sm'>
          <ProjectsContainer
            org={selectedOrg}
            associate={associate}
            unassociate={unassociate}
          ></ProjectsContainer>
        </div>
      </div>
    </div>
  );
}

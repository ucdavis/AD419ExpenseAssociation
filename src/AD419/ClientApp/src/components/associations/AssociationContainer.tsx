import React, { useEffect, useState } from 'react';
import ExpenseRecordsContainer from './ExpenseRecordsContainer';
import ProjectsContainer from './ProjectsContainer';

import {
  Organization,
  ExpenseGrouping,
  Association,
  Expense,
} from '../../models';

const JSONHeader = {
  'Content-type': 'application/json; charset=UTF-8',
};

export default function AssociationContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();

  // keep track of which groupings are selected in the expenses table
  const defaultExpenseGrouping: ExpenseGrouping = {
    grouping: 'Organization',
    showAssociated: false,
    showUnassociated: true,
  };
  const [expenseGrouping, setExpenseGrouping] = useState<ExpenseGrouping>(
    defaultExpenseGrouping
  );

  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);

  const [associations, setAssociations] = useState<Association[]>([]);

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
      // TODO: when changing org/grouping/associated, we need to clear out any already chosen expenses
      const data = {
        org: selectedOrg?.code,
        expenseGrouping: {
          ...expenseGrouping,
          org: selectedOrg?.code,
        },
        expenses: selectedExpenses,
      };

      const result = await fetch('/Association/ByGrouping', {
        method: 'POST',
        headers: JSONHeader,
        body: JSON.stringify(data),
      });

      const associations = (await result.json()) as Association[];

      setAssociations(associations);
      console.log('found association data', associations);
    };

    if (selectedExpenses && selectedExpenses.length > 0) {
      getAssociations();
    } else {
      setAssociations([]);
    }
  }, [selectedOrg, expenseGrouping, selectedExpenses]);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  // TODO: pass projects?  just accessions?
  const associate = async (associations: Association[]): Promise<void> => {
    console.log('associate', associations, selectedExpenses);
    
    const data = {
      associations,
      expenseGrouping: {
        ...expenseGrouping,
        org: selectedOrg?.code,
      },
      expenses: selectedExpenses,
    };

    const result = await fetch('/Association', {
      method: 'PUT',
      headers: JSONHeader,
      body: JSON.stringify(data),
    });

    if (result.ok) {
      console.log('success associating');
      // associate success, reset the expenses so none are selected
      setSelectedExpenses([]);
    }
  };

  const unassociate = async (): Promise<void> => {
    const data = {
      org: selectedOrg?.code,
      expenseGrouping: {
        ...expenseGrouping,
        org: selectedOrg?.code,
      },
      expenses: selectedExpenses,
    };

    const result = await fetch('/Association', {
      method: 'DELETE',
      headers: JSONHeader,
      body: JSON.stringify(data),
    });

    if (result.ok) {
      // delete success, reset the expenses so none are selected
      setSelectedExpenses([]);
    }

    console.log('unassociate done', result.ok);
  };

  return (
    <div>
      <div>Selected expense count {selectedExpenses?.length}</div>
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
            selectedExpenses={selectedExpenses}
            setSelectedExpenses={setSelectedExpenses}
            expenseGrouping={expenseGrouping}
            setExpenseGrouping={setExpenseGrouping}
          ></ExpenseRecordsContainer>
        </div>
        <div className='col-sm'>
          <ProjectsContainer
            org={selectedOrg}
            associations={associations}
            associate={associate}
            unassociate={unassociate}
          ></ProjectsContainer>
        </div>
      </div>
    </div>
  );
}

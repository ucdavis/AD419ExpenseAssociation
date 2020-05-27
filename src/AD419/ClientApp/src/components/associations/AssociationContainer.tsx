import React, { useEffect, useState } from 'react';
import ExpenseRecordsContainer from './ExpenseRecordsContainer';
import ProjectsContainer from './ProjectsContainer';

import { Organization, ExpenseGrouping, Association } from '../../models';

const JSONHeader = {
  'Content-type': 'application/json; charset=UTF-8',
};

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
        grouping: expenseGrouping.grouping,
        expenses: expenseGrouping.expenses,
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

    if (expenseGrouping.expenses && expenseGrouping.expenses.length > 0) {
      getAssociations();
    } else {
      setAssociations([]);
    }
  }, [selectedOrg, expenseGrouping]);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  // TODO: pass projects?  just accessions?
  const associate = async (associations: Association[]): Promise<void> => {
    console.log('associate', associations, expenseGrouping.expenses);
    const data = {
      associations,
      expenseGrouping: {
        ...expenseGrouping,
        org: selectedOrg?.code
      }
    };

    const result = await fetch('/Association', {
      method: 'PUT',
      headers: JSONHeader,
      body: JSON.stringify(data),
    });

    if (result.ok) {
      console.log('success associating');
    }
  };

  const unassociate = async (): Promise<void> => {
    const data = {
      org: selectedOrg?.code,
      grouping: expenseGrouping.grouping,
      expenses: expenseGrouping.expenses,
    };

    const result = await fetch('/Association', {
      method: 'DELETE',
      headers: JSONHeader,
      body: JSON.stringify(data),
    });

    if (result.ok) {
      // delete success, reset the expenses so none are selected
      setExpenseGrouping({ ...expenseGrouping, expenses: [] });
    }

    console.log('unassociate done', result.ok);
  };

  return (
    <div>
      <div>Selected expense count {expenseGrouping.expenses?.length}</div>
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
            associations={associations}
            associate={associate}
            unassociate={unassociate}
          ></ProjectsContainer>
        </div>
      </div>
    </div>
  );
}

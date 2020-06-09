import React, { useEffect, useState, useCallback } from 'react';
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

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);

  const [associations, setAssociations] = useState<Association[]>([]);

  // fire only once to grab initial orgs
  useEffect(() => {
    const getDepartments = async (): Promise<void> => {
      // TODO: handle just getting orgs for current user
      // TODO: handle api errors and possibly login issue errors
      const result = await fetch('/Organization');
      const data = await result.json();

      // need to allow any because the return type is odd
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgs: Organization[] = data.map((d: any) => {
        return {
          code: d.OrgR,
          name: d['Org-Dept'],
        };
      });

      if (data && data.length > 0) {
        setOrgs(orgs);
        setSelectedOrg(orgs[0]);
      }
    };

    getDepartments(); // go grab the depts
  }, []);

  // query for associations whenever the expense grouping changes
  useEffect(() => {
    const getAssociations = async (): Promise<void> => {
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
    };

    if (selectedExpenses && selectedExpenses.length > 0) {
      getAssociations();
    } else {
      setAssociations([]);
    }
  }, [selectedOrg, expenseGrouping, selectedExpenses]);

  const getExpensesCallback = useCallback(async (): Promise<void> => {
    const result = await fetch(
      `/Expense?org=${selectedOrg?.code}&grouping=${expenseGrouping.grouping}&showAssociated=${expenseGrouping.showAssociated}&showUnassociated=${expenseGrouping.showUnassociated}`
    );
    const expenses = await result.json();

    setExpenses(expenses);
  }, [
    expenseGrouping.grouping,
    expenseGrouping.showAssociated,
    expenseGrouping.showUnassociated,
    selectedOrg,
  ]);

  // requery whenever our grouping or org changes
  useEffect(() => {
    if (selectedOrg) {
      setSelectedExpenses([]);
      getExpensesCallback();
    }
  }, [
    selectedOrg,
    expenseGrouping.grouping,
    expenseGrouping.showAssociated,
    expenseGrouping.showUnassociated,
    setSelectedExpenses,
    getExpensesCallback,
  ]);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  // TODO: pass projects?  just accessions?
  const associate = async (associations: Association[]): Promise<void> => {
    if (selectedExpenses.length === 0 || associations.length === 0) return;

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
      // associate success, reset the expenses so none are selected
      await getExpensesCallback();
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
      await getExpensesCallback();
      setSelectedExpenses([]);
    }
  };

  return (
      <div className='row mb-5'>
        <div className='col-sm'>
          <div className="form-group">
          <label>Department</label>
          <select className="form-control box-shadow" name='orgs' onChange={orgSelected}>
            {orgs.map((org) => (
              <option key={org.code} value={org.code}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
          <div className="card">
          <ExpenseRecordsContainer
            expenses={expenses}
            selectedExpenses={selectedExpenses}
            setSelectedExpenses={setSelectedExpenses}
            expenseGrouping={expenseGrouping}
            setExpenseGrouping={setExpenseGrouping}
          ></ExpenseRecordsContainer>
        </div>
        </div>
        <div className='col-sm right-side'>
          <ProjectsContainer
            org={selectedOrg}
            associations={associations}
            associate={associate}
            unassociate={unassociate}
          ></ProjectsContainer>
        </div>
      </div>
  );
}

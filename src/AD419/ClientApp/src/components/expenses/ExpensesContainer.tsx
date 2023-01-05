import React, { useEffect, useState, useCallback } from 'react';

import { useHistory } from 'react-router-dom';

import ExpenseTable from './ExpenseTable';

import { Organization, SFNRecord, UngroupedExpense } from '../../models';

export default function ExpensesContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [sfns, setSFNs] = useState<SFNRecord[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();
  const [selectedSFN, setSelectedSFN] = useState<SFNRecord>();

  const [expenses, setExpenses] = useState<UngroupedExpense[]>([]);

  const [expensesLoading, setExpensesLoading] = useState<boolean>(true);

  const history = useHistory();

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
          code: d.orgR,
          name: d.name,
        };
      });

      if (data && data.length > 0) {
        setOrgs(orgs);
        setSelectedOrg(orgs[0]);
      } else {
        // no department access
        history.push('/access');
      }
    };

    getDepartments(); // go grab the depts
  }, [history]);

  useEffect(() => {
    const getSFNs = async (): Promise<void> => {
      const result = await fetch('/Expense/SFNs');
      const data = await result.json();
      const sfns = [{ sfn: 'All', description: '-- All SFNs --' }, ...data];
      if (data && data.length > 0) {
        setSFNs(sfns);
        setSelectedSFN(sfns[0]);
      }
    };
    getSFNs();
  }, []);

  const getExpensesCallback = useCallback(async (): Promise<void> => {
    setExpensesLoading(true);
    const result = await fetch(
      `/Expense/Ungrouped?org=${selectedOrg?.code}&sfn=${selectedSFN?.sfn}`
    );
    const expenses = await result.json();

    setExpenses(expenses);
    setExpensesLoading(false);
  }, [selectedOrg, selectedSFN]);

  // requery whenever our grouping or org changes
  useEffect(() => {
    if (selectedOrg) {
      getExpensesCallback();
    }
  }, [selectedOrg, getExpensesCallback]);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  const sfnSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const sfn = sfns.find((s) => s.sfn === val);
    setSelectedSFN(sfn);
  };

  return (
    <>
      <div className='row mb-5'>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <label>Department</label>
            <select
              className='form-control form-shadow'
              name='orgs'
              onChange={orgSelected}
            >
              {orgs.map((org) => (
                <option key={org.code} value={org.code}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className='col-12 col-md-6'>
          <div className='form-group'>
            <label>SFNs</label>
            <select
              className='form-control form-shadow'
              name='sfns'
              onChange={sfnSelected}
            >
              {sfns.map((sfnRecord) => (
                <option key={sfnRecord.sfn} value={sfnRecord.sfn}>
                  {sfnRecord.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className='row mb-5'>
        <div className='col-12 col-md-12'>
          <div className='card'>
            <ExpenseTable
              loading={expensesLoading}
              expenses={expenses}
            ></ExpenseTable>
          </div>
        </div>
      </div>
    </>
  );
}

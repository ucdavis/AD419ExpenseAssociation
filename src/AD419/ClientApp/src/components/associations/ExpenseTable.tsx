import React, { useMemo, useState } from 'react';
import { Expense } from '../../models';
import NumberDisplay from '../NumberDisplay';
import { TableFilter } from '../Filter';

interface Props {
  grouping: string;
  expenses: Expense[];
  selectedExpenses: Expense[];
  setSelectedExpenses: (expenses: Expense[]) => void;
}

export default function ExpenseTable(props: Props): JSX.Element {
  // ability to filter the unselected projects by project or PI
  const [filter, setFilter] = useState<string>();

  const areEqual = (expA: Expense, expB: Expense): boolean => {
    return (
      expA.entity === expB.entity &&
      expA.code === expB.code &&
      expA.code2 === expB.code2 &&
      expA.isAssociated === expB.isAssociated
    );
  };
  const isSelected = (expense: Expense): boolean => {
    return props.selectedExpenses.some((e) => areEqual(e, expense));
  };

  const expenseSelected = (
    expense: Expense,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = event.target;

    if (checked) {
      props.setSelectedExpenses([...props.selectedExpenses, expense]);
    } else {
      props.setSelectedExpenses([
        ...props.selectedExpenses.filter((exp) => !areEqual(exp, expense)),
      ]);
    }
  };

  const { grouping } = props;

  const showCode = useMemo(() => {
    return !(grouping === 'PI' || grouping === 'Employee');
  }, [grouping]);

  const showCode2 = useMemo(() => {
    return grouping === 'Fund/Project';
  }, [grouping]);

  const data = useMemo(() => {
    if (filter) {
      const lowerFilter = filter.toLowerCase();

      return props.expenses.filter((exp) => {
        // TODO: what do we want to filter on?
        // For now, filter on everything
        for (const value of Object.values(exp)) {
          if (value && String(value).toLowerCase().includes(lowerFilter)) {
            return true;
          }
        }

        // nothing matched, don't include this expense
        return false;
      });
    } else {
      return props.expenses;
    }
  }, [filter, props.expenses]);

  const codeHeader =
    grouping === 'FinancialDepartment'
      ? 'Fin Dept'
      : grouping === 'Project' || grouping === 'Fund/Project'
      ? 'Project'
      : grouping === 'Activity'
      ? 'Activity'
      : grouping === 'None'
      ? 'ExpenseId'
      : 'Code';

  const code2Header = grouping === 'Fund/Project' ? 'Fund' : 'Code2';

  const descriptionHeader =
    grouping === 'FinancialDepartment'
      ? 'Fin Dept Description'
      : grouping === 'PI'
      ? 'Principal Investigator'
      : grouping === 'Project'
      ? 'Project Description'
      : grouping === 'Activity'
      ? 'Activity Description'
      : 'Description';

  return (
    <>
      <div className='card-body card-bg'>
        <TableFilter filter={filter} setFilter={setFilter}></TableFilter>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th>Num</th>
            <th>Entity</th>
            {showCode2 && <th>{code2Header}</th>}
            {showCode && <th>{codeHeader}</th>}
            <th>{descriptionHeader}</th>
            <th className='expense-numeric'>Spent</th>
            <th className='expense-numeric'>FTE</th>
            <th>{/* Select */}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((expense) => (
            <tr
              key={
                expense.entity +
                expense.code +
                expense.code2 +
                expense.isAssociated
              }
              className={`expense-${
                expense.isAssociated ? 'associated' : 'unassociated'
              }`}
            >
              <td>{expense.num}</td>
              <td>{expense.entity}</td>
              {showCode2 && <td>{expense.code2 || '----'}</td>}
              {showCode && <td>{expense.code || '----'}</td>}
              <td className='expense-description'>
                {expense.description || '----'}
              </td>
              <td className='expense-numeric'>
                <NumberDisplay
                  value={expense.spent}
                  precision={2}
                  type='currency'
                ></NumberDisplay>
              </td>
              <td className='expense-numeric'>
                <NumberDisplay
                  value={expense.fte}
                  precision={4}
                ></NumberDisplay>
              </td>
              <td>
                <input
                  type='checkbox'
                  checked={isSelected(expense)}
                  onChange={(event): void => expenseSelected(expense, event)}
                ></input>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

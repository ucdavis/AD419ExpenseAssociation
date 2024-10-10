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
      : grouping === 'Project'
      ? 'Project'
      : grouping === 'Activity'
      ? 'Activity'
      : grouping === 'None'
      ? 'ExpenseId'
      : 'Code';

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
      <table className='table expense-table'>
        <thead>
          <tr>
            <th>Num</th>
            <th>Entity</th>
            {showCode && <th>{codeHeader}</th>}
            <th>{descriptionHeader}</th>
            <th>Spent</th>
            <th>FTE</th>
            <th>{/* Select */}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((expense) => (
            <tr
              key={expense.entity + expense.code + expense.isAssociated}
              className={`expense-${
                expense.isAssociated ? 'associated' : 'unassociated'
              }`}
            >
              <td>{expense.num}</td>
              <td>{expense.entity}</td>
              {showCode && <td>{expense.code || '----'}</td>}
              <td>{expense.description || '----'}</td>
              <td>
                <NumberDisplay
                  value={expense.spent}
                  precision={2}
                  type='currency'
                ></NumberDisplay>
              </td>
              <td>
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

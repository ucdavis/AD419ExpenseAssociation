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
      expA.chart === expB.chart &&
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

    console.log('selected', checked);
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
    return !(
      grouping === 'PI' ||
      grouping === 'Employee' ||
      grouping === 'None'
    );
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

  return (
    <>
      <div>
        <TableFilter filter={filter} setFilter={setFilter}></TableFilter>
      </div>
      <table>
        <thead>
          <tr>
            <th>Num</th>
            <th>Chart</th>
            {showCode && <th>Code</th>}
            <th>Description</th>
            <th>Spent</th>
            <th>FTE</th>
            <th>{/* Select */}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((expense) => (
            <tr key={expense.chart + expense.code + expense.isAssociated}>
              <td>{expense.num}</td>
              <td>{expense.chart}</td>
              {showCode && <td>{expense.code}</td>}
              <td>{expense.description}</td>
              <td>
                <NumberDisplay
                  value={expense.spent}
                  precision={2}
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

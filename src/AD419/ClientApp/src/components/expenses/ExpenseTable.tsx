import React, { useMemo, useState } from 'react';
import { UngroupedExpense } from '../../models';
import NumberDisplay from '../NumberDisplay';
import { TableFilter } from '../Filter';
import { groupBy } from '../../utilities';

interface Props {
  expenses: UngroupedExpense[];
  loading: boolean;
  emptyMessage: string;
}

export default function ExpenseTable(props: Props): JSX.Element {
  // ability to filter the unselected projects by project or PI
  const [filter, setFilter] = useState<string>();

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

  if (props.loading) {
    return (
      <div className='loading-expander text-center'>
        <b>Loading...</b>
      </div>
    );
  }

  return (
    <>
      <div className='card-body card-bg'>
        <TableFilter filter={filter} setFilter={setFilter}></TableFilter>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th>SFN</th>
            <th>OrgR</th>
            <th>Project</th>
            <th>PI</th>
            <th>Spent</th>
          </tr>
        </thead>
        <tbody>
          {data.map((expense, i) => (
            <tr key={expense.expenseId + expense.orgR + i}>
              <td>{expense.sfn}</td>
              <td>{expense.orgR}</td>
              <td>{expense.project}</td>
              <td>{expense.pi}</td>
              <td>
                <NumberDisplay
                  value={expense.expenses}
                  precision={2}
                  type='currency'
                ></NumberDisplay>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}></th>
            <th>SFN Subtotal</th>
          </tr>
          {groupBy(data, (d) => d.sfn).map(([sfn, expenses]) => (
            <tr key={sfn}>
              <td colSpan={4}>{sfn}</td>
              <td>
                <NumberDisplay
                  value={expenses.reduce((sum, exp) => sum + exp.expenses, 0)}
                  precision={2}
                  type='currency'
                ></NumberDisplay>
              </td>
            </tr>
          ))}
        </tfoot>
      </table>
      {data.length === 0 && (
        <div>
          <p className='text-center mt-2'>{props.emptyMessage}</p>
        </div>
      )}
    </>
  );
}

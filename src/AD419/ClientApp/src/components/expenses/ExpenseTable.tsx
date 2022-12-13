import React, { useMemo, useState } from 'react';
import { Expense, UngroupedExpense } from '../../models';
import NumberDisplay from '../NumberDisplay';
import { TableFilter } from '../Filter';

interface Props {
  expenses: UngroupedExpense[];
  loading: boolean;
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
            <th>Chart</th>
            <th>OrgR</th>
            <th>Project</th>
            <th>PI</th>
            <th>Accession</th>
            <th>Spent</th>
            <th>FTE</th>
          </tr>
        </thead>
        <tbody>
          {data.map((expense, i) => (
            <tr
              key={expense.chart + expense.orgR + expense.isAssociated + i}
              className={`expense-${
                expense.isAssociated ? 'associated' : 'unassociated'
              }`}
            >
              <td>{expense.sfn}</td>
              <td>{expense.chart}</td>
              <td>{expense.orgR}</td>
              <td>{expense.project}</td>
              <td>{expense.pi}</td>
              <td>{expense.accession}</td>
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
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6}>Total</td>
            <td>
              <NumberDisplay
                value={data.reduce((sum, exp) => sum + exp.spent, 0)}
                precision={2}
                type='currency'
              ></NumberDisplay>
            </td>
            <td>
              <NumberDisplay
                value={data.reduce((sum, exp) => sum + exp.fte, 0)}
                precision={4}
              ></NumberDisplay>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>Associated</td>
            <td>
              <NumberDisplay
                value={data
                  .filter((exp) => exp.isAssociated)
                  .reduce((sum, exp) => sum + exp.spent, 0)}
                precision={2}
                type='currency'
              ></NumberDisplay>
            </td>
            <td>
              <NumberDisplay
                value={data
                  .filter((exp) => exp.isAssociated)
                  .reduce((sum, exp) => sum + exp.fte, 0)}
                precision={4}
              ></NumberDisplay>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>Unassociated</td>
            <td>
              <NumberDisplay
                value={data
                  .filter((exp) => !exp.isAssociated)
                  .reduce((sum, exp) => sum + exp.spent, 0)}
                precision={2}
                type='currency'
              ></NumberDisplay>
            </td>
            <td>
              <NumberDisplay
                value={data
                  .filter((exp) => !exp.isAssociated)
                  .reduce((sum, exp) => sum + exp.fte, 0)}
                precision={4}
              ></NumberDisplay>
            </td>
          </tr>
        </tfoot>
      </table>
      {data.length === 0 && (
        <div>
          <p className='text-center mt-2'>
            No expenses found for given parameters.
          </p>
        </div>
      )}
    </>
  );
}

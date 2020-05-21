import React, { useEffect, useState } from 'react';
import { Organization, Expense } from '../../models';

interface Props {
  org: Organization | undefined;
}

export default function ExpenseRecordsContainer(props: Props): JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    console.log('org changed to ', props.org);

    const getExpenses = async (): Promise<void> => {
      const result = await fetch(`/Expense?org=${props.org?.code}`);
      const expenses = await result.json();

      setExpenses(expenses);
    };

    if (props.org) {
      getExpenses();
    }
  }, [props.org]);

    return (
      <div>
        <h1>Expenses</h1>
        <p>Options go here</p>
        <div>
          <table>
            <tbody>
              {expenses.map((p) => (
                <tr key={`${p.chart}-${p.code}`}>
                  <td>{p.description}</td>
                  <td>{p.spent}</td>
                  <td>{p.fte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
}

import React, { useEffect, useState } from 'react';
import { Organization, Expense, ExpenseGrouping } from '../../models';

interface Props {
  org: Organization | undefined;
  expenseGrouping: ExpenseGrouping;
  setExpenseGrouping: (grouping: ExpenseGrouping) => void;
}

export default function ExpenseRecordsContainer(props: Props): JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    console.log('org changed to ', props.org);

    const getExpenses = async (): Promise<void> => {
      const result = await fetch(
        `/Expense?org=${props.org?.code}&grouping=${props.expenseGrouping.grouping}&showAssociated=${props.expenseGrouping.showAssociated}&showUnassociated=${props.expenseGrouping.showUnassociated}`
      );
      const expenses = await result.json();

      setExpenses(expenses);
    };

    if (props.org) {
      getExpenses();
    }
  }, [
    props.org,
    props.expenseGrouping.grouping,
    props.expenseGrouping.showAssociated,
    props.expenseGrouping.showUnassociated,
  ]);

  const expenseSelected = (
    expense: Expense,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = event.target;

    if (checked) {
      props.setExpenseGrouping({
        ...props.expenseGrouping,
        expenses: [...props.expenseGrouping.expenses, expense], // add our new expense to the list
      });
    } else {
      props.setExpenseGrouping({
        ...props.expenseGrouping,
        expenses: [
          ...props.expenseGrouping.expenses.filter(
            (exp) => !(exp.chart === expense.chart && exp.code === expense.code)
          ),
        ],
      });
    }

    console.log('selected', event.target.checked);
  };

  // change show associated/unassociated options
  const handleOptionsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    option: string
  ): void => {
    props.setExpenseGrouping({
      ...props.expenseGrouping,
      [option]: event.target.checked,
    });
  };

  return (
    <div>
      <h1>Expenses</h1>
      <p>Options go here</p>
      <div>
        <input
          type='checkbox'
          checked={props.expenseGrouping.showAssociated}
          onChange={(event): void =>
            handleOptionsChange(event, 'showAssociated')
          }
        ></input>
        <label>Associated</label>
        <br></br>
        <input
          type='checkbox'
          checked={props.expenseGrouping.showUnassociated}
          onChange={(event): void =>
            handleOptionsChange(event, 'showUnassociated')
          }
        ></input>
        <label>Unassociated</label>
      </div>
      <div>
        <table>
          <tbody>
            {expenses.map((p) => (
              <tr key={`${p.chart}-${p.code}`}>
                <td>{p.code}</td>
                <td>{p.description}</td>
                <td>{p.spent}</td>
                <td>{p.fte}</td>
                <td>
                  <input
                    type='checkbox'
                    onChange={(event): void => expenseSelected(p, event)}
                  ></input>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

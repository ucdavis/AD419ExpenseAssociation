import React, { useEffect, useState } from 'react';
import { Organization, Expense, ExpenseGrouping } from '../../models';
import Groupings from './Groupings';

interface Props {
  org: Organization | undefined;
  selectedExpenses: Expense[];
  setSelectedExpenses: (expenses: Expense[]) => void;
  expenseGrouping: ExpenseGrouping;
  setExpenseGrouping: (grouping: ExpenseGrouping) => void;
}

export default function ExpenseRecordsContainer(props: Props): JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const { org, expenseGrouping, setSelectedExpenses } = props;

  useEffect(() => {
    console.log('org changed to ', org);

    const getExpenses = async (): Promise<void> => {
      const result = await fetch(
        `/Expense?org=${org?.code}&grouping=${expenseGrouping.grouping}&showAssociated=${expenseGrouping.showAssociated}&showUnassociated=${expenseGrouping.showUnassociated}`
      );
      const expenses = await result.json();

      setExpenses(expenses);
    };

    if (org) {
      setSelectedExpenses([]);
      getExpenses();
    }
  }, [
    org,
    expenseGrouping.grouping,
    expenseGrouping.showAssociated,
    expenseGrouping.showUnassociated,
    setSelectedExpenses,
  ]);

  const expenseSelected = (
    expense: Expense,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = event.target;

    if (checked) {
      props.setSelectedExpenses([...props.selectedExpenses, expense]);
    } else {
      props.setSelectedExpenses([
        ...props.selectedExpenses.filter(
          (exp) => !(exp.chart === expense.chart && exp.code === expense.code)
        ),
      ]);
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

  const isSelected = (expense: Expense): boolean => {
    return props.selectedExpenses.some(
      (e) => e.chart === expense.chart && e.code === expense.code
    );
  };

  const setGrouping = (grouping: string): void => {
    props.setExpenseGrouping({
      ...expenseGrouping,
      grouping,
    });
  };

  return (
    <div>
      <h1>Expenses</h1>
      <Groupings
        grouping={props.expenseGrouping.grouping}
        setGrouping={setGrouping}
      ></Groupings>
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
            {expenses.map((expense) => (
              <tr
                key={`${expense.chart}-${expense.code}-assoc${expense.isAssociated}`}
              >
                <td>{expense.num}</td>
                <td>{expense.chart}</td>
                <td>{expense.code}</td>
                <td>{expense.description}</td>
                <td>{expense.spent}</td>
                <td>{expense.fte}</td>
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
      </div>
    </div>
  );
}

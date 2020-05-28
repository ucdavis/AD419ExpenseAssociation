import React, { useEffect, useState } from 'react';
import { Organization, Expense, ExpenseGrouping } from '../../models';
import Groupings from './Groupings';
import ExpenseTable from './ExpenseTable';

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
        <ExpenseTable
          expenses={expenses}
          selectedExpenses={props.selectedExpenses}
          setSelectedExpenses={props.setSelectedExpenses}
        ></ExpenseTable>
      </div>
    </div>
  );
}

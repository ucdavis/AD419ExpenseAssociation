import React from 'react';
import { Expense, ExpenseGrouping } from '../../models';
import Groupings from './Groupings';
import ExpenseTable from './ExpenseTable';

interface Props {
  expenses: Expense[];
  selectedExpenses: Expense[];
  setSelectedExpenses: (expenses: Expense[]) => void;
  expenseGrouping: ExpenseGrouping;
  setExpenseGrouping: (grouping: ExpenseGrouping) => void;
}

export default function ExpenseRecordsContainer(props: Props): JSX.Element {
  const { expenseGrouping } = props;

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
      <div className='card-body pb-0 card-bg'>
        <div className='row justify-content-between'>
          <div className='col'>
            <Groupings
              grouping={props.expenseGrouping.grouping}
              setGrouping={setGrouping}
            ></Groupings>
          </div>
          <div className='col-sm d-flex align-items-center'>
            <div className='form-check checkbox checkbox-secondary form-check-inline'>
              <input
                id='showAssociated'
                type='checkbox'
                className='form-check-input'
                checked={props.expenseGrouping.showAssociated}
                onChange={(event): void =>
                  handleOptionsChange(event, 'showAssociated')
                }
              ></input>
              <label htmlFor='showAssociated' className='form-check-label'>
                Associated
              </label>
            </div>
            <div className='form-check checkbox checkbox-primary form-check-inline'>
              <input
                id='showUnassociated'
                type='checkbox'
                className='form-check-input'
                checked={props.expenseGrouping.showUnassociated}
                onChange={(event): void =>
                  handleOptionsChange(event, 'showUnassociated')
                }
              ></input>
              <label htmlFor='showUnassociated' className='form-check-label'>
                Unassociated
              </label>
            </div>
          </div>
        </div>
      </div>
      <div>
        <ExpenseTable
          grouping={expenseGrouping.grouping}
          expenses={props.expenses}
          selectedExpenses={props.selectedExpenses}
          setSelectedExpenses={props.setSelectedExpenses}
        ></ExpenseTable>
      </div>
    </div>
  );
}

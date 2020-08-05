import React from 'react';
import { ExpenseGrouping } from '../../models';

interface Props {
  expenseGrouping: ExpenseGrouping;
}

export default function ExpensesEmpty(props: Props): JSX.Element {
  // Cal -- this being shown depends on what is selected in the expense grouping (show associated only, unassoc only, or both)
  // so we should customize the message for each or pick a generic one.  I pass in the grouping in the props is case we want to use it
  return (
    <div className='text-center'>
      <h2>It looks like there are no unassociated items in here!</h2>
      <p>Perhaps it's time for icecream?</p>
      <i className='fas fa-ice-cream'></i>
    </div>
  );
}

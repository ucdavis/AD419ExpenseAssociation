import React from 'react';
import { ExpenseGrouping } from '../../models';

interface Props {
  expenseGrouping: ExpenseGrouping;
}

export default function ExpensesEmpty(props: Props): JSX.Element {
  // Cal -- this being shown depends on what is selected in the expense grouping (show associated only, unassoc only, or both)
  // so we should customize the message for each or pick a generic one.  I pass in the grouping in the props is case we want to use it
  if (true) {
  return (
      <div>
      <p className="text-center pt-2">Looks like there are no more unassociated items in this department <br/>
      Maybe it's time for an ice cream?
      </p>
    </div>
    ); } 
    
    else { return (
      <div>
      <p className="text-center mt-2">There is nothing to display with these parameters</p>
    </div>
    ) }
}

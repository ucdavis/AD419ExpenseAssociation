import React from 'react';
import { ExpenseGrouping } from '../../models';

interface Props {
  expenseGrouping: ExpenseGrouping;
}

export default function ExpensesEmpty(props: Props): JSX.Element {
  const { showAssociated, showUnassociated } = props.expenseGrouping;
  if (showUnassociated && !showAssociated) {
    // if we are showing unassociated expenses only
    return (
      <div>
        <p className='text-center pt-2'>
          Looks like there are no more unassociated items in this department{' '}
          <br />
          Maybe it's time for an ice cream?
        </p>
      </div>
    );
  } else {
    return (
      <div>
        <p className='text-center mt-2'>
          There is nothing to display with these parameters
        </p>
      </div>
    );
  }
}

import React, { useEffect, useState } from 'react';
import { Organization, AssociationTotal } from '../../models';

interface Props {
  org: Organization | undefined;
}

export default function Totals(props: Props): JSX.Element {
  const [totals, setTotals] = useState<AssociationTotal[]>([]);

  const { org } = props;

  // get totals whenever orgs change
  useEffect(() => {
    const getTotals = async (): Promise<void> => {
      const result = await fetch(`/Summary/ExpensesByDepartment/${org?.code}`);
      const data = (await result.json()) as AssociationTotal[];

      setTotals(data);
    };

    if (org && org.code) {
      getTotals();
    }
  }, [org]);

  return (
    <table className='table'>
      <thead>
        <tr>
          <th></th>
          <th>SPENT</th>
          <th>FTE</th>
          <th>RECS</th>
        </tr>
      </thead>
      <tbody>
        {totals.map((total) => (
          <tr key={total.name}>
            <td>{total.name}</td>
            <td>{total.spent}</td>
            <td>{total.fte}</td>
            <td>{total.recs}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

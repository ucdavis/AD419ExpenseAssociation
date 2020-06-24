import React, { useEffect, useState } from 'react';
import { Organization, AssociationTotal } from '../../models';
import NumberDisplay from '../NumberDisplay';

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
      setTotals([]);
      getTotals();
    }
  }, [org]);

  return (
    <div className='card'>
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
              <td>
                <NumberDisplay
                  value={total.spent}
                  precision={2}
                  type='currency'
                ></NumberDisplay>
              </td>
              <td>
                <NumberDisplay
                  value={total.fte}
                  precision={4}
                  type='number'
                ></NumberDisplay>
              </td>
              <td>{total.recs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

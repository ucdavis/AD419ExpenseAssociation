import React from 'react';
import { AssociationTotal } from '../../models';
import NumberDisplay from '../NumberDisplay';

interface Props {
  totals: AssociationTotal[];
}

export default function Totals(props: Props): JSX.Element {
  const { totals } = props;

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

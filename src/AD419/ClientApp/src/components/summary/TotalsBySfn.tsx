import React, { useEffect, useState } from 'react';
import { Organization, SFNSummary } from '../../models';
import NumberDisplay from '../NumberDisplay';

interface Props {
  org: Organization | undefined;
}

export default function TotalsBySfn(props: Props): JSX.Element {
  const [totals, setTotals] = useState<SFNSummary[]>([]);

  const { org } = props;

  // get totals whenever orgs change
  useEffect(() => {
    const getTotals = async (): Promise<void> => {
      const result = await fetch(
        `/Summary/ExpensesBySFN/${org?.code}?associationStatus=1`
      );
      const data = (await result.json()) as SFNSummary[];

      setTotals(data);
    };

    if (org && org.code) {
      getTotals();
    }
  }, [org]);

  // TODO: sort, order, make into a table
  // TODO: find a better key
  return (
    <div className="card">
      <div className="card-body">
      <p className="mb-0">Funding information for <b>{org?.name}</b></p>
      </div>
      <table className='table summary-table'>
        <thead>
          <tr>
            <th>Line Description</th>
            <th>SFN</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {totals.map((lineTotal) => (
            <tr key={lineTotal.lineDisplayDescriptor} className={lineTotal.lineTypeCode}>
              <td>{lineTotal.lineDisplayDescriptor}</td>
              <td>{lineTotal.sfn}</td>
              <td>
                {lineTotal.lineTypeCode === 'Heading' ? (
                  ''
                ) : (
                  <NumberDisplay
                    value={lineTotal.total}
                    precision={2}
                    type={lineTotal.lineTypeCode.startsWith('FTE') ? 'number' : 'currency'}
                  ></NumberDisplay>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

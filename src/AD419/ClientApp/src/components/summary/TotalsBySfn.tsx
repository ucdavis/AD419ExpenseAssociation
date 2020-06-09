import React, { useEffect, useState } from 'react';
import { Organization, SFNSummary } from '../../models';

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
    <div>
      <ul>
        {totals.map((lineTotal) => (
          <li key={lineTotal.lineDisplayDescriptor}>
            {lineTotal.lineDisplayDescriptor}- {lineTotal.total}
          </li>
        ))}
      </ul>
    </div>
  );
}

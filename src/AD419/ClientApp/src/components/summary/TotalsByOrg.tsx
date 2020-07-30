import React, { useEffect, useState } from 'react';
import { Organization, AssociationTotal } from '../../models';
import Totals from './Totals';

interface Props {
  org: Organization | undefined;
}

export default function TotalsByOrg(props: Props): JSX.Element {
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
      <Totals totals={totals}></Totals>
  );
}

import React, { useEffect } from "react";
import { Organization } from "../../models";

interface Props {
  org: Organization | undefined;
}

export default function ExpenseRecordsContainer(props: Props): JSX.Element {
  useEffect(() => {
    console.log('org changed to ', props.org);

    const getExpenses = async (): Promise<void> => {
      const result = await fetch("");
      const expenses = await result.json();

      console.log(expenses);
    };

    if (props.org) {
      getExpenses();
    }
  }, [props.org]);

  return <h1>Exp Container</h1>;
}

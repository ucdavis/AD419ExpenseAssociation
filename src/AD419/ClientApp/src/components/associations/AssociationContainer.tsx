import React, { useEffect, useState } from "react";
import ExpenseRecordsContainer from "./ExpenseRecordsContainer";
import ProjectsContainer from "./ProjectsContainer";

import { Organization } from "../../models";

export default function AssociationContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();

  // fire only once to grab initial orgs
  useEffect(() => {
    const getDepartments = async (): Promise<void> => {
      const result = await fetch("/Organization");
      const data = await result.json() as Organization[];

      if (data && data.length > 0) {
        setOrgs(data);
        setSelectedOrg(data[0]);
      }
    };

    getDepartments(); // go grab the depts
  }, []);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find(o => o.code === val);
    setSelectedOrg(org);
  };

  return (
    <div className="row">
      <select name="orgs" onChange={orgSelected}>
        {orgs.map((org) => (
          <option key={org.code} value={org.code}>
            {org.name}
          </option>
        ))}
      </select>
      {selectedOrg && selectedOrg.name}
      <div className="col-sm">
        <ExpenseRecordsContainer></ExpenseRecordsContainer>
      </div>
      <div className="col-sm">
        <ProjectsContainer></ProjectsContainer>
      </div>
    </div>
  );
}

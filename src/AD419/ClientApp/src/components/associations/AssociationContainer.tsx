import React, { useEffect, useState } from 'react';
import ExpenseRecordsContainer from './ExpenseRecordsContainer';
import ProjectsContainer from './ProjectsContainer';

import { Organization } from '../../models';

export default function AssociationContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();

  // fire only once to grab initial orgs
  useEffect(() => {
    const getDepartments = async (): Promise<void> => {
      // TODO: handle just getting orgs for current user
      // TODO: handle api errors and possibly login issue errors
      const result = await fetch('/Organization');
      const data = (await result.json()) as Organization[];

      if (data && data.length > 0) {
        setOrgs(data);
        setSelectedOrg(data[0]);
      }
    };

    getDepartments(); // go grab the depts
  }, []);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  // TODO: pass projects?  just accessions?
  const associate = (): Promise<void> => {
    console.log('associate');

    return Promise.resolve();
  };

  const unassociate = (): Promise<void> => {
    console.log('unassociate');

    return Promise.resolve();
  };

  return (
    <div>
      <select name='orgs' onChange={orgSelected}>
        {orgs.map((org) => (
          <option key={org.code} value={org.code}>
            {org.name}
          </option>
        ))}
      </select>
      {selectedOrg && selectedOrg.name}
      <div className='row'>
        <div className='col-sm'>
          <ExpenseRecordsContainer org={selectedOrg}></ExpenseRecordsContainer>
        </div>
        <div className='col-sm'>
          <ProjectsContainer
            org={selectedOrg}
            associate={associate}
            unassociate={unassociate}
          ></ProjectsContainer>
        </div>
      </div>
    </div>
  );
}

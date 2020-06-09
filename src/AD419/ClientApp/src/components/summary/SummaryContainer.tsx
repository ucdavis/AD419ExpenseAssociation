import React, { useState, useEffect } from 'react';
import { Organization } from '../../models';
import Totals from './Totals';
import ProjectInformation from './ProjectInformation';
import TotalsBySfn from './TotalsBySfn';

export default function SummaryContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();

  // fire only once to grab initial orgs
  useEffect(() => {
    const getDepartments = async (): Promise<void> => {
      // TODO: handle just getting orgs for current user
      // TODO: handle api errors and possibly login issue errors
      const result = await fetch('/Organization');
      const data = await result.json();

      // need to allow any because the return type is odd
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgs: Organization[] = data.map((d: any) => {
        return {
          code: d.OrgR,
          name: d['Org-Dept'],
        };
      });

      if (data && data.length > 0) {
        setOrgs(orgs);
        setSelectedOrg(orgs[0]);
      }
    };

    getDepartments(); // go grab the depts
  }, []);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  return (
    <div className='row mb-5'>
      <div className='col-sm'>
        <div className='form-group'>
          <label>Department</label>
          <select
            className='form-control box-shadow'
            name='orgs'
            onChange={orgSelected}
          >
            {orgs.map((org) => (
              <option key={org.code} value={org.code}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        <div className='card'>
          <Totals org={selectedOrg}></Totals>
        </div>
        <div className='card'>
          FISCAL YEAR 2019
          <ProjectInformation org={selectedOrg}></ProjectInformation>
        </div>
      </div>
      <div className='col-sm'>
          <TotalsBySfn org={selectedOrg}></TotalsBySfn>
      </div>
    </div>
  );
}

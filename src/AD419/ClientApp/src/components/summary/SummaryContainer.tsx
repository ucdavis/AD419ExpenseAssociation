import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { Organization } from '../../models';
import ProjectInformation from './ProjectInformation';
import TotalsBySfn from './TotalsBySfn';
import TotalsByOrg from './TotalsByOrg';

export default function SummaryContainer(): JSX.Element {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization>();
  const history = useHistory();

  // fire only once to grab initial orgs
  useEffect(() => {
    const getDepartments = async (): Promise<void> => {
      // TODO: handle just getting orgs for current user
      // TODO: handle api errors and possibly login issue errors
      const result = await fetch('/Organization?includeAll=true');
      const data = await result.json();

      // need to allow any because the return type is odd
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgs: Organization[] = data.map((d: any) => {
        return {
          code: d.orgR,
          name: d.name,
        };
      });

      if (data && data.length > 0) {
        setOrgs(orgs);
        setSelectedOrg(orgs[0]);
      } else {
        // no department access
        history.push('/access');
      }
    };

    getDepartments(); // go grab the depts
  }, [history]);

  const orgSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const org = orgs.find((o) => o.code === val);
    setSelectedOrg(org);
  };

  return (
    <div className='row mb-5'>
      <div className='col-12 col-md-6'>
        <div className='card'>
          <div className='card-body'>
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
            <TotalsByOrg org={selectedOrg}></TotalsByOrg>
          </div>
        </div>
        <div className='card mt-5'>
          <div className='card-body'>
            <ProjectInformation org={selectedOrg}></ProjectInformation>
          </div>
        </div>
      </div>
      <div className='col-12 col-md-6'>
        <TotalsBySfn org={selectedOrg}></TotalsBySfn>
      </div>
    </div>
  );
}

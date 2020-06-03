import React, { useState, useMemo } from 'react';
import { Project, Association } from '../../models';
import { PercentInput } from './PercentInput';
import { ProjectFilter } from '../Filter';

interface Props {
  projects: Project[];
  projectSelected: (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  projectPercentageChange: (project: Project, percent: number) => void;
  selectedAssociations: Association[];
}

export default function ProjectsTable(props: Props): JSX.Element {
  // TODO: is this the right way to use a memo of non-static data?
  const projects = React.useMemo(() => props.projects, [props.projects]);

  // ability to filter the unselected projects by project or PI
  const [filter, setFilter] = useState<string>();

  // we break the projects list into separate lists for those that have already been selected
  const unselectedProjects: Project[] = [],
    selectedProjects: Project[] = [];

  for (let i = 0; i < projects.length; i++) {
    const proj = projects[i];

    if (
      props.selectedAssociations.some((sa) => sa.accession === proj.accession)
    ) {
      selectedProjects.push(proj);
    } else {
      if (filter) {
        const lowercaseFilter = filter.toLowerCase();
        // we have a filter, so we need to only push if we match the filter
        if (
          proj.project.toLowerCase().includes(lowercaseFilter) ||
          proj.pi.toLowerCase().includes(lowercaseFilter)
        ) {
          unselectedProjects.push(proj);
        }
      } else {
        unselectedProjects.push(proj);
      }
    }
  }

  const isSelected = (project: Project): boolean => {
    return props.selectedAssociations.some(
      (assoc) => assoc.project === project.project
    );
  };

  const total = useMemo(() => {
    // get the total of all selected associations
    return props.selectedAssociations.reduce((sum, curr) => {
      return sum + curr.percent;
    }, 0);
  }, [props.selectedAssociations]);

  // TODO: we'll do two separate tables for now.  If they prove to be similar, refactor
  return (
    <>
      <div>
        <ProjectFilter filter={filter} setFilter={setFilter}></ProjectFilter>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th></th>
            <th>{total.toFixed(2)} %</th>
            <th>Project</th>
            <th>PI</th>
          </tr>
        </thead>
        <tbody>
          {selectedProjects.map((proj) => (
            <tr key={proj.accession}>
              <td>
                <input
                  type='checkbox'
                  checked={isSelected(proj)}
                  onChange={(event): void => props.projectSelected(proj, event)}
                ></input>
              </td>
              <td>
                <PercentInput
                  project={proj}
                  selectedAssociations={props.selectedAssociations}
                  projectPercentageChange={props.projectPercentageChange}
                ></PercentInput>
              </td>
              <td>{proj.project}</td>
              <td>{proj.pi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className='table'>
        <tbody>
          {unselectedProjects.map((proj) => (
            <tr key={proj.accession}>
              <td>
                <input
                  type='checkbox'
                  checked={isSelected(proj)}
                  onChange={(event): void => props.projectSelected(proj, event)}
                ></input>
              </td>
              <td>
                <PercentInput
                  project={proj}
                  selectedAssociations={props.selectedAssociations}
                  projectPercentageChange={props.projectPercentageChange}
                ></PercentInput>
              </td>
              <td>{proj.project}</td>
              <td>{proj.pi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

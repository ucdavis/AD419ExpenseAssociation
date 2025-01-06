import React, { useMemo } from 'react';
import { Project, Association } from '../../models';
import { PercentInput } from './PercentInput';
import NumberDisplay from '../NumberDisplay';

interface Props {
  filter: string | undefined;
  projects: Project[];
  projectSelected: (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  projectPercentageChange: (project: Project, percent: number) => void;
  selectedAssociations: Association[];
  toggleAllAssociations: (selected: boolean) => void;
}

export default function ProjectsTable(props: Props): JSX.Element {
  // TODO: is this the right way to use a memo of non-static data?
  const projects = React.useMemo(() => props.projects, [props.projects]);

  const { filter } = props;

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

  const areAllSelected = (): boolean => {
    return (
      props.selectedAssociations.length > 0 &&
      props.selectedAssociations.length === props.projects.length
    );
  };

  const toggleSelectAll = (): void => {
    const shouldUnassignAll = areAllSelected();
    props.toggleAllAssociations(!shouldUnassignAll);
  };

  const total = useMemo(() => {
    // get the total of all selected associations
    return props.selectedAssociations.reduce((sum, curr) => {
      return sum + curr.percent;
    }, 0);
  }, [props.selectedAssociations]);

  function getProjectClass(project: string) {
    if (project.toUpperCase().includes('CG')) {
      return ' expense-project-CG';
    }
    return '';
  }

  return (
    <>
      <div className='card'>
        <table className='table projects-table'>
          <thead>
            <tr>
              <th>
                <input
                  type='checkbox'
                  checked={areAllSelected()}
                  onChange={toggleSelectAll}
                ></input>
              </th>
              <th>{total.toFixed(2)} %</th>
              <th>PI</th>
              <th>
                Project ({props.selectedAssociations.length} of{' '}
                {props.projects.length})
              </th>
              <th>Spent</th>
              <th>FTE</th>
            </tr>
          </thead>
          <tbody>
            {selectedProjects.map((proj, i) => {
              const isLastRow = i === selectedProjects.length - 1;
              const projAssociation = {
                spent: 0,
                fte: 0,
                ...props.selectedAssociations.find(
                  (association) => association.project === proj.project
                ),
              };
              return (
                <tr
                  key={proj.accession}
                  className={(isLastRow && 'last-active-row') || 'active-row'}
                >
                  <td>
                    <input
                      type='checkbox'
                      checked={isSelected(proj)}
                      onChange={(event): void =>
                        props.projectSelected(proj, event)
                      }
                    ></input>
                  </td>
                  <td>
                    <PercentInput
                      project={proj}
                      selectedAssociations={props.selectedAssociations}
                      projectPercentageChange={props.projectPercentageChange}
                    ></PercentInput>
                  </td>
                  <td>{proj.pi}</td>
                  <td className={'text-nowrap' + getProjectClass(proj.project)}>
                    {proj.project}
                  </td>
                  <td>
                    <NumberDisplay
                      value={projAssociation.spent}
                      precision={2}
                      type='currency'
                    ></NumberDisplay>
                  </td>
                  <td>
                    <NumberDisplay
                      value={projAssociation.fte}
                      precision={4}
                    ></NumberDisplay>
                  </td>
                </tr>
              );
            })}
            {unselectedProjects.map((proj) => (
              <tr key={proj.accession}>
                <td>
                  <input
                    type='checkbox'
                    checked={isSelected(proj)}
                    onChange={(event): void =>
                      props.projectSelected(proj, event)
                    }
                  ></input>
                </td>
                <td>
                  <PercentInput
                    project={proj}
                    selectedAssociations={props.selectedAssociations}
                    projectPercentageChange={props.projectPercentageChange}
                  ></PercentInput>
                </td>
                <td>{proj.pi}</td>
                <td className={'text-nowrap' + getProjectClass(proj.project)}>
                  {proj.project}
                </td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

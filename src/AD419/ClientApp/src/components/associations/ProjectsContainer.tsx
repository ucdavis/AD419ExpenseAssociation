import React, { useEffect, useState, useMemo } from 'react';

import { Organization, Project, Association } from '../../models';
import ProjectsTable from './ProjectsTable';
import { TableFilter } from '../Filter';

interface Props {
  org: Organization | undefined;
  associations: Association[];
  associate: (associations: Association[]) => Promise<void>;
  unassociate: () => Promise<void>;
}

export default function ProjectsContainer(props: Props): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedAssociations, setSelectedAssociations] = useState<
    Association[]
  >([]);

  // ability to filter the unselected projects by project or PI
  const [filter, setFilter] = useState<string>();

  useEffect(() => {
    const getProjects = async (): Promise<void> => {
      const result = await fetch(`/Association?org=${props.org?.code}`);
      const projects = await result.json();

      setProjects(projects);
    };

    if (props.org) {
      getProjects();
    }
  }, [props.org]);

  useEffect(() => {
    // clear out existing selected associations and replace with props whenever parent changes
    // this will happen when we select a new expense or do an assignment action

    // first we need to figure out each project's association percentage
    const totalAssociated = props.associations.reduce((sum, curr) => {
      return sum + curr.spent;
    }, 0);

    const associationsWithPercentages = props.associations.map((assoc) => ({
      ...assoc,
      percent: (assoc.spent / totalAssociated) * 100.0,
    }));

    setSelectedAssociations(associationsWithPercentages);
    setFilter(undefined);
  }, [props.associations]);

  const projectSelected = (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = event.target;

    let newAssociations: Association[] = [];

    if (checked) {
      // TODO: FUTURE FEATURE: once a percentage has been manually changed, don't change existing percentages

      // new association desired, add to the list
      const newAssociation: Association = {
        project: project.project,
        accession: project.accession,
        percent: 0,
        spent: 0,
        fte: 0,
      };
      newAssociations = [...selectedAssociations, newAssociation];
    } else {
      newAssociations = [
        ...selectedAssociations.filter(
          (assoc) => !(assoc.project === project.project)
        ),
      ];
    }

    // amount each row should have with an equal distribution
    const evenPercentage = 100.0 / newAssociations.length;

    setSelectedAssociations(
      newAssociations.map((assoc) => ({
        ...assoc,
        percent: evenPercentage,
      }))
    );
  };

  const handleProjectPercentageChange = (
    project: Project,
    percent: number
  ): void => {
    let adjustedAssociations = adjustAssociations(selectedAssociations);

    // ensure total doesn't exceed 100%
    var totalPercent = adjustedAssociations.reduce((sum, curr) => {
      return sum + curr.percent;
    }, 0);
    if (totalPercent > 100) {
      percent = 100 - (totalPercent - percent);
      adjustedAssociations = adjustAssociations(selectedAssociations);
    }

    setSelectedAssociations(adjustedAssociations);

    function adjustAssociations(associations: Association[]) {
      return associations.map((assoc) => {
        if (project.accession === assoc.accession) {
          // this is the one we want to change, so update the values
          return {
            ...assoc,
            percent,
          };
        }

        // otherwise just return the ones we don't care about
        return assoc;
      });
    }
  };

  // Function to return different associations depending on the percentage
  const chooseSelectAllOptions = (percentage: number) => {
    let everyProjectAsAssociation;

    if (percentage >= 100 || percentage == 0) {
      const evenPercentage = 100 / projects.length;

      everyProjectAsAssociation = projects.map((project) => {
        const newAssociation: Association = {
          project: project.project,
          accession: project.accession,
          percent: evenPercentage,
          spent: 0,
          fte: 0,
        };

        return newAssociation;
      });
    } else {
      const evenPercentage =
        (100 - percentage) / (projects.length - selectedAssociations.length);

      everyProjectAsAssociation = projects.map((project) => {
        const targetAssc = searchAssociation(project);

        if (!targetAssc) {
          const newAssociation: Association = {
            project: project.project,
            accession: project.accession,
            percent: evenPercentage,
            spent: 0,
            fte: 0,
          };
          return newAssociation;
        } else {
          return targetAssc;
        }
      });
    }

    return everyProjectAsAssociation;
  };

  // Tries to find an association through accession
  const searchAssociation = (project: Project) => {
    for (let i = 0; i < selectedAssociations.length; i++) {
      if (selectedAssociations[i].accession == project.accession) {
        return selectedAssociations[i];
      }
    }
  };

  const toggleAllAssociations = (selected: boolean): void => {
    if (selected) {
      const percentage = selectedAssociations.reduce((sum, curr) => {
        return sum + curr.percent;
      }, 0);

      const everyProjectAsAssociation = chooseSelectAllOptions(percentage);

      setSelectedAssociations(everyProjectAsAssociation);
    } else {
      // set selected associations back to empty
      setSelectedAssociations([]);
    }
  };

  const canAssociate = useMemo((): boolean => {
    // % needs to add up to 100 (or close to)
    const totalAssocationPercent = selectedAssociations.reduce((sum, curr) => {
      return sum + curr.percent;
    }, 0);

    // TODO: what precision do we care about?
    return Math.round(totalAssocationPercent) === 100.0;
  }, [selectedAssociations]);

  return (
    <div>
      <div className='row justify-content-between'>
        <div className='col-12 col-sm-6 form-shadow-right'>
          <TableFilter filter={filter} setFilter={setFilter}></TableFilter>
        </div>
        <div className='col-12 col-sm-6'>
          <div className='d-flex flex-wrap justify-content-between'>
            <button
              className='btn btn-assigners btn-secondary'
              disabled={!canAssociate}
              onClick={(): Promise<void> =>
                props.associate(selectedAssociations)
              }
            >
              <i className='far fa-arrow-alt-circle-up'></i>
              Assign
            </button>
            <button
              className='btn btn-assigners btn-primary'
              disabled={props.associations.length === 0}
              onClick={props.unassociate}
            >
              <i className='far fa-arrow-alt-circle-down'></i>
              Unassign
            </button>
          </div>
        </div>
      </div>
      <div>
        <ProjectsTable
          filter={filter}
          projects={projects}
          projectSelected={projectSelected}
          projectPercentageChange={handleProjectPercentageChange}
          selectedAssociations={selectedAssociations}
          toggleAllAssociations={toggleAllAssociations}
        ></ProjectsTable>
      </div>
    </div>
  );
}

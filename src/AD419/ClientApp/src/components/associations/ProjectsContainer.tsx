import React, { useEffect, useState } from 'react';

import { Organization, Project, Association } from '../../models';

interface Props {
  org: Organization | undefined;
  associations: Association[];
  associate: (associations: Association[]) => Promise<void>;
  unassociate: () => Promise<void>;
}

export default function ProjectsContainer(props: Props): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedAssociations, setSelectedAssociations] = useState<Association[]>([]);

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
      return sum + curr.spent
    }, 0);

    const associationsWithPercentages = props.associations.map(assoc => ({
      ...assoc,
      percent: (assoc.spent / totalAssociated) * 100.0
    }));

    setSelectedAssociations(associationsWithPercentages);
  }, [props.associations]);

  const projectSelected = (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    console.log('selected project', project);

    const { checked } = event.target;

    if (checked) {
      // TODO: FUTURE FEATURE: once a percentage has been manually changed, don't change existing percentages

      // new association desired, add to the list and then distribute percentages equally across all associations
      const newAssociation: Association = { project: project.project, accession: project.accession, percent: 0, spent: 0, fte: 0 };
      const newAssociations = [...selectedAssociations, newAssociation];

      // amount each row should have with an equal distribution
      const evenPercentage = (100.0 / newAssociations.length);
      
      setSelectedAssociations(newAssociations.map(assoc => ({
        ...assoc,
        percent: evenPercentage
      })));
    } else {
      setSelectedAssociations([
        ...selectedAssociations.filter(
          (assoc) =>
            !(
              assoc.project === project.project
            )
        ),
      ]);
    }
  };

  const isSelected = (project: Project): boolean => {
    return selectedAssociations.some((assoc) => assoc.project === project.project);
  };

  // return the percentage associated with this project
  const associationPercentage = (project: Project): number | undefined => {
    return selectedAssociations.find(assoc => assoc.project === project.project)?.percent
  }

  return (
    <div>
      <h1>Projects</h1>
      <p>Save buttons go here</p>
      <button className='btn btn-primary' onClick={(): Promise<void> => props.associate(selectedAssociations)}>
        Assign
      </button>
      <button className='btn btn-warning' onClick={props.unassociate}>
        Unassign
      </button>
      <div>
        <table>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project}>
                <td>
                  <input
                    type='checkbox'
                    checked={isSelected(p)}
                    onChange={(event): void => projectSelected(p, event)}
                  ></input>
                </td>
                <td>{associationPercentage(p)?.toFixed(2)}</td>
                <td>{p.project}</td>
                <td>{p.pi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';

import { Organization, Project, Association } from '../../models';

interface Props {
  org: Organization | undefined;
  associations: Association[];
  associate: () => Promise<void>;
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
    setSelectedAssociations(props.associations);
  }, [props.associations]);

  const projectSelected = (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    console.log('selected project', project);

    const { checked } = event.target;

    if (checked) {
      // TODO: we need to do a bunch of percentage calculations here
      const newAssociation: Association = { project: project.project, percent: 50, spent: 0, fte: 0 };

      setSelectedAssociations([...selectedAssociations, newAssociation]); // add our new project to the list
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

  return (
    <div>
      <h1>Projects</h1>
      <p>Save buttons go here</p>
      <button className='btn btn-primary' onClick={props.associate}>
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
                <td>%%</td>
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

import React, { useEffect, useState } from 'react';

import { Organization, Project } from '../../models';

interface Props {
  org: Organization | undefined;
  associate: () => Promise<void>;
  unassociate: () => Promise<void>;
}

export default function ProjectsContainer(props: Props): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProject] = useState<Project[]>([]);

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

  const projectSelected = (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    console.log('selected project', project);

    const { checked } = event.target;

    if (checked) {
      setSelectedProject([...selectedProjects, project]); // add our new project to the list
    } else {
      setSelectedProject([
        ...selectedProjects.filter(
          (p) =>
            !(
              p.accession === project.accession && p.project === project.project
            )
        ),
      ]);
    }
  };

  const isSelected = (project: Project): boolean => {
    return selectedProjects.some((p) => p.project === project.project);
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

import React, { useEffect, useState } from 'react';

import { Organization, Project } from '../../models';

interface Props {
  org: Organization | undefined;
}

export default function ProjectsContainer(props: Props): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    console.log('org changed to ', props.org);

    const getProjects = async (): Promise<void> => {
      const result = await fetch(`/Association?org=${props.org?.code}`);
      const projects = await result.json();

      setProjects(projects);
    };

    if (props.org) {
      getProjects();
    }
  }, [props.org]);

  return (
    <div>
      <h1>Projects</h1>
      <p>Save buttons go here</p>
      <div>
        <table>
          <tbody>
            {projects.map((p) => (
              <tr key={p.number}>
                <td>{p.number}</td>
                <td>{p.pi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

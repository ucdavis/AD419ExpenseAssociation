import React, { useEffect, useState } from 'react';
import { Organization, Project } from '../../models';

interface Props {
  org: Organization | undefined;
}

export default function ProjectInfo(props: Props): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);

  const { org } = props;

  useEffect(() => {
    const getProjects = async (): Promise<void> => {
      const result = await fetch(`/Project/${org?.code}`);
      const data = (await result.json()) as Project[];
      setProjects(data);
    };
    if (org && org.code) {
      getProjects();
    }
  }, [org]);

  return <div>{projects.length} projects</div>;
}

import React, { useEffect, useState } from 'react';
import { Organization, Project, ProjectInfo } from '../../models';

interface Props {
  org: Organization | undefined;
}

export default function ProjectInformation(props: Props): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project>();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>();

  const { org } = props;

  useEffect(() => {
    const getProjects = async (): Promise<void> => {
      const result = await fetch(`/Project/ByDepartment/${org?.code}`);
      const data = (await result.json()) as Project[];
      setProjects(data);
    };
    if (org && org.code) {
      getProjects();
    }
  }, [org]);

  useEffect(() => {
    const getProjectInfo = async (): Promise<void> => {
      const result = await fetch(`/Project/${selectedProject?.project}`);
      const data = (await result.json()) as ProjectInfo;
      setProjectInfo(data);
    };
    if (selectedProject) {
      getProjectInfo();
    }
  }, [selectedProject]);

  const projectSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;

    const proj = projects.find((p) => p.accession === val);
    setSelectedProject(proj);
  };

  return (
    <div>
      <div className='form-group'>
        <label>Projects</label>
        <select
          className='form-control box-shadow'
          name='projects'
          onChange={projectSelected}
        >
          <option key='none' value='none'>
            -- Select a project --
          </option>
          {projects.map((project) => (
            <option key={project.accession} value={project.accession}>
              {project.project}
            </option>
          ))}
        </select>
      </div>
      {projectInfo && (
        <div>
          <h5>Investigators</h5>
          <p>{projectInfo.inv1}</p>
          <p>Begin: {projectInfo.beginDate}</p>
          <p>End: {projectInfo.termDate}</p>
          <textarea readOnly={true} value={projectInfo.title}></textarea>
        </div>
      )}
    </div>
  );
}

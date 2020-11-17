import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

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
      const orderedProjects = data.sort((a, b) =>
        a.project.localeCompare(b.project)
      );

      setProjects(orderedProjects);
    };
    if (org && org.code) {
      setProjects([]);
      setSelectedProject(undefined);
      setProjectInfo(undefined);
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

  const projectSelected = (selectedProjects: Project[]): void => {
    setSelectedProject(selectedProjects[0]);
  };

  return (
    <div>
      <div className='form-group'>
        <label>Projects</label>
        <Typeahead
          id='project-typeahead'
          placeholder='Select A Project'
          labelKey='project'
          options={projects}
          onChange={projectSelected}
        />
      </div>
      {projectInfo && (
        <div className='projectinfo'>
          <p>
            <b>PI:</b> {projectInfo.inv1}
          </p>
          <p>
            <b>Begin:</b>{' '}
            {projectInfo.beginDate
              ? new Date(projectInfo.beginDate).toDateString()
              : ''}
          </p>
          <p>
            <b>End:</b>{' '}
            {projectInfo.termDate
              ? new Date(projectInfo.termDate).toDateString()
              : ''}
          </p>
          <p>
            <b>Project title:</b> {projectInfo.title}
          </p>
        </div>
      )}
    </div>
  );
}

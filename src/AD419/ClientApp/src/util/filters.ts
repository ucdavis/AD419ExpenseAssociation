import { Project } from '../models';

export const filterMatchesProject = (
  filter: string | undefined,
  project: Project
): boolean => {
  if (!filter) {
    return true;
  }

  const lowercaseFilter = filter.toLowerCase();

  return (
    project.project.toLowerCase().includes(lowercaseFilter) ||
    project.pi.toLowerCase().includes(lowercaseFilter)
  );
};

export const filterProjects = (
  filter: string | undefined,
  projects: Project[]
): Project[] => {
  return projects.filter((proj) => filterMatchesProject(filter, proj));
};

import React, { useState, useEffect } from 'react';
import { Project, Association } from '../../models';

interface Props {
  project: Project;
  selectedAssociations: Association[];
  projectPercentageChange: (project: Project, percent: number) => void;
}

export const PercentInput = (props: Props): JSX.Element => {
  const [percent, setPercent] = useState<string>('');

  const handlePercentageChange = (
    project: Project,
    event: React.FocusEvent<HTMLInputElement>
  ): void => {
    const val = parseFloat(event.target.value) || 0;
    props.projectPercentageChange(project, val);
  };

  useEffect(() => {
    // return the percentage associated with this project
    const associationPercentage = (project: Project): number | undefined => {
      return props.selectedAssociations.find(
        (assoc) => assoc.project === project.project
      )?.percent;
    };

    setPercent(associationPercentage(props.project)?.toFixed(2) || '');
  }, [props.project, props.selectedAssociations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPercent(e.target.value);
  };

  return (
    <input
      key={props.project.accession}
      type='text'
      value={percent}
      onChange={handleChange}
      onBlur={(event): void => handlePercentageChange(props.project, event)}
    ></input>
  );
};

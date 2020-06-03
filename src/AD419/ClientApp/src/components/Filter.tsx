import React from 'react';

interface Props {
  filter: string | undefined;
  setFilter: (filter: string | undefined) => void;
}

// Define a default UI for filtering
export const ProjectFilter = (props: Props): JSX.Element => {
  const { filter, setFilter } = props;

  return (
    <span>
      Search:{' '}
      <input
        value={filter || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
          setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        placeholder={`Search projects...`}
      />
    </span>
  );
};

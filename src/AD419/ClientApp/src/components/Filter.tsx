import React from 'react';

interface Props {
  filter: string | undefined;
  setFilter: (filter: string | undefined) => void;
  placeholder?: string;
}

// Define a default UI for filtering
export const TableFilter = (props: Props): JSX.Element => {
  const { filter, setFilter } = props;

  return (
    <div>
      <form>
        <div className="form-group">
      <input
      type="search"
      className="form-control"
        value={filter || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
          setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        placeholder={props.placeholder || 'Search...'}
      />
    </div>
    </form>
    </div>
  );
};

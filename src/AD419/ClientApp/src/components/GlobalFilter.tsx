import React from 'react';

// Define a default UI for filtering
export const GlobalFilter = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}: any): JSX.Element => {
  const count = preGlobalFilteredRows.length;

  return (
    <span>
      Search:{' '}
      <input
        value={globalFilter || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
          setGlobalFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
        }}
        placeholder={`${count} records...`}
      />
    </span>
  );
};

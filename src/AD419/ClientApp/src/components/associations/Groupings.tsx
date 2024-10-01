import React from 'react';

interface Props {
  grouping: string;
  setGrouping: (grouping: string) => void;
}

export default function Groupings(props: Props): JSX.Element {
  const handleSelected = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;
    props.setGrouping(val);
  };
  return (
    <select className='form-control' onChange={handleSelected}>
      {groupOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

interface Option {
  value: string;
  name: string;
}
const groupOptions: Option[] = [
  { name: 'Financial Department', value: 'FinancialDepartment' },
  {
    name: 'Principal Investigator',
    value: 'PI',
  },
  {
    name: 'Project',
    value: 'Project',
  },
  {
    name: 'Employee',
    value: 'Employee',
  },
  {
    name: 'Activity',
    value: 'Activity',
  },
];

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
    <select onChange={handleSelected}>
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
  { name: 'Organization', value: 'Organization' },
  {
    name: 'Principle Investigator',
    value: 'PI',
  },
  {
    name: 'Account',
    value: 'Account',
  },
  {
    name: 'Employee',
    value: 'Employee',
  },
  {
    name: 'Sub-Account',
    value: 'Sub-Account',
  },
  {
    name: 'No Grouping',
    value: 'None',
  },
];

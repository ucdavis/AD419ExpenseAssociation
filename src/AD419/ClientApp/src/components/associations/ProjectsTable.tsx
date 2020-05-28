import React from 'react';
import { Project, Association } from '../../models';
import {
  Column,
  CellProps,
  useTable,
  useFilters,
  useGlobalFilter,
} from 'react-table';
import { GlobalFilter } from '../GlobalFilter';

interface Props {
  projects: Project[];
  projectSelected: (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  selectedAssociations: Association[];
}

export default function ProjectsTable(props: Props): JSX.Element {
  // TODO: is this the right way to use a memo of non-static data?
  const data = React.useMemo(() => props.projects, [props.projects]);

  const isSelected = (project: Project): boolean => {
    return props.selectedAssociations.some(
      (assoc) => assoc.project === project.project
    );
  };

  const handleSelected = (
    project: Project,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    props.projectSelected(project, event);
  };

  // return the percentage associated with this project
  const associationPercentage = (project: Project): number | undefined => {
    return props.selectedAssociations.find(
      (assoc) => assoc.project === project.project
    )?.percent;
  };

  const cols: Column<Project>[] = [
    {
      id: '_select',
      Cell: ({ row }: CellProps<Project>): JSX.Element => (
        <input
          type='checkbox'
          checked={isSelected(row.original)}
          onChange={(event): void => handleSelected(row.original, event)}
        ></input>
      ),
    },
    {
      id: 'percentage',
      Cell: ({ row }: CellProps<Project>): JSX.Element => (
        <>{associationPercentage(row.original)?.toFixed(2)}</>
      ),
    },
    {
      Header: 'Project',
      accessor: 'project', // accessor is the "key" in the data
    },
    {
      Header: 'PI',
      accessor: 'pi',
    },
  ];

  // columns will never change but we still need the memo or we'll get a memory leak
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns: Column<Project>[] = React.useMemo(() => cols, [
    props.projects,
    props.selectedAssociations,
  ]);

  const {
    state,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable<Project>({ columns, data }, useFilters, useGlobalFilter);

  return (
    <table {...getTableProps()}>
      <thead>
        <tr>
          <th
            colSpan={6}
            style={{
              textAlign: 'left',
            }}
          >
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </th>
        </tr>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import React from 'react';
import { Expense } from '../../models';
import {
  useTable,
  Column,
  CellProps,
  useFilters,
  useGlobalFilter,
  TableState,
} from 'react-table';
import NumberDisplay from '../NumberDisplay';

interface Props {
    grouping: string;
  expenses: Expense[];
  selectedExpenses: Expense[];
  setSelectedExpenses: (expenses: Expense[]) => void;
}

export default function ExpenseTable(props: Props): JSX.Element {
  // TODO: is this the right way to use a memo of non-static data?
  const data = React.useMemo(() => props.expenses, [props.expenses]);

  const areEqual = (expA: Expense, expB: Expense): boolean => {
    return (
      expA.chart === expB.chart &&
      expA.code === expB.code &&
      expA.isAssociated === expB.isAssociated
    );
  };
  const isSelected = (expense: Expense): boolean => {
    return props.selectedExpenses.some((e) => areEqual(e, expense));
  };

  const expenseSelected = (
    expense: Expense,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = event.target;

    console.log('selected', checked);
    if (checked) {
      props.setSelectedExpenses([...props.selectedExpenses, expense]);
    } else {
      props.setSelectedExpenses([
        ...props.selectedExpenses.filter((exp) => !areEqual(exp, expense)),
      ]);
    }
  };

  const cols: Column<Expense>[] = [
    {
      Header: 'Num',
      accessor: 'num', // accessor is the "key" in the data
    },
    {
      Header: 'Chart',
      accessor: 'chart',
    },
    {
      id: 'code',
      Header: 'Code',
      accessor: 'code',
    },
    {
      Header: 'Description',
      accessor: 'description',
    },
    {
      Header: 'Spent ($)',
      Cell: ({ row }: CellProps<Expense>): JSX.Element => (
        <NumberDisplay value={row.original.spent} precision={2}></NumberDisplay>
      ),
    },
    {
      Header: 'FTE',
      Cell: ({ row }: CellProps<Expense>): JSX.Element => (
        <NumberDisplay value={row.original.fte} precision={4}></NumberDisplay>
      ),
    },
    {
      id: '_select',
      Cell: ({ row }: CellProps<Expense>): JSX.Element => (
        <input
          type='checkbox'
          checked={isSelected(row.original)}
          onChange={(event): void => expenseSelected(row.original, event)}
        ></input>
      ),
    },
  ];

  // columns will never change but we still need the memo or we'll get a memory leak
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns: Column<Expense>[] = React.useMemo(() => cols, [
    props.selectedExpenses,
    props.expenses,
  ]);

  const initialState: Partial<TableState<Expense>> = {
    hiddenColumns: [],
  };

  const { grouping } = props;
  if (grouping === 'PI' || grouping === 'Employee' || grouping === 'None'){
      initialState.hiddenColumns = ['code']; // hide code for certain groupings
  }

  const {
    state,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable<Expense>({ columns, data, initialState }, useFilters, useGlobalFilter);

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

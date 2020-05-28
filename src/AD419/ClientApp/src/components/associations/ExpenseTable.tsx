import React from 'react';
import { Expense } from '../../models';
import { useTable, Column, CellProps } from 'react-table';
import NumberDisplay from '../NumberDisplay';

interface Props {
  expenses: Expense[];
  selectedExpenses: Expense[];
  setSelectedExpenses: (expenses: Expense[]) => void;
}

export default function ExpenseTable(props: Props): JSX.Element {
  // TODO: is this the right way to use a memo of non-static data?
  const data = React.useMemo(() => props.expenses, [props.expenses]);

  const isSelected = (expense: Expense): boolean => {
    return props.selectedExpenses.some(
      (e) => e.chart === expense.chart && e.code === expense.code
    );
  };

  const expenseSelected = (
    expense: Expense,
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { checked } = event.target;

    if (checked) {
      props.setSelectedExpenses([...props.selectedExpenses, expense]);
    } else {
      props.setSelectedExpenses([
        ...props.selectedExpenses.filter(
          (exp) => !(exp.chart === expense.chart && exp.code === expense.code)
        ),
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
      Header: 'Code',
      accessor: 'code',
    },
    {
      Header: 'Desc',
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

  // TODO: do we need to have any deps?
  // columns will never change but we still need the memo or we'll get a memory leak
  //   eslint-disable-next-line react-hooks/exhaustive-deps
  const columns: Column<Expense>[] = React.useMemo(() => cols, [
    props.selectedExpenses,
    props.expenses,
  ]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<Expense>({ columns, data });

  return (
    <table {...getTableProps()}>
      <thead>
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

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn, type DataTablePagination } from '../data-table';

interface TestRow {
  id: string;
  name: string;
  status: string;
  amount: number;
}

const columns: DataTableColumn<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
  { key: 'amount', header: 'Amount', cell: (row) => `$${row.amount}` },
];

const sampleData: TestRow[] = [
  { id: '1', name: 'Alice', status: 'Active', amount: 100 },
  { id: '2', name: 'Bob', status: 'Inactive', amount: 200 },
  { id: '3', name: 'Charlie', status: 'Active', amount: 150 },
];

const rowKey = (row: TestRow) => row.id;

describe('DataTable', () => {
  it('renders column headers', () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        isLoading={false}
        rowKey={rowKey}
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        isLoading={false}
        rowKey={rowKey}
      />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('renders custom cell content via cell renderer', () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        isLoading={false}
        rowKey={rowKey}
      />,
    );

    // The Amount column uses a custom cell renderer
    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        isLoading={false}
        emptyMessage="No bookings found"
        rowKey={rowKey}
      />,
    );

    expect(screen.getByText('No bookings found')).toBeInTheDocument();
  });

  it('shows default empty message when no custom message provided', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        isLoading={false}
        rowKey={rowKey}
      />,
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        isLoading={true}
        rowKey={rowKey}
      />,
    );

    // Loading state shows headers but with skeleton rows
    expect(screen.getByText('Name')).toBeInTheDocument();

    // Should have skeleton loading elements
    const loadingElements = screen.getAllByRole('status');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('does not render data rows when loading', () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        isLoading={true}
        rowKey={rowKey}
      />,
    );

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('calls onRowClick callback when a row is clicked', async () => {
    const user = userEvent.setup();
    const handleRowClick = vi.fn();

    render(
      <DataTable
        columns={columns}
        data={sampleData}
        isLoading={false}
        rowKey={rowKey}
        onRowClick={handleRowClick}
      />,
    );

    await user.click(screen.getByText('Alice'));
    expect(handleRowClick).toHaveBeenCalledTimes(1);
    expect(handleRowClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('renders rows with cursor-pointer when onRowClick is provided', () => {
    render(
      <DataTable
        columns={columns}
        data={sampleData}
        isLoading={false}
        rowKey={rowKey}
        onRowClick={vi.fn()}
      />,
    );

    // The row containing Alice should have cursor-pointer
    const aliceCell = screen.getByText('Alice');
    const row = aliceCell.closest('tr');
    expect(row!.className).toContain('cursor-pointer');
  });

  describe('pagination', () => {
    const paginationProps: DataTablePagination = {
      page: 1,
      pageSize: 10,
      totalCount: 30,
      totalPages: 3,
      onPageChange: vi.fn(),
    };

    it('renders pagination controls when pagination is provided', () => {
      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={paginationProps}
        />,
      );

      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={{ ...paginationProps, page: 1 }}
        />,
      );

      expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={{ ...paginationProps, page: 3 }}
        />,
      );

      expect(screen.getByLabelText('Next page')).toBeDisabled();
    });

    it('calls onPageChange when next page is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={{ ...paginationProps, onPageChange }}
        />,
      );

      await user.click(screen.getByLabelText('Next page'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when previous page is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={{ ...paginationProps, page: 2, onPageChange }}
        />,
      );

      await user.click(screen.getByLabelText('Previous page'));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('does not render pagination when totalPages is 1', () => {
      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={{ ...paginationProps, totalPages: 1, totalCount: 3 }}
        />,
      );

      expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
    });

    it('displays total count', () => {
      render(
        <DataTable
          columns={columns}
          data={sampleData}
          isLoading={false}
          rowKey={rowKey}
          pagination={paginationProps}
        />,
      );

      expect(screen.getByText(/30 total/)).toBeInTheDocument();
    });
  });
});

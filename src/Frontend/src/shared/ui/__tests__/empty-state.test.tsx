import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No bookings"
        description="You have not created any bookings yet."
      />,
    );

    expect(screen.getByText('No bookings')).toBeInTheDocument();
    expect(
      screen.getByText('You have not created any bookings yet.'),
    ).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No data" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('renders action button when action is provided', () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="No events"
        action={{ label: 'Create Event', onClick: handleAction }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="No events"
        action={{ label: 'Create Event', onClick: handleAction }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Create Event' }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when action is not provided', () => {
    render(<EmptyState title="No data" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        title="No items"
        icon={<span data-testid="custom-icon">Icon</span>}
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('hides icon from assistive technology', () => {
    const { container } = render(
      <EmptyState
        title="No items"
        icon={<span>Icon</span>}
      />,
    );

    const iconWrapper = container.querySelector('[aria-hidden="true"]');
    expect(iconWrapper).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState title="Styled" className="my-custom-class" />,
    );

    const wrapper = container.firstElementChild;
    expect(wrapper!.className).toContain('my-custom-class');
  });

  it('renders complete empty state with all props', () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="No notifications"
        description="You are all caught up!"
        icon={<span data-testid="bell-icon">Bell</span>}
        action={{ label: 'Refresh', onClick: handleAction }}
      />,
    );

    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.getByText('You are all caught up!')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});

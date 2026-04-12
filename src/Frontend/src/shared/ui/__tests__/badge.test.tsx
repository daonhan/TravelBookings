import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default color variant classes', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('bg-gray-100');
    expect(badge!.className).toContain('text-gray-700');
  });

  it('applies success color variant classes', () => {
    const { container } = render(<Badge color="success">Success</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('bg-green-100');
    expect(badge!.className).toContain('text-green-800');
  });

  it('applies warning color variant classes', () => {
    const { container } = render(<Badge color="warning">Warning</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('bg-amber-100');
  });

  it('applies error color variant classes', () => {
    const { container } = render(<Badge color="error">Error</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('bg-red-100');
    expect(badge!.className).toContain('text-red-800');
  });

  it('applies info color variant classes', () => {
    const { container } = render(<Badge color="info">Info</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('bg-blue-100');
    expect(badge!.className).toContain('text-blue-800');
  });

  it('applies purple color variant classes', () => {
    const { container } = render(<Badge color="purple">Purple</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('bg-purple-100');
    expect(badge!.className).toContain('text-purple-800');
  });

  it('renders default sr-only text based on color', () => {
    render(<Badge color="success">Active</Badge>);
    const srElement = screen.getByText('Status: success');
    expect(srElement).toHaveClass('sr-only');
  });

  it('renders custom sr-only text when srText is provided', () => {
    render(<Badge srText="Custom accessibility text">Active</Badge>);
    expect(screen.getByText('Custom accessibility text')).toHaveClass('sr-only');
  });

  it('renders default sr-only text "Status: default" when no color specified', () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText('Status: default')).toHaveClass('sr-only');
  });

  it('applies small size variant', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('text-xs');
  });

  it('applies medium size variant by default', () => {
    const { container } = render(<Badge>Medium</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('text-sm');
  });

  it('merges custom className', () => {
    const { container } = render(<Badge className="ml-2">Custom</Badge>);
    const badge = container.querySelector('span');
    expect(badge!.className).toContain('ml-2');
  });
});

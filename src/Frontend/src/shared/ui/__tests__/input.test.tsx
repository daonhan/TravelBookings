import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders without a label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<Input label="Name" error="Name is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Name" error="Required" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('sets aria-describedby linking to the error element', () => {
    render(<Input label="Email" error="Invalid email" id="email-field" />);
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toContain('email-field-error');

    // Verify the error element has the matching ID
    const errorEl = screen.getByRole('alert');
    expect(errorEl).toHaveAttribute('id', 'email-field-error');
  });

  it('sets aria-describedby linking to helper text when no error', () => {
    render(<Input label="Email" helperText="We will never share your email" id="email-field" />);
    const input = screen.getByLabelText('Email');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toContain('email-field-helper');
  });

  it('does not show helper text when error is present', () => {
    render(<Input label="Email" error="Required" helperText="Helper" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  it('shows helper text when there is no error', () => {
    render(<Input label="Email" helperText="Enter your work email" />);
    expect(screen.getByText('Enter your work email')).toBeInTheDocument();
  });

  it('applies error styling classes when error is present', () => {
    render(<Input label="Name" error="Required" />);
    const input = screen.getByLabelText('Name');
    expect(input.className).toContain('border-red-500');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);

    const input = screen.getByLabelText('Name');
    await user.type(input, 'John');
    expect(input).toHaveValue('John');
  });

  it('uses text type by default', () => {
    render(<Input label="Field" />);
    expect(screen.getByLabelText('Field')).toHaveAttribute('type', 'text');
  });

  it('supports password type', () => {
    render(<Input label="Password" type="password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});

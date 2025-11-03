import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationPanel from '../ValidationPanel';
import { NAP } from '../../types/nap';
import { AuthProvider } from '../AuthProvider';

// Mock the AuthProvider
const mockUser = {
  id: '1',
  email: 'validator@test.com',
  name: 'Test Validator',
  role: 'tecnico_validador' as const,
  googleId: 'google123',
  lastLogin: new Date()
};

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

// Mock useAuth hook
jest.mock('../AuthProvider', () => ({
  ...jest.requireActual('../AuthProvider'),
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false
  })
}));

const mockNaps: NAP[] = [
  {
    id: '1',
    coordinates: { latitude: 10.123456, longitude: -74.123456 },
    status: 'pendiente',
    registeredBy: 'field@test.com',
    registrationDate: new Date('2024-01-15T10:00:00Z'),
    observations: 'Test NAP 1',
    municipality: 'Test Municipality',
    sector: 'Test Sector'
  },
  {
    id: '2',
    coordinates: { latitude: 10.654321, longitude: -74.654321 },
    status: 'validado',
    registeredBy: 'field@test.com',
    registrationDate: new Date('2024-01-14T09:00:00Z'),
    validatedBy: 'validator@test.com',
    validationDate: new Date('2024-01-14T15:00:00Z'),
    validationComments: 'Validated successfully',
    observations: 'Test NAP 2',
    municipality: 'Test Municipality 2',
    sector: 'Test Sector 2'
  }
];

describe('ValidationPanel', () => {
  const mockOnValidate = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders validation panel for authorized users', () => {
    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('Panel de Validación')).toBeInTheDocument();
    expect(screen.getByText('1 pendientes')).toBeInTheDocument();
  });

  it('shows pending NAPs by default', () => {
    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    // Should show the pending NAP
    expect(screen.getByText('NAP-000001')).toBeInTheDocument();
    expect(screen.getByText('Test Municipality')).toBeInTheDocument();
  });

  it('allows filtering NAPs by status', () => {
    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    // Change filter to show all NAPs
    const statusFilter = screen.getByDisplayValue('Pendiente');
    fireEvent.change(statusFilter, { target: { value: 'all' } });

    // Should now show both NAPs
    expect(screen.getByText('NAP-000001')).toBeInTheDocument();
    expect(screen.getByText('NAP-000002')).toBeInTheDocument();
  });

  it('opens validation modal when NAP is clicked', () => {
    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    // Click on the pending NAP
    fireEvent.click(screen.getByText('NAP-000001'));

    // Should open validation modal
    expect(screen.getByText('Validar NAP-000001')).toBeInTheDocument();
    expect(screen.getByText('✓ Validado')).toBeInTheDocument();
    expect(screen.getByText('✗ Rechazado')).toBeInTheDocument();
  });

  it('submits validation with comments', async () => {
    mockOnValidate.mockResolvedValue(undefined);

    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    // Open validation modal
    fireEvent.click(screen.getByText('NAP-000001'));

    // Select "Rechazado" option
    fireEvent.click(screen.getByLabelText('✗ Rechazado'));

    // Add comments
    const commentsTextarea = screen.getByPlaceholderText('Explique las razones del rechazo...');
    fireEvent.change(commentsTextarea, { target: { value: 'Test rejection reason' } });

    // Submit validation
    fireEvent.click(screen.getByText('✗ Rechazar NAP'));

    await waitFor(() => {
      expect(mockOnValidate).toHaveBeenCalledWith('1', {
        status: 'rechazado',
        comments: 'Test rejection reason'
      });
    });
  });

  it('requires comments for rejected NAPs', () => {
    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    // Open validation modal
    fireEvent.click(screen.getByText('NAP-000001'));

    // Select "Rechazado" option
    fireEvent.click(screen.getByLabelText('✗ Rechazado'));

    // Submit button should be disabled without comments
    const submitButton = screen.getByText('✗ Rechazar NAP');
    expect(submitButton).toBeDisabled();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <ValidationPanel
        naps={mockNaps}
        onValidate={mockOnValidate}
        onRefresh={mockOnRefresh}
      />
    );

    fireEvent.click(screen.getByText('🔄 Actualizar'));
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
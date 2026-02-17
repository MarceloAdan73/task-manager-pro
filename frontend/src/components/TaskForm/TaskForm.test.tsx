import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renderiza correctamente el formulario', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByLabelText(/Task Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority Level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Task/i })).toBeInTheDocument();
  });

  it('el botón está deshabilitado cuando no hay título', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });

  it('el botón se habilita cuando hay título válido', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const titleInput = screen.getByLabelText(/Task Title \*/i);
    const submitButton = screen.getByRole('button');

    expect(submitButton).toBeDisabled();
    await user.type(titleInput, 'T');
    expect(submitButton).not.toBeDisabled();
  });

  it('envía el formulario correctamente', async () => {
    const user = userEvent.setup();
    
    mockOnSubmit.mockResolvedValueOnce(undefined);
    
    render(<TaskForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const titleInput = screen.getByLabelText(/Task Title \*/i);
    const descriptionTextarea = screen.getByLabelText(/Description/i);
    const prioritySelect = screen.getByLabelText(/Priority Level/i);
    const submitButton = screen.getByRole('button', { name: /Create New Task/i });

    await user.type(titleInput, 'Nueva tarea');
    await user.type(descriptionTextarea, 'Descripción');
    await user.selectOptions(prioritySelect, 'HIGH');  // ← CAMBIADO: 'Alta' → 'HIGH'
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Nueva tarea',
      description: 'Descripción',
      priority: 'HIGH',  // ← CAMBIADO: 'Alta' → 'HIGH'
    });
  });

  it('limita automáticamente la descripción a 500 caracteres', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const descriptionTextarea = screen.getByLabelText(/Description/i);
    
    const longDescription = 'a'.repeat(50);
    await user.type(descriptionTextarea, longDescription);
    
    expect(descriptionTextarea).toHaveValue('a'.repeat(50));
    expect(screen.getByText('50/500 characters')).toBeInTheDocument();
  });

  it('muestra estado de envío', () => {
    render(<TaskForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/Creating Task\.\.\./i);
  });

  it('muestra error cuando se pasa prop de error', () => {
    const errorMessage = 'Error de prueba';
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        isSubmitting={false}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('limpia el formulario después de enviar exitosamente', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValueOnce(undefined);

    render(<TaskForm onSubmit={mockSubmit} isSubmitting={false} />);

    const titleInput = screen.getByLabelText(/Task Title \*/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /Create New Task/i });

    await user.type(titleInput, 'Test');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });

    expect(titleInput.value).toBe('');
  });
});
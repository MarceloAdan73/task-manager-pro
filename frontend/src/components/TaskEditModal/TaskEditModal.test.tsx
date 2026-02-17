import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskEditModal from './TaskEditModal';

jest.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="fi-x">×</span>,
  FiSave: () => <span data-testid="fi-save">💾</span>,
}));

describe('TaskEditModal', () => {
  const mockTask = {
    id: '1',
    title: 'Original Task',
    description: 'Original Description',
    priority: 'MEDIUM' as const,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    task: mockTask,
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<TaskEditModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
  });

  it('renders correctly when open', () => {
    render(<TaskEditModal {...defaultProps} />);
    
    // Modal title
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    
    // Fields with initial values
    expect(screen.getByDisplayValue('Original Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
    
    // Selected priority
    const select = screen.getByLabelText('Task priority') as HTMLSelectElement;
    expect(select.value).toBe('MEDIUM');
    
    // Verify priority options (by checking their text content)
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    
    // Verify there are no other priority options
    expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    
    // Buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    
    // Close button
    expect(screen.getByTestId('fi-x')).toBeInTheDocument();
    expect(screen.getByTestId('fi-save')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    render(<TaskEditModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    render(<TaskEditModal {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Close');
    await userEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onSave with updated data', async () => {
    render(<TaskEditModal {...defaultProps} />);
    
    // Change title
    const titleInput = screen.getByDisplayValue('Original Task');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Edited Task');
    
    // Change description
    const descriptionTextarea = screen.getByDisplayValue('Original Description');
    await userEvent.clear(descriptionTextarea);
    await userEvent.type(descriptionTextarea, 'New description');
    
    // Change priority to HIGH
    const prioritySelect = screen.getByLabelText('Task priority');
    await userEvent.selectOptions(prioritySelect, 'HIGH');
    
    // Submit form
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    // Verify it was called with correct data
    expect(defaultProps.onSave).toHaveBeenCalledWith({
      id: '1',
      title: 'Edited Task',
      description: 'New description',
      priority: 'HIGH',
    });
  });

  it('does not call onSave if title is empty', async () => {
    render(<TaskEditModal {...defaultProps} />);
    
    // Empty title
    const titleInput = screen.getByDisplayValue('Original Task');
    await userEvent.clear(titleInput);
    
    // Try to save
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    // Should not call onSave
    expect(defaultProps.onSave).not.toHaveBeenCalled();
    
    // Button should be disabled
    expect(saveButton).toBeDisabled();
  });

  it('disables fields and buttons during saving', async () => {
    // Mock that never resolves to simulate loading
    const neverResolvingPromise = new Promise(() => {});
    const onSaveMock = jest.fn().mockReturnValue(neverResolvingPromise);
    
    render(<TaskEditModal {...defaultProps} onSave={onSaveMock} />);
    
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    // Check states during loading
    expect(saveButton).toHaveTextContent('Saving...');
    expect(saveButton).toBeDisabled();
    
    expect(screen.getByDisplayValue('Original Task')).toBeDisabled();
    expect(screen.getByDisplayValue('Original Description')).toBeDisabled();
    expect(screen.getByLabelText('Task priority')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByLabelText('Close')).toBeDisabled();
  });

  it('closes modal after successful save', async () => {
    render(<TaskEditModal {...defaultProps} />);
    
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    // onSave is async, wait for it to complete
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
    
    // onClose should be called after onSave
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles errors during save', async () => {
    const error = new Error('Save error');
    const onSaveMock = jest.fn().mockRejectedValue(error);
    
    // Mock console.error to avoid output in tests
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<TaskEditModal {...defaultProps} onSave={onSaveMock} />);
    
    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);
    
    // Wait for promise to complete
    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalled();
    });
    
    // console.error should have been called
    expect(consoleErrorMock).toHaveBeenCalledWith('Error saving task:', error);
    
    // Restore console.error
    consoleErrorMock.mockRestore();
    
    // Button should be enabled again
    expect(saveButton).toBeEnabled();
    expect(saveButton).toHaveTextContent('Save');
  });

  it('updates fields when task changes', () => {
    const { rerender } = render(
      <TaskEditModal {...defaultProps} task={mockTask} />
    );
    
    expect(screen.getByDisplayValue('Original Task')).toBeInTheDocument();
    
    // New task
    const newTask = {
      ...mockTask,
      id: '2',
      title: 'New Task',
      description: 'New Description',
      priority: 'HIGH' as const,
    };
    
    rerender(
      <TaskEditModal {...defaultProps} task={newTask} />
    );
    
    expect(screen.getByDisplayValue('New Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Description')).toBeInTheDocument();
    
    const select = screen.getByLabelText('Task priority') as HTMLSelectElement;
    expect(select.value).toBe('HIGH');
  });

  it('automatically focuses on title field', () => {
    render(<TaskEditModal {...defaultProps} />);
    
    const titleInput = screen.getByDisplayValue('Original Task');
    expect(titleInput).toHaveFocus();
  });
});
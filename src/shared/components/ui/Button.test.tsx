import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when the user clicks it', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Save</Button>);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // isLoading debe bloquear la interacción igual que disabled, para evitar envíos duplicados.
  it('is disabled and ignores clicks while loading', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(handleClick).not.toHaveBeenCalled();
  });
});

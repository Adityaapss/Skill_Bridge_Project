import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UiProvider, useUi } from './UiContext';

const Probe = ({ onResult }) => {
    const { confirm, toast } = useUi();
    return (
        <>
            <button onClick={async () => onResult(await confirm({ title: 'Delete?', message: 'Really?', confirmText: 'Yes' }))}>ask</button>
            <button onClick={() => toast.success('Saved!')}>toast</button>
        </>
    );
};

describe('UiProvider', () => {
    it('resolves confirm() with the user choice', async () => {
        const onResult = vi.fn();
        render(<UiProvider><Probe onResult={onResult} /></UiProvider>);
        await userEvent.click(screen.getByText('ask'));
        expect(screen.getByText('Really?')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
        expect(onResult).toHaveBeenCalledWith(true);

        await userEvent.click(screen.getByText('ask'));
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onResult).toHaveBeenLastCalledWith(false);
    });

    it('shows toasts', async () => {
        render(<UiProvider><Probe onResult={() => { }} /></UiProvider>);
        await userEvent.click(screen.getByText('toast'));
        expect(await screen.findByText('Saved!')).toBeInTheDocument();
    });
});

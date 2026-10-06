import { errorMessage } from './errors';

describe('errorMessage', () => {
    it('prefers the API message', () => {
        expect(errorMessage({ response: { data: { message: 'Nope' } } })).toBe('Nope');
    });
    it('falls back to the error text, then the default', () => {
        expect(errorMessage({ message: 'Network Error' })).toBe('Network Error');
        expect(errorMessage(undefined, 'Fallback')).toBe('Fallback');
    });
});

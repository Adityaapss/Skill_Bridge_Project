import { renderHook, act } from '@testing-library/react';
import useTablePagination from './useTablePagination';

const rows = Array.from({ length: 25 }, (_, i) => i);

describe('useTablePagination', () => {
    it('slices rows per page', () => {
        const { result } = renderHook(() => useTablePagination(rows, 10));
        expect(result.current.pageRows).toHaveLength(10);
        act(() => result.current.props.onPageChange(null, 2));
        expect(result.current.pageRows).toEqual([20, 21, 22, 23, 24]);
    });

    it('clamps to the last page when the list shrinks', () => {
        const { result, rerender } = renderHook(({ list }) => useTablePagination(list, 10), { initialProps: { list: rows } });
        act(() => result.current.props.onPageChange(null, 2));
        rerender({ list: rows.slice(0, 5) });
        expect(result.current.page).toBe(0);
        expect(result.current.pageRows).toHaveLength(5);
    });

    it('resets to the first page when the page size changes', () => {
        const { result } = renderHook(() => useTablePagination(rows, 10));
        act(() => result.current.props.onPageChange(null, 2));
        act(() => result.current.props.onRowsPerPageChange({ target: { value: '25' } }));
        expect(result.current.page).toBe(0);
        expect(result.current.pageRows).toHaveLength(25);
    });
});

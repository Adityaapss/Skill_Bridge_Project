import { useState, useMemo } from 'react';

/** Client-side pagination: `const { pageRows, props } = useTablePagination(rows)`; spread props on TablePagination. */
export default function useTablePagination(rows, initialRowsPerPage = 10) {
    const [requestedPage, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    // Filtering can shrink the list below the requested page: clamp instead of showing an empty page
    const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
    const page = Math.min(requestedPage, lastPage);

    const pageRows = useMemo(
        () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [rows, page, rowsPerPage],
    );

    return {
        pageRows,
        page,
        props: {
            component: 'div',
            count: rows.length,
            page,
            rowsPerPage,
            rowsPerPageOptions: [5, 10, 25, 50],
            onPageChange: (_, p) => setPage(p),
            onRowsPerPageChange: (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); },
        },
    };
}

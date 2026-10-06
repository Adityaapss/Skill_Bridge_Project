/** Extracts a human-readable message from an axios error. */
export const errorMessage = (err, fallback = 'Something went wrong') =>
    err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;

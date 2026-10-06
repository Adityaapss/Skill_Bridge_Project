package com.skillbridge.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginRateLimitFilterTest {

    @Test
    void blocksAfterLimitAndRecoversAfterWindow() {
        LoginRateLimitFilter filter = new LoginRateLimitFilter();
        long t0 = 1_000_000L;
        for (int i = 0; i < LoginRateLimitFilter.MAX_ATTEMPTS; i++) {
            assertTrue(filter.tryAcquire("1.2.3.4", t0 + i));
        }
        assertFalse(filter.tryAcquire("1.2.3.4", t0 + 100));
        assertTrue(filter.tryAcquire("5.6.7.8", t0 + 100), "other clients are unaffected");
        assertTrue(filter.tryAcquire("1.2.3.4", t0 + LoginRateLimitFilter.WINDOW_MS + 1000));
    }
}

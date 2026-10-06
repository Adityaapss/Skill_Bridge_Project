package com.skillbridge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Basic brute-force protection: at most MAX_ATTEMPTS login requests per client IP per window.
 * In-memory, so it is per-instance; put a gateway/WAF in front for multi-node deployments.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    static final int MAX_ATTEMPTS = 10;
    static final long WINDOW_MS = 60_000;

    @org.springframework.beans.factory.annotation.Value("${app.security.login-max-attempts:10}")
    private int maxAttempts = MAX_ATTEMPTS;

    private final Map<String, Deque<Long>> attempts = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !("POST".equals(request.getMethod()) && request.getRequestURI().endsWith("/auth/login"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!tryAcquire(request.getRemoteAddr(), System.currentTimeMillis())) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many login attempts. Try again in a minute.\"}");
            return;
        }
        chain.doFilter(request, response);
    }

    boolean tryAcquire(String key, long now) {
        Deque<Long> q = attempts.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > WINDOW_MS) {
                q.pollFirst();
            }
            if (q.size() >= maxAttempts) {
                return false;
            }
            q.addLast(now);
            return true;
        }
    }
}

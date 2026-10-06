package com.skillbridge.service;

import java.net.URI;

/** Only http(s) links may be stored: anything else (javascript:, data:) becomes script when rendered as a link. */
final class UrlValidator {

    private UrlValidator() {
    }

    static void requireWebUrl(String url, String fieldName) {
        if (url == null || url.isBlank()) {
            return;
        }
        try {
            String scheme = URI.create(url.trim()).getScheme();
            if (scheme != null && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                return;
            }
        } catch (IllegalArgumentException ignored) {
            // falls through to the error below
        }
        throw new IllegalArgumentException(fieldName + " must be a valid http(s) URL");
    }
}

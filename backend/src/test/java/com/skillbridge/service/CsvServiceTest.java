package com.skillbridge.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CsvServiceTest {

    @Test
    void escapeQuotesCommasAndNeutralisesFormulas() {
        assertEquals("plain", CsvService.escape("plain"));
        assertEquals("\"a,b\"", CsvService.escape("a,b"));
        assertEquals("\"say \"\"hi\"\"\"", CsvService.escape("say \"hi\""));
        assertEquals("'=SUM(A1)", CsvService.escape("=SUM(A1)"));
        assertEquals("", CsvService.escape(null));
    }

    @Test
    void parseHandlesQuotedFieldsAndCrlf() {
        List<List<String>> rows = CsvService.parse("name,note\r\n\"Doe, Jane\",\"a \"\"b\"\"\"\r\nBob,x\n");
        assertEquals(3, rows.size());
        assertEquals(List.of("Doe, Jane", "a \"b\""), rows.get(1));
        assertEquals(List.of("Bob", "x"), rows.get(2));
    }
}

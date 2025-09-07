package com.backend.logMiner.security.customHandlers;

import java.util.Set;

public class ExtensionHandler {

    public static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            // plain‐text logs
            "log", "txt", "out", "stderr", "stdout",
            // structured text
            "json", "ndjson", "csv", "tsv", "xml", "yaml", "yml", "html" , "xhtml" ,
            // common miscellany
            "ini", "conf", "cfg", "properties",
            // others
            "pdf" , "md"
    );

    public static final Set<String> ALLOWED_MIME = Set.of(
            // plain‑text
            "text/plain",
            "text/log",
            "text/x-log",

            // Markdown
            "text/markdown",

            // HTML
            "text/html",
            "application/xhtml+xml",

            // JSON
            "application/json",
            "application/ndjson",
            "application/octet-stream",

            // XML
            "application/xml",
            "text/xml",

            // CSV / TSV
            "text/csv",
            "text/tab-separated-values",

            // YAML
            "application/x-yaml",
            "text/yaml",
            "text/x-yaml",

            // PDF (binary but sometimes needed)
            "application/pdf",

            // compressed archives
            "application/zip",
            "application/gzip",
            "application/x-tar",
            "application/x-7z-compressed",

            // Microsoft spreadsheet formats
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

}

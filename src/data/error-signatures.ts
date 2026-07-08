// error-signatures.ts — Error page patterns for server/framework fingerprinting
// Each signature maps a server or framework to the error response patterns it produces.

export interface ErrorSignature {
  /** Server or framework name */
  server: string;
  /** Patterns to match against the HTTP response */
  patterns: {
    /** Regex strings to match in the response body */
    body?: string[];
    /** Expected HTTP status code */
    status?: number;
    /** Regex patterns to match against response header values (header name -> regex) */
    headers?: Record<string, string>;
  };
  /** URL paths that are likely to trigger this error page */
  triggerPaths: string[];
  /** Confidence score from 0.0 to 1.0 */
  confidence: number;
}

export const ERROR_SIGNATURES: ErrorSignature[] = [
  // ── Apache HTTPD ───────────────────────────────────────────────────────
  {
    server: "Apache",
    patterns: {
      body: [
        "<address>Apache\\/([\\d.]+)\\s*(?:\\(.*?\\))?\\s*Server at",
        "Not Found.*The requested URL was not found on this server",
      ],
      status: 404,
      headers: {
        server: "^Apache\\/[\\d.]+",
      },
    },
    triggerPaths: [
      "/nonexistent-path-abc123",
      "/this-does-not-exist.html",
    ],
    confidence: 0.9,
  },

  // ── Nginx ──────────────────────────────────────────────────────────────
  {
    server: "Nginx",
    patterns: {
      body: [
        "<title>\\d{3}\\s+.*<\\/title>\\s*<\\/head>\\s*<body>\\s*<center><h1>\\d{3}",
        "<hr><center>nginx\\/([\\d.]+)<\\/center>",
        "<center>nginx<\\/center>",
      ],
      status: 404,
      headers: {
        server: "^nginx",
      },
    },
    triggerPaths: [
      "/nonexistent-path-abc123",
      "/this-does-not-exist.html",
    ],
    confidence: 0.9,
  },

  // ── Microsoft IIS ──────────────────────────────────────────────────────
  {
    server: "IIS",
    patterns: {
      body: [
        "Microsoft-IIS\\/([\\d.]+)",
        '<span><H1>Server Error in \'.*?\' Application\\.<\\/H1>',
        "HTTP Error \\d{3}\\.\\d+ - .*",
        "Detailed Error Information:",
      ],
      status: 404,
      headers: {
        server: "^Microsoft-IIS\\/[\\d.]+",
        "x-powered-by": "^ASP\\.NET",
      },
    },
    triggerPaths: [
      "/nonexistent.aspx",
      "/nonexistent.asp",
      "/trace.axd",
    ],
    confidence: 0.85,
  },

  // ── Apache Tomcat ──────────────────────────────────────────────────────
  {
    server: "Tomcat",
    patterns: {
      body: [
        "<title>Apache Tomcat\\/([\\d.]+) - Error report<\\/title>",
        "<h1>HTTP Status \\d{3} &ndash;",
        "java\\.lang\\.\\w+Exception",
        "org\\.apache\\.catalina\\.",
      ],
      status: 404,
      headers: {
        server: "^Apache-Coyote\\/[\\d.]+",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/WEB-INF/",
      "/META-INF/",
    ],
    confidence: 0.9,
  },

  // ── Express.js ─────────────────────────────────────────────────────────
  {
    server: "Express",
    patterns: {
      body: [
        "Cannot GET \\/.*",
        "Cannot POST \\/.*",
        "ReferenceError:.*<br>\\s+at\\s+",
        "<!DOCTYPE html>\\s*<html.*?>\\s*<head>\\s*<title>Error<\\/title>",
      ],
      status: 404,
      headers: {
        "x-powered-by": "^Express$",
      },
    },
    triggerPaths: [
      "/nonexistent-path",
      "/%00",
    ],
    confidence: 0.85,
  },

  // ── Django ─────────────────────────────────────────────────────────────
  {
    server: "Django",
    patterns: {
      body: [
        "Page not found \\(404\\)",
        "You're seeing this error because you have <code>DEBUG = True<\\/code>",
        "Using the URLconf defined in <code>.*?\\.urls<\\/code>",
        "DisallowedHost at \\/",
        "django\\.core\\.exceptions\\.DisallowedHost",
      ],
      status: 404,
      headers: {
        "x-frame-options": "^DENY$",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/admin/nonexistent",
    ],
    confidence: 0.9,
  },

  // ── Laravel (Ignition) ────────────────────────────────────────────────
  {
    server: "Laravel",
    patterns: {
      body: [
        "Whoops!\\s*<\\/h1>",
        "Illuminate\\\\.*?Exception",
        "ignition-ui",
        "laravel_session",
        "Symfony\\\\Component\\\\HttpKernel\\\\Exception\\\\NotFoundHttpException",
      ],
      status: 500,
      headers: {
        "set-cookie": "laravel_session=",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/_ignition/health-check",
      "/_ignition/execute-solution",
    ],
    confidence: 0.85,
  },

  // ── Spring Boot ────────────────────────────────────────────────────────
  {
    server: "Spring Boot",
    patterns: {
      body: [
        "Whitelabel Error Page",
        '"timestamp"\\s*:\\s*".*?"\\s*,\\s*"status"\\s*:\\s*\\d+\\s*,\\s*"error"\\s*:',
        "This application has no explicit mapping for \\/error",
        '"path"\\s*:\\s*"\\/.*?"',
      ],
      status: 404,
      headers: {
        "x-application-context": ".*",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/error",
      "/actuator",
    ],
    confidence: 0.9,
  },

  // ── Flask / Werkzeug ───────────────────────────────────────────────────
  {
    server: "Flask",
    patterns: {
      body: [
        "werkzeug\\.exceptions\\.NotFound",
        "The requested URL was not found on the server",
        "<!DOCTYPE HTML PUBLIC.*?werkzeug",
        "Traceback \\(most recent call last\\)",
        "\\/console.*?__debugger__",
      ],
      status: 404,
      headers: {
        server: "^Werkzeug\\/[\\d.]+",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/console",
    ],
    confidence: 0.85,
  },

  // ── Ruby on Rails ──────────────────────────────────────────────────────
  {
    server: "Rails",
    patterns: {
      body: [
        "ActionController::RoutingError",
        "No route matches \\[GET\\]",
        "Rails\\.root:",
        "<title>Action Controller: Exception caught<\\/title>",
        "_rucksack_session",
      ],
      status: 404,
      headers: {
        "x-request-id": "^[0-9a-f-]{36}$",
        "x-runtime": "^[\\d.]+$",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/rails/info/properties",
    ],
    confidence: 0.85,
  },

  // ── FastAPI ────────────────────────────────────────────────────────────
  {
    server: "FastAPI",
    patterns: {
      body: [
        '\\{"detail"\\s*:\\s*"Not Found"\\}',
        '\\{"detail"\\s*:\\s*\\[\\{.*?"type"\\s*:',
      ],
      status: 404,
      headers: {
        "content-type": "^application\\/json",
      },
    },
    triggerPaths: [
      "/nonexistent",
      "/docs",
      "/openapi.json",
    ],
    confidence: 0.8,
  },

  // ── Gin (Go) ───────────────────────────────────────────────────────────
  {
    server: "Gin",
    patterns: {
      body: [
        "^404 page not found$",
      ],
      status: 404,
      headers: {
        "content-type": "^text\\/plain",
      },
    },
    triggerPaths: [
      "/nonexistent",
    ],
    confidence: 0.7,
  },

  // ── ASP.NET ────────────────────────────────────────────────────────────
  {
    server: "ASP.NET",
    patterns: {
      body: [
        "Server Error in '\\/.*?' Application",
        "Runtime Error",
        "\\[HttpException.*?\\]",
        "Version Information:.*?Microsoft \\.NET Framework Version:",
        "ASP\\.NET is configured to show.*?error messages",
      ],
      status: 500,
      headers: {
        "x-powered-by": "^ASP\\.NET",
        "x-aspnet-version": "^[\\d.]+$",
      },
    },
    triggerPaths: [
      "/nonexistent.aspx",
      "/elmah.axd",
      "/Trace.axd",
    ],
    confidence: 0.9,
  },

  // ── Koa.js ─────────────────────────────────────────────────────────────
  {
    server: "Koa",
    patterns: {
      body: [
        "^Not Found$",
        "InternalServerError:.*at.*",
      ],
      status: 404,
      headers: {
        "x-koa-redis": ".*",
        "content-type": "^text\\/plain",
      },
    },
    triggerPaths: [
      "/nonexistent",
    ],
    confidence: 0.6,
  },

  // ── Fiber (Go) ─────────────────────────────────────────────────────────
  {
    server: "Fiber",
    patterns: {
      body: [
        "Cannot GET \\/.*",
        "Cannot POST \\/.*",
      ],
      status: 404,
      headers: {
        "x-request-id": "^[0-9a-f-]{36}$",
        "content-type": "^text\\/plain",
      },
    },
    triggerPaths: [
      "/nonexistent",
    ],
    confidence: 0.6,
  },
];

/**
 * JavaScript library, framework, and build-tool detection patterns with
 * version extraction and known CVE mappings.
 *
 * Used for client-side technology fingerprinting: identifies libraries from
 * script URLs, global variables, DOM attributes, meta tags, and HTML comments.
 * When a version can be extracted, it is cross-referenced against known CVEs
 * to surface vulnerable dependencies.
 *
 * References:
 *  - https://cve.mitre.org/
 *  - https://www.npmjs.com/advisories
 *  - https://snyk.io/vuln/
 */

/** A client-side technology detection profile. */
export interface TechPattern {
  /** Library / framework / tool name */
  name: string;
  /** Classification */
  category: "library" | "framework" | "build-tool" | "runtime";
  /** Detection heuristics — at least one field must match */
  detection: {
    /** Regex patterns matched against <script src="..."> attribute values */
    script?: string[];
    /** window.* global variable names whose existence indicates the technology */
    global?: string[];
    /** DOM attribute or element patterns (CSS-selector-like or regex) */
    dom?: string[];
    /** <meta> tag patterns (regex matched against the full tag HTML) */
    meta?: string[];
    /** HTML comment patterns (regex) */
    comment?: string[];
  };
  /** Regex to extract a semver-like version string from the page source */
  versionExtract?: string;
  /** Known CVEs keyed by the highest affected version */
  cves?: { version: string; cve: string; description: string }[];
}

export const TECH_PATTERNS: TechPattern[] = [
  // ──────────────────────────────────────────────────
  // Libraries — with known CVEs
  // ──────────────────────────────────────────────────
  {
    name: "jQuery",
    category: "library",
    detection: {
      script: ["jquery[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js", "jquery\\.slim"],
      global: ["jQuery", "jQuery.fn.jquery"],
      comment: ["jQuery v\\d+"],
    },
    versionExtract: "jQuery\\s+v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<3.5.0",
        cve: "CVE-2020-11022",
        description:
          "XSS via .html() when passing untrusted input containing <option> or <style> tags.",
      },
      {
        version: "<3.5.0",
        cve: "CVE-2020-11023",
        description:
          "XSS in jQuery.htmlPrefilter when handling HTML from untrusted sources.",
      },
      {
        version: "<3.0.0",
        cve: "CVE-2019-11358",
        description:
          "Prototype pollution in jQuery.extend(true, ...) with crafted Object.prototype properties.",
      },
      {
        version: "<1.12.0",
        cve: "CVE-2015-9251",
        description:
          "XSS when a cross-domain Ajax request is performed without the dataType option, leading to text/javascript execution.",
      },
    ],
  },
  {
    name: "jQuery UI",
    category: "library",
    detection: {
      script: ["jquery-ui[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["jQuery.ui", "jQuery.ui.version"],
    },
    versionExtract: "jQuery UI[\\s-]+v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<1.13.2",
        cve: "CVE-2022-31160",
        description:
          "XSS in the checkboxradio widget when processing untrusted label content.",
      },
      {
        version: "<1.13.0",
        cve: "CVE-2021-41184",
        description:
          "XSS in the .position() utility when using of option with untrusted input.",
      },
    ],
  },
  {
    name: "Lodash",
    category: "library",
    detection: {
      script: ["lodash[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["_", "_.VERSION"],
    },
    versionExtract: "lodash\\s+v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<4.17.21",
        cve: "CVE-2021-23337",
        description:
          "Command injection in lodash.template via the variable option.",
      },
      {
        version: "<4.17.20",
        cve: "CVE-2020-28500",
        description:
          "ReDoS in lodash.toNumber, lodash.trim, lodash.trimEnd via crafted strings.",
      },
      {
        version: "<4.17.12",
        cve: "CVE-2019-10744",
        description:
          "Prototype pollution in lodash.defaultsDeep and lodash.merge.",
      },
    ],
  },
  {
    name: "AngularJS (1.x)",
    category: "framework",
    detection: {
      script: ["angular[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["angular", "angular.version"],
      dom: ["\\[ng-app\\]", "\\[ng-controller\\]", "\\[ng-model\\]"],
    },
    versionExtract: "AngularJS v(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<1.8.0",
        cve: "CVE-2022-25869",
        description:
          "XSS via the $sanitize service allowing bypass of SVG sanitization rules.",
      },
      {
        version: "<1.6.9",
        cve: "CVE-2019-14863",
        description:
          "Prototype pollution in angular.merge() and angular.extend().",
      },
    ],
  },
  {
    name: "Moment.js",
    category: "library",
    detection: {
      script: ["moment[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["moment", "moment.version"],
    },
    versionExtract: "moment\\.js[\\s-]+v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<=2.29.4",
        cve: "CVE-2022-31129",
        description:
          "ReDoS in moment.js parsing of user-supplied date strings (inefficient regex).",
      },
      {
        version: "<=2.29.2",
        cve: "CVE-2022-24785",
        description:
          "Path traversal in moment.locale() when the locale parameter is user-controlled.",
      },
    ],
  },
  {
    name: "DOMPurify",
    category: "library",
    detection: {
      script: ["purify[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js", "dompurify"],
      global: ["DOMPurify"],
    },
    versionExtract: "DOMPurify\\s+v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<2.3.6",
        cve: "CVE-2023-48634",
        description:
          "Mutation XSS bypass in DOMPurify via nested HTML elements and browser parsing differences.",
      },
      {
        version: "<2.4.4",
        cve: "CVE-2024-45801",
        description:
          "XSS bypass via namespace confusion in SVG/MathML content.",
      },
    ],
  },
  {
    name: "Axios",
    category: "library",
    detection: {
      script: ["axios[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["axios"],
    },
    versionExtract: "axios/v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<1.6.0",
        cve: "CVE-2023-45857",
        description:
          "CSRF token leakage via X-XSRF-TOKEN header sent to cross-origin requests.",
      },
      {
        version: "<0.21.1",
        cve: "CVE-2020-28168",
        description:
          "SSRF via request redirect — axios follows redirects to arbitrary protocols.",
      },
    ],
  },
  {
    name: "Underscore.js",
    category: "library",
    detection: {
      script: ["underscore[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["_", "_.VERSION"],
    },
    versionExtract: "Underscore\\.js\\s+v?(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<1.13.6",
        cve: "CVE-2021-23358",
        description:
          "Arbitrary code execution via the template function when a variable option is crafted.",
      },
    ],
  },
  {
    name: "Backbone.js",
    category: "framework",
    detection: {
      script: ["backbone[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["Backbone", "Backbone.VERSION"],
    },
    versionExtract: "Backbone\\.js\\s+v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Handlebars",
    category: "library",
    detection: {
      script: ["handlebars[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["Handlebars", "Handlebars.VERSION"],
    },
    versionExtract: "Handlebars v(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<4.7.7",
        cve: "CVE-2021-23383",
        description:
          "Prototype pollution leading to RCE via crafted template input.",
      },
      {
        version: "<4.7.6",
        cve: "CVE-2021-23369",
        description:
          "RCE when compiling templates from untrusted sources via lookup helper.",
      },
    ],
  },
  {
    name: "Bootstrap",
    category: "library",
    detection: {
      script: ["bootstrap[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["bootstrap", "$.fn.tooltip.Constructor.VERSION"],
      meta: ["<meta[^>]+name=[\"']generator[\"'][^>]+Bootstrap"],
    },
    versionExtract: "Bootstrap v(\\d+\\.\\d+\\.\\d+)",
    cves: [
      {
        version: "<3.4.1",
        cve: "CVE-2019-8331",
        description:
          "XSS in the tooltip and popover plugins via data-template attribute.",
      },
      {
        version: "<3.4.0",
        cve: "CVE-2018-14042",
        description:
          "XSS in the collapse plugin via data-parent attribute.",
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // Frameworks — DOM / global detection
  // ──────────────────────────────────────────────────
  {
    name: "Next.js",
    category: "framework",
    detection: {
      global: ["__NEXT_DATA__", "next.version"],
      dom: ["#__next"],
      meta: ["<meta[^>]+name=[\"']next-head-count[\"']"],
      script: ["/_next/static/"],
    },
    versionExtract: "Next\\.js\\s+v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Nuxt.js",
    category: "framework",
    detection: {
      global: ["__NUXT__", "$nuxt"],
      dom: ["#__nuxt", "#__layout"],
      script: ["/_nuxt/"],
    },
    versionExtract: "Nuxt\\.js v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Angular (2+)",
    category: "framework",
    detection: {
      global: ["ng"],
      dom: ["\\[ng-version\\]", "\\[_nghost-[a-z0-9-]+\\]", "\\[_ngcontent-[a-z0-9-]+\\]"],
      script: ["runtime\\.[a-f0-9]+\\.js", "polyfills\\.[a-f0-9]+\\.js"],
    },
    versionExtract: "ng-version=[\"'](\\d+\\.\\d+\\.\\d+)[\"']",
  },
  {
    name: "React",
    category: "framework",
    detection: {
      global: [
        "__REACT_DEVTOOLS_GLOBAL_HOOK__",
        "React.version",
      ],
      dom: ["\\[data-reactroot\\]", "#_reactRootContainer"],
    },
    versionExtract: "React v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "React DOM",
    category: "framework",
    detection: {
      global: ["ReactDOM"],
      dom: ["\\[data-reactid\\]"],
    },
    versionExtract: "ReactDOM v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Svelte",
    category: "framework",
    detection: {
      global: ["__svelte_meta"],
      dom: ["\\[class^=\"svelte-\"\\]"],
      comment: ["svelte-"],
    },
    versionExtract: "svelte[/v](\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "SvelteKit",
    category: "framework",
    detection: {
      global: ["__sveltekit"],
      dom: ["#svelte"],
      script: ["/_app/immutable/"],
    },
  },
  {
    name: "Vue.js",
    category: "framework",
    detection: {
      global: ["__vue_app__", "__VUE__", "Vue"],
      dom: ["\\[data-v-[a-f0-9]+\\]", "#app[^\"]*data-v-"],
      script: ["vue[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
    versionExtract: "Vue\\.js v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Ember.js",
    category: "framework",
    detection: {
      global: ["Ember", "Ember.VERSION", "Em"],
      dom: ["\\[id^=\"ember\"\\]", "\\.ember-view"],
      meta: ["<meta[^>]+name=[\"'].*ember.*[\"']"],
    },
    versionExtract: "Ember[\\s.]+v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Preact",
    category: "framework",
    detection: {
      global: ["preact"],
      script: ["preact[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
    versionExtract: "Preact\\s+v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Solid.js",
    category: "framework",
    detection: {
      global: ["_$HY"],
      dom: ["\\[data-hk\\]"],
    },
  },
  {
    name: "Alpine.js",
    category: "framework",
    detection: {
      dom: ["\\[x-data\\]", "\\[x-init\\]", "\\[x-show\\]"],
      script: ["alpine[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
    versionExtract: "Alpine\\.js v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "htmx",
    category: "library",
    detection: {
      dom: ["\\[hx-get\\]", "\\[hx-post\\]", "\\[hx-trigger\\]"],
      script: ["htmx[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["htmx"],
    },
    versionExtract: "htmx\\.org@v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Lit",
    category: "framework",
    detection: {
      global: ["litElementVersions"],
      script: ["lit[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
  },
  {
    name: "Stimulus",
    category: "framework",
    detection: {
      dom: ["\\[data-controller\\]", "\\[data-action\\]", "\\[data-target\\]"],
      script: ["stimulus[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
  },
  {
    name: "Turbo",
    category: "framework",
    detection: {
      dom: ["\\[data-turbo\\]", "turbo-frame", "turbo-stream"],
      global: ["Turbo"],
    },
  },
  {
    name: "Remix",
    category: "framework",
    detection: {
      global: ["__remixContext", "__remixRouteModules"],
      script: ["/build/_shared/"],
    },
  },
  {
    name: "Gatsby",
    category: "framework",
    detection: {
      dom: ["#___gatsby"],
      global: ["___gatsby", "___loader"],
      script: ["/page-data/", "/commons-"],
    },
  },
  {
    name: "Astro",
    category: "framework",
    detection: {
      dom: ["astro-island", "astro-slot"],
      meta: ["<meta[^>]+name=[\"']generator[\"'][^>]+Astro"],
    },
    versionExtract: "Astro v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Qwik",
    category: "framework",
    detection: {
      dom: ["\\[q:container\\]", "\\[on:qvisible\\]"],
      global: ["qwikCity"],
    },
  },

  // ──────────────────────────────────────────────────
  // Additional Libraries
  // ──────────────────────────────────────────────────
  {
    name: "D3.js",
    category: "library",
    detection: {
      script: ["d3[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["d3", "d3.version"],
    },
    versionExtract: "d3 v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Three.js",
    category: "library",
    detection: {
      script: ["three[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["THREE", "THREE.REVISION"],
    },
    versionExtract: "three\\.js r?(\\d+\\.?\\d*\\.?\\d*)",
  },
  {
    name: "Chart.js",
    category: "library",
    detection: {
      script: ["chart[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["Chart"],
    },
    versionExtract: "Chart\\.js v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Socket.IO",
    category: "library",
    detection: {
      script: ["socket\\.io[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["io"],
    },
    versionExtract: "socket\\.io[/-]v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Leaflet",
    category: "library",
    detection: {
      script: ["leaflet[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["L", "L.version"],
      dom: ["\\.leaflet-container"],
    },
    versionExtract: "Leaflet v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "GSAP (GreenSock)",
    category: "library",
    detection: {
      script: ["gsap[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js", "TweenMax", "TweenLite"],
      global: ["gsap", "TweenMax", "TweenLite"],
    },
    versionExtract: "GSAP v?(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Anime.js",
    category: "library",
    detection: {
      script: ["anime[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["anime"],
    },
    versionExtract: "anime v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Swiper",
    category: "library",
    detection: {
      script: ["swiper[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["Swiper"],
      dom: ["\\.swiper-container", "\\.swiper-wrapper"],
    },
  },
  {
    name: "Modernizr",
    category: "library",
    detection: {
      script: ["modernizr[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["Modernizr"],
      dom: ["\\.no-js"],
    },
    versionExtract: "Modernizr v(\\d+\\.\\d+\\.\\d+)",
  },
  {
    name: "Polyfill.io",
    category: "library",
    detection: {
      script: ["polyfill\\.io/v\\d/polyfill"],
    },
    cves: [
      {
        version: "<=2024.06",
        cve: "CVE-2024-38526",
        description:
          "Supply chain attack — cdn.polyfill.io domain acquired by malicious actor, serving injected code to all consumers.",
      },
    ],
  },
  {
    name: "RequireJS",
    category: "library",
    detection: {
      script: ["require[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["requirejs", "require.version"],
    },
    versionExtract: "RequireJS\\s+v?(\\d+\\.\\d+\\.\\d+)",
  },

  // ──────────────────────────────────────────────────
  // Build Tools & Bundlers
  // ──────────────────────────────────────────────────
  {
    name: "Webpack",
    category: "build-tool",
    detection: {
      global: ["webpackJsonp", "__webpack_require__", "webpackChunk"],
      comment: ["Built with webpack"],
    },
  },
  {
    name: "Vite",
    category: "build-tool",
    detection: {
      global: ["__vite_plugin_react_preamble_installed__"],
      script: ["/@vite/client", "\\.vite/deps/"],
      comment: ["vite"],
    },
  },
  {
    name: "Parcel",
    category: "build-tool",
    detection: {
      global: ["parcelRequire"],
      script: ["/parcel/"],
    },
  },
  {
    name: "Rollup",
    category: "build-tool",
    detection: {
      comment: ["rollup"],
      script: ["/rollup/"],
    },
  },
  {
    name: "esbuild",
    category: "build-tool",
    detection: {
      comment: ["esbuild"],
    },
  },
  {
    name: "SystemJS",
    category: "build-tool",
    detection: {
      global: ["System", "System.register"],
      script: ["system[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js", "s\\.min\\.js"],
    },
  },
  {
    name: "RequireJS / AMD",
    category: "build-tool",
    detection: {
      global: ["define.amd"],
    },
  },
  {
    name: "Turbopack",
    category: "build-tool",
    detection: {
      script: ["/_next/static/chunks/webpack"],
      comment: ["turbopack"],
    },
  },

  // ──────────────────────────────────────────────────
  // Runtimes & Polyfills
  // ──────────────────────────────────────────────────
  {
    name: "Zone.js (Angular)",
    category: "runtime",
    detection: {
      global: ["Zone", "Zone.__symbol__"],
      script: ["zone[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
  },
  {
    name: "core-js",
    category: "runtime",
    detection: {
      global: ["__core-js_shared__"],
      script: ["core-js"],
    },
  },
  {
    name: "RxJS",
    category: "library",
    detection: {
      global: ["rxjs"],
      script: ["rxjs[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
    },
  },

  // ──────────────────────────────────────────────────
  // Analytics & Tag Managers
  // ──────────────────────────────────────────────────
  {
    name: "Google Tag Manager",
    category: "library",
    detection: {
      script: ["googletagmanager\\.com/gtm\\.js", "googletagmanager\\.com/gtag/js"],
      global: ["google_tag_manager", "dataLayer"],
    },
  },
  {
    name: "Google Analytics",
    category: "library",
    detection: {
      script: [
        "google-analytics\\.com/analytics\\.js",
        "google-analytics\\.com/ga\\.js",
        "googletagmanager\\.com/gtag/js",
      ],
      global: ["ga", "gtag", "_gaq"],
    },
  },
  {
    name: "Segment",
    category: "library",
    detection: {
      script: ["cdn\\.segment\\.com/analytics\\.js"],
      global: ["analytics"],
    },
  },
  {
    name: "Hotjar",
    category: "library",
    detection: {
      script: ["static\\.hotjar\\.com"],
      global: ["hj", "_hjSettings"],
    },
  },
  {
    name: "Sentry",
    category: "library",
    detection: {
      script: ["browser\\.sentry-cdn\\.com", "sentry[.-]?(\\d+\\.\\d+\\.\\d+)?(\\.min)?\\.js"],
      global: ["Sentry", "__SENTRY__"],
    },
    versionExtract: "Sentry JavaScript SDK v?(\\d+\\.\\d+\\.\\d+)",
  },
];

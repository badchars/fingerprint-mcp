/**
 * Application detection signatures for CMS platforms, e-commerce solutions,
 * and backend frameworks.
 *
 * Each entry defines multiple detection vectors: meta tags, characteristic
 * URL paths, script/global patterns, cookie names, HTTP headers, and body
 * content patterns. Matching any subset of these signals with sufficient
 * confidence identifies the technology.
 *
 * Version detection methods (where available) describe how to extract the
 * exact version from a response — typically via generator meta tags, static
 * file checksums, or error page content.
 *
 * References:
 *  - https://www.wappalyzer.com/
 *  - https://builtwith.com/
 */

/** An application / platform detection signature. */
export interface AppSignature {
  /** Application name */
  name: string;
  /** Functional category */
  category: "cms" | "ecommerce" | "framework";
  /** Detection heuristics — multiple signals increase confidence */
  detection: {
    /** Regex patterns matched against <meta> tags */
    meta?: string[];
    /** Characteristic URL paths that indicate the application */
    paths?: string[];
    /** Script src or inline script content patterns */
    scripts?: string[];
    /** window.* global variable names */
    globals?: string[];
    /** Cookie name patterns (regex) */
    cookies?: string[];
    /** HTTP response header patterns (header name → regex for value) */
    headers?: Record<string, string>;
    /** Response body content patterns (regex) */
    body?: string[];
    /** Error response format pattern */
    errorFormat?: string;
  };
  /** How to extract the exact version */
  versionDetection?: {
    /** Method description (e.g., "meta generator tag", "static file hash") */
    method: string;
    /** Regex with a capture group for the version string */
    pattern: string;
  };
}

export const APP_SIGNATURES: AppSignature[] = [
  // ══════════════════════════════════════════════════
  // CMS Platforms
  // ══════════════════════════════════════════════════

  // ──────────────────────────────────────────────────
  // WordPress
  // ──────────────────────────────────────────────────
  {
    name: "WordPress",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+WordPress\\s+([\\d.]+)',
      ],
      paths: [
        "/wp-content/",
        "/wp-includes/",
        "/wp-admin/",
        "/wp-login.php",
        "/wp-json/",
        "/xmlrpc.php",
        "/wp-cron.php",
      ],
      scripts: [
        "/wp-includes/js/",
        "/wp-content/themes/",
        "/wp-content/plugins/",
        "wp-emoji-release\\.min\\.js",
      ],
      globals: ["wp", "wp.customize", "wpApiSettings", "wp.i18n"],
      cookies: ["wordpress_logged_in_[a-f0-9]+", "wp-settings-\\d+"],
      headers: {
        "x-powered-by": "WordPress",
        link: "<.*>; rel=\"https://api\\.w\\.org/\"",
        "x-pingback": ".*/xmlrpc\\.php$",
      },
      body: [
        'class="wp-',
        "wp-content/uploads/",
        "wp-json",
      ],
    },
    versionDetection: {
      method: "meta generator tag or /feed/ response",
      pattern: "WordPress\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // Drupal
  // ──────────────────────────────────────────────────
  {
    name: "Drupal",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']Generator["\'][^>]+Drupal\\s+([\\d.]+)',
      ],
      paths: [
        "/sites/default/files/",
        "/core/misc/drupal.js",
        "/node/",
        "/user/login",
        "/admin/content",
        "/core/themes/",
        "/modules/",
      ],
      scripts: [
        "drupal\\.js",
        "/core/misc/",
        "Drupal\\.settings",
        "/sites/all/modules/",
      ],
      globals: ["Drupal", "Drupal.settings", "drupalSettings"],
      cookies: ["SESS[a-f0-9]{32}", "Drupal\\.visitor"],
      headers: {
        "x-drupal-cache": "^(HIT|MISS)$",
        "x-drupal-dynamic-cache": "^(HIT|MISS|UNCACHEABLE)$",
        "x-generator": "^Drupal",
      },
      body: [
        'data-drupal-selector',
        "drupal-ajax",
        'class="drupal-',
      ],
    },
    versionDetection: {
      method: "meta generator tag or CHANGELOG.txt",
      pattern: "Drupal\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // Joomla
  // ──────────────────────────────────────────────────
  {
    name: "Joomla",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Joomla',
      ],
      paths: [
        "/administrator/",
        "/components/",
        "/modules/",
        "/templates/",
        "/media/system/js/",
        "/plugins/",
        "/configuration.php",
      ],
      scripts: [
        "/media/system/js/core\\.js",
        "/media/jui/js/",
        "Joomla\\.optionsStorage",
      ],
      globals: ["Joomla", "Joomla.optionsStorage"],
      cookies: ["[a-f0-9]{32}"],
      headers: {},
      body: [
        "com_content",
        "/media/system/css/",
      ],
    },
    versionDetection: {
      method: "meta generator tag or /administrator/manifests/files/joomla.xml",
      pattern: "Joomla![\\s!]*(\\d+\\.\\d+\\.?\\d*)",
    },
  },

  // ──────────────────────────────────────────────────
  // Ghost CMS
  // ──────────────────────────────────────────────────
  {
    name: "Ghost",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Ghost\\s+([\\d.]+)',
      ],
      paths: [
        "/ghost/api/",
        "/ghost/",
        "/content/images/",
        "/assets/built/",
      ],
      scripts: [
        "/assets/built/casper\\.js",
        "/public/ghost-sdk\\.min\\.js",
      ],
      globals: ["ghost"],
      headers: {
        "x-ghost-cache-status": ".",
      },
      body: [
        "ghost-post",
        "ghost-page",
        'class="gh-',
      ],
    },
    versionDetection: {
      method: "meta generator tag",
      pattern: "Ghost\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // TYPO3
  // ──────────────────────────────────────────────────
  {
    name: "TYPO3",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+TYPO3',
      ],
      paths: [
        "/typo3/",
        "/typo3conf/",
        "/typo3temp/",
        "/fileadmin/",
        "/uploads/",
      ],
      scripts: [
        "/typo3conf/ext/",
        "/typo3/sysext/",
      ],
      globals: ["TYPO3"],
      headers: {},
      body: [
        "typo3temp",
        "tx_[a-z]+",
      ],
    },
    versionDetection: {
      method: "meta generator tag or /typo3/index.php",
      pattern: "TYPO3 CMS[\\sv]*(\\d+\\.\\d+\\.?\\d*)",
    },
  },

  // ──────────────────────────────────────────────────
  // Hugo
  // ──────────────────────────────────────────────────
  {
    name: "Hugo",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Hugo\\s+([\\d.]+)',
      ],
      paths: [],
      body: [
        "Powered by.*Hugo",
      ],
    },
    versionDetection: {
      method: "meta generator tag",
      pattern: "Hugo\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // Gatsby
  // ──────────────────────────────────────────────────
  {
    name: "Gatsby",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Gatsby',
      ],
      paths: [
        "/page-data/",
        "/static/",
      ],
      scripts: [
        "/commons-[a-f0-9]+\\.js",
        "/app-[a-f0-9]+\\.js",
        "/framework-[a-f0-9]+\\.js",
      ],
      globals: ["___gatsby", "___loader"],
      body: [
        "gatsby-image",
        "gatsby-resp-image",
        "id=\"___gatsby\"",
      ],
    },
    versionDetection: {
      method: "meta generator tag",
      pattern: "Gatsby\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // Contentful (headless CMS)
  // ──────────────────────────────────────────────────
  {
    name: "Contentful",
    category: "cms",
    detection: {
      scripts: [
        "contentful\\.com",
        "cdn\\.contentful\\.com",
      ],
      body: [
        "contentful",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Strapi
  // ──────────────────────────────────────────────────
  {
    name: "Strapi",
    category: "cms",
    detection: {
      paths: [
        "/admin/",
        "/api/",
        "/uploads/",
      ],
      headers: {
        "x-powered-by": "^Strapi",
      },
    },
  },

  // ──────────────────────────────────────────────────
  // Sanity
  // ──────────────────────────────────────────────────
  {
    name: "Sanity",
    category: "cms",
    detection: {
      scripts: [
        "cdn\\.sanity\\.io",
        "sanity-client",
      ],
      body: [
        "sanity\\.io",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Webflow
  // ──────────────────────────────────────────────────
  {
    name: "Webflow",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Webflow',
      ],
      scripts: [
        "assets\\.website-files\\.com",
        "webflow\\.js",
      ],
      globals: ["Webflow"],
      body: [
        "data-wf-domain",
        "data-wf-page",
        "data-wf-site",
        "w-nav",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Squarespace
  // ──────────────────────────────────────────────────
  {
    name: "Squarespace",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Squarespace',
      ],
      scripts: [
        "static\\d?\\.squarespace\\.com",
        "squarespace\\.com/universal/scripts-compressed",
      ],
      globals: ["Static", "SQUARESPACE_ROLLUPS"],
      body: [
        "squarespace-headers",
        "sqs-block",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Wix
  // ──────────────────────────────────────────────────
  {
    name: "Wix",
    category: "cms",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+Wix\\.com',
      ],
      scripts: [
        "static\\.parastorage\\.com",
        "static\\.wixstatic\\.com",
      ],
      headers: {
        "x-wix-request-id": ".",
      },
      body: [
        "wixsite\\.com",
        "_wix_browser_sess",
      ],
    },
  },

  // ══════════════════════════════════════════════════
  // E-commerce Platforms
  // ══════════════════════════════════════════════════

  // ──────────────────────────────────────────────────
  // Shopify
  // ──────────────────────────────────────────────────
  {
    name: "Shopify",
    category: "ecommerce",
    detection: {
      paths: [
        "/collections/",
        "/products/",
        "/cart",
        "/checkouts/",
        "/admin/",
      ],
      scripts: [
        "cdn\\.shopify\\.com",
        "sdks\\.shopifycdn\\.com",
        "Shopify\\.theme",
        "Shopify\\.shop",
      ],
      globals: ["Shopify", "ShopifyAnalytics", "Shopify.theme"],
      cookies: ["_shopify_s", "_shopify_y", "cart_sig"],
      headers: {
        "x-shopify-stage": ".",
        "x-shopid": "^\\d+$",
        "x-sorting-hat-podid": ".",
        "x-shardid": ".",
      },
      body: [
        "cdn\\.shopify\\.com/s/files/",
        "shopify-section",
        "Shopify\\.cdnHost",
      ],
    },
    versionDetection: {
      method: "Shopify.theme.schema_version global",
      pattern: "Shopify\\.theme.*?schema_version.*?[\"'](\\d+\\.\\d+)[\"']",
    },
  },

  // ──────────────────────────────────────────────────
  // WooCommerce (WordPress plugin)
  // ──────────────────────────────────────────────────
  {
    name: "WooCommerce",
    category: "ecommerce",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+WooCommerce\\s+([\\d.]+)',
      ],
      paths: [
        "/wp-content/plugins/woocommerce/",
        "/wc-api/",
        "/shop/",
        "/product-category/",
        "/?wc-ajax=",
      ],
      scripts: [
        "woocommerce",
        "wc_add_to_cart_params",
        "wc_cart_fragments_params",
        "wc-blocks",
      ],
      globals: ["wc_add_to_cart_params", "wc_cart_fragments_params", "wc"],
      cookies: [
        "woocommerce_cart_hash",
        "woocommerce_items_in_cart",
        "wp_woocommerce_session_[a-f0-9]+",
      ],
      body: [
        "woocommerce",
        "wc-block-grid",
      ],
    },
    versionDetection: {
      method: "meta generator tag",
      pattern: "WooCommerce\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // Magento / Adobe Commerce
  // ──────────────────────────────────────────────────
  {
    name: "Magento",
    category: "ecommerce",
    detection: {
      paths: [
        "/checkout/cart/",
        "/customer/account/login/",
        "/catalog/product/",
        "/catalogsearch/result/",
        "/static/version",
        "/pub/static/",
      ],
      scripts: [
        "mage/requirejs/",
        "requirejs/require\\.js",
        "mage/cookies",
        "Magento_Ui",
      ],
      globals: ["Mage", "require.config"],
      cookies: [
        "PHPSESSID",
        "form_key",
        "mage-cache-sessid",
        "mage-cache-storage",
        "mage-messages",
      ],
      headers: {
        "x-magento-vary": ".",
        "x-magento-cache-control": ".",
      },
      body: [
        "Mage\\.Cookies",
        "data-mage-init",
        "mage/url",
      ],
    },
    versionDetection: {
      method: "version indicator in /magento_version or /pub/static/deployed_version.txt",
      pattern: "Magento/([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // BigCommerce
  // ──────────────────────────────────────────────────
  {
    name: "BigCommerce",
    category: "ecommerce",
    detection: {
      paths: [
        "/product/",
        "/cart.php",
        "/account.php",
      ],
      scripts: [
        "cdn\\d+\\.bigcommerce\\.com",
        "bigcommerce\\.com/s-[a-z0-9]+/",
      ],
      globals: ["BCData", "stencilBootstrap"],
      cookies: [
        "SHOP_SESSION_TOKEN",
        "STORE_VISITOR",
        "fornax_anonymousId",
      ],
      headers: {
        "x-bc-store-version": ".",
      },
      body: [
        "bigcommerce\\.com",
        "data-content-region",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // PrestaShop
  // ──────────────────────────────────────────────────
  {
    name: "PrestaShop",
    category: "ecommerce",
    detection: {
      meta: [
        '<meta[^>]+name=["\']generator["\'][^>]+PrestaShop',
      ],
      paths: [
        "/modules/",
        "/themes/",
        "/index.php?controller=",
        "/en/cart",
      ],
      scripts: [
        "prestashop",
        "/js/jquery/plugins/",
      ],
      globals: ["prestashop"],
      cookies: ["PrestaShop-[a-f0-9]+"],
      body: [
        "prestashop",
        "id_product",
      ],
    },
    versionDetection: {
      method: "meta generator tag",
      pattern: "PrestaShop\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // OpenCart
  // ──────────────────────────────────────────────────
  {
    name: "OpenCart",
    category: "ecommerce",
    detection: {
      paths: [
        "/index.php?route=common/home",
        "/index.php?route=checkout/cart",
        "/index.php?route=account/login",
        "/catalog/view/theme/",
      ],
      scripts: [
        "catalog/view/javascript/",
      ],
      cookies: [
        "OCSESSID",
        "currency",
        "language",
      ],
      body: [
        "route=product/product",
        "route=common/home",
      ],
    },
    versionDetection: {
      method: "admin footer or /admin/ login page source",
      pattern: "OpenCart\\s+([\\d.]+)",
    },
  },

  // ──────────────────────────────────────────────────
  // Medusa.js
  // ──────────────────────────────────────────────────
  {
    name: "Medusa",
    category: "ecommerce",
    detection: {
      paths: [
        "/store/products",
        "/store/carts",
        "/admin/products",
      ],
      headers: {
        "x-medusa-version": ".",
      },
    },
  },

  // ──────────────────────────────────────────────────
  // Saleor
  // ──────────────────────────────────────────────────
  {
    name: "Saleor",
    category: "ecommerce",
    detection: {
      paths: [
        "/graphql/",
        "/dashboard/",
      ],
      body: [
        "saleor",
      ],
    },
  },

  // ══════════════════════════════════════════════════
  // Backend Frameworks
  // ══════════════════════════════════════════════════

  // ──────────────────────────────────────────────────
  // Spring Boot (Java)
  // ──────────────────────────────────────────────────
  {
    name: "Spring Boot",
    category: "framework",
    detection: {
      paths: [
        "/actuator",
        "/actuator/health",
        "/actuator/info",
        "/actuator/env",
        "/error",
        "/swagger-ui.html",
        "/v3/api-docs",
      ],
      headers: {
        "x-application-context": ".",
      },
      cookies: ["JSESSIONID"],
      errorFormat:
        '\\{"timestamp":"[^"]+","status":\\d+,"error":"[^"]+","path":"[^"]+"\\}',
      body: [
        "Whitelabel Error Page",
        "There was an unexpected error",
        '"timestamp":.*"status":.*"error":',
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Django (Python)
  // ──────────────────────────────────────────────────
  {
    name: "Django",
    category: "framework",
    detection: {
      paths: [
        "/admin/",
        "/admin/login/",
        "/static/admin/",
      ],
      headers: {
        "x-frame-options": "^DENY$",
      },
      cookies: ["csrftoken", "sessionid", "django_language"],
      errorFormat: "You're seeing this error because you have.*DEBUG\\s*=\\s*True",
      body: [
        "csrfmiddlewaretoken",
        "__admin_media_prefix__",
        "djdt",
        "django\\.contrib",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // FastAPI (Python)
  // ──────────────────────────────────────────────────
  {
    name: "FastAPI",
    category: "framework",
    detection: {
      paths: [
        "/docs",
        "/redoc",
        "/openapi.json",
      ],
      headers: {},
      errorFormat: '\\{"detail":\\[?\\{"loc":\\[.*\\],"msg":".*","type":".*"\\}',
      body: [
        "FastAPI",
        "Swagger UI",
        '"openapi":"3\\.',
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Flask (Python)
  // ──────────────────────────────────────────────────
  {
    name: "Flask",
    category: "framework",
    detection: {
      paths: [],
      headers: {
        server: "^Werkzeug",
      },
      cookies: ["session"],
      errorFormat: "Traceback \\(most recent call last\\)",
      body: [
        "Werkzeug Debugger",
        "werkzeug\\.debug",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Laravel (PHP)
  // ──────────────────────────────────────────────────
  {
    name: "Laravel",
    category: "framework",
    detection: {
      paths: [
        "/login",
        "/register",
        "/password/reset",
        "/api/",
        "/storage/",
        "/public/",
      ],
      headers: {
        "set-cookie": "laravel_session=",
        "x-powered-by": "^Laravel$",
      },
      cookies: [
        "laravel_session",
        "XSRF-TOKEN",
        "laravel_token",
      ],
      errorFormat: "Whoops, looks like something went wrong",
      body: [
        "_token",
        "laravel",
        "Illuminate\\\\",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Ruby on Rails
  // ──────────────────────────────────────────────────
  {
    name: "Ruby on Rails",
    category: "framework",
    detection: {
      paths: [
        "/rails/info",
        "/rails/mailers",
      ],
      headers: {
        "x-powered-by": "^Phusion Passenger",
        "x-runtime": "^[\\d.]+$",
        "x-request-id": "^[0-9a-f-]{36}$",
      },
      cookies: ["_[a-z]+_session"],
      errorFormat: "ActionController::RoutingError",
      body: [
        "data-turbolinks",
        "csrf-token",
        'name="csrf-param"',
        "Rails\\.ajax",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Express.js (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "Express.js",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^Express$",
      },
      errorFormat: "Cannot (GET|POST|PUT|DELETE|PATCH) /",
      body: [],
    },
  },

  // ──────────────────────────────────────────────────
  // Koa.js (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "Koa.js",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^koa$",
      },
      errorFormat: "Not Found",
    },
  },

  // ──────────────────────────────────────────────────
  // Hono (edge runtime)
  // ──────────────────────────────────────────────────
  {
    name: "Hono",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^Hono$",
      },
      errorFormat: '\\{"message":"Not Found"\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // NestJS (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "NestJS",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^Express$",
      },
      errorFormat: '\\{"statusCode":\\d+,"message":".*","error":".*"\\}',
      body: [],
    },
  },

  // ──────────────────────────────────────────────────
  // Gin (Go)
  // ──────────────────────────────────────────────────
  {
    name: "Gin",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^go-gin$",
      },
      errorFormat: "404 page not found",
    },
  },

  // ──────────────────────────────────────────────────
  // Fiber (Go)
  // ──────────────────────────────────────────────────
  {
    name: "Fiber",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^Fiber$",
      },
      errorFormat: "Cannot (GET|POST|PUT|DELETE|PATCH) /",
    },
  },

  // ──────────────────────────────────────────────────
  // Echo (Go)
  // ──────────────────────────────────────────────────
  {
    name: "Echo",
    category: "framework",
    detection: {
      headers: {},
      errorFormat: '\\{"message":"Not Found"\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // Chi (Go)
  // ──────────────────────────────────────────────────
  {
    name: "Chi",
    category: "framework",
    detection: {
      errorFormat: "404 page not found",
    },
  },

  // ──────────────────────────────────────────────────
  // ASP.NET / ASP.NET Core
  // ──────────────────────────────────────────────────
  {
    name: "ASP.NET",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^ASP\\.NET$",
        "x-aspnet-version": "^\\d+\\.\\d+",
        "x-aspnetmvc-version": "^\\d+\\.\\d+",
      },
      cookies: [
        "ASP\\.NET_SessionId",
        "\\.AspNetCore\\.Session",
        "\\.AspNetCore\\.Antiforgery\\.",
        "__RequestVerificationToken",
      ],
      body: [
        "__VIEWSTATE",
        "__EVENTVALIDATION",
        "aspnetForm",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Symfony (PHP)
  // ──────────────────────────────────────────────────
  {
    name: "Symfony",
    category: "framework",
    detection: {
      paths: [
        "/_profiler/",
        "/_wdt/",
        "/bundles/",
      ],
      headers: {
        "x-debug-token": ".",
        "x-debug-token-link": "/_profiler/",
      },
      cookies: ["PHPSESSID"],
      errorFormat: "Oops! An Error Occurred.*The server returned a",
      body: [
        "sf-toolbar",
        "sf-dump",
        "symfony",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // CodeIgniter (PHP)
  // ──────────────────────────────────────────────────
  {
    name: "CodeIgniter",
    category: "framework",
    detection: {
      cookies: ["ci_session", "csrf_cookie_name"],
      errorFormat: "A PHP Error was encountered",
      body: [
        "codeigniter",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // CakePHP
  // ──────────────────────────────────────────────────
  {
    name: "CakePHP",
    category: "framework",
    detection: {
      cookies: ["CAKEPHP"],
      errorFormat: "Missing Controller.*CakePHP",
      body: [
        "cakephp",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Phoenix (Elixir)
  // ──────────────────────────────────────────────────
  {
    name: "Phoenix",
    category: "framework",
    detection: {
      headers: {
        server: "^Cowboy$",
        "x-request-id": "^[A-Za-z0-9_-]+$",
      },
      cookies: ["_[a-z_]+_key"],
      body: [
        "phx-",
        "phx:page-loading",
        "data-phx-main",
        "Phoenix\\.LiveView",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Rocket (Rust)
  // ──────────────────────────────────────────────────
  {
    name: "Rocket",
    category: "framework",
    detection: {
      headers: {
        server: "^Rocket$",
      },
      errorFormat: "404 Not Found.*The requested resource could not be found",
    },
  },

  // ──────────────────────────────────────────────────
  // Actix Web (Rust)
  // ──────────────────────────────────────────────────
  {
    name: "Actix Web",
    category: "framework",
    detection: {
      errorFormat: "^$",
    },
  },

  // ──────────────────────────────────────────────────
  // Axum (Rust)
  // ──────────────────────────────────────────────────
  {
    name: "Axum",
    category: "framework",
    detection: {
      errorFormat: "^$",
    },
  },

  // ──────────────────────────────────────────────────
  // AdonisJS (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "AdonisJS",
    category: "framework",
    detection: {
      cookies: ["adonis-session", "adonis-session-values"],
      headers: {
        "x-powered-by": "^AdonisJS$",
      },
      errorFormat: '\\{"message":".*"\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // Fastify (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "Fastify",
    category: "framework",
    detection: {
      headers: {},
      errorFormat: '\\{"message":"Route.*not found","error":"Not Found","statusCode":404\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // Elysia (Bun)
  // ──────────────────────────────────────────────────
  {
    name: "Elysia",
    category: "framework",
    detection: {
      headers: {},
      errorFormat: "NOT_FOUND",
    },
  },

  // ──────────────────────────────────────────────────
  // Vapor (Swift)
  // ──────────────────────────────────────────────────
  {
    name: "Vapor",
    category: "framework",
    detection: {
      headers: {
        server: "^vapor$",
      },
      errorFormat: '\\{"error":true,"reason":"Not Found"\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // Play Framework (Scala/Java)
  // ──────────────────────────────────────────────────
  {
    name: "Play Framework",
    category: "framework",
    detection: {
      cookies: ["PLAY_SESSION"],
      headers: {},
      errorFormat: "Action Not Found.*For request",
      body: [
        "play-",
      ],
    },
  },

  // ──────────────────────────────────────────────────
  // Ktor (Kotlin)
  // ──────────────────────────────────────────────────
  {
    name: "Ktor",
    category: "framework",
    detection: {
      headers: {
        server: "^ktor",
      },
    },
  },

  // ──────────────────────────────────────────────────
  // Micronaut (Java/Kotlin/Groovy)
  // ──────────────────────────────────────────────────
  {
    name: "Micronaut",
    category: "framework",
    detection: {
      errorFormat: '\\{"message":"Page Not Found","_links":\\{"self":\\{"href":".*"\\}\\}\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // Quarkus (Java)
  // ──────────────────────────────────────────────────
  {
    name: "Quarkus",
    category: "framework",
    detection: {
      paths: [
        "/q/health",
        "/q/metrics",
        "/q/dev/",
      ],
      errorFormat: "RESTEASY.*could not find resource",
    },
  },

  // ──────────────────────────────────────────────────
  // Hapi.js (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "Hapi.js",
    category: "framework",
    detection: {
      errorFormat: '\\{"statusCode":404,"error":"Not Found","message":"Not Found"\\}',
    },
  },

  // ──────────────────────────────────────────────────
  // Sails.js (Node.js)
  // ──────────────────────────────────────────────────
  {
    name: "Sails.js",
    category: "framework",
    detection: {
      headers: {
        "x-powered-by": "^Sails$",
      },
      cookies: ["sails.sid"],
    },
  },
];

/**
 * Cloud provider identification patterns.
 *
 * Maps ASN numbers, reverse-DNS naming conventions, HTTP response headers,
 * and error page content to specific cloud providers and their services.
 * Used for infrastructure attribution — determining which cloud platform
 * hosts a given IP or service without relying on IP range databases.
 *
 * References:
 *  - https://bgp.he.net/
 *  - https://docs.aws.amazon.com/general/latest/gr/aws-ip-ranges.html
 *  - https://www.microsoft.com/en-us/download/details.aspx?id=56519
 *  - https://cloud.google.com/compute/docs/faq#find_ip_range
 */

/** A cloud provider identification profile. */
export interface CloudPattern {
  /** Cloud provider name */
  provider: string;
  /** Autonomous System Numbers associated with this provider */
  asn: string[];
  /** Regex patterns for reverse DNS (PTR record) hostnames */
  rdnsPatterns: string[];
  /** HTTP header patterns (header name in lowercase → regex for value) */
  headerPatterns: Record<string, string>;
  /** Error page body content patterns (regex) unique to this provider */
  errorPatterns?: string[];
  /** Sub-service identifiers within the provider */
  serviceIdentifiers?: { service: string; pattern: string }[];
}

export const CLOUD_PATTERNS: CloudPattern[] = [
  // ──────────────────────────────────────────────────
  // Amazon Web Services
  // ──────────────────────────────────────────────────
  {
    provider: "Amazon Web Services (AWS)",
    asn: ["AS16509", "AS14618", "AS8987"],
    rdnsPatterns: [
      "\\.compute\\.amazonaws\\.com$",
      "\\.compute\\.internal$",
      "\\.elb\\.amazonaws\\.com$",
      "\\.cloudfront\\.net$",
      "\\.elasticbeanstalk\\.com$",
      "\\.s3\\.amazonaws\\.com$",
      "\\.s3-website[-.].+\\.amazonaws\\.com$",
      "\\.execute-api\\..+\\.amazonaws\\.com$",
    ],
    headerPatterns: {
      "x-amz-cf-id": ".",
      "x-amz-cf-pop": "^[A-Z]{3}\\d+-[CP]\\d+$",
      "x-amz-request-id": "^[A-Z0-9]{16}$",
      "x-amzn-requestid": "^[0-9a-f-]{36}$",
      "x-amzn-trace-id": "^Root=",
      "x-amz-apigw-id": ".",
      "x-amz-id-2": ".",
    },
    errorPatterns: [
      "<Code>NoSuchBucket</Code>",
      "<Code>AccessDenied</Code>",
      "The specified bucket does not exist",
      "<!DOCTYPE html PUBLIC.*AmazonS3",
      "502 Bad Gateway.*cloudfront",
    ],
    serviceIdentifiers: [
      { service: "CloudFront", pattern: "x-amz-cf-id" },
      { service: "S3", pattern: "\\.s3[.-].*\\.amazonaws\\.com" },
      { service: "ALB/ELB", pattern: "\\.elb\\.amazonaws\\.com" },
      { service: "API Gateway", pattern: "\\.execute-api\\." },
      { service: "Lambda@Edge", pattern: "x-amz-cf-pop" },
      { service: "EC2", pattern: "ec2.*\\.compute\\.amazonaws\\.com" },
      { service: "Elastic Beanstalk", pattern: "\\.elasticbeanstalk\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Microsoft Azure
  // ──────────────────────────────────────────────────
  {
    provider: "Microsoft Azure",
    asn: ["AS8075", "AS8068", "AS12076"],
    rdnsPatterns: [
      "\\.cloudapp\\.azure\\.com$",
      "\\.azurewebsites\\.net$",
      "\\.azure-api\\.net$",
      "\\.azurefd\\.net$",
      "\\.azureedge\\.net$",
      "\\.blob\\.core\\.windows\\.net$",
      "\\.database\\.windows\\.net$",
      "\\.trafficmanager\\.net$",
      "\\.azurecontainer\\.io$",
    ],
    headerPatterns: {
      "x-ms-request-id": "^[0-9a-f-]{36}$",
      "x-azure-ref": ".",
      "x-ms-version": "^\\d{4}-\\d{2}-\\d{2}$",
      "x-aspnet-version": ".",
      "x-powered-by": "^ASP\\.NET$",
      "x-ms-blob-type": ".",
    },
    errorPatterns: [
      "Web App - Pair Not Found",
      "404 Web Site not found",
      "The resource you are looking for has been removed",
      "<Error><Code>BlobNotFound</Code>",
      "The specified resource does not exist",
    ],
    serviceIdentifiers: [
      { service: "App Service", pattern: "\\.azurewebsites\\.net" },
      { service: "Front Door", pattern: "\\.azurefd\\.net" },
      { service: "CDN", pattern: "\\.azureedge\\.net" },
      { service: "Blob Storage", pattern: "\\.blob\\.core\\.windows\\.net" },
      { service: "API Management", pattern: "\\.azure-api\\.net" },
      { service: "Container Instances", pattern: "\\.azurecontainer\\.io" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Google Cloud Platform
  // ──────────────────────────────────────────────────
  {
    provider: "Google Cloud Platform (GCP)",
    asn: ["AS15169", "AS396982"],
    rdnsPatterns: [
      "\\.bc\\.googleusercontent\\.com$",
      "\\.run\\.app$",
      "\\.appspot\\.com$",
      "\\.cloudfunctions\\.net$",
      "\\.web\\.app$",
      "\\.firebaseapp\\.com$",
      "\\.storage\\.googleapis\\.com$",
      "\\.googleusercontent\\.com$",
    ],
    headerPatterns: {
      "x-cloud-trace-context": "^[0-9a-f]{32}/\\d+",
      "x-goog-generation": "^\\d+$",
      "x-goog-hash": ".",
      "x-goog-metageneration": "^\\d+$",
      "x-guploader-uploadid": ".",
      "x-gfe-ssl": ".",
    },
    errorPatterns: [
      "The requested URL was not found on this server.*Google",
      "Error: Page not found.*Google Cloud",
      "Your client does not have access to get URL",
      "<Error><Code>NoSuchKey</Code>",
    ],
    serviceIdentifiers: [
      { service: "Cloud Run", pattern: "\\.run\\.app" },
      { service: "App Engine", pattern: "\\.appspot\\.com" },
      { service: "Cloud Functions", pattern: "\\.cloudfunctions\\.net" },
      { service: "Firebase Hosting", pattern: "\\.web\\.app|\\.firebaseapp\\.com" },
      { service: "Cloud Storage", pattern: "\\.storage\\.googleapis\\.com" },
      { service: "Compute Engine", pattern: "\\.bc\\.googleusercontent\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // DigitalOcean
  // ──────────────────────────────────────────────────
  {
    provider: "DigitalOcean",
    asn: ["AS14061"],
    rdnsPatterns: [
      "\\.digitaloceanspaces\\.com$",
      "\\.ondigitalocean\\.app$",
      "\\.digitalocean\\.com$",
    ],
    headerPatterns: {
      "x-do-app-origin": ".",
      "x-do-orig-status": "^\\d{3}$",
    },
    errorPatterns: [
      "DigitalOcean App Platform",
      "Droplet not found",
    ],
    serviceIdentifiers: [
      { service: "Spaces (S3-compatible)", pattern: "\\.digitaloceanspaces\\.com" },
      { service: "App Platform", pattern: "\\.ondigitalocean\\.app" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Cloudflare
  // ──────────────────────────────────────────────────
  {
    provider: "Cloudflare",
    asn: ["AS13335", "AS209242"],
    rdnsPatterns: [
      "\\.cdn\\.cloudflare\\.net$",
      "\\.cloudflare-dns\\.com$",
      "\\.pages\\.dev$",
      "\\.workers\\.dev$",
    ],
    headerPatterns: {
      "cf-ray": "^[0-9a-f]+-[A-Z]{3}$",
      "cf-cache-status": "^(HIT|MISS|EXPIRED|STALE|BYPASS|DYNAMIC|REVALIDATED)$",
      server: "^cloudflare$",
      "cf-request-id": ".",
    },
    errorPatterns: [
      "Attention Required! | Cloudflare",
      "Error 1000.*DNS points to prohibited IP",
      "Error 1001.*DNS resolution error",
      "Cloudflare Ray ID:",
    ],
    serviceIdentifiers: [
      { service: "CDN/Proxy", pattern: "cf-ray" },
      { service: "Pages", pattern: "\\.pages\\.dev" },
      { service: "Workers", pattern: "\\.workers\\.dev" },
      { service: "R2 Storage", pattern: "\\.r2\\.dev" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Linode / Akamai Connected Cloud
  // ──────────────────────────────────────────────────
  {
    provider: "Linode (Akamai)",
    asn: ["AS63949", "AS63950"],
    rdnsPatterns: [
      "\\.ip\\.linodeusercontent\\.com$",
      "\\.members\\.linode\\.com$",
      "\\.nodebalancer\\.linode\\.com$",
    ],
    headerPatterns: {},
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Linode Compute", pattern: "\\.ip\\.linodeusercontent\\.com" },
      { service: "NodeBalancer", pattern: "\\.nodebalancer\\.linode\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Akamai CDN
  // ──────────────────────────────────────────────────
  {
    provider: "Akamai CDN",
    asn: ["AS20940", "AS16625"],
    rdnsPatterns: [
      "\\.akamaiedge\\.net$",
      "\\.akamaized\\.net$",
      "\\.edgekey\\.net$",
      "\\.edgesuite\\.net$",
      "\\.akadns\\.net$",
    ],
    headerPatterns: {
      "x-akamai-transformed": ".",
      "x-akamai-request-id": ".",
      server: "^AkamaiGHost$",
      "x-cache": ".*from\\s+a]?[0-9]+\\.deploy\\.akamaitechnologies\\.com",
    },
    errorPatterns: [
      "Reference&#32;&#35;\\d+\\.\\w+",
      "Access Denied.*Akamai",
    ],
    serviceIdentifiers: [
      { service: "Edge CDN", pattern: "\\.akamaiedge\\.net|\\.akamaized\\.net" },
      { service: "Ion/DSA", pattern: "\\.edgekey\\.net" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Fastly CDN
  // ──────────────────────────────────────────────────
  {
    provider: "Fastly",
    asn: ["AS54113"],
    rdnsPatterns: [
      "\\.fastly\\.net$",
      "\\.fastlylb\\.net$",
      "\\.global\\.prod\\.fastly\\.net$",
    ],
    headerPatterns: {
      "x-served-by": "^cache-",
      "x-cache": "^(HIT|MISS)",
      "x-cache-hits": "^\\d+$",
      "x-timer": "^S\\d+\\.\\d+,",
      "fastly-debug-digest": ".",
    },
    errorPatterns: [
      "Fastly error: unknown domain",
      "Fastly error: connection timeout",
    ],
    serviceIdentifiers: [
      { service: "CDN Edge", pattern: "x-served-by.*cache-" },
    ],
  },

  // ──────────────────────────────────────────────────
  // OVHcloud
  // ──────────────────────────────────────────────────
  {
    provider: "OVHcloud",
    asn: ["AS16276"],
    rdnsPatterns: [
      "\\.ovh\\.net$",
      "\\.ovh\\.com$",
      "\\.ovh\\.ca$",
      "\\.kimsufi\\.com$",
      "\\.soyoustart\\.com$",
    ],
    headerPatterns: {
      "x-ovh-id": ".",
      "x-iplb-request-id": ".",
    },
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Public Cloud", pattern: "\\.ovh\\.net" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Hetzner Cloud
  // ──────────────────────────────────────────────────
  {
    provider: "Hetzner",
    asn: ["AS24940", "AS213230"],
    rdnsPatterns: [
      "\\.your-server\\.de$",
      "\\.hetzner\\.com$",
      "\\.host\\.hetzner\\.com$",
      "static\\..+\\.clients\\.your-server\\.de$",
    ],
    headerPatterns: {},
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Dedicated", pattern: "\\.your-server\\.de" },
      { service: "Cloud", pattern: "\\.hetzner\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Vultr
  // ──────────────────────────────────────────────────
  {
    provider: "Vultr",
    asn: ["AS20473", "AS64515"],
    rdnsPatterns: [
      "\\.vultr\\.com$",
      "\\.vultrusercontent\\.com$",
    ],
    headerPatterns: {},
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Compute", pattern: "\\.vultr\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Oracle Cloud Infrastructure
  // ──────────────────────────────────────────────────
  {
    provider: "Oracle Cloud Infrastructure (OCI)",
    asn: ["AS31898", "AS7160"],
    rdnsPatterns: [
      "\\.oraclecloud\\.com$",
      "\\.oraclevcn\\.com$",
      "\\.oci\\.oraclecloud\\.com$",
    ],
    headerPatterns: {
      "opc-request-id": "^[a-zA-Z0-9/+]+$",
    },
    errorPatterns: [
      "Oracle Cloud Infrastructure",
    ],
    serviceIdentifiers: [
      { service: "Compute", pattern: "\\.oraclecloud\\.com" },
      { service: "VCN", pattern: "\\.oraclevcn\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Alibaba Cloud
  // ──────────────────────────────────────────────────
  {
    provider: "Alibaba Cloud",
    asn: ["AS45102", "AS37963"],
    rdnsPatterns: [
      "\\.alicloudccp\\.com$",
      "\\.aliyuncs\\.com$",
      "\\.alicdn\\.com$",
    ],
    headerPatterns: {
      "x-oss-request-id": ".",
      eagleid: ".",
      server: "^Tengine$",
    },
    errorPatterns: [
      "<Code>NoSuchBucket</Code>.*Chinese",
      "Chinese.*alibaba",
    ],
    serviceIdentifiers: [
      { service: "OSS (Object Storage)", pattern: "\\.aliyuncs\\.com" },
      { service: "CDN", pattern: "\\.alicdn\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Tencent Cloud
  // ──────────────────────────────────────────────────
  {
    provider: "Tencent Cloud",
    asn: ["AS45090", "AS132203"],
    rdnsPatterns: [
      "\\.myqcloud\\.com$",
      "\\.tencentcloudapi\\.com$",
      "\\.tcloudbaseapp\\.com$",
    ],
    headerPatterns: {
      "x-cos-request-id": ".",
    },
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "CVM (Compute)", pattern: "\\.myqcloud\\.com" },
      { service: "COS (Object Storage)", pattern: "x-cos-request-id" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Vercel
  // ──────────────────────────────────────────────────
  {
    provider: "Vercel",
    asn: ["AS209242"],
    rdnsPatterns: [
      "\\.vercel\\.app$",
      "\\.vercel-dns\\.com$",
      "\\.now\\.sh$",
    ],
    headerPatterns: {
      "x-vercel-id": "^[a-z]{3}1::",
      "x-vercel-cache": "^(HIT|MISS|STALE|PRERENDER|REVALIDATED)$",
      server: "^Vercel$",
    },
    errorPatterns: [
      "DEPLOYMENT_NOT_FOUND",
      "The deployment could not be found",
    ],
    serviceIdentifiers: [
      { service: "Edge Network", pattern: "x-vercel-id" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Netlify
  // ──────────────────────────────────────────────────
  {
    provider: "Netlify",
    asn: [],
    rdnsPatterns: [
      "\\.netlify\\.app$",
      "\\.netlify\\.com$",
      "\\.bitballoon\\.com$",
    ],
    headerPatterns: {
      "x-nf-request-id": "^[0-9a-f-]{36}$",
      server: "^Netlify$",
    },
    errorPatterns: [
      "Not Found - Request ID",
    ],
    serviceIdentifiers: [
      { service: "Hosting", pattern: "x-nf-request-id" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────
  {
    provider: "Render",
    asn: [],
    rdnsPatterns: [
      "\\.onrender\\.com$",
    ],
    headerPatterns: {
      "rndr-id": ".",
      server: "^Render$",
    },
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Web Service", pattern: "\\.onrender\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Fly.io
  // ──────────────────────────────────────────────────
  {
    provider: "Fly.io",
    asn: ["AS40509"],
    rdnsPatterns: [
      "\\.fly\\.dev$",
      "\\.flycast\\.dev$",
    ],
    headerPatterns: {
      "fly-request-id": "^[0-9a-zA-Z-]+$",
      server: "^Fly/",
    },
    errorPatterns: [
      "Could not find the app",
    ],
    serviceIdentifiers: [
      { service: "App", pattern: "\\.fly\\.dev" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Heroku (Salesforce)
  // ──────────────────────────────────────────────────
  {
    provider: "Heroku",
    asn: [],
    rdnsPatterns: [
      "\\.herokuapp\\.com$",
      "\\.herokussl\\.com$",
    ],
    headerPatterns: {
      server: "^heroku-router$",
      "x-request-id": "^[0-9a-f-]{36}$",
      via: "heroku",
    },
    errorPatterns: [
      "No such app",
      "Application error.*Heroku",
    ],
    serviceIdentifiers: [
      { service: "Dyno", pattern: "\\.herokuapp\\.com" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Railway
  // ──────────────────────────────────────────────────
  {
    provider: "Railway",
    asn: [],
    rdnsPatterns: [
      "\\.up\\.railway\\.app$",
      "\\.railway\\.app$",
    ],
    headerPatterns: {},
    errorPatterns: [
      "Application failed to respond",
    ],
    serviceIdentifiers: [
      { service: "Deployment", pattern: "\\.railway\\.app" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Scaleway
  // ──────────────────────────────────────────────────
  {
    provider: "Scaleway",
    asn: ["AS12876"],
    rdnsPatterns: [
      "\\.scw\\.cloud$",
      "\\.scaleway\\.com$",
    ],
    headerPatterns: {},
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Instances", pattern: "\\.scw\\.cloud" },
    ],
  },

  // ──────────────────────────────────────────────────
  // UpCloud
  // ──────────────────────────────────────────────────
  {
    provider: "UpCloud",
    asn: ["AS202053"],
    rdnsPatterns: [
      "\\.upcloud\\.host$",
      "\\.upcloudusercontent\\.com$",
    ],
    headerPatterns: {},
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Cloud Server", pattern: "\\.upcloud\\.host" },
    ],
  },

  // ──────────────────────────────────────────────────
  // IBM Cloud
  // ──────────────────────────────────────────────────
  {
    provider: "IBM Cloud",
    asn: ["AS36351", "AS2647"],
    rdnsPatterns: [
      "\\.mybluemix\\.net$",
      "\\.appdomain\\.cloud$",
      "\\.cloud\\.ibm\\.com$",
    ],
    headerPatterns: {
      "x-backside-transport": ".",
    },
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "Cloud Foundry", pattern: "\\.mybluemix\\.net" },
      { service: "Code Engine", pattern: "\\.appdomain\\.cloud" },
    ],
  },

  // ──────────────────────────────────────────────────
  // Huawei Cloud
  // ──────────────────────────────────────────────────
  {
    provider: "Huawei Cloud",
    asn: ["AS136907"],
    rdnsPatterns: [
      "\\.myhuaweicloud\\.com$",
      "\\.huaweicloudobs\\.com$",
    ],
    headerPatterns: {
      "x-obs-request-id": ".",
    },
    errorPatterns: [],
    serviceIdentifiers: [
      { service: "OBS (Object Storage)", pattern: "x-obs-request-id" },
    ],
  },

  // ──────────────────────────────────────────────────
  // GitHub (Microsoft)
  // ──────────────────────────────────────────────────
  {
    provider: "GitHub",
    asn: ["AS36459"],
    rdnsPatterns: [
      "\\.github\\.io$",
      "\\.githubusercontent\\.com$",
      "\\.github\\.dev$",
    ],
    headerPatterns: {
      "x-github-request-id": ".",
      server: "^GitHub\\.com$",
    },
    errorPatterns: [
      "There isn't a GitHub Pages site here",
    ],
    serviceIdentifiers: [
      { service: "Pages", pattern: "\\.github\\.io" },
      { service: "Codespaces", pattern: "\\.github\\.dev" },
    ],
  },

  // ──────────────────────────────────────────────────
  // GitLab
  // ──────────────────────────────────────────────────
  {
    provider: "GitLab",
    asn: ["AS394161"],
    rdnsPatterns: [
      "\\.gitlab\\.io$",
    ],
    headerPatterns: {
      "x-gitlab-custom-domain-host": ".",
    },
    errorPatterns: [
      "The page you're looking for could not be found",
    ],
    serviceIdentifiers: [
      { service: "Pages", pattern: "\\.gitlab\\.io" },
    ],
  },
];

export const httpStatus: Record<number, { message: string; code?: number }> = {
  "100": {
    message: "Continue with the request",
    code: 100,
  },
  "101": {
    message: "Switching to the protocol requested",
    code: 101,
  },
  "102": {
    message: "Request is being processed",
    code: 102,
  },
  "103": {
    message: "Preliminary information",
    code: 103,
  },
  "200": {
    message: "Request succeeded",
    code: 200,
  },
  "201": {
    message: "Resource created",
    code: 201,
  },
  "202": {
    message: "Request accepted but not yet processed",
    code: 202,
  },
  "203": {
    message: "Non-authoritative information",
    code: 203,
  },
  "204": {
    message: "No content to send for this request",
    code: 204,
  },
  "205": {
    message: "Reset the content that sent this request",
    code: 205,
  },
  "206": {
    message: "Partial content sent",
    code: 206,
  },
  "207": {
    message: "Multiple status messages",
    code: 207,
  },
  "300": {
    message: "Multiple options for the resource",
    code: 300,
  },
  "301": {
    message: "Resource moved permanently",
    code: 301,
  },
  "302": {
    message: "Resource found at another location",
    code: 302,
  },
  "303": {
    message: "See another resource",
    code: 303,
  },
  "304": {
    message: "Resource not modified",
    code: 304,
  },
  "305": {
    message: "Use proxy to access resource",
    code: 305,
  },
  "307": {
    message: "Temporary redirection",
    code: 307,
  },
  "308": {
    message: "Permanent redirection",
    code: 308,
  },
  "400": {
    message: "Bad request syntax or unsupported method",
    code: 400,
  },
  "401": {
    message: "No permission to access resource",
    code: 401,
  },
  "402": {
    message: "Payment required to access resource",
    code: 402,
  },
  "403": {
    message: "Access to this route is forbidden",
    code: 403,
  },
  "404": {
    message: "Resource not found",
    code: 404,
  },
  "405": {
    message: "HTTP method not allowed",
    code: 405,
  },
  "406": {
    message: "Resource not acceptable according to the Accept headers",
    code: 406,
  },
  "407": {
    message: "Authentication with the proxy is required",
    code: 407,
  },
  "408": {
    message: "Server timed out waiting for the request",
    code: 408,
  },
  "409": {
    message: "Request conflict",
    code: 409,
  },
  "410": {
    message: "Resource is gone",
    code: 410,
  },
  "411": {
    message: "Content-Length header required",
    code: 411,
  },
  "412": {
    message: "Precondition failed",
    code: 412,
  },
  "413": {
    message: "Payload too large",
    code: 413,
  },
  "414": {
    message: "URI too long",
    code: 414,
  },
  "415": {
    message: "Unsupported media type",
    code: 415,
  },
  "416": {
    message: "Range not satisfiable",
    code: 416,
  },
  "417": {
    message: "Expectation failed",
    code: 417,
  },
  "418": {
    message: "I'm a teapot",
    code: 418,
  },
  "419": {
    message: "Insufficient space on resource",
    code: 419,
  },
  "420": {
    message: "Method failure",
    code: 420,
  },
  "421": {
    message: "Misdirected request",
    code: 421,
  },
  "422": {
    message: "Unprocessable entity",
    code: 422,
  },
  "423": {
    message: "Resource is locked",
    code: 423,
  },
  "424": {
    message: "Failed dependency",
    code: 424,
  },
  "426": {
    message: "Upgrade required",
    code: 426,
  },
  "428": {
    message: "Precondition required",
    code: 428,
  },
  "429": {
    message: "Too many requests",
    code: 429,
  },
  "431": {
    message: "Request header fields too large",
    code: 431,
  },
  "451": {
    message: "Unavailable for legal reasons",
    code: 451,
  },
  "500": {
    message: "Internal server error",
    code: 500,
  },
  "501": {
    message: "Not implemented",
    code: 501,
  },
  "502": {
    message: "Bad gateway",
    code: 502,
  },
  "503": {
    message: "Service unavailable",
    code: 503,
  },
  "504": {
    message: "Gateway timeout",
    code: 504,
  },
  "505": {
    message: "HTTP version not supported",
    code: 505,
  },
  "507": {
    message: "Insufficient storage",
    code: 507,
  },
  "511": {
    message: "Network authentication required",
    code: 511,
  },
};

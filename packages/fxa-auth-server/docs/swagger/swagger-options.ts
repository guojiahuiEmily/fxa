/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

export const swaggerOptions = {
  info: {
    title: 'Firefox Accounts API Documentation',
    description: dedent`
      [**WARNING**]: This information may not be up-to-date, use it at your own risk. It may be worth verifying information in the source code before acting on anything you read here.
    `,
  },
  basePath: '/v1',
  schemes: ['https'],
  tags: [
    {
      name: TAGS.AUTH_SERVER[1],
      description: dedent`
        This document provides protocol-level details of the Firefox Accounts auth server API. For a prose description of the client/server protocol and details on how each parameter is derived, see the [**API design document**](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol). For a reference client implementation, see [**fxa-auth-client**](https://github.com/mozilla/fxa/tree/main/packages/fxa-auth-client).

        ## Auth URL Structure
        All requests use URLs of the form:

        > \`https://<base-URI>/v1/<endpoint-path>\`

        Note that:

        - All API access must be over a properly-validated HTTPS connection.
        - The URL embeds a version identifier \`v1\`.
          Future revisions of this API may introduce new version numbers.
        - The base URI of the server may be configured on a per-client basis:
          - For a list of development servers
            see [Firefox Accounts deployments on MDN](https://developer.mozilla.org/en-US/Firefox_Accounts#Firefox_Accounts_deployments).
          - The canonical URL for Mozilla's hosted Firefox Accounts server
            is \`https://api.accounts.firefox.com/v1\`.

        ## Request Format
        All POST requests must have a content-type of \`application/json\` with a UTF8-encoded JSON body and must specify the content-length header. Keys and other binary data are included in the JSON as hexadecimal strings.

        The following request headers may be specified to influence the behaviour of the server:

        - \`Accept-Language\` may be used to localize emails and SMS messages.

        ## Response format
        All requests receive a JSON response body with a \`Content-Type: application/json\` header and appropriate \`Content-Length\` set. The body structure depends on the endpoint returning it.

        Successful responses will have an HTTP status code of 200 and a \`Timestamp\` header that contains the current server time in seconds since the epoch.

        Error responses caused by invalid client behavior will have an HTTP status code in the 4xx range. Error responses caused by server-side problems will have an HTTP status code in the 5xx range. Failures due to invalid behavior from the client.

        To simplify error handling for the client, the type of error is indicated by both
        a defined HTTP status code and an application-specific \`errno\` in the body.

        For example:

        {<br/>
          \`"code": 400,\`  // Matches the HTTP status code<br/>
          \`"errno": 107,\` // Stable application-level error number<br/>
          \`"error": "Bad Request",\` // String description of the error type<br/>
          \`"message": "Invalid parameter in request body",\` // Specific error message<br/>
          \`"info": "https://docs.dev.lcip.og/errors/1234"\`  // Link to more information<br/>
        }

        Responses for some errors may include additional parameters.


        ### Defined errors

        The currently-defined values for \`code\` and \`errno\` are:


        The following errors include additional response properties:

        ### Responses from intermediary servers

        As with any HTTP-based API, clients must handle standard errors that may be returned by proxies, load-balancers or other intermediary servers. These non-application responses can be identified by the absence of a correctly-formatted JSON response body.

        Common examples include:

        - \`413 Request Entity Too Large\`: may be returned by an upstream proxy server.
        - \`502 Gateway Timeout\`: may be returned if a load-balancer can't connect to application servers.

        ## Validation
        In the documentation that follows, some properties of requests and responses are validated by common code that has been refactored and extracted. For reference, those common validations are defined here.


        ### lib/routes/validators

        - \`HEX_STRING\`: \`/^(?:[a-fA-F0-9]{2})+$/\`
        - \`BASE_36\`: \`/^[a-zA-Z0-9]*$/\`
        - \`URL_SAFE_BASE_64\`: \`/^[A-Za-z0-9_-]+$/\`
        - \`PKCE_CODE_VERIFIER\`: \`/^[A-Za-z0-9-\._~]{43,128}$/\`
        - \`DISPLAY_SAFE_UNICODE\`: \`/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/\`
        - \`DISPLAY_SAFE_UNICODE_WITH_NON_BMP\`: \`/^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uE000-\uF8FF\uFFF9-\uFFFF])*$/\`
        - \`BEARER_AUTH_REGEX\`: \`/^Bearer\s+([a-z0-9+\/]+)$/i\`
        - \`service\`: \`string, max(16), regex(/^[a-zA-Z0-9\-]*$/)\`
        - \`hexString\`: \`string, regex(/^(?:[a-fA-F0-9]{2})+$/)\`
        - \`clientId\`: \`module.exports.hexString.length(16)\`
        - \`clientSecret\`: \`module.exports.hexString\`
        - \`accessToken\`: \`module.exports.hexString.length(64)\`
        - \`refreshToken\`: \`module.exports.hexString.length(64)\`
        - \`authorizationCode\`: \`module.exports.hexString.length(64)\`
        - \`scope\`: \`string, max(256), regex(/^[a-zA-Z0-9 _\/.:-]*$/), allow('')\`
        - \`assertion\`: \`string, min(50), max(10240), regex(/^[a-zA-Z0-9_\-\.~=]+$/)\`
        - \`pkceCodeChallengeMethod\`: \`string, valid('S256')\`
        - \`pkceCodeChallenge\`: \`string, length(43), regex(module, exports.URL_SAFE_BASE_64)\`
        - \`pkceCodeVerifier\`: \`string, length(43), regex(module, exports.PKCE_CODE_VERIFIER)\`
        - \`jwe\`: \`string, max(1024), regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)\`
        - \`verificationMethod\`: \`string, valid()\`
        - \`authPW\`: \`string, length(64), regex(HEX_STRING), required\`
        - \`wrapKb\`: \`string, length(64), regex(/^(?:[a-fA-F0-9]{2})+$/)\`
        - \`recoveryKeyId\`: \`string, regex(HEX_STRING), max(32)\`
        - \`recoveryData\`: \`string, regex(/[a-zA-Z0-9.]/), max(1024), required\`
        - \`E164_NUMBER\`: \`/^\+[1-9]\d{1,14}$/\`
        - \`DIGITS\`: \`/^[0-9]+$/\`
        - \`DEVICE_COMMAND_NAME\`: \`/^[a-zA-Z0-9._\/\-:]{1,100}$/\`
        - \`IP_ADDRESS\`: \`string, ip\`


        ### lib/metrics/context

        - \`SCHEMA\`: object({
          - \`deviceId\`: string, length(32), regex(HEX_STRING), optional
          - \`entrypoint\`: ENTRYPOINT_SCHEMA.optional
          - \`entrypointExperiment\`: ENTRYPOINT_SCHEMA.optional
          - \`entrypointVariation\`: ENTRYPOINT_SCHEMA.optional
          - \`flowId\`: string, length(64), regex(HEX_STRING), optional
          - \`flowBeginTime\`: number, integer, positive, optional
          - \`utmCampaign\`: UTM_CAMPAIGN_SCHEMA.optional
          - \`utmContent\`: UTM_SCHEMA.optional
          - \`utmMedium\`: UTM_SCHEMA.optional
          - \`utmSource\`: UTM_SCHEMA.optional
          - \`utmTerm\`: UTM_SCHEMA.optional
            }), unknown(false), and('flowId', 'flowBeginTime')
        - \`schema\`: SCHEMA.optional
        - \`requiredSchema\`: SCHEMA.required


        ### lib/features

        - \`schema\`: array, items(string), optional


        ### lib/devices

        - \`schema\`: {

          - \`id\`: isA.string.length(32).regex(HEX_STRING)
          - \`location\`: isA.object({
            - \`city\`: isA.string.optional.allow(null)
            - \`country\`: isA.string.optional.allow(null)
            - \`state\`: isA.string.optional.allow(null)
            - \`stateCode\`: isA.string.optional.allow(null)
            - })
          - \`name\`: isA.string.max(255).regex(DISPLAY_SAFE_UNICODE_WITH_NON_BMP)
          - \`nameResponse\`: isA.string.max(255).allow('')
          - \`type\`: isA.string.max(16)
          - \`pushCallback\`: validators.pushCallbackUrl({ scheme: 'https' }).regex(PUSH_SERVER_REGEX).max(255).allow('')
          - \`pushPublicKey\`: isA.string.max(88).regex(URL_SAFE_BASE_64).allow('')
          - \`pushAuthKey\`: isA.string.max(24).regex(URL_SAFE_BASE_64).allow('')
          - \`pushEndpointExpired\`: isA.boolean.strict
          - \`availableCommands\`: isA.object.pattern(validators.DEVICE_COMMAND_NAME
          - \`isA.string.max(2048))

          }

        ## Back-off protocol

        During periods of heavy load, the server may request that clients enter a "back-off" state,
        in which they avoid making further requests.

        At such times,
        it will return a \`503 Service Unavailable\` response
        with a \`Retry-After\` header denoting the number of seconds to wait
        before issuing any further requests.
        It will also include \`errno: 201\`
        and a \`retryAfter\` field
        matching the value of the \`Retry-After\` header
        in the body.

        For example,
        the following response indicates that the client
        should suspend making further requests
        for 30 seconds:

        > \`HTTP/1.1 503 Service Unavailable\`
        > \`Retry-After: 30\`
        > \`Content-Type: application/json\`
        >
        > {<br/>
        >    \`"code": 503,\`<br/>
        >    \`"errno": 201,\`<br/>
        >    \`"error": "Service Unavailable",\`<br/>
        >    \`"message": "Service unavailable",\`<br/>
        >    \`"info": "https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/api.md#response-format",\`<br/>
        >    \`"retryAfter": 30,\`<br/>
        >    \`"retryAfterLocalized": "in a few seconds"\`<br/>
        > }
      `,
    },
    {
      name: TAGS.ACCOUNT[1],
    },
    {
      name: TAGS.DEVICES_AND_SESSIONS[1],
    },
    {
      name: TAGS.EMAILS[1],
    },
    {
      name: TAGS.MISCELLANEOUS[1],
    },
    {
      name: TAGS.OAUTH[1],
    },
    {
      name: TAGS.PASSWORD[1],
    },
    {
      name: TAGS.RECOVERY_CODES[1],
    },
    {
      name: TAGS.RECOVERY_KEY[1],
    },
    {
      name: TAGS.SECURITY_EVENTS[1],
    },
    {
      name: TAGS.SESSION[1],
    },
    {
      name: TAGS.SIGN[1],
    },
    {
      name: TAGS.SUBSCRIPTIONS[1],
    },
    {
      name: TAGS.THIRD_PARTY_AUTH[1],
    },
    {
      name: TAGS.TOTP[1],
    },
    {
      name: TAGS.UNBLOCK_CODES[1],
    },
    {
      name: TAGS.UTIL[1],
    },
    {
      name: TAGS.OAUTH_SERVER[1],
      description: dedent`
        ## OAuth URL Structure
        > \`https://<server-url>/v1/<api-endpoint>\`

        Note that:
        - All API access must be over HTTPS
        - The URL embeds a version identifier "v1"; future versions of this API may introduce new version numbers.
        - The base URL of the server may be configured on a per-client basis.

        ## Errors
        Invalid requests will return 4XX responses. Internal failures will return 5XX. Both will include JSON responses describing the error.

        **Example error:**
        > {<br/>
        >  \`"code": 400,\` // matches the HTTP status code<br/>
        >  \`"errno": 101,\` // stable application-level error number<br/>
        >  \`"error": "Bad Request",\` // string description of error type<br/>
        >  \`"message": "Unknown client"\`<br/>
        > }

        The currently-defined error responses are:

        <table>
          <thead>
            <tr>
              <th>status code</th>
              <th>errno</th>
              <th>description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td>400</td>
                <td>101</td>
                <td>unknown client id</td>
            </tr>
            <tr>
                <td>400</td>
                <td>102</td>
                <td>incorrect client secret</td>
            </tr>
            <tr>
                <td>400</td>
                <td>103</td>
                <td>\`redirect_uri\` doesn't match registered value</td>
            </tr>
            <tr>
                <td>401</td>
                <td>104</td>
                <td>invalid fxa assertion</td>
            </tr>
            <tr>
                <td>400</td>
                <td>105</td>
                <td>unknown code</td>
            </tr>
            <tr>
                <td>400</td>
                <td>106</td>
                <td>incorrect code</td>
            </tr>
            <tr>
                <td>400</td>
                <td>107</td>
                <td>expired code</td>
            </tr>
            <tr>
                <td>400</td>
                <td>108</td>
                <td>invalid token</td>
            </tr>
            <tr>
                <td>400</td>
                <td>109</td>
                <td>invalid request parameter</td>
            </tr>
            <tr>
                <td>400</td>
                <td>110</td>
                <td>invalid response_type</td>
            </tr>
            <tr>
                <td>401</td>
                <td>111</td>
                <td>unauthorized</td>
            </tr>
            <tr>
                <td>403</td>
                <td>112</td>
                <td>forbidden</td>
            </tr>
            <tr>
                <td>415</td>
                <td>113</td>
                <td>invalid content type</td>
            </tr>
            <tr>
                <td>400</td>
                <td>114</td>
                <td>invalid scopes</td>
            </tr>
            <tr>
                <td>400</td>
                <td>115</td>
                <td>expired token</td>
            </tr>
            <tr>
                <td>400</td>
                <td>116</td>
                <td>not a public client</td>
            </tr>
            <tr>
                <td>400</td>
                <td>117</td>
                <td>incorrect code_challenge</td>
            </tr>
            <tr>
                <td>400</td>
                <td>118</td>
                <td>pkce parameters missing</td>
            </tr>
            <tr>
                <td>400</td>
                <td>119</td>
                <td>stale authentication timestamp</td>
            </tr>
            <tr>
                <td>400</td>
                <td>120</td>
                <td>mismatch acr value</td>
            </tr>
            <tr>
                <td>400</td>
                <td>121</td>
                <td>invalid grant_type</td>
            </tr>
            <tr>
                <td>500</td>
                <td>999</td>
                <td>internal server error</td>
            </tr>
          </tbody>
        </table>

        ## API Endpoints
        - [GET /v1/authorization](#tag/OAuth-Server-API-Overview/operation/getAuthorization)
        - [POST /v1/authorization](#tag/OAuth-Server-API-Overview/operation/postAuthorization)
        - [POST /v1/authorized-clients](#tag/OAuth-Server-API-Overview/operation/postAuthorizedclients)
        - [POST /v1/authorized-clients/destroy](#tag/OAuth-Server-API-Overview/operation/postAuthorizedclientsDestroy)
        - [GET /v1/client/:id](#tag/OAuth-Server-API-Overview/operation/getClientClient_id)
        - [POST /v1/destroy](#tag/OAuth-Server-API-Overview/operation/postDestroy)
        - [POST /v1/introspect](#tag/OAuth-Server-API-Overview/operation/postIntrospect)
        - [GET /v1/jwks](#tag/OAuth-Server-API-Overview/operation/getJwks)
        - [POST /v1/key-data](#tag/OAuth-Server-API-Overview/operation/postKeydata)
        - [POST /v1/token](#tag/OAuth-Server-API-Overview/operation/postToken)
        - [POST /v1/verify](#tag/OAuth-Server-API-Overview/operation/postVerify)
    `,
    },
  ],
  'x-tagGroups': [
    {
      name: 'Firefox Accounts Auth Server API',
      tags: [
        TAGS.AUTH_SERVER[1],
        TAGS.ACCOUNT[1],
        TAGS.DEVICES_AND_SESSIONS[1],
        TAGS.EMAILS[1],
        TAGS.MISCELLANEOUS[1],
        TAGS.OAUTH[1],
        TAGS.PASSWORD[1],
        TAGS.RECOVERY_CODES[1],
        TAGS.RECOVERY_KEY[1],
        TAGS.SECURITY_EVENTS[1],
        TAGS.SESSION[1],
        TAGS.SIGN[1],
        TAGS.SUBSCRIPTIONS[1],
        TAGS.THIRD_PARTY_AUTH[1],
        TAGS.TOTP[1],
        TAGS.UNBLOCK_CODES[1],
        TAGS.UTIL[1],
      ],
    },
    {
      name: 'Firefox Accounts OAuth Server API',
      tags: [TAGS.OAUTH_SERVER[1]],
    },
  ],
  grouping: 'tags',
};

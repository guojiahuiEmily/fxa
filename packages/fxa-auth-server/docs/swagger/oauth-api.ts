/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';
import TAGS from './swagger-tags';

const TAGS_OAUTH = {
  tags: TAGS.OAUTH,
};

const TAGS_OAUTH_SERVER = {
  tags: TAGS.OAUTH_SERVER,
};

const OAUTH_AUTHORIZATION_POST = {
  ...TAGS_OAUTH,
  description: '/oauth/authorization',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Authorize a new OAuth client connection to the user's account, returning a short-lived authentication code that the client can exchange for access tokens at the OAuth token endpoint.

      This route behaves like the oauth-server /authorization endpoint except that it is authenticated directly with a sessionToken rather than with a BrowserID assertion.
    `,
  ],
};

const OAUTH_DESTROY_POST = {
  ...TAGS_OAUTH,
  description: '/oauth/destroy',
  notes: [
    dedent`
      Destroy an OAuth access token or refresh token.

      This is the "token revocation endpoint" as defined in RFC7009 and should be used by clients to explicitly revoke any OAuth tokens that they are no longer using.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        401: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 171\` - Incorrect client secret.
          `,
        },
        500: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 162\` - Unknown client id.
          `,
        },
      },
    },
  },
};

const ACCOUNT_SCOPED_KEY_DATA_POST = {
  ...TAGS_OAUTH,
  description: '/account/scoped-key-data',
  notes: [
    dedent`
      🔒 Authenticated with session token

      Query for the information required to derive scoped encryption keys requested by the specified OAuth client.
    `,
  ],
};

const OAUTH_TOKEN_POST = {
  ...TAGS_OAUTH,
  description: '/oauth/token',
  notes: [
    dedent`
      🔒🔓 Optionally authenticated with session token

      Grant new OAuth tokens for use by a connected client, using one of the following grant types:
        - \`grant_type=authorization_code\`: A single-use code obtained via OAuth redirect flow.
        - \`grant_type=refresh_token\`: A refresh token issued by a previous call to this endpoint.
        - \`grant_type=fxa-credentials\`: Directly grant tokens using an FxA sessionToken.

      This is the "token endpoint" as defined in RFC6749, and behaves like the oauth-server /token endpoint except that the \`fxa-credentials\` grant can be authenticated directly with a sessionToken rather than with a BrowserID assertion.
    `,
  ],
  plugins: {
    'hapi-swagger': {
      responses: {
        401: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 110\` - Invalid authentication token in request signature.
          `,
        },
        500: {
          description: dedent`
            Failing requests may be caused by the following errors (this is not an exhaustive list):
            \`errno: 998\` - An internal validation check failed.
          `,
        },
      },
    },
  },
};

const AUTHORIZATION_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorization',
  notes: [
    'This endpoint starts the OAuth flow. A client redirects the user agent to this url. This endpoint will then redirect to the appropriate content-server page.',
  ],
};

const AUTHORIZATION_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorization',
  notes: [
    dedent`
      This endpoint should be used by the fxa-content-server, requesting that we supply a short-lived code (currently 15 minutes) that will be sent back to the client. This code will be traded for a token at the [token][] endpoint.

      Note:

      Responses

      Implicit Grant - If requesting an implicit grant (token), the response will match the [/v1/token][token] response.
    `,
  ],
};

const DESTROY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/destroy',
  notes: [
    'After a client is done using a token, the responsible thing to do is to destroy the token afterwards. A client can use this route to do so.',
  ],
};

const AUTHORIZED_CLIENTS_DESTROY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorized-clients/destroy',
  notes: [
    `This endpoint revokes tokens granted to a given client. It must be authenticated with an identity assertion for the user's account.`,
  ],
};

const AUTHORIZED_CLIENTS_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/authorized_clients',
  notes: [
    dedent`
      This endpoint returns a list of all OAuth client instances connected to the user's account, including the the scopes granted to each client instance and the time at which it was last active, if available. It must be authenticated with an identity assertion for the user's account

      Note:

      Responses

      For clients that use refresh tokens, each refresh token is taken to represent a separate instance of that client and is returned as a separate entry in the list, with the \`refresh_token_id\` field distinguishing each.

      For clients that only use access tokens, all active access tokens are combined into a single entry in the list, and the \`refresh_token_id\` field will not be present.
    `,
  ],
};

const CLIENT_CLIENTID_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/client/{client_id}',
  notes: [
    'This endpoint is for the fxa-content-server to retrieve information about a client to show in its user interface.',
  ],
};

const INTROSPECT_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/introspect',
  notes: [
    'This endpoint returns the status of the token and meta-information about this token.',
  ],
};

const JWKS_GET = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/jwks',
  notes: [
    'This endpoint returns the [JWKs](https://datatracker.ietf.org/doc/html/rfc7517) that are used for signing OpenID Connect id tokens.',
  ],
};

const KEY_DATA_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/key-data',
  notes: ['This endpoint returns the required scoped key metadata.'],
};

const TOKEN_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/token',
  notes: [
    dedent`
      After receiving an authorization grant from the user, clients exercise that grant at this endpoint to obtain tokens that can be used to access attached services for a particular user.

      The following types of grant are possible:

      - \`authorization_code\`: a single-use code as produced by the [authorization][] endpoint, obtained through a redirect-based authorization flow.
      - \`refresh_token\`: a token previously obtained from this endpoint when using access_type=offline.
      - \`fxa-credentials\`: an FxA identity assertion, obtained by directly authenticating the user's account.
    `,
  ],
};

const VERIFY_POST = {
  ...TAGS_OAUTH_SERVER,
  description: '/v1/verify',
  notes: [
    'Attached services can post tokens to this endpoint to learn about which user and scopes are permitted for the token.',
  ],
};

const API_DOCS = {
  ACCOUNT_SCOPED_KEY_DATA_POST,
  OAUTH_AUTHORIZATION_POST,
  OAUTH_DESTROY_POST,
  OAUTH_TOKEN_POST,
  AUTHORIZATION_GET,
  AUTHORIZATION_POST,
  DESTROY_POST,
  AUTHORIZED_CLIENTS_DESTROY_POST,
  AUTHORIZED_CLIENTS_POST,
  CLIENT_CLIENTID_GET,
  INTROSPECT_POST,
  JWKS_GET,
  KEY_DATA_POST,
  TOKEN_POST,
  VERIFY_POST,
};

export default API_DOCS;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const validators = require('../../../oauth/validators');
const authorizedClients = require('../../../oauth/authorized_clients');
const verifyAssertion = require('../../../oauth/assertion');
const DESCRIPTION =
  require('../../../../docs/swagger/shared/descriptions').default;
const OAUTH_DOCS = require('../../../../docs/swagger/oauth-api').default;

module.exports = () => ({
  method: 'POST',
  path: '/authorized-clients/destroy',
  config: {
    ...OAUTH_DOCS.AUTHORIZED_CLIENTS_DESTROY_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        client_id: validators.clientId.description(
          DESCRIPTION.clientId + DESCRIPTION.clientIdToDelete
        ),
        refresh_token_id: validators.token
          .optional()
          .description(DESCRIPTION.refresh_token_id),
        assertion: validators.assertion.description(DESCRIPTION.assertion),
      }),
    },
    handler: async function (req) {
      const claims = await verifyAssertion(req.payload.assertion);
      await authorizedClients.destroy(
        req.payload.client_id,
        claims.uid,
        req.payload.refresh_token_id
      );
      return {};
    },
  },
});

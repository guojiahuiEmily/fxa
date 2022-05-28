/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const validators = require('../../../oauth/validators');
const verifyAssertion = require('../../../oauth/assertion');
const authorizedClients = require('../../../oauth/authorized_clients');
const {
  default: DESCRIPTIONS,
} = require('../../../../docs/swagger/shared/descriptions');
const OAUTH_DOCS = require('../../../../docs/swagger/oauth-api').default;

module.exports = () => ({
  method: 'POST',
  path: '/authorized-clients',
  config: {
    ...OAUTH_DOCS.AUTHORIZED_CLIENTS_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        assertion: validators.assertion
          .required()
          .description(DESCRIPTIONS.assertion),
      }),
    },
    response: {
      schema: Joi.array().items(
        Joi.object({
          client_id: validators.clientId.description(DESCRIPTIONS.clientId),
          refresh_token_id: validators.token
            .optional()
            .description(DESCRIPTIONS.refresh_token_id),
          client_name: Joi.string()
            .required()
            .description(DESCRIPTIONS.clientName),
          created_time: Joi.number()
            .min(0)
            .required()
            .description(DESCRIPTIONS.createdTime),
          last_access_time: Joi.number()
            .min(0)
            .required()
            .allow(null)
            .description(DESCRIPTIONS.lastAccessTime),
          scope: Joi.array()
            .items(Joi.string())
            .required()
            .description(DESCRIPTIONS.scope),
        })
      ),
    },
    handler: async function (req) {
      const claims = await verifyAssertion(req.payload.assertion);
      return await authorizedClients.list(claims.uid);
    },
  },
});

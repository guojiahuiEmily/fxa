/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const Joi = require('joi');

const AppError = require('../../../oauth/error');
const validators = require('../../../oauth/validators');
const {
  default: DESCRIPTIONS,
} = require('../../../../docs/swagger/shared/descriptions');
const OAUTH_DOCS = require('../../../../docs/swagger/oauth-api').default;

module.exports = ({ log, oauthDB }) => ({
  method: 'GET',
  path: '/client/{client_id}',
  config: {
    ...OAUTH_DOCS.CLIENT_CLIENTID_GET,
    cors: { origin: 'ignore' },
    validate: {
      params: {
        client_id: validators.clientId
          .required()
          .description(DESCRIPTIONS.clientId + DESCRIPTIONS.clientIdPermission),
      },
    },
    response: {
      schema: Joi.object({
        id: validators.clientId.description(
          DESCRIPTIONS.clientId + ' asking for permission.'
        ),
        name: Joi.string().required().description(DESCRIPTIONS.name),
        trusted: Joi.boolean().required().description(DESCRIPTIONS.trusted),
        image_uri: Joi.any().description(DESCRIPTIONS.image_uri),
        redirect_uri: Joi.string()
          .required()
          .allow('')
          .description(DESCRIPTIONS.redirectUri),
      }),
    },
    handler: async function requestInfoEndpoint(req) {
      const params = req.params;

      return oauthDB
        .getClient(Buffer.from(params.client_id, 'hex'))
        .then(function (client) {
          if (!client) {
            log.debug('notFound', { id: params.client_id });
            throw AppError.unknownClient(params.client_id);
          } else {
            return {
              id: hex(client.id),
              name: client.name,
              trusted: client.trusted,
              image_uri: client.imageUri,
              redirect_uri: client.redirectUri,
            };
          }
        });
    },
  },
});

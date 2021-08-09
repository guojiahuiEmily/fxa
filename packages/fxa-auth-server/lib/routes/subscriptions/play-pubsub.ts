/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ServerRoute } from '@hapi/hapi';
import isA from '@hapi/joi';
import { Container } from 'typedi';

import error from '../../error';
import { CapabilityService } from '../../payments/capability';
import { PlayBilling } from '../../payments/google-play/play-billing';
import { DeveloperNotification } from '../../payments/google-play/types';
import { AuthLogger, AuthRequest, ProfileClient } from '../../types';

export class PlayPubsubHandler {
  private log: AuthLogger;
  private playBilling: PlayBilling;
  private capabilityService: CapabilityService;
  private db: any;
  private profileClient: ProfileClient;

  constructor(db: any) {
    this.db = db;
    this.log = Container.get(AuthLogger);
    this.playBilling = Container.get(PlayBilling);
    this.capabilityService = Container.get(CapabilityService);
    this.profileClient = Container.get(ProfileClient);
  }

  /**
   * Handle a Google Play Real-time Developer Notification
   */
  public async rtdn(request: AuthRequest) {
    // See https://developer.android.com/google/play/billing/rtdn-reference for
    // message formatting details.
    const developerNotification = this.extractMessage(
      (request.payload as any).message.data
    ) as DeveloperNotification;

    if (developerNotification.testNotification) {
      this.log.info('play-test-notification', developerNotification);
      return;
    }

    if (!developerNotification.subscriptionNotification) {
      this.log.info('play-other-notification', developerNotification);
      return;
    }

    const purchase = await this.playBilling.purchaseManager.getPurchase(
      developerNotification.subscriptionNotification.purchaseToken
    );
    if (!purchase) {
      // Store the purchase by processing it, even though we don't know who it
      // belongs to.
      await this.playBilling.purchaseManager.processDeveloperNotification(
        developerNotification.packageName,
        developerNotification
      );
      return;
    }

    if (!purchase.userId) {
      // Purchase is not associated with a user, nothing else can be done.
      return;
    }
    const uid = purchase.userId;

    // Lookup the email for the user as we need it for capability checks
    const { email } = (await this.db.account(uid)).primaryEmail;

    const priorProductIds = await this.capabilityService.subscribedProductIds(
      uid,
      email
    );
    await this.playBilling.purchaseManager.processDeveloperNotification(
      developerNotification.packageName,
      developerNotification
    );
    const currentProductIds = await this.capabilityService.subscribedProductIds(
      uid,
      email
    );

    // If our products have changed, process them and update the profile cache
    if (priorProductIds != currentProductIds) {
      // Update cache first in case RPs are quick to update.
      await this.profileClient.deleteCache(uid);

      await this.capabilityService.processProductDiff({
        uid,
        priorProductIds,
        currentProductIds,
      });
    }
  }

  /**
   * Extract the Google PubSub message from its encoded published format.
   *
   * See https://cloud.google.com/pubsub/docs/push#receiving_messages for message
   * encoding details.
   *
   * @param messageData Raw string message data from Google PubSub message body
   */
  private extractMessage(messageData: string): Record<string, any> {
    try {
      // The message is a unicode string encoded in base64.
      const rawMessage = Buffer.from(messageData, 'base64').toString('utf-8');
      const message = JSON.parse(rawMessage);
      this.log.debug('rtdn', { message });
      return message;
    } catch (err) {
      this.log.error('rtdn', {
        message: 'Failure to load message payload',
        err,
      });
      throw error.internalValidationError('Invalid message payload');
    }
  }
}

export const playPubsubRoutes = (db: any): ServerRoute[] => {
  const playPubsubHandler = new PlayPubsubHandler(db);
  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/iap/rtdn',
      options: {
        auth: {
          payload: false,
          strategy: 'pubsub',
        },
        validate: {
          payload: isA
            .object({
              message: isA
                .object({
                  data: isA.string().required(),
                })
                .required(),
            })
            .required(),
        },
      },
      handler: (request: AuthRequest) => playPubsubHandler.rtdn(request),
    },
  ];
};

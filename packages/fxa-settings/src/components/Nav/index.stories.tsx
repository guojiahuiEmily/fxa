/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { getDefault } from '../../lib/config';
import { Nav } from '.';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from '../../models/mocks';
import { Account } from '../../models/Account';
import { MOCK_LINKED_ACCOUNTS } from '../LinkedAccounts/mocks';

const defaultStory = { title: 'Components/Nav', component: Nav };
export default defaultStory;

const account = {
  primaryEmail: {
    email: 'johndope@example.com',
  },
  subscriptions: [{ created: 1, productName: 'x' }],
  linkedAccounts: [],
} as any;

const accountWithLinkedAccounts = Object.assign({}, account, {
  linkedAccounts: MOCK_LINKED_ACCOUNTS,
});

const configWithoutNewsletterLink = Object.assign({}, getDefault(), {
  marketingEmailPreferencesUrl: '',
});

const storyWithAccount = (
  account: Partial<Account>,
  storyName?: string,
  config?: any
) => {
  const context = config
    ? { account: account as Account, config: config }
    : { account: account as Account };

  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext(context)}>
        <Nav />
      </AppContext.Provider>
    </LocationProvider>
  );
  if (storyName) story.storyName = storyName;
  return story;
};

export const basic = () => <Nav />;

export const WithLinkToSubscriptions = storyWithAccount(
  account,
  'with link to Subscriptions'
);

export const WithLinkedAccounts = storyWithAccount(
  accountWithLinkedAccounts,
  'with linked accounts'
);

export const WithoutNewsletterLink = storyWithAccount(
  account,
  'without link to Newsletters',
  configWithoutNewsletterLink
);

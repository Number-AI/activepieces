import { slackAuth } from '../../';
import { createAction, PieceAuth, Property } from '@activepieces/pieces-framework';
import { apiEndpoint, singleSelectChannelInfo, slackChannel } from '../common/props';

import { WebClient } from '@slack/web-api';
import { processMessageTimestamp } from '../common/utils';
import { previousNodeOutput } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const addRectionToMessageAction = createAction({
  auth: PieceAuth.None(),
  name: 'slack-add-reaction-to-message',
  displayName: 'Add Reaction to Message',
  description: 'Add an emoji reaction to a message.',

  props: {
    previousNodeOutput,
    // info: singleSelectChannelInfo,
    // channel: slackChannel(true),
    ts: Property.ShortText({
      displayName: 'Message Timestamp',
      description:
        'Please provide the timestamp of the message you wish to react, such as `1710304378.475129`. Alternatively, you can easily obtain the message link by clicking on the three dots next to the message and selecting the `Copy link` option.',
      required: true,
    }),
    reaction: Property.ShortText({
      displayName: 'Reaction (emoji) name',
      required: true,
      description: 'e.g.`thumbsup`',
    }),
    apiEndpoint
  },

  async run(context) {
    const { ts, reaction, previousNodeOutput, apiEndpoint } = context.propsValue;

    const organizationId = previousNodeOutput['organizationId'] as string;
    if (!organizationId) {
    throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
    const channel = previousNodeOutput['channelId'] as string;

    const credentials = await SlackCredentialService
        .getInstance()
        .getCredentials(apiEndpoint, organizationId);

    const slack = new WebClient(credentials.access_token);

    const messageTimestamp = processMessageTimestamp(ts);

    if (messageTimestamp) {
      const response = await slack.reactions.add({
        channel,
        timestamp: messageTimestamp,
        name: reaction,
      });

      return response;
    } else {
      throw new Error('Invalid Timestamp Value.');
    }
  },
});

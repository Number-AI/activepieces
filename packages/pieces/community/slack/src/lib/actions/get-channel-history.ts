import { ConversationsHistoryResponse, WebClient } from '@slack/web-api';
import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../..';
import { previousNodeOutput, singleSelectChannelInfo, slackChannel, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';
import { PieceAuth } from '@activepieces/pieces-framework';

export const getChannelHistory = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'getChannelHistory',
  auth: PieceAuth.None(),
  displayName: 'Get channel history',
  description:
    'Retrieve all messages from a specific channel ("conversation") between specified timestamps',
  props: {
    // info: singleSelectChannelInfo,
    // channel: slackChannel(true),
    oldest: Property.Number({
      displayName: 'Oldest',
      description:
        'Only messages after this timestamp will be included in results',
      required: false,
    }),
    latest: Property.Number({
      displayName: 'Latest',
      description:
        'Only messages before this timestamp will be included in results. Default is the current time',
      required: false,
    }),
    inclusive: Property.Checkbox({
      displayName: 'Inclusive',
      description:
        'Include messages with oldest or latest timestamps in results. Ignored unless either timestamp is specified',
      defaultValue: false,
      required: true,
    }),
    includeAllMetadata: Property.Checkbox({
      displayName: 'Include all metadata',
      description: 'Return all metadata associated with each message',
      defaultValue: false,
      required: true,
    }),
    previousNodeOutput,
    apiEndpoint,
  },
  async run({ auth, propsValue }) {
    const { previousNodeOutput, apiEndpoint } = propsValue;
    const organizationId = previousNodeOutput['organizationId'] as string;
            if (!organizationId) {
            throw new Error("Input Processing must return an object with an 'organizationId'.");
            }
    const channel = previousNodeOutput['channelId'] as string;
    const credentials = await SlackCredentialService
                .getInstance()
                .getCredentials(apiEndpoint, organizationId);
    const client = new WebClient(credentials.access_token);
    const messages = [];
    await client.conversations.history({ channel });
    for await (const page of client.paginate('conversations.history', {
      channel,
      oldest: propsValue.oldest,
      latest: propsValue.latest,
      limit: 200, // page size, does not limit the total number of results
      include_all_metadata: propsValue.includeAllMetadata,
      inclusive: propsValue.inclusive,
    })) {
      const response = page as ConversationsHistoryResponse;
      if (response.messages) {
        messages.push(...response.messages);
      }
    }
    return messages;
  },
});

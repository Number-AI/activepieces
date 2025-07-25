import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../..';
import { WebClient } from '@slack/web-api';
import { slackChannel } from '../common/props';
import { processMessageTimestamp } from '../common/utils';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';
import { PieceAuth } from '@activepieces/pieces-framework';

export const retrieveThreadMessages = createAction({
  name: 'retrieveThreadMessages',
  displayName: 'Retrieve Thread Messages',
  description: 'Retrieves thread messages by channel and thread timestamp.',
  auth: PieceAuth.None(),
  props: {
    // channel: slackChannel(true),
    threadTs: Property.ShortText({
      displayName: 'Thread ts',
      description:
        'Provide the ts (timestamp) value of the **parent** message to retrieve replies of this message. Do not use the ts value of the reply itself; use its parent instead. For example `1710304378.475129`.Alternatively, you can easily obtain the message link by clicking on the three dots next to the parent message and selecting the `Copy link` option.',
      required: true,
      defaultValue: `{{trigger.body.threadTs}}`,
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
                            
    const credentials = await SlackCredentialService.getInstance().getCredentials(apiEndpoint, organizationId);
    const client = new WebClient(credentials.access_token);
      const messageTimestamp = processMessageTimestamp(propsValue.threadTs);
        if (!messageTimestamp) {
          throw new Error('Invalid Timestamp Value.');
        }
    return await client.conversations.replies({
      channel: propsValue.previousNodeOutput['channelId'] as string,
      ts: messageTimestamp,
    });
  },
});

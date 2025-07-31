import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../..';
import { singleSelectChannelInfo, slackChannel, apiEndpoint } from '../common/props';
import { processMessageTimestamp } from '../common/utils';
import { WebClient } from '@slack/web-api';
import { previousNodeOutput } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';
import { PieceAuth } from '@activepieces/pieces-framework';

export const getMessageAction = createAction({
	name: 'get-message',
	displayName: 'Get Message by Timestamp',
	description: `Retrieves a specific message from a channel history using the message's timestamp.`,
	auth: PieceAuth.None(),
	props: {
		// info: singleSelectChannelInfo,
		// channel: slackChannel(true),
		ts: Property.ShortText({
			displayName: 'Message Timestamp',
			description:
				'Please provide the timestamp of the message you wish to retrieve, such as `1710304378.475129`. Alternatively, you can easily obtain the message link by clicking on the three dots next to the message and selecting the `Copy link` option.',
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
         const channel = previousNodeOutput['channelId'] as string;       
        const credentials = await SlackCredentialService
                        .getInstance()
                        .getCredentials(apiEndpoint, organizationId);
		const messageTimestamp = processMessageTimestamp(propsValue.ts);
		if (!messageTimestamp) {
			throw new Error('Invalid Timestamp Value.');
		}
		const client = new WebClient(credentials.access_token);

		return await client.conversations.history({
			channel,
			latest: messageTimestamp,
			limit: 1,
			inclusive: true,
		});
	},
});

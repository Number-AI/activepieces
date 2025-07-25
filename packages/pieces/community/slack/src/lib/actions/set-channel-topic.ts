import { slackAuth } from '../../index';
import { createAction, Property } from '@activepieces/pieces-framework';
import { apiEndpoint, previousNodeOutput, singleSelectChannelInfo, slackChannel } from '../common/props';
import { WebClient } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { SlackCredentialService } from '../common/credential-service';

export const setChannelTopicAction = createAction({
	auth: PieceAuth.None(),
	name: 'set-channel-topic',
	displayName: 'Set Channel Topic',
	description: 'Sets the topic on a selected channel.',
	props: {
		// info: singleSelectChannelInfo,
		// channel: slackChannel(true),
		topic: Property.LongText({
			displayName: 'Topic',
			required: true,
		}),
        previousNodeOutput,
        apiEndpoint,
    },
	async run(context) {
		const { topic, previousNodeOutput, apiEndpoint } = context.propsValue;
        const organizationId = previousNodeOutput['organizationId'] as string;
        if (!organizationId) {
            throw new Error("Input Processing must return an object with an 'organizationId'.");
        }
                                    
        const credentials = await SlackCredentialService.getInstance().getCredentials(apiEndpoint, organizationId);
		const client = new WebClient(credentials.access_token);

		return await client.conversations.setTopic({
			channel: previousNodeOutput['channelId'] as string,
			topic,
		});
	},
});

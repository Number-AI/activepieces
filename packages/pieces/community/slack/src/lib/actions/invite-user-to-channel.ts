import { slackAuth } from '../../index';
import { createAction } from '@activepieces/pieces-framework';
import { singleSelectChannelInfo, slackChannel, userId, apiEndpoint } from '../common/props';
import { WebClient } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { previousNodeOutput } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const inviteUserToChannelAction = createAction({
	auth: PieceAuth.None(),
	name: 'invite-user-to-channel',
	displayName: 'Invite User to Channel',
	description: 'Invites an existing User to an existing channel.',
	props: {
		// info: singleSelectChannelInfo,
		// channel: slackChannel(true),
		userId,
        previousNodeOutput,
    apiEndpoint,
	},
    
	async run(context) {
        const { previousNodeOutput, apiEndpoint } = context.propsValue;
        const organizationId = previousNodeOutput['organizationId'] as string;
        if (!organizationId) {
            throw new Error("Input Processing must return an object with an 'organizationId'.");
        }
        const channel = previousNodeOutput['channelId'] as string;
                
        const credentials = await SlackCredentialService
                        .getInstance()
                        .getCredentials(apiEndpoint, organizationId);
		const client = new WebClient(credentials.access_token);

		return await client.conversations.invite({
			channel,
			users: `${context.propsValue.userId}`,
		});
	},
});

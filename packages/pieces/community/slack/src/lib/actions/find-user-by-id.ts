import { slackAuth } from '../../';
import { createAction, Property } from '@activepieces/pieces-framework';
import { WebClient } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const findUserByIdAction = createAction({
	auth: PieceAuth.None(),
	name: 'find-user-by-id',
	displayName: 'Find User by ID',
	description: 'Finds a user by their ID.',
	props: {
		id: Property.ShortText({
			displayName: 'ID',
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
    
        const credentials = await SlackCredentialService
            .getInstance()
            .getCredentials(apiEndpoint, organizationId);
		const client = new WebClient(credentials.access_token);
		return await client.users.profile.get({
			user: propsValue.id,
		});
	},
});

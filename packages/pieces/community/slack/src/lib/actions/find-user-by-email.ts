import { slackAuth } from '../../';
import { createAction, Property } from '@activepieces/pieces-framework';
import { WebClient } from '@slack/web-api';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';
import { PieceAuth } from '@activepieces/pieces-framework';

export const findUserByEmailAction = createAction({
  auth: PieceAuth.None(),
  name: 'slack-find-user-by-email',
  displayName: 'Find User by Email',
  description: 'Finds a user by matching against their email address.',
  props: {
    previousNodeOutput,
    apiEndpoint,
    email: Property.ShortText({
      displayName: 'Email',
      required: true,
    }),
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
    const email = propsValue.email;
    const client = new WebClient(credentials.access_token);
    return await client.users.lookupByEmail({
      email,
    });
  },
});

import { slackAuth } from '../../';
import { createAction, Property } from '@activepieces/pieces-framework';
import { WebClient } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const updateProfileAction = createAction({
  auth: PieceAuth.None(),
  name: 'slack-update-profile',
  displayName: 'Update Profile',
  description: 'Update basic profile field such as name or title.',
  props: {
    firstName: Property.ShortText({
      displayName: 'First Name',
      required: false,
    }),
    lastName: Property.ShortText({
      displayName: 'Last Name',
      required: false,
    }),
    email: Property.ShortText({
      displayName: 'Email',
      description: `Changing a user's email address will send an email to both the old and new addresses, and also post a slackbot message to the user informing them of the change.`,
      required: false,
    }),
    userId: Property.ShortText({
      displayName: 'User',
      description:
        'ID of user to change. This argument may only be specified by admins on paid teams.You can use **Find User by Email** action to retrieve ID.',
      required: false,
    }),
    previousNodeOutput,
    apiEndpoint,
  },
  async run({ auth, propsValue }) {
    const organizationId = propsValue.previousNodeOutput['organizationId'] as string;
    if (!organizationId) {
      throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
    const credentials = await SlackCredentialService.getInstance().getCredentials(propsValue.apiEndpoint, organizationId);
    const client = new WebClient(credentials.access_token);
    return client.users.profile.set({
      profile: {
        first_name: propsValue.firstName,
        last_name: propsValue.lastName,
        email: propsValue.email,
      },
      user: propsValue.userId,
    });
  },
});

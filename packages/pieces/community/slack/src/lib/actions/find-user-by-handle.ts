import { slackAuth } from '../../';
import { createAction, Property } from '@activepieces/pieces-framework';
import { UsersListResponse, WebClient } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const findUserByHandleAction = createAction({
  auth: PieceAuth.None(),
  name: 'slack-find-user-by-handle',
  displayName: 'Find User by Handle',
  description: 'Finds a user by matching against their Slack handle.',
  props: {
    handle: Property.ShortText({
      displayName: 'Handle',
      description: 'User handle (display name), without the leading @',
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
    const handle = propsValue.handle.replace('@', '');
    const client = new WebClient(credentials.access_token);
    for await (const page of client.paginate('users.list', {
      limit: 1000, // Only limits page size, not total number of results
    })) {
      const response = page as UsersListResponse;
      if (response.members) {
        const matchedMember = response.members.find(
          (member) => member.profile?.display_name === handle
        );
        if (matchedMember) {
          return matchedMember;
        }
      }
    }
    throw new Error(`Could not find user with handle @${handle}`);
  },
});

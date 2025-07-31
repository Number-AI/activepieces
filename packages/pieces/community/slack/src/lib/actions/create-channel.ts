import { slackAuth } from '../../';
import { createAction, Property } from '@activepieces/pieces-framework';
import { WebClient } from '@slack/web-api';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';
import { PieceAuth } from '@activepieces/pieces-framework';

export const createChannelAction = createAction({
  auth: PieceAuth.None(),
  name: 'slack-create-channel',
  displayName: 'Create Channel',
  description: 'Creates a new channel.',
  props: {
    previousNodeOutput,
    apiEndpoint,
    channelName: Property.ShortText({
      displayName: 'Channel Name',
      required: true,
    }),
    isPrivate: Property.Checkbox({
      displayName: 'Is Private?',
      required: false,
      defaultValue: false,
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
    const client = new WebClient(credentials.access_token);
    return await client.conversations.create({
      name: propsValue.channelName,
      is_private: propsValue.isPrivate,
    });
  },
});

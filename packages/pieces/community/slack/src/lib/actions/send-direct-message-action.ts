import { createAction } from '@activepieces/pieces-framework';
import { slackSendMessage } from '../common/utils';
import { slackAuth } from '../../';
import { assertNotNullOrUndefined } from '@activepieces/shared';
import {
  profilePicture,
  text,
  userId,
  username,
  blocks,
  previousNodeOutput,
  apiEndpoint,
} from '../common/props';
import { Block,KnownBlock } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { SlackCredentialService } from '../common/credential-service';

export const slackSendDirectMessageAction = createAction({
  auth: PieceAuth.None(),
  name: 'send_direct_message',
  displayName: 'Send Message To A User',
  description: 'Send message to a user',
  props: {
    userId,
    text,
    username,
    profilePicture,
    blocks,
    previousNodeOutput,
    apiEndpoint,
  },
  async run(context) {
    const { previousNodeOutput, apiEndpoint } = context.propsValue;
    const organizationId = previousNodeOutput['organizationId'] as string;
    if (!organizationId) {
      throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
                            
    const credentials = await SlackCredentialService.getInstance().getCredentials(apiEndpoint, organizationId);
    const token = credentials.access_token;
    const { text, userId, blocks } = context.propsValue;

    assertNotNullOrUndefined(token, 'token');
    assertNotNullOrUndefined(text, 'text');
    assertNotNullOrUndefined(userId, 'userId');

    const blockList = blocks ?[{ type: 'section', text: { type: 'mrkdwn', text } }, ...(blocks as unknown as (KnownBlock | Block)[])] :undefined


    return slackSendMessage({
      token,
      text,
      username: context.propsValue.username,
      profilePicture: context.propsValue.profilePicture,
      conversationId: userId,
      blocks:blockList,
    });
  },
});


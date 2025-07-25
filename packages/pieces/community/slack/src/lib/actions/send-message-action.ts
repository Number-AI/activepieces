import { createAction, PieceAuth, Property } from '@activepieces/pieces-framework';
import {
  profilePicture,
  slackChannel,
  username,
  blocks,
  singleSelectChannelInfo,
  previousNodeOutput,
  apiEndpoint,
} from '../common/props';
import { processMessageTimestamp, slackSendMessage } from '../common/utils';
import { slackAuth } from '../../';
import { Block,KnownBlock } from '@slack/web-api';
import { SlackCredentialService } from '../common/credential-service';

export const slackSendMessageAction = createAction({
  auth: PieceAuth.None(),
  name: 'send_channel_message',
  displayName: 'Send Message To A Channel',
  description: 'Send message to a channel',
  props: {
    // info: singleSelectChannelInfo,
    previousNodeOutput,
    // channel: slackChannel(true),
    text: Property.LongText({
      displayName: 'Message',
      description: 'The text of your message',
      required: true,
    }),
    apiEndpoint,
    username,
    profilePicture,
    file: Property.File({
      displayName: 'Attachment',
      required: false,
    }),
    threadTs: Property.ShortText({
      displayName: 'Thread ts',
      description:
        'Provide the ts (timestamp) value of the **parent** message to make this message a reply. Do not use the ts value of the reply itself; use its parent instead. For example `1710304378.475129`.Alternatively, you can easily obtain the message link by clicking on the three dots next to the parent message and selecting the `Copy link` option.',
      required: false,
      defaultValue: `{{trigger.body.threadTs}}`
    }),
    blocks,
  },
  async run(context) {
    const organizationId = context.propsValue.previousNodeOutput['organizationId'] as string;
    const channelId = context.propsValue.previousNodeOutput['channelId'] as string;
    const credentials = await SlackCredentialService
    .getInstance()
    .getCredentials(context.propsValue.apiEndpoint, organizationId);
    // const threadTs = previousNodeOutput['threadTs'] as string;
    if (!organizationId) {
    throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
    const token = credentials.access_token;
    const { text, username, profilePicture, threadTs, file,blocks } = context.propsValue;
    
    const blockList = blocks ?[{ type: 'section', text: { type: 'mrkdwn', text } }, ...(blocks as unknown as (KnownBlock | Block)[])] :undefined


    return slackSendMessage({
    token,
      text,
      username,
      profilePicture,
      conversationId: channelId,
      threadTs: threadTs ? processMessageTimestamp(threadTs) : undefined,
      file,
      blocks: blockList,
    });
  },
});

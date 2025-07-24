import { createAction, PieceAuth, Property } from '@activepieces/pieces-framework';
import {
  profilePicture,
  slackChannel,
  username,
  blocks,
  singleSelectChannelInfo,
  previousNodeOutput
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
    apiEndpoint: Property.ShortText({
        displayName: 'API Endpoint',
        description: 'backend API endpoint to fetch Slack credentials',
        required: true,
        defaultValue: 'https://api.torvalds.dev/api/n8n/get_config_details'
    }),
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
    // const token = context.auth.access_token;
    const { text, previousNodeOutput, username, profilePicture, threadTs, file,blocks, apiEndpoint } = context.propsValue;

    const organizationId = previousNodeOutput['organizationId'] as string;
    const channelId = previousNodeOutput['channelId'] as string;
    // const threadTs = previousNodeOutput['threadTs'] as string;
    if (!organizationId) {
    throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
    
    const blockList = blocks ?[{ type: 'section', text: { type: 'mrkdwn', text } }, ...(blocks as unknown as (KnownBlock | Block)[])] :undefined

    const credentials = await SlackCredentialService
    .getInstance()
    .getCredentials(apiEndpoint, organizationId);

    return slackSendMessage({
    token: credentials.access_token,
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

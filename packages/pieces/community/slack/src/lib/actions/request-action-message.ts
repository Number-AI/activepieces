import { createAction } from '@activepieces/pieces-framework';
import { slackAuth } from '../..';
import { assertNotNullOrUndefined } from '@activepieces/shared';
import {
  profilePicture,
  text,
  slackChannel,
  username,
  actions,
  singleSelectChannelInfo,
  apiEndpoint,
  previousNodeOutput,
} from '../common/props';
import { requestAction } from '../common/request-action';
import { PieceAuth } from '@activepieces/pieces-framework';

export const requestActionMessageAction = createAction({
  auth: PieceAuth.None(),
  name: 'request_action_message',
  displayName: 'Request Action in A Channel',
  description:
    'Send a message in a channel and wait until an action is selected',
  props: {
    // info: singleSelectChannelInfo,
    // channel: slackChannel(true),
    text,
    actions,
    username,
    profilePicture,
    apiEndpoint,
    previousNodeOutput,
  },
  async run(context) {
    const channel = context.propsValue.previousNodeOutput['channelId'] as string;
    assertNotNullOrUndefined(channel, 'channel');

    return await requestAction(channel, context);
  },
});

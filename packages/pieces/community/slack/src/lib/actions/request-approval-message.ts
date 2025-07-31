import { createAction } from '@activepieces/pieces-framework';
import { slackSendMessage } from '../common/utils';
import { slackAuth } from '../..';
import {
  assertNotNullOrUndefined,
  ExecutionType,
  PauseType,
} from '@activepieces/shared';
import {
  profilePicture,
  singleSelectChannelInfo,
  slackChannel,
  text,
  username,
} from '../common/props';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';
import { PieceAuth } from '@activepieces/pieces-framework';

export const requestSendApprovalMessageAction = createAction({
  auth: PieceAuth.None(),
  name: 'request_approval_message',
  displayName: 'Request Approval in a Channel',
  description:
    'Send approval message to a channel and then wait until the message is approved or disapproved',
  props: {
    // info: singleSelectChannelInfo,
    // channel: slackChannel(true),
    text,
    username,
    profilePicture,
    apiEndpoint,
    previousNodeOutput,
  },
  async run(context) {
    if (context.executionType === ExecutionType.BEGIN) {
      context.run.pause({
        pauseMetadata: {
          type: PauseType.WEBHOOK,
          response: {},
        },
      });
      const { previousNodeOutput, apiEndpoint } = context.propsValue;
            const organizationId = previousNodeOutput['organizationId'] as string;
            if (!organizationId) {
              throw new Error("Input Processing must return an object with an 'organizationId'.");
            }
                              
            const credentials = await SlackCredentialService.getInstance().getCredentials(apiEndpoint, organizationId);
      const token = credentials.access_token;
      const { username, profilePicture, text } = context.propsValue;

      assertNotNullOrUndefined(token, 'token');
      assertNotNullOrUndefined(text, 'text');
      const channel = context.propsValue.previousNodeOutput['channelId'] as string;
      assertNotNullOrUndefined(channel, 'channel');
      const approvalLink = context.generateResumeUrl({
        queryParams: { action: 'approve' },
      });
      const disapprovalLink = context.generateResumeUrl({
        queryParams: { action: 'disapprove' },
      });

      await slackSendMessage({
        token,
        text: `${context.propsValue.text}\n\nApprove: ${approvalLink}\n\nDisapprove: ${disapprovalLink}`,
        username,
        profilePicture,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${context.propsValue.text}`,
            },
          },
          {
            type: 'actions',
            block_id: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Approve',
                },
                style: 'primary',
                url: approvalLink,
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Disapprove',
                },
                style: 'danger',
                url: disapprovalLink,
              },
            ],
          },
        ],
        conversationId: channel,
      });

      return {
        approved: false, // default approval is false
      };
    } else {
      return {
        approved: context.resumePayload.queryParams['action'] === 'approve',
      };
    }
  },
});

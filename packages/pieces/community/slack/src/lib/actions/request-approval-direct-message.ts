import { createAction } from '@activepieces/pieces-framework';
import { slackSendMessage } from '../common/utils';
import { PieceAuth } from '@activepieces/pieces-framework';
import {
  assertNotNullOrUndefined,
  ExecutionType,
  PauseType,
} from '@activepieces/shared';
import { profilePicture, text, userId, username } from '../common/props';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const requestApprovalDirectMessageAction = createAction({
  auth: PieceAuth.None(),
  name: 'request_approval_direct_message',
  displayName: 'Request Approval from A User',
  description:
    'Send approval message to a user and then wait until the message is approved or disapproved',
  props: {
    userId,
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
      const { userId, username, profilePicture } = context.propsValue;

      assertNotNullOrUndefined(token, 'token');
      assertNotNullOrUndefined(text, 'text');
      assertNotNullOrUndefined(userId, 'userId');
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
        conversationId: userId,
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

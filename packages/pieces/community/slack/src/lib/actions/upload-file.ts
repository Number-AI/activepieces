import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../index';
import { WebClient } from '@slack/web-api';
import {
  slackChannel,
  previousNodeOutput,
  apiEndpoint,
} from '../common/props';
import { PieceAuth } from '@activepieces/pieces-framework';
import { SlackCredentialService } from '../common/credential-service';
export const uploadFile = createAction({
  auth: PieceAuth.None(),
  name: 'uploadFile',
  displayName: 'Upload file',
  description: 'Upload file without sharing it to a channel or user',
  props: {
    file: Property.File({
      displayName: 'Attachment',
      required: true,
    }),
    title: Property.ShortText({
      displayName: 'Title',
      required: false,
    }),
    filename: Property.ShortText({
      displayName: 'Filename',
      required: false,
    }),
    // channel: slackChannel(false),
    previousNodeOutput,
    apiEndpoint,
  },
  async run(context) {
    const organizationId = context.propsValue.previousNodeOutput['organizationId'] as string;
    if (!organizationId) {
      throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
    const credentials = await SlackCredentialService.getInstance().getCredentials(context.propsValue.apiEndpoint, organizationId);
    const token = credentials.access_token;
    const { file, title, filename } = context.propsValue;
    const client = new WebClient(token);
    return await client.files.uploadV2({
      file_uploads: [{ file: file.data, filename: filename || file.filename }],
      title: title,
      channel_id: context.propsValue.previousNodeOutput['channelId'] as string,
    });
  },
});

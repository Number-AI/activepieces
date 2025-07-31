import { slackAuth } from '../../index';
import { AuthenticationType, httpClient, HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { WebClient } from '@slack/web-api';
import { PieceAuth } from '@activepieces/pieces-framework';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const getFileAction = createAction({
	auth: PieceAuth.None(),
	name: 'get-file',
	displayName: 'Get File',
	description: 'Return information about a given file ID.',
	props: {
		fileId: Property.ShortText({
			displayName: 'File ID',
			required: true,
			description: 'You can pass the file ID from the New Message Trigger payload.',
		}),
    previousNodeOutput,
    apiEndpoint,
	},
	async run(context) {

        const { previousNodeOutput, apiEndpoint } = context.propsValue;
        const organizationId = previousNodeOutput['organizationId'] as string;
        if (!organizationId) {
            throw new Error("Input Processing must return an object with an 'organizationId'.");
        }
                
        const credentials = await SlackCredentialService
                        .getInstance()
                        .getCredentials(apiEndpoint, organizationId);
		const client = new WebClient(credentials.access_token);

		const fileData = await client.files.info({ file: context.propsValue.fileId });

		const fileDownloadUrl = fileData.file?.url_private_download;

		if (!fileDownloadUrl) {
			throw new Error('Unable to find the download URL.');
		}

		const response = await httpClient.sendRequest({
			method: HttpMethod.GET,
			url: fileDownloadUrl,
			authentication: {
				type: AuthenticationType.BEARER_TOKEN,
				token: credentials.access_token,
			},
			responseType: 'arraybuffer',
		});

		return {
			...fileData.file,
			data: await context.files.write({
				fileName: fileData.file?.name || `file`,
				data: Buffer.from(response.body),
			}),
		};
	},
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const torvaldssendcustomemail = createAction({
  name: 'torvaldssendcustomemail',
  displayName: 'Torvalds Send Custom Email',
  description: 'Sends a customized email using the Torvalds email service.',
  props: {
    previousNodeOutput: Property.Json({
        displayName: 'Node Input',
        description: 'The full output from the previous node, e.g., {{trigger.body}}.',
        required: true,
    }),
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'The API endpoint for the email service.',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/n8n/send_email',
    }),
    toEmail: Property.ShortText({
        displayName: 'To Email',
        description: 'Recipient email address.',
        required: true,
    }),
    ccEmail: Property.ShortText({
        displayName: 'CC Email',
        description: 'CC recipient email address.',
        required: false,
    }),
    subject: Property.ShortText({
        displayName: 'Subject',
        description: 'Email subject.',
        required: true,
    }),
    bodyHtml: Property.LongText({
        displayName: 'Body (HTML)',
        description: 'Email body, which can include HTML.',
        required: true,
    })
  },

  async run(context) {
    const {
        previousNodeOutput,
        apiEndpoint,
        toEmail,
        ccEmail,
        subject,
        bodyHtml
    } = context.propsValue;

    try {
      const emailBody = {
        toEmail: toEmail,
        ccEmail: ccEmail || '',
        subject: subject,
        bodyHtml: bodyHtml,
      };

      if (!emailBody.toEmail) {
          throw new Error('The "To Email" field cannot be empty after processing.');
      }

      const apiResponse = await httpClient.sendRequest<any>({
        method: HttpMethod.POST,
        url: apiEndpoint,
        body: emailBody,
      });

      return { ...previousNodeOutput, emailResponse: apiResponse.body };

    } catch (error: any) {
        const errorMessage = error.response?.body?.message || error.message;
        throw new Error(`Custom Email Action Failed: ${errorMessage}`);
    }
  },
});
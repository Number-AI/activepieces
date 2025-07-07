import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const torvaldssendcustomemail = createAction({
  name: 'torvaldssendcustomemail',
  displayName: 'Torvalds Send Custom Email',
  description: 'Sends a customized email using the Torvalds email service.',
  props: {
    previousNodeOutput: Property.Json({
        displayName: 'Node Input',
        description: 'The full output from the previous node, e.g., {{trigger}}.',
        required: true,
    }),
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'The API endpoint for the email service.',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/n8n/send_email',
    }),
    inputProcessingCode: Property.LongText({
      displayName: 'Input Processing Code',
      description: 'JavaScript code to process input data. Must return an object.',
      required: false,
    }),
    toEmail: Property.ShortText({
        displayName: 'To Email',
        description: 'Recipient email address. Use {{variable}} for dynamic data.',
        required: true,
    }),
    ccEmail: Property.ShortText({
        displayName: 'CC Email',
        description: 'CC recipient email address. Use {{variable}} for dynamic data.',
        required: false,
    }),
    subject: Property.ShortText({
        displayName: 'Subject',
        description: 'Email subject. Use {{variable}} for dynamic data.',
        required: true,
    }),
    bodyHtml: Property.LongText({
        displayName: 'Body (HTML)',
        description: 'Email body, which can include HTML. Use {{variable}} for dynamic data.',
        required: true,
    }),
    outputProcessingCode: Property.LongText({
      displayName: 'Output Processing Code',
      description: 'JavaScript code to process the final result.',
      required: false,
    }),
  },

  async run(context) {
    const {
        previousNodeOutput,
        apiEndpoint,
        inputProcessingCode,
        toEmail,
        ccEmail,
        subject,
        bodyHtml,
        outputProcessingCode
    } = context.propsValue;

    try {
      let processedInput: any = previousNodeOutput;
      if (inputProcessingCode) {
        const inputFn = new Function('inputData', inputProcessingCode);
        processedInput = inputFn(previousNodeOutput);
      }

      const replaceTemplates = (text: string, data: any) => {
        if (!text) return '';
        return text.replace(/\{\{(.*?)\}\}/g, (_, path) =>
          path.trim().split('.').reduce((o: any, key: string) => o?.[key], data) ?? ''
        );
      };

      const emailBody = {
        toEmail: replaceTemplates(toEmail, processedInput),
        ccEmail: replaceTemplates(ccEmail || '', processedInput),
        subject: replaceTemplates(subject, processedInput),
        bodyHtml: replaceTemplates(bodyHtml, processedInput),
      };

      if (!emailBody.toEmail) {
          throw new Error('The "To Email" field cannot be empty after processing.');
      }

      const apiResponse = await httpClient.sendRequest<any>({
        method: HttpMethod.POST,
        url: apiEndpoint,
        body: emailBody,
      });

      if (outputProcessingCode) {
        const outputFn = new Function('context', `return (async () => { ${outputProcessingCode} })();`);
        return await outputFn({
          originalInput: previousNodeOutput,
          processedInput: processedInput,
          apiResponse: apiResponse.body
        });
      }

      return { ...processedInput, emailResponse: apiResponse.body };

    } catch (error: any) {
        const errorMessage = error.response?.body?.message || error.message;
        throw new Error(`Custom Email Action Failed: ${errorMessage}`);
    }
  },
});
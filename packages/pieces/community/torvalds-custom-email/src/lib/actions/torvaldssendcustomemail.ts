// File: /Users/aaspaas/Documents/numberlabs/activepieces/packages/pieces/community/torvalds-custom-email/src/lib/actions/torvaldssendcustomemail.ts

import { createAction } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { Property } from '@activepieces/pieces-framework';

export const torvaldssendcustomemail = createAction({
  name: 'torvaldssendcustomemail',
  displayName: 'TorvaldsSendCustomEmail',
  description: 'Custom Email Node from Torvalds',
  props: {
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'The API endpoint to call for sending emails',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/automation/send_email',
    }),
    inputProcessingCode: Property.ShortText({
      displayName: 'Input Processing Code',
      description: 'JavaScript code to process input data before sending to the API',
      required: true,
      defaultValue: `// Example: Format input data for email sending
const email = {
  toEmail: inputData.toEmail,  
  ccEmail: inputData.ccEmail || '',
  subject: \`Subject: \${inputData.subject || 'No Subject'}\`,
  bodyHtml: \`<p>Hello,</p><p>\${inputData.body || 'No body content'}</p>\`
};

return email;`,
    }),
    outputProcessingCode: Property.ShortText({
      displayName: 'Output Processing Code',
      description: 'JavaScript code to process the API response',
      required: false,
      defaultValue: `// Process API response
return {
  ...inputData,
  emailSent: apiResponse.success,
  emailMessage: apiResponse.message
};`,
    }),
  },
  async run(context) {
    const apiEndpoint = context.propsValue.apiEndpoint;
    const inputProcessingCode = context.propsValue.inputProcessingCode;
    const outputProcessingCode = context.propsValue.outputProcessingCode;

    try {
      // Process input data
      const processInputFunction = new Function(
        'inputData',
        inputProcessingCode || 'return inputData;'
      );
      
      const processedInput = processInputFunction(context.propsValue);
      console.log('Processed input:', processedInput);

      // Make API call
      const response = await httpClient.sendRequest({
        method: HttpMethod.POST,
        url: apiEndpoint,
        body: {
          toEmail: processedInput.toEmail,
          ccEmail: processedInput.ccEmail,
          subject: processedInput.subject,
          bodyHtml: processedInput.bodyHtml
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Process output
      if (outputProcessingCode) {
        const processOutputFunction = new Function(
          'apiResponse',
          'inputData',
          outputProcessingCode
        );
        return processOutputFunction(response.body, context.propsValue);
      }

      return {
        ...context.propsValue,
        emailResponse: response.body
      };
    } catch (error) {
      console.error('Error in TorvaldsCustomEmail:', error);
      throw error;
    }
  },
});
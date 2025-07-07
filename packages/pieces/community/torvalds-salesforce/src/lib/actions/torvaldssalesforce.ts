import { createAction, Property } from '@activepieces/pieces-framework';
import axios from 'axios';

export const torvaldssalesforce = createAction({
  name: 'torvaldssalesforce',
  displayName: 'TorvaldsSalesforce',
  description: 'Execute SOQL queries in Salesforce using your Torvalds organization configuration',
  props: {
    previousNodeOutput: Property.Json({
      displayName: 'Previous Node Output (for context)',
      description: 'The full output from the previous node. Use this to map data into the prompts below.',
      required: true,
    }),
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'Torvalds API endpoint to fetch organization configuration',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/n8n/get_config_details',
    }),
    soqlQuery: Property.LongText({
      displayName: 'SOQL Query',
      description: 'The SOQL query to execute. Use {{variable}} for dynamic values',
      required: true,
      defaultValue: 'SELECT Id, Name FROM Account LIMIT 10'
    }),
    inputProcessingCode: Property.LongText({
      displayName: 'Input Processing',
      description: 'JavaScript code to process input data before executing query',
      required: false,
      defaultValue: ''
    }),
    outputProcessingCode: Property.LongText({
      displayName: 'Output Processing',
      description: 'JavaScript code to process Salesforce response',
      required: false,
      defaultValue: ''
    })
  },
  async run(context: any) {
    const {
      apiEndpoint,
      soqlQuery,
      inputProcessingCode,
      outputProcessingCode,
      previousNodeOutput
    } = context.propsValue;

    try {
      // Process the input data
      let processedInput = previousNodeOutput;
      if (inputProcessingCode) {
        const inputProcessingFn = new Function(
          'inputData', 
          inputProcessingCode
        );
        processedInput = inputProcessingFn(previousNodeOutput);
        console.log('Processed input:', processedInput);
      }

      // Get Salesforce config from organization config
      const configResponse = await axios.post(apiEndpoint, {
        organizationId: processedInput.organizationId
      });
      
      const orgConfig = configResponse.data.organizationConfig;
      
      if (!orgConfig || !orgConfig.salesforce_access_token || !orgConfig.salesforce_instance_url) {
        throw new Error('Salesforce credentials not found in organization config');
      }

      const processedQuery = soqlQuery.replace(/\{\{(.*?)\}\}/g, (match: any, p1: any) => {
        try {
          return eval(`processedInput.${p1.trim()}`);
        } catch (e: any) {
          console.error(`Failed to evaluate template: ${p1}`, e);
          return match;
        }
      });
      
      const accessToken = orgConfig.salesforce_access_token;
      const instanceUrl = orgConfig.salesforce_instance_url;
      const apiVersion = '57.0';
      
      console.log('Executing SOQL query:', processedQuery);
      
      const encodedQuery = encodeURIComponent(processedQuery);
      const apiResponse = await axios.get(
        `${instanceUrl}/services/data/v${apiVersion}/query/?q=${encodedQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      let finalResult = apiResponse.data;
      if (outputProcessingCode) {
        const outputProcessingFn = new Function('context', `return (async () => { ${outputProcessingCode} })().call(null, context)`);
        finalResult = await outputProcessingFn({
          originalInput: previousNodeOutput,
          processedInput: processedInput,
          apiResponse: apiResponse.data
        });
      }

      return finalResult;

    } catch (error) {
      console.error('Error in TorvaldsSalesforce:', error);
      throw error;
    }
  },
});
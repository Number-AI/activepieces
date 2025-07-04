import { createAction, Property } from '@activepieces/pieces-framework';
import axios from 'axios';

export const torvaldssalesforce = createAction({
  name: 'torvaldssalesforce',
  displayName: 'TorvaldsSalesforce',
  description: 'Execute SOQL queries in Salesforce using your Torvalds organization configuration',
  props: {
    organizationId: Property.ShortText({
      displayName: 'Organization ID',
      description: 'The Torvalds organization ID to fetch Salesforce configuration',
      required: true,
    }),
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'Torvalds API endpoint to fetch organization configuration',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/automation/get_config_details',
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
      defaultValue: `// Example: Extract data from previous steps
return { 
  accountName: inputData.accountName 
};`
    }),
    outputProcessingCode: Property.LongText({
      displayName: 'Output Processing',
      description: 'JavaScript code to process Salesforce response',
      required: false,
      defaultValue: `// Example: Format API response
return { 
  ...inputData,
  records: apiResponse.records,
  done: apiResponse.done,
  totalSize: apiResponse.totalSize 
};`
    })
  },
  async run(context) {
    const {
      organizationId,
      apiEndpoint,
      soqlQuery,
      inputProcessingCode,
      outputProcessingCode
    } = context.propsValue;

    try {
      // Process the input data
      let processedInput = context.propsValue;
      if (inputProcessingCode) {
        const inputProcessingFn = new Function(
          'inputData', 
          inputProcessingCode
        );
        processedInput = inputProcessingFn(context.propsValue);
        console.log('Processed input:', processedInput);
      }

      // Get Salesforce config from organization config
      const configResponse = await axios.post(apiEndpoint, {
        organizationId: organizationId
      });
      
      const orgConfig = configResponse.data.organizationConfig;
      
      if (!orgConfig || !orgConfig.salesforce_access_token || !orgConfig.salesforce_instance_url) {
        throw new Error('Salesforce credentials not found in organization config');
      }

      // Process SOQL query with template variables
      const processedQuery = soqlQuery.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
        try {
          return eval(`processedInput.${p1.trim()}`);
        } catch (e) {
          console.error(`Failed to evaluate template: ${p1}`, e);
          return match;
        }
      });
      
      // Execute the SOQL query
      const accessToken = orgConfig.salesforce_access_token;
      const instanceUrl = orgConfig.salesforce_instance_url;
      const apiVersion = '57.0';
      
      console.log('Executing SOQL query:', processedQuery);
      
      const encodedQuery = encodeURIComponent(processedQuery);
      const salesforceResponse = await axios.get(
        `${instanceUrl}/services/data/v${apiVersion}/query/?q=${encodedQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Process the output
      if (outputProcessingCode) {
        const outputProcessingFn = new Function(
          'apiResponse',
          'inputData',
          outputProcessingCode
        );
        
        return outputProcessingFn(salesforceResponse.data, processedInput);
      }
      
      return {
        ...processedInput,
        apiResponse: salesforceResponse.data
      };
      
    } catch (error) {
      console.error('Error in TorvaldsSalesforce:', error);
      throw error;
    }
  },
});
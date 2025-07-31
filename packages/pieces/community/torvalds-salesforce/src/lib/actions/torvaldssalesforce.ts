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
      defaultValue: ''
    })
  },
  async run(context: any) {
    const {
      apiEndpoint,
      soqlQuery,
      previousNodeOutput
    } = context.propsValue;

    try {

      // Get Salesforce config from organization config
      const configResponse = await axios.post(apiEndpoint, {
        organizationId: previousNodeOutput['organizationId']
      }, {
        headers: {
          'Authorization': `Bearer 7DE8BC19A19C97AE2864BA7FAF46F`
        }
      });
      
      const orgConfig = configResponse.data.organizationConfig;
      
      if (!orgConfig || !orgConfig.salesforce_access_token || !orgConfig.salesforce_instance_url) {
        throw new Error('Salesforce credentials not found in organization config');
      }
      
      const accessToken = orgConfig.salesforce_access_token;
      const instanceUrl = orgConfig.salesforce_instance_url;
      const apiVersion = '57.0';
      
      const encodedQuery = encodeURIComponent(soqlQuery);
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
      return finalResult;
    } catch (error) {
      console.error('Error in TorvaldsSalesforce:', error);
      throw error;
    }
  },
});
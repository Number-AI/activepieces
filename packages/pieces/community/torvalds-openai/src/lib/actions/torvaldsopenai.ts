import { createAction, Property } from '@activepieces/pieces-framework';
import axios from 'axios';

export const torvaldsopenai = createAction({
  name: 'torvaldsopenai',
  displayName: 'TorvaldsOpenAI',
  description: 'A generic OpenAI node',
  props: {
    previousNodeOutput: Property.Json({
      displayName: 'Node Input',
      description: 'The full output from the previous node, e.g., {{trigger}}.',
      required: true,
    }),
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'Torvalds API endpoint to fetch organization configuration.',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/n8n/get_config_details',
    }),
    endpointType: Property.StaticDropdown({
        displayName: 'OpenAI Endpoint',
        description: 'The type of OpenAI API to call.',
        required: true,
        options: {
            options: [
                { label: 'Chat Completions', value: 'chat_completions' },
            ]
        },
        defaultValue: 'chat_completions'
    }),
    model: Property.ShortText({
      displayName: 'Model',
      description: 'The OpenAI model to use (e.g., gpt-4o-mini).',
      required: true,
      defaultValue: 'gpt-4o-mini',
    }),
    systemPrompt: Property.LongText({
      displayName: 'System Prompt',
      description: 'The system prompt for the AI model (Chat Completions only).',
      required: false,
    }),
    userPrompt: Property.LongText({
        displayName: 'User Prompt / Input Text',
        description: 'The user message.',
        required: true,
    }),
  },

  async run(context) {
    const {
      previousNodeOutput,
      apiEndpoint,
      endpointType,
      model,
      systemPrompt,
      userPrompt,
    } = context.propsValue;

    try {
      const organizationId = previousNodeOutput['organizationId'];
      if (!organizationId) {
        throw new Error("Input Processing must return an object with an 'organizationId'.");
      }

      const configResponse = await axios.post(apiEndpoint, { organizationId });
      const openai_api_key = configResponse.data.openai_api_key;
      if (!openai_api_key) {
        throw new Error('OpenAI API key not found in organization config.');
      }

      let apiUrl = '';
      let requestBody = {};

      if (endpointType === 'chat_completions') {
          apiUrl = 'https://api.openai.com/v1/chat/completions';
          requestBody = {
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            response_format: { type: "json_object" }
          };
      } else {
          throw new Error(`Unsupported endpoint type: ${endpointType}`);
      }

      const apiResponse = await axios.post(apiUrl, requestBody, {
        headers: { 'Authorization': `Bearer ${openai_api_key}` }
      });

      return { ...JSON.parse(apiResponse.data.choices[0].message.content || '{}') };

    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`OpenAI Action Failed: ${errorMessage}`);
    }
  },
});
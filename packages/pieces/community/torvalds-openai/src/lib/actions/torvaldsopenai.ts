import { createAction, Property } from '@activepieces/pieces-framework';
import axios from 'axios';

export const torvaldsopenai = createAction({
  name: 'torvaldsopenai',
  displayName: 'TorvaldsOpenAI',
  description: 'OpenAI Custom Node from Torvalds',
  props: {
    organizationId: Property.ShortText({
      displayName: 'Organization ID',
      description: 'The Torvalds organization ID to fetch OpenAI configuration',
      required: true,
    }),
    apiEndpoint: Property.ShortText({
      displayName: 'API Endpoint',
      description: 'Torvalds API endpoint to fetch organization configuration',
      required: true,
      defaultValue: 'https://api.torvalds.dev/api/get_config_details',
    }),
    prompt: Property.LongText({
      displayName: 'Prompt',
      description: 'The prompt to send to OpenAI',
      required: true,
    }),
    model: Property.StaticDropdown({
      displayName: 'Model',
      description: 'The OpenAI model to use',
      required: true,
      defaultValue: 'gpt-4o-mini',
      options: {
        options: [
          { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
        ]
      }
    }),
    inputProcessingCode: Property.ShortText({
      displayName: 'Input Processing',
      description: 'JavaScript code to process input data before sending to OpenAI',
      required: false,
      defaultValue: 'return inputData;'
    }),
    outputProcessingCode: Property.ShortText({
      displayName: 'Output Processing',
      description: 'JavaScript code to process OpenAI response',
      required: false,
      defaultValue: 'return { result: inputData };'
    })
  },
  async run(context) {
    const {
      organizationId,
      apiEndpoint,
      prompt,
      model,
      inputProcessingCode,
      outputProcessingCode
    } = context.propsValue;

    // 1. Process the input data using the user-provided code
    let processedInput;
    try {
      // Create a function from the provided code and execute it
      const inputProcessingFn = new Function('inputData', inputProcessingCode || '');
      processedInput = inputProcessingFn(context.propsValue);
    } catch (error: any) {
      throw new Error(`Error in input processing code: ${error}`);
    }

    // 2. Get OpenAI API key from organization config
    let openai_api_key, orgConfig;
    try {
      const response = await axios.get(`${apiEndpoint}/${organizationId}`);
      orgConfig = response.data.orgConfig;
      openai_api_key = response.data.openai_api_key;
      
      if (!openai_api_key) {
        throw new Error('OpenAI API key not found in organization config');
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch organization config: ${error}`);
    }

    // 3. Call OpenAI API with processed input
    let openAIResponse;
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
                try {
                  return eval(`processedInput.${p1.trim()}`);
                } catch {
                  return match;
                }
              })
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openai_api_key}` // Using claude_api_key assuming it contains OpenAI key
          }
        }
      );
      
      openAIResponse = response.data;
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error}`);
    }

    // 4. Process the output data
    try {
      const outputProcessingFn = new Function('inputData', outputProcessingCode || '');
      const processedOutput = outputProcessingFn({
        ...processedInput,
        openAIResponse,
        result: openAIResponse?.choices?.[0]?.message?.content || ''
      });
      return processedOutput;
    } catch (error: any) {
      throw new Error(`Error in output processing code: ${error}`);
    }
  },
});
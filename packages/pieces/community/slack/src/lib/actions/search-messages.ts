import { createAction, Property } from '@activepieces/pieces-framework';
import { PieceAuth } from '@activepieces/pieces-framework';
import { WebClient } from '@slack/web-api';
import { previousNodeOutput, apiEndpoint } from '../common/props';
import { SlackCredentialService } from '../common/credential-service';

export const searchMessages = createAction({
  name: 'searchMessages',
  displayName: 'Search messages',
  description: 'Searches for messages matching a query',
  auth: PieceAuth.None(),
  props: {
    query: Property.ShortText({
      displayName: 'Search query',
      required: true,
    }),
    previousNodeOutput,
    apiEndpoint,
  },
  async run({ auth, propsValue }) {
    const { previousNodeOutput, apiEndpoint } = propsValue;
    const organizationId = previousNodeOutput['organizationId'] as string;
    if (!organizationId) {
      throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
                            
    const credentials = await SlackCredentialService.getInstance().getCredentials(apiEndpoint, organizationId);
    const userToken = credentials.access_token;
    if (userToken === undefined) {
      throw new Error(JSON.stringify(
        {
          message: 'Missing user token, please re-authenticate'
        }
      ));
    }
    const client = new WebClient(userToken);
    const matches = [];

    // We can't use the usual "for await ... of" syntax with client.paginate
    // Because search.messages uses a bastardized version of cursor-based pagination
    // Where you need to pass * as first cursor
    // https://api.slack.com/methods/search.messages#arg_cursor
    let cursor = '*';
    do {
      const page = await client.search.messages({
        query: propsValue.query,
        count: 100,
        // @ts-expect-error TS2353 - SDK is not aware cursor is actually supported
        cursor,
      });
      if (page.messages?.matches) {
        matches.push(...page.messages.matches);
      }
      // @ts-expect-error TS2353 - SDK is not aware next_cursor is actually returned
      cursor = page.messages?.pagination?.next_cursor;
    } while (cursor);

    return matches;
  },
});

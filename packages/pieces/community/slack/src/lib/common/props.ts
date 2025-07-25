import { OAuth2PropertyValue, Property } from '@activepieces/pieces-framework';
import { UsersListResponse, WebClient } from '@slack/web-api';
import { SlackCredentialService } from './credential-service';

const slackChannelBotInstruction = `
	Please make sure add the bot to the channel by following these steps:
	  1. Type /invite in the channel's chat.
	  2. Click on Add apps to this channel.
	  3. Search for and add the bot.
  `

export const multiSelectChannelInfo = Property.MarkDown({
  value: slackChannelBotInstruction +
    `\n**Note**: If you can't find the channel in the dropdown list (which fetches up to 2000 channels), please click on the **(F)** and type the channel ID directly in an array like this: \`{\`{ ['your_channel_id_1', 'your_channel_id_2', ...] \`}\`}`,
});

export const singleSelectChannelInfo = Property.MarkDown({
  value: slackChannelBotInstruction +
    `\n**Note**: If you can't find the channel in the dropdown list (which fetches up to 2000 channels), please click on the **(F)** and type the channel ID directly.
  `,
});

export const slackChannel = <R extends boolean>(required: R) =>
  Property.Dropdown<string, R>({
    displayName: 'Channel',
    description:
      "You can get the Channel ID by right-clicking on the channel and selecting 'View Channel Details.'",
    required,
    refreshers: [],
    async options(context) {
      const { auth, propsValue } = context;
      if (!auth) {
        return {
          disabled: true,
          placeholder: 'connect slack account',
          options: [],
        };
      }
      const { previousNodeOutput, apiEndpoint } = propsValue as Record<string, any>;
      const organizationId = previousNodeOutput['organizationId'] as string;
      if (!organizationId) {
          throw new Error("Input Processing must return an object with an 'organizationId'.");
      }
      
      const credentials = await SlackCredentialService
                        .getInstance()
                        .getCredentials(apiEndpoint, organizationId);
      const authentication = auth as OAuth2PropertyValue;
      const accessToken = credentials.access_token;

      const channels = await getChannels(accessToken);

      return {
        disabled: false,
        placeholder: 'Select channel',
        options: channels,
      };
    },
  });

export const username = Property.ShortText({
  displayName: 'Username',
  description: 'The username of the bot',
  required: false,
  defaultValue: 'TorvaldsFlows'
});

export const profilePicture = Property.ShortText({
  displayName: 'Profile Picture',
  description: 'The profile picture of the bot',
  required: false,
});

export const blocks = Property.Json({
  displayName: 'Block Kit blocks',
  description: 'See https://api.slack.com/block-kit for specs',
  required: false,
});

export const userId = Property.Dropdown<string>({
  displayName: 'User',
  required: true,
  refreshers: [],
  async options(context) {
    const { auth, propsValue } = context;
    if (!auth) {
      return {
        disabled: true,
        placeholder: 'connect slack account',
        options: [],
      };
    }

    const { previousNodeOutput, apiEndpoint } = propsValue as Record<string, any>;
    const organizationId = previousNodeOutput['organizationId'] as string;
    if (!organizationId) {
        throw new Error("Input Processing must return an object with an 'organizationId'.");
    }
    
    const credentials = await SlackCredentialService
                    .getInstance()
                    .getCredentials(apiEndpoint, organizationId);
    const accessToken = credentials.access_token;

    const client = new WebClient(accessToken);
    const users: { label: string; value: string }[] = [];
    for await (const page of client.paginate('users.list', {
      limit: 1000, // Only limits page size, not total number of results
    })) {
      const response = page as UsersListResponse;
      if (response.members) {
        users.push(
          ...response.members
            .filter((member) => !member.deleted)
            .map((member) => {
              return { label: member.name || '', value: member.id || '' };
            })
        );
      }
    }
    return {
      disabled: false,
      placeholder: 'Select User',
      options: users,
    };
  },
});

export const text = Property.LongText({
  displayName: 'Message',
  required: true,
});

export const actions = Property.Array({
  displayName: 'Action Buttons',
  required: true,
});

export async function getChannels(accessToken: string) {
  const client = new WebClient(accessToken);
  const channels: { label: string; value: string }[] = [];
  const CHANNELS_LIMIT = 2000;

  let cursor;
  do {
    const response = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: 1000,
      cursor,
    });

    if (response.channels) {
      channels.push(
        ...response.channels.map((channel) => {
          return { label: channel.name || '', value: channel.id || '' };
        })
      );
    }

    cursor = response.response_metadata?.next_cursor;
  } while (cursor && channels.length < CHANNELS_LIMIT);

  return channels;
}

export const previousNodeOutput = Property.Json({
    displayName: 'Node Input',
    description: 'The full output from the previous node, e.g., {{trigger}}.',
    required: true,
});

export const apiEndpoint = Property.ShortText({
    displayName: 'API Endpoint',
    description: 'Backend API endpoint to fetch Slack credentials',
    required: true,
    defaultValue: 'https://api.torvalds.dev/api/n8n/get_config_details'
});
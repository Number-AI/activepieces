import axios from 'axios';
import { httpClient, HttpMethod } from "@activepieces/pieces-common";

interface SlackCredentials {
  access_token: string;
  team_id?: string;
  bot_user_id?: string;
}

export type SlackAuth = {
    access_token: string;
    data: {
        team_id: string;
        team: {
            id: string;
        };
        authed_user: {
            id: string;
            access_token: string;
        };
    };
    apiEndpoint: string;
    organizationId: string;
};

export class SlackCredentialService {
  private static instance: SlackCredentialService;
  private credentials: Map<string, SlackCredentials> = new Map();

  private constructor() {}

  static getInstance(): SlackCredentialService {
    if (!SlackCredentialService.instance) {
      SlackCredentialService.instance = new SlackCredentialService();
    }
    return SlackCredentialService.instance;
  }

  async getCredentials(apiEndpoint: string, organizationId: string): Promise<SlackCredentials> {
    const cacheKey = `${apiEndpoint}:${organizationId}`;
    
    if (!this.credentials.has(cacheKey)) {
      try {
        const response = await axios.post(apiEndpoint, {
          organizationId
        });
        
        // Check for the new response structure with slack_bot_details
        const slackData = response.data.slack_bot_details || response.data;
        
        if (!slackData.access_token) {
          throw new Error('No access token returned from backend service');
        }
        
        const credentials: SlackCredentials = {
          access_token: slackData.access_token,
          team_id: slackData.team_id,
          bot_user_id: slackData.bot_user_id
        };
        
        this.credentials.set(cacheKey, credentials);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch Slack credentials: ${errorMessage}`);
      }
    }

    return this.credentials.get(cacheKey)!;
  }
}
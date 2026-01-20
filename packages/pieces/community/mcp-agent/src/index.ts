import {
  createPiece,
  PieceAuth,
} from "@activepieces/pieces-framework";
import { callMcpTool } from "./actions/call-tool";

export const mcpAgent = createPiece({
  displayName: "Sample MCP",
  auth: PieceAuth.None(),
  minimumSupportedRelease: "0.0.0",
  logoUrl: "https://cdn.activepieces.com/pieces/openai.png",
  authors: [],
  actions: [callMcpTool],
  triggers: [],
});

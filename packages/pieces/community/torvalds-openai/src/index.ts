
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { torvaldsopenai } from "./lib/actions/torvaldsopenai";

    export const torvaldsOpenai = createPiece({
      displayName: "TorvaldsOpenAI",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/torvalds-openai.png",
      authors: [],
      actions: [torvaldsopenai],
      triggers: [],
    });
    
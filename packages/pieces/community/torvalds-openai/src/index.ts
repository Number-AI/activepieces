
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { torvaldsopenai } from "./lib/actions/torvaldsopenai";
import { TORVALDS_LOGO_DATA_URI } from '@activepieces/pieces-common';

    export const torvaldsOpenai = createPiece({
      displayName: "TorvaldsOpenAI",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: TORVALDS_LOGO_DATA_URI,
      authors: [],
      actions: [torvaldsopenai],
      triggers: [],
    });
    
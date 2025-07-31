
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { torvaldssendcustomemail } from "./lib/actions/torvaldssendcustomemail";
import { TORVALDS_LOGO_DATA_URI } from '@activepieces/pieces-common';

    export const torvaldsCustomEmail = createPiece({
      displayName: "TorvaldsCustomEmail",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: TORVALDS_LOGO_DATA_URI,
      authors: [],
      actions: [torvaldssendcustomemail],
      triggers: [],
    });
    
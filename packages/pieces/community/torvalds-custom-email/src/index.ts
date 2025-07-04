
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { torvaldssendcustomemail } from "./lib/actions/torvaldssendcustomemail";

    export const torvaldsCustomEmail = createPiece({
      displayName: "TorvaldsCustomEmail",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/torvalds-custom-email.png",
      authors: [],
      actions: [torvaldssendcustomemail],
      triggers: [],
    });
    
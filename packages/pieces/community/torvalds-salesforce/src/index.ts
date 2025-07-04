
    import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { torvaldssalesforce } from "./lib/actions/torvaldssalesforce";

    export const torvaldsSalesforce = createPiece({
      displayName: "TorvaldsSalesforce",
      auth: PieceAuth.None(),
      minimumSupportedRelease: '0.36.1',
      logoUrl: "https://cdn.activepieces.com/pieces/torvalds-salesforce.png",
      authors: [],
      actions: [torvaldssalesforce],
      triggers: [],
    });
    
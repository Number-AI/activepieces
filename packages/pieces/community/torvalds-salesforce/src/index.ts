import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { torvaldssalesforce as torvaldsSalesforceAction } from "./lib/actions/torvaldssalesforce";
import { TORVALDS_LOGO_DATA_URI } from '@activepieces/pieces-common';
export const torvaldsSalesforce = createPiece({
  displayName: "TorvaldsSalesforce",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.36.1',
  logoUrl: TORVALDS_LOGO_DATA_URI,
  authors: [],
  actions: [torvaldsSalesforceAction],
  triggers: [],
});
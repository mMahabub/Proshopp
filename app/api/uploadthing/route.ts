import { createRouteHandler } from 'uploadthing/next'

import { ourFileRouter } from '@/lib/uploadthing'

/**
 * UploadThing API Route Handlers
 *
 * This file creates the necessary API endpoints for UploadThing:
 * - GET /api/uploadthing - Returns upload configuration
 * - POST /api/uploadthing - Handles file uploads
 *
 * The routes use the file router configuration from lib/uploadthing.ts
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    /**
     * Optional: Configure the upload behavior
     *
     * callbackUrl: Custom callback URL after upload (defaults to current origin)
     * uploadthingId: Your UploadThing app ID (from env vars)
     * uploadthingSecret: Your UploadThing secret (from env vars)
     */
  },
})

import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/auth'

const f = createUploadthing()

/**
 * UploadThing File Router
 *
 * This defines the file upload configuration for the application.
 * Currently supports product image uploads for admin users.
 */
export const ourFileRouter = {
  /**
   * Product Image Uploader
   *
   * Restrictions:
   * - Only authenticated admin users can upload
   * - Maximum 5 images per upload
   * - Maximum 4MB per image
   * - Only image files (jpeg, png, webp, gif)
   */
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      // Verify user is authenticated and has admin role
      const session = await auth()

      if (!session?.user) {
        throw new Error('Unauthorized: You must be signed in to upload images')
      }

      if (session.user.role !== 'admin') {
        throw new Error('Forbidden: Only admin users can upload product images')
      }

      // Pass user info to onUploadComplete
      return { userId: session.user.id, userName: session.user.name }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Log upload completion for debugging/monitoring
      console.log('Product image uploaded by user:', metadata.userName)
      console.log('File URL:', file.url)
      console.log('File name:', file.name)
      console.log('File size:', file.size, 'bytes')

      // Return file info to the client
      return {
        url: file.url,
        name: file.name,
        size: file.size,
        uploadedBy: metadata.userId,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

'use client'

import { useState } from 'react'
import ProductImageUpload from '@/components/shared/product/product-image-upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Demo page for ProductImageUpload component (TASK-501)
 * This page demonstrates the image upload functionality
 *
 * Features demonstrated:
 * - Upload up to 5 images (4MB each)
 * - Image preview grid
 * - Remove images
 * - Reorder images (move up/down)
 * - Primary image indicator
 * - Empty state
 * - Toast notifications
 */
export default function DemoUploadPage() {
  const [images, setImages] = useState<string[]>([])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Product Image Upload Demo
        </h1>
        <p className="text-muted-foreground text-lg">
          TASK-501: UploadThing Integration Demo
        </p>
      </div>

      {/* Component Demo Card */}
      <Card>
        <CardHeader>
          <CardTitle>ProductImageUpload Component</CardTitle>
          <CardDescription>
            Upload product images with preview, remove, and reorder functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImageUpload
            images={images}
            onChange={setImages}
            maxImages={5}
          />
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            This component includes the following features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>✅ Upload up to 5 images (4MB max per image)</li>
            <li>✅ Supported formats: JPEG, PNG, WebP, GIF</li>
            <li>✅ Image preview grid (responsive)</li>
            <li>✅ Remove image functionality</li>
            <li>✅ Reorder images (move up/down)</li>
            <li>✅ Primary image indicator (first image)</li>
            <li>✅ Empty state with instructions</li>
            <li>✅ Toast notifications for all actions</li>
            <li>✅ Upload progress feedback</li>
            <li>✅ Admin-only access (enforced by middleware)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current State Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
          <CardDescription>
            Images uploaded: {images.length}/5
          </CardDescription>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">No images uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {images.map((url, index) => (
                <div key={url} className="text-sm">
                  <span className="font-medium">Image {index + 1}</span>
                  {index === 0 && <span className="text-primary ml-2">(Primary)</span>}
                  <p className="text-muted-foreground truncate">{url}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

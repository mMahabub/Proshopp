'use server';

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { insertProductSchema } from '../validators';


// Helper function to verify admin access
async function verifyAdmin() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/')
  }

  return session
}


// get latest products

export async function getLatestProducts() {


    const data = await prisma.product.findMany({
        take: LATEST_PRODUCTS_LIMIT,
        orderBy: { createdAt: 'desc'}
    })

    return convertToPlainObject(data);

}

//Get featured products for carousel
export async function getFeaturedProducts() {
    const data = await prisma.product.findMany({
        where: { isFeatured: true },
        take: 8,
        orderBy: { createdAt: 'desc' }
    })

    return convertToPlainObject(data);
}

//Get single product by it's slug

export async function getProductBySlug(slug:string) {
    return await prisma.product.findFirst({
        where: { slug: slug},
    })

}


// ============================================
// ADMIN PRODUCT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get all products with pagination, search, and filtering
 * Admin only
 */
export async function getAllProducts(params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
}) {
  await verifyAdmin()

  try {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (params?.search) {
      where.OR = [
        {
          name: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: params.search,
            mode: 'insensitive' as const,
          },
        },
      ]
    }

    if (params?.category) {
      where.category = params.category
    }

    // Get total count
    const totalCount = await prisma.product.count({ where })

    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    return {
      success: true,
      data: {
        products: convertToPlainObject(products),
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
    }
  }
}

/**
 * Get single product by ID
 * Admin only
 */
export async function getProductById(id: string) {
  await verifyAdmin()

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    return {
      success: true,
      data: convertToPlainObject(product),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product',
    }
  }
}

/**
 * Create new product
 * Admin only
 */
export async function createProduct(formData: FormData) {
  await verifyAdmin()

  try {
    // Parse form data
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      category: formData.get('category') as string,
      brand: formData.get('brand') as string,
      description: formData.get('description') as string,
      stock: Number(formData.get('stock')),
      images: JSON.parse(formData.get('images') as string),
      isFeatured: formData.get('isFeatured') === 'true',
      banner: formData.get('banner') as string | null,
      price: formData.get('price') as string,
    }

    // Validate data
    const validated = insertProductSchema.parse(data)

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return {
        success: false,
        error: 'A product with this slug already exists',
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: validated,
    })

    // Revalidate pages
    revalidatePath('/admin/products')
    revalidatePath('/')

    return {
      success: true,
      data: convertToPlainObject(product),
      message: 'Product created successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    }
  }
}

/**
 * Update existing product
 * Admin only
 */
export async function updateProduct(id: string, formData: FormData) {
  await verifyAdmin()

  try {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Parse form data
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      category: formData.get('category') as string,
      brand: formData.get('brand') as string,
      description: formData.get('description') as string,
      stock: Number(formData.get('stock')),
      images: JSON.parse(formData.get('images') as string),
      isFeatured: formData.get('isFeatured') === 'true',
      banner: formData.get('banner') as string | null,
      price: formData.get('price') as string,
    }

    // Validate data
    const validated = insertProductSchema.parse(data)

    // Check if slug is being changed and if new slug already exists
    if (validated.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validated.slug },
      })

      if (slugExists) {
        return {
          success: false,
          error: 'A product with this slug already exists',
        }
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: validated,
    })

    // Revalidate pages
    revalidatePath('/admin/products')
    revalidatePath(`/product/${product.slug}`)
    revalidatePath('/')

    return {
      success: true,
      data: convertToPlainObject(product),
      message: 'Product updated successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    }
  }
}

/**
 * Delete product
 * Admin only
 */
export async function deleteProduct(id: string) {
  await verifyAdmin()

  try {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    })

    // Revalidate pages
    revalidatePath('/admin/products')
    revalidatePath('/')

    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    }
  }
}
'use server';

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";
import { LATEST_PRODUCTS_LIMIT } from "../constants";


// get latest producta

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
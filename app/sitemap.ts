import type { MetadataRoute } from "next";
import { models } from "@/data/models";
import { problems } from "@/data/problems";
import { getStoreProducts } from "@/lib/product-store";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:4173";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getStoreProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/engines`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/problems`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/wholesale`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/shipping`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/returns`, changeFrequency: "yearly", priority: 0.4 }
  ];

  const problemRoutes: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${SITE_URL}/problems/${problem.slug}`,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const modelRoutes: MetadataRoute.Sitemap = models.map((model) => ({
    url: `${SITE_URL}/engines/${model.slug}`,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes, ...problemRoutes, ...modelRoutes];
}

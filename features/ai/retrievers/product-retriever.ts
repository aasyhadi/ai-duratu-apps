import {
  getProducts,
} from "@/features/products/queries/get-products";

import type {
  Product,
} from "@/features/products/types/product";

import type {
  ProductKnowledgeContext,
  ProductKnowledgeItem,
  ProductQueryAnalysis,
} from "@/features/ai/types/product-knowledge";

const PAGE_SIZE =
  100;

function normalizeSearch(
  value: string,
): string {
  return value
    .toLocaleLowerCase(
      "id-ID",
    )
    .normalize("NFKD")
    .trim();
}

function mapProduct(
  product: Product,
): ProductKnowledgeItem {
  return {
    id:
      product.id,

    sku:
      product.sku,

    name:
      product.name,

    categoryName:
      product.categoryName,

    description:
      product.description,

    unit:
      product.unit,

    costPrice:
      product.costPrice,

    sellingPrice:
      product.sellingPrice,

    grossMarginPerUnit:
      product.grossMarginPerUnit,

    grossMarginPercentage:
      product.grossMarginPercentage,

    isActive:
      product.isActive,
  };
}

export async function retrieveProductKnowledge(
  queryAnalysis: ProductQueryAnalysis,
): Promise<ProductKnowledgeContext> {
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Product AI query:",
      {
        kind:
          queryAnalysis.kind,

        searchTerm:
          queryAnalysis.searchTerm,

        categoryTerm:
          queryAnalysis.categoryTerm,

        matchedKeywords:
          queryAnalysis.matchedKeywords,
      },
    );
  }

  const result =
    await getProducts({
      page:
        1,

      pageSize:
        PAGE_SIZE,
    });

  const allProducts =
    result.products;

  let selectedProducts =
    [...allProducts];

  if (
    queryAnalysis.kind ===
    "active"
  ) {
    selectedProducts =
      selectedProducts.filter(
        (product) =>
          product.isActive,
      );
  }

  if (
    queryAnalysis.kind ===
    "inactive"
  ) {
    selectedProducts =
      selectedProducts.filter(
        (product) =>
          !product.isActive,
      );
  }

  if (
    queryAnalysis.kind ===
      "product_detail" &&
    queryAnalysis.searchTerm
  ) {
    const search =
      normalizeSearch(
        queryAnalysis.searchTerm,
      );

    selectedProducts =
      selectedProducts.filter(
        (product) => {
          const name =
            normalizeSearch(
              product.name,
            );

          const sku =
            product.sku
              ? normalizeSearch(
                  product.sku,
                )
              : "";

          return (
            name.includes(
              search,
            ) ||
            search.includes(
              name,
            ) ||
            sku.includes(
              search,
            )
          );
        },
      );
  }

  if (
    queryAnalysis.kind ===
      "category" &&
    queryAnalysis.categoryTerm
  ) {
    const categorySearch =
      normalizeSearch(
        queryAnalysis.categoryTerm,
      );

    selectedProducts =
      selectedProducts.filter(
        (product) => {
          if (
            !product.categoryName
          ) {
            return false;
          }

          const categoryName =
            normalizeSearch(
              product.categoryName,
            );

          return (
            categoryName.includes(
              categorySearch,
            ) ||
            categorySearch.includes(
              categoryName,
            )
          );
        },
      );
  }

  if (
    queryAnalysis.kind ===
    "summary"
  ) {
    selectedProducts =
      selectedProducts.slice(
        0,
        20,
      );
  }

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.info(
      "Product AI result:",
      {
        totalProducts:
          result.summary
            .totalProducts,

        selectedCount:
          selectedProducts.length,

        products:
          selectedProducts.map(
            (product) => ({
              id:
                product.id,

              name:
                product.name,

              category:
                product.categoryName,

              sellingPrice:
                product.sellingPrice,

              isActive:
                product.isActive,
            }),
          ),
      },
    );
  }

  return {
    query:
      queryAnalysis,

    summary: {
      totalProducts:
        result.summary
          .totalProducts,

      activeProducts:
        result.summary
          .activeProducts,

      inactiveProducts:
        result.summary
          .inactiveProducts,
    },

    products:
      selectedProducts.map(
        mapProduct,
      ),

    retrievedAt:
      new Date().toISOString(),
  };
}
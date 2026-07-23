import {
  analyzeInventoryQuery,
} from "@/features/ai/analyzers/inventory-query-analyzer";

import {
  analyzeTransactionQuery,
} from "@/features/ai/analyzers/transaction-query-analyzer";

import {
  buildBusinessContext,
} from "@/features/ai/builders/context-builder";

import {
  buildInventoryContext,
} from "@/features/ai/builders/inventory-context-builder";

import {
  retrieveInventoryKnowledge,
} from "@/features/ai/retrievers/inventory-retriever";

import {
  retrieveTransactions,
} from "@/features/ai/retrievers/transaction-retriever";

import type {
  QuestionAnalysis,
} from "@/features/ai/types/rag";

import {
  analyzeSupplierQuery,
} from "@/features/ai/analyzers/supplier-query-analyzer";

import {
  buildSupplierContext,
} from "@/features/ai/builders/supplier-context-builder";

import {
  retrieveSupplierKnowledge,
} from "@/features/ai/retrievers/supplier-retriever";

import {
  analyzePurchaseQuery,
} from "@/features/ai/analyzers/purchase-query-analyzer";

import {
  buildPurchaseContext,
} from "@/features/ai/builders/purchase-context-builder";

import {
  retrievePurchaseKnowledge,
} from "@/features/ai/retrievers/purchase-retriever";

import {
  analyzeProductQuery,
} from "@/features/ai/analyzers/product-query-analyzer";

import {
  buildProductContext,
} from "@/features/ai/builders/product-context-builder";

import {
  retrieveProductKnowledge,
} from "@/features/ai/retrievers/product-retriever";

import {
  buildRagContext,
} from "@/features/ai/rag/rag-context-builder";

import {
  retrieveVectorDocuments,
} from "@/features/ai/rag/vector-retriever";

export type KnowledgeDomain =
  | "general"
  | "product"
  | "transaction"
  | "inventory"
  | "supplier"
  | "purchase";

export type KnowledgeProviderResult = {
  domain: KnowledgeDomain;
  context: string;
};

async function provideInventoryKnowledge(
  question: string,
): Promise<KnowledgeProviderResult> {
  const inventoryAnalysis =
    analyzeInventoryQuery(
      question,
    );

  const inventoryKnowledge =
    await retrieveInventoryKnowledge(
      inventoryAnalysis,
    );

  return {
    domain:
      "inventory",

    context:
      buildInventoryContext(
        inventoryKnowledge,
      ),
  };
}

async function provideTransactionKnowledge(
  question: string,
): Promise<KnowledgeProviderResult> {
  const transactionAnalysis =
    analyzeTransactionQuery(
      question,
    );

  const transactionKnowledge =
    await retrieveTransactions({
      kind:
        transactionAnalysis.kind,

      dateRange:
        transactionAnalysis
          .dateRange,
    });

  return {
    domain:
      "transaction",

    context:
      buildBusinessContext(
        transactionKnowledge,
      ),
  };
}

async function provideSupplierKnowledge(
  question: string,
): Promise<KnowledgeProviderResult> {
  const supplierAnalysis =
    analyzeSupplierQuery(
      question,
    );

  const supplierKnowledge =
    await retrieveSupplierKnowledge(
      supplierAnalysis,
    );

  return {
    domain:
      "supplier",

    context:
      buildSupplierContext(
        supplierKnowledge,
      ),
  };
}

async function providePurchaseKnowledge(
  question: string,
): Promise<KnowledgeProviderResult> {
  const purchaseAnalysis =
    analyzePurchaseQuery(
      question,
    );

  const purchaseKnowledge =
    await retrievePurchaseKnowledge(
      purchaseAnalysis,
    );

  return {
    domain:
      "purchase",

    context:
      buildPurchaseContext(
        purchaseKnowledge,
      ),
  };
}

async function provideProductKnowledge(
  question: string,
): Promise<KnowledgeProviderResult> {
  const productAnalysis =
    analyzeProductQuery(
      question,
    );

  const productKnowledge =
    await retrieveProductKnowledge(
      productAnalysis,
    );

  return {
    domain:
      "product",

    context:
      buildProductContext(
        productKnowledge,
      ),
  };
}

async function provideRagKnowledge(
  question: string,
): Promise<KnowledgeProviderResult> {
  const results =
    await retrieveVectorDocuments(
      question,
    );

  return {
    domain:
      "general",

    context:
      buildRagContext(
        results,
      ),
  };
}

export async function provideKnowledge(
  question: string,
  analysis: QuestionAnalysis,
): Promise<KnowledgeProviderResult> {
  if (
    !analysis.requiresBusinessData
  ) {
    return provideRagKnowledge(
      question,
    );
  }

  switch (
    analysis.category
  ) {
    case "inventory":
      return provideInventoryKnowledge(
        question,
      );

    case "transaction":
    case "sales":
    case "report":
      return provideTransactionKnowledge(
        question,
      );

    /**
     * Provider Product, Supplier,
     * dan Purchase akan ditambahkan
     * bertahap pada sprint berikutnya.
     *
     * Untuk sementara jangan mengambil
     * data domain lain agar AI tidak
     * menerima context yang salah.
     */
    case "product":
      return provideProductKnowledge(
        question,
      );

    case "supplier":
      return provideSupplierKnowledge(
        question,
      );

    case "purchase":
      return providePurchaseKnowledge(
        question,
      );

    default:
      return {
        domain:
          "general",

        context:
          "",
      };
  }
}
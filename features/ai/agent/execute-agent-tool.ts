import {
  analyzeInventoryQuery,
} from "@/features/ai/analyzers/inventory-query-analyzer";

import {
  analyzeProductQuery,
} from "@/features/ai/analyzers/product-query-analyzer";

import {
  analyzePurchaseQuery,
} from "@/features/ai/analyzers/purchase-query-analyzer";

import {
  analyzeSupplierQuery,
} from "@/features/ai/analyzers/supplier-query-analyzer";

import {
  buildInventoryContext,
} from "@/features/ai/builders/inventory-context-builder";

import {
  buildProductContext,
} from "@/features/ai/builders/product-context-builder";

import {
  buildPurchaseContext,
} from "@/features/ai/builders/purchase-context-builder";

import {
  buildSupplierContext,
} from "@/features/ai/builders/supplier-context-builder";

import {
  retrieveInventoryKnowledge,
} from "@/features/ai/retrievers/inventory-retriever";

import {
  retrieveProductKnowledge,
} from "@/features/ai/retrievers/product-retriever";

import {
  retrievePurchaseKnowledge,
} from "@/features/ai/retrievers/purchase-retriever";

import {
  retrieveSupplierKnowledge,
} from "@/features/ai/retrievers/supplier-retriever";

import {
  buildRagContext,
} from "@/features/ai/rag/rag-context-builder";

import {
  retrieveVectorDocuments,
} from "@/features/ai/rag/vector-retriever";

import {
  analyzeTransactionQuery,
} from "@/features/ai/analyzers/transaction-query-analyzer";

import {
  buildBusinessContext,
} from "@/features/ai/builders/context-builder";

import {
  retrieveTransactions,
} from "@/features/ai/retrievers/transaction-retriever";

export type AgentToolName =
  | "get_transactions"
  | "get_inventory"
  | "get_supplier"
  | "get_purchase_orders"
  | "get_product"
  | "search_knowledge_base";

export type AgentToolArguments = {
  question?: unknown;
};

function getQuestion(
  args: AgentToolArguments,
): string {
  if (
    typeof args.question !==
      "string" ||
    !args.question.trim()
  ) {
    throw new Error(
      "Agent tool membutuhkan pertanyaan.",
    );
  }

  return args.question.trim();
}

export async function executeAgentTool(
  name: AgentToolName,
  args: AgentToolArguments,
): Promise<string> {
  const question =
    getQuestion(args);

  switch (name) {
    case "get_transactions": {
      const analysis =
        analyzeTransactionQuery(
          question,
        );

      const knowledge =
        await retrieveTransactions({
          kind:
            analysis.kind,

          dateRange:
            analysis.dateRange,
        });

      return buildBusinessContext(
        knowledge,
      );
    }

    case "get_inventory": {
      const analysis =
        analyzeInventoryQuery(
          question,
        );

      const knowledge =
        await retrieveInventoryKnowledge(
          analysis,
        );

      return buildInventoryContext(
        knowledge,
      );
    }

    case "get_supplier": {
      const analysis =
        analyzeSupplierQuery(
          question,
        );

      const knowledge =
        await retrieveSupplierKnowledge(
          analysis,
        );

      return buildSupplierContext(
        knowledge,
      );
    }

    case "get_purchase_orders": {
      const analysis =
        analyzePurchaseQuery(
          question,
        );

      const knowledge =
        await retrievePurchaseKnowledge(
          analysis,
        );

      return buildPurchaseContext(
        knowledge,
      );
    }

    case "get_product": {
      const analysis =
        analyzeProductQuery(
          question,
        );

      const knowledge =
        await retrieveProductKnowledge(
          analysis,
        );

      return buildProductContext(
        knowledge,
      );
    }

    case "search_knowledge_base": {
      const documents =
        await retrieveVectorDocuments(
          question,
        );

      return buildRagContext(
        documents,
      );
    }

    default: {
      const exhaustiveCheck:
        never = name;

      throw new Error(
        `Agent tool tidak dikenal: ${exhaustiveCheck}`,
      );
    }
  }
}
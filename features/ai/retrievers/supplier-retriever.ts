import { createClient } from "@/lib/supabase/server";

import type {
  SupplierKnowledgeContext,
  SupplierKnowledgeItem,
  SupplierQueryAnalysis,
} from "@/features/ai/types/supplier-knowledge";

type SupplierRow = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
};

function normalizeSearchTerm(
  value: string,
): string {
  return value
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, " ");
}

function mapSupplierRow(
  row: SupplierRow,
): SupplierKnowledgeItem {
  return {
    id: row.id,

    name: row.name,

    contactPerson:
      row.contact_person,

    phone:
      row.phone,

    email:
      row.email,

    address:
      row.address,

    isActive:
      row.is_active,
  };
}

export async function retrieveSupplierKnowledge(
  queryAnalysis: SupplierQueryAnalysis,
): Promise<SupplierKnowledgeContext> {
  const supabase =
    await createClient();

  const summaryResult =
    await supabase
      .from("suppliers")
      .select(
        "id, is_active",
      );

  if (summaryResult.error) {
    console.error(
      "Retrieve AI supplier summary failed:",
      summaryResult.error,
    );

    throw new Error(
      "Data supplier gagal diambil dari Supabase.",
    );
  }

  const summaryRows =
    summaryResult.data ?? [];

  const totalSuppliers =
    summaryRows.length;

  const activeSuppliers =
    summaryRows.filter(
      (supplier) =>
        supplier.is_active ===
        true,
    ).length;

  const inactiveSuppliers =
    totalSuppliers -
    activeSuppliers;

  let supplierQuery =
    supabase
      .from("suppliers")
      .select(
        `
          id,
          name,
          contact_person,
          phone,
          email,
          address,
          is_active
        `,
      );

  if (
    queryAnalysis.kind ===
    "active"
  ) {
    supplierQuery =
      supplierQuery.eq(
        "is_active",
        true,
      );
  }

  if (
    queryAnalysis.kind ===
    "inactive"
  ) {
    supplierQuery =
      supplierQuery.eq(
        "is_active",
        false,
      );
  }

  if (
    queryAnalysis.kind ===
      "supplier_detail" &&
    queryAnalysis.searchTerm
  ) {
    const search =
      normalizeSearchTerm(
        queryAnalysis.searchTerm,
      );

    supplierQuery =
      supplierQuery.or(
        [
          `name.ilike.%${search}%`,
          `contact_person.ilike.%${search}%`,
          `phone.ilike.%${search}%`,
          `email.ilike.%${search}%`,
        ].join(","),
      );
  }

  const supplierResult =
    await supplierQuery
      .order("name", {
        ascending: true,
      })
      .limit(100);

  if (supplierResult.error) {
    console.error(
      "Retrieve AI supplier knowledge failed:",
      supplierResult.error,
    );

    throw new Error(
      "Data supplier gagal diambil dari Supabase.",
    );
  }

  const rows =
    (supplierResult.data ??
      []) as SupplierRow[];

  return {
    query:
      queryAnalysis,

    summary: {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
    },

    suppliers:
      rows.map(
        mapSupplierRow,
      ),

    retrievedAt:
      new Date().toISOString(),
  };
}
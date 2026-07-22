"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  supplierSchema,
} from "@/features/suppliers/schemas/supplier-schema";

import type {
  ActionState,
} from "@/features/shared/types/action-state";

import {
  createClient,
} from "@/lib/supabase/server";

type CreateSupplierResult = {
  supplierId: number;
  supplierName: string;
};

export type CreateSupplierState =
  ActionState<CreateSupplierResult>;

type CreatedSupplierRow = {
  id: number;
  name: string;
};

function normalizeOptionalValue(
  value: string,
): string | null {
  const normalized =
    value.trim();

  return normalized.length >
    0
    ? normalized
    : null;
}

export async function createSupplier(
  values: unknown,
): Promise<CreateSupplierState> {
  const validationResult =
    supplierSchema.safeParse(
      values,
    );

  if (
    !validationResult.success
  ) {
    return {
      success: false,

      message:
        "Data supplier belum valid.",

      fieldErrors:
        validationResult.error
          .flatten()
          .fieldErrors,
    };
  }

  const {
    name,
    contactPerson,
    phone,
    email,
    address,
    notes,
    isActive,
  } = validationResult.data;

  const supabase =
    await createClient();

  const {
    data: existingSupplier,
    error:
      existingSupplierError,
  } = await supabase
    .from("suppliers")
    .select(
      "id",
    )
    .ilike(
      "name",
      name,
    )
    .limit(1)
    .maybeSingle();

  if (
    existingSupplierError
  ) {
    console.error(
      "Check supplier duplication failed:",
      existingSupplierError,
    );

    return {
      success: false,
      message:
        "Nama supplier gagal diperiksa.",
    };
  }

  if (existingSupplier) {
    return {
      success: false,

      message:
        "Supplier dengan nama tersebut sudah tersedia.",

      fieldErrors: {
        name: [
          "Gunakan nama supplier yang berbeda.",
        ],
      },
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("suppliers")
    .insert({
      name,

      contact_person:
        normalizeOptionalValue(
          contactPerson,
        ),

      phone:
        normalizeOptionalValue(
          phone,
        ),

      email:
        normalizeOptionalValue(
          email,
        ),

      address:
        normalizeOptionalValue(
          address,
        ),

      notes:
        normalizeOptionalValue(
          notes,
        ),

      is_active:
        isActive,
    })
    .select(
      `
        id,
        name
      `,
    )
    .single();

  if (error) {
    console.error(
      "Create supplier failed:",
      error,
    );

    return {
      success: false,

      message:
        error.code ===
        "23505"
          ? "Supplier dengan data tersebut sudah tersedia."
          : "Supplier gagal ditambahkan.",
    };
  }

  const result =
    data as CreatedSupplierRow;

  revalidatePath(
    "/suppliers",
  );

  revalidatePath(
    "/purchases",
  );

  revalidatePath(
    "/purchase-orders",
  );

  return {
    success: true,

    message:
      "Supplier berhasil ditambahkan.",

    data: {
      supplierId:
        result.id,

      supplierName:
        result.name,
    },
  };
}
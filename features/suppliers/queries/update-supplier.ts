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

type UpdateSupplierInput = {
  supplierId: number;
  values: unknown;
};

type UpdateSupplierResult = {
  supplierId: number;
  supplierName: string;
};

export type UpdateSupplierState =
  ActionState<UpdateSupplierResult>;

type UpdatedSupplierRow = {
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

export async function updateSupplier({
  supplierId,
  values,
}: UpdateSupplierInput): Promise<UpdateSupplierState> {
  if (
    !Number.isInteger(
      supplierId,
    ) ||
    supplierId < 1
  ) {
    return {
      success: false,
      message:
        "ID supplier tidak valid.",
    };
  }

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
    .neq(
      "id",
      supplierId,
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
    .update({
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

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      supplierId,
    )
    .select(
      `
        id,
        name
      `,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Update supplier failed:",
      error,
    );

    return {
      success: false,

      message:
        error.code ===
        "23505"
          ? "Supplier dengan data tersebut sudah tersedia."
          : "Supplier gagal diperbarui.",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "Supplier tidak ditemukan.",
    };
  }

  const result =
    data as UpdatedSupplierRow;

  revalidatePath(
    "/suppliers",
  );

  revalidatePath(
    `/suppliers/${supplierId}`,
  );

  revalidatePath(
    `/suppliers/${supplierId}/edit`,
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
      "Supplier berhasil diperbarui.",

    data: {
      supplierId:
        result.id,

      supplierName:
        result.name,
    },
  };
}
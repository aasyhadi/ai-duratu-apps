"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  ActionState,
} from "@/features/shared/types/action-state";

import {
  createClient,
} from "@/lib/supabase/server";

type ToggleSupplierStatusInput = {
  supplierId: number;
  isActive: boolean;
};

type ToggleSupplierStatusResult = {
  supplierId: number;
  supplierName: string;
  isActive: boolean;
};

export type ToggleSupplierStatusState =
  ActionState<ToggleSupplierStatusResult>;

type UpdatedSupplierStatusRow = {
  id: number;
  name: string;
  is_active: boolean;
};

export async function toggleSupplierStatus({
  supplierId,
  isActive,
}: ToggleSupplierStatusInput): Promise<ToggleSupplierStatusState> {
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

  if (
    typeof isActive !==
    "boolean"
  ) {
    return {
      success: false,
      message:
        "Status supplier tidak valid.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("suppliers")
    .update({
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
        name,
        is_active
      `,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Toggle supplier status failed:",
      error,
    );

    return {
      success: false,
      message:
        "Status supplier gagal diperbarui.",
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
    data as UpdatedSupplierStatusRow;

  revalidatePath(
    "/suppliers",
  );

  revalidatePath(
    `/suppliers/${supplierId}`,
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
      result.is_active
        ? "Supplier berhasil diaktifkan."
        : "Supplier berhasil dinonaktifkan.",

    data: {
      supplierId:
        result.id,

      supplierName:
        result.name,

      isActive:
        result.is_active,
    },
  };
}
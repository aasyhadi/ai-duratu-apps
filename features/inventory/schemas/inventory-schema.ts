import { z } from "zod";

import {
  DEFAULT_INVENTORY_PAGE_SIZE,
  INVENTORY_MOVEMENT_TYPES,
  MAX_INVENTORY_PAGE_SIZE,
} from "@/features/inventory/constants/inventory-constants";

export const inventoryMovementTypeSchema =
  z.enum(
    INVENTORY_MOVEMENT_TYPES,
  );

export const inventoryMovementFilterSchema =
  z.object({
    page: z.coerce
      .number<number>()
      .int()
      .positive()
      .catch(1),

    pageSize: z.coerce
      .number<number>()
      .int()
      .positive()
      .max(
        MAX_INVENTORY_PAGE_SIZE,
      )
      .catch(
        DEFAULT_INVENTORY_PAGE_SIZE,
      ),

    search: z
      .string()
      .trim()
      .max(100)
      .catch(""),

    movementType: z
      .union([
        inventoryMovementTypeSchema,
        z.literal("all"),
      ])
      .catch("all"),

    dateFrom: z
      .string()
      .trim()
      .catch(""),

    dateTo: z
      .string()
      .trim()
      .catch(""),
  });

export const inventoryAdjustmentSchema =
  z.object({
    productId: z.coerce
      .number<number>()
      .int(
        "ID produk harus berupa bilangan bulat.",
      )
      .positive(
        "Produk wajib dipilih.",
      ),

    physicalStock: z.coerce
      .number<number>()
      .min(
        0,
        "Stok fisik tidak boleh negatif.",
      )
      .max(
        999_999,
        "Stok fisik terlalu besar.",
      ),

    notes: z
      .string()
      .trim()
      .min(
        3,
        "Alasan penyesuaian minimal 3 karakter.",
      )
      .max(
        500,
        "Alasan maksimal 500 karakter.",
      ),
  });

export type InventoryMovementFilterInput =
  z.input<
    typeof inventoryMovementFilterSchema
  >;

export type InventoryMovementFilterValues =
  z.output<
    typeof inventoryMovementFilterSchema
  >;

export type InventoryAdjustmentInput =
  z.input<
    typeof inventoryAdjustmentSchema
  >;

export type InventoryAdjustmentValues =
  z.output<
    typeof inventoryAdjustmentSchema
  >;
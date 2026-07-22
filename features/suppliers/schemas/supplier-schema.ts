import { z } from "zod";

const optionalTextSchema = (
  maximumLength: number,
  maximumMessage: string,
) =>
  z
    .string()
    .trim()
    .max(
      maximumLength,
      maximumMessage,
    );

export const supplierSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Nama supplier minimal 2 karakter.",
        )
        .max(
          150,
          "Nama supplier maksimal 150 karakter.",
        ),

    contactPerson:
      optionalTextSchema(
        100,
        "Nama kontak maksimal 100 karakter.",
      ),

    phone:
      optionalTextSchema(
        30,
        "Nomor telepon maksimal 30 karakter.",
      )
        .refine(
          (value) =>
            value.length === 0 ||
            /^[0-9+\-()\s]+$/.test(
              value,
            ),
          {
            message:
              "Format nomor telepon tidak valid.",
          },
        ),

    email:
      z
        .string()
        .trim()
        .max(
          150,
          "Email maksimal 150 karakter.",
        )
        .refine(
          (value) =>
            value.length === 0 ||
            z
              .string()
              .email()
              .safeParse(
                value,
              )
              .success,
          {
            message:
              "Format email tidak valid.",
          },
        ),

    address:
      optionalTextSchema(
        500,
        "Alamat maksimal 500 karakter.",
      ),

    notes:
      optionalTextSchema(
        1000,
        "Catatan maksimal 1.000 karakter.",
      ),

    isActive:
      z.boolean(),
  });

export type SupplierSchemaInput =
  z.input<
    typeof supplierSchema
  >;

export type SupplierSchemaValues =
  z.output<
    typeof supplierSchema
  >;
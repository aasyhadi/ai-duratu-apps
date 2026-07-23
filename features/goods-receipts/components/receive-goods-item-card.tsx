"use client";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  formatCurrency,
} from "@/features/shared/utils/currency";

export type ReceiveGoodsFormItem = {
  purchaseOrderItemId: number;

  productId: number;
  productName: string;
  productSku: string | null;
  productUnit: string;

  orderedQuantity: number;
  previouslyReceivedQuantity: number;
  remainingQuantity: number;

  quantityReceived: number;
  unitCost: number;
  notes: string;
};

type ReceiveGoodsItemCardProps = {
  item: ReceiveGoodsFormItem;
  disabled?: boolean;

  onChange: (
    item: ReceiveGoodsFormItem,
  ) => void;
};

function formatQuantity(
  value: number,
): string {
  return new Intl.NumberFormat(
    "id-ID",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function parseNumberInput(
  value: string,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return 0;
  }

  return parsed;
}

export function ReceiveGoodsItemCard({
  item,
  disabled = false,
  onChange,
}: ReceiveGoodsItemCardProps) {
  const isSelected =
    item.quantityReceived > 0;

  const subtotal =
    item.quantityReceived *
    item.unitCost;

  function handleToggle() {
    if (
      disabled ||
      item.remainingQuantity <= 0
    ) {
      return;
    }

    onChange({
      ...item,

      quantityReceived:
        isSelected
          ? 0
          : item.remainingQuantity,
    });
  }

  return (
    <article
      className={[
        "rounded-xl border p-4 transition-colors",

        isSelected
          ? "border-primary/50 bg-primary/5"
          : "bg-card",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={
            disabled ||
            item.remainingQuantity <= 0
          }
          onChange={handleToggle}
          aria-label={`Pilih ${item.productName}`}
          className="mt-1 size-4 rounded border-input accent-primary"
        />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold">
                {item.productName}
              </h3>

              <p className="text-xs text-muted-foreground">
                SKU:{" "}
                {item.productSku ??
                  "Tanpa SKU"}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="font-medium">
                {formatCurrency(
                  item.unitCost,
                )}
              </p>

              <p className="text-xs text-muted-foreground">
                per {item.productUnit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Dipesan
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatQuantity(
                  item.orderedQuantity,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Sudah diterima
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatQuantity(
                  item.previouslyReceivedQuantity,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Sisa
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatQuantity(
                  item.remainingQuantity,
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <div className="space-y-2">
              <Label
                htmlFor={`receive-quantity-${item.purchaseOrderItemId}`}
              >
                Diterima sekarang
              </Label>

              <Input
                id={`receive-quantity-${item.purchaseOrderItemId}`}
                type="number"
                min={0}
                max={
                  item.remainingQuantity
                }
                step="any"
                value={
                  item.quantityReceived
                }
                disabled={
                  disabled ||
                  item.remainingQuantity <= 0
                }
                onChange={(event) => {
                  const parsedValue =
                    parseNumberInput(
                      event.target.value,
                    );

                  onChange({
                    ...item,

                    quantityReceived:
                      Math.min(
                        parsedValue,
                        item.remainingQuantity,
                      ),
                  });
                }}
              />

              <p className="text-xs text-muted-foreground">
                Maksimal{" "}
                {formatQuantity(
                  item.remainingQuantity,
                )}{" "}
                {item.productUnit}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`receive-note-${item.purchaseOrderItemId}`}
              >
                Catatan item
              </Label>

              <Input
                id={`receive-note-${item.purchaseOrderItemId}`}
                value={item.notes}
                disabled={
                  disabled ||
                  !isSelected
                }
                placeholder="Contoh: kondisi barang baik"
                onChange={(event) => {
                  onChange({
                    ...item,
                    notes:
                      event.target.value,
                  });
                }}
              />
            </div>
          </div>

          {isSelected ? (
            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">
                Nilai penerimaan
              </span>

              <span className="font-semibold">
                {formatCurrency(
                  subtotal,
                )}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
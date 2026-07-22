import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import { analyzeTransactionQuery } from "../transaction-query-analyzer";

const TEST_DATE = new Date(
  "2026-07-21T07:00:00+07:00",
);

describe(
  "analyzeTransactionQuery",
  () => {
    it(
      "mendeteksi pendapatan bulan ini",
      () => {
        const result =
          analyzeTransactionQuery(
            "Berapa pendapatan bulan ini?",
            TEST_DATE,
          );

        assert.equal(
          result.kind,
          "revenue",
        );

        assert.equal(
          result.dateRange.startDate,
          "2026-07-01",
        );

        assert.equal(
          result.dateRange.endDate,
          "2026-07-31",
        );

        assert.equal(
          result.dateRange.label,
          "bulan ini",
        );
      },
    );

    it(
      "mendeteksi pengeluaran hari ini",
      () => {
        const result =
          analyzeTransactionQuery(
            "Berapa pengeluaran hari ini?",
            TEST_DATE,
          );

        assert.equal(
          result.kind,
          "expense",
        );

        assert.equal(
          result.dateRange.startDate,
          "2026-07-21",
        );

        assert.equal(
          result.dateRange.endDate,
          "2026-07-21",
        );
      },
    );

    it(
      "mendeteksi seluruh transaksi kemarin",
      () => {
        const result =
          analyzeTransactionQuery(
            "Berapa total transaksi kemarin?",
            TEST_DATE,
          );

        assert.equal(
          result.kind,
          "all",
        );

        assert.equal(
          result.dateRange.startDate,
          "2026-07-20",
        );

        assert.equal(
          result.dateRange.endDate,
          "2026-07-20",
        );
      },
    );

    it(
      "mendeteksi bulan lalu",
      () => {
        const result =
          analyzeTransactionQuery(
            "Berapa omzet bulan lalu?",
            TEST_DATE,
          );

        assert.equal(
          result.kind,
          "revenue",
        );

        assert.equal(
          result.dateRange.startDate,
          "2026-06-01",
        );

        assert.equal(
          result.dateRange.endDate,
          "2026-06-30",
        );
      },
    );

    it(
      "menggunakan semua data jika tidak ada periode",
      () => {
        const result =
          analyzeTransactionQuery(
            "Berapa pendapatan Duratu Kafe?",
            TEST_DATE,
          );

        assert.equal(
          result.kind,
          "revenue",
        );

        assert.equal(
          result.dateRange.startDate,
          null,
        );

        assert.equal(
          result.dateRange.endDate,
          null,
        );
      },
    );
  },
);
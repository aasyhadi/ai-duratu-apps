import assert from "node:assert/strict";
import {
  describe,
  it,
} from "node:test";

import { analyzeQuestion } from "../question-analyzer";

describe(
  "analyzeQuestion",
  () => {
    it(
      "mengklasifikasikan pertanyaan umum",
      () => {
        const result =
          analyzeQuestion(
            "Apa yang dimaksud dengan pelayanan prima?",
          );

        assert.equal(
          result.category,
          "general",
        );

        assert.equal(
          result.intent,
          "definition",
        );

        assert.equal(
          result.requiresBusinessData,
          false,
        );
      },
    );

    it(
      "membedakan definisi food cost dari data bisnis",
      () => {
        const result =
          analyzeQuestion(
            "Apa itu food cost?",
          );

        assert.equal(
          result.category,
          "general",
        );

        assert.equal(
          result.intent,
          "definition",
        );

        assert.equal(
          result.requiresBusinessData,
          false,
        );

        assert.ok(
          result.matchedKeywords.includes(
            "food cost",
          ),
        );
      },
    );

    it(
      "mendeteksi permintaan data food cost",
      () => {
        const result =
          analyzeQuestion(
            "Berapa food cost Duratu Kafe bulan ini?",
          );

        assert.equal(
          result.category,
          "product",
        );

        assert.equal(
          result.intent,
          "business_data",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );

        assert.ok(
          result.matchedKeywords.includes(
            "food cost",
          ),
        );

        assert.ok(
          result.matchedKeywords.includes(
            "bulan ini",
          ),
        );
      },
    );

    it(
      "mengklasifikasikan pertanyaan penjualan",
      () => {
        const result =
          analyzeQuestion(
            "Berapa omzet bulan ini?",
          );

        assert.equal(
          result.category,
          "sales",
        );

        assert.equal(
          result.intent,
          "business_data",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );

        assert.ok(
          result.matchedKeywords.includes(
            "omzet",
          ),
        );
      },
    );

    it(
      "mengklasifikasikan pertanyaan transaksi",
      () => {
        const result =
          analyzeQuestion(
            "Berapa jumlah transaksi QRIS hari ini?",
          );

        assert.equal(
          result.category,
          "transaction",
        );

        assert.equal(
          result.intent,
          "business_data",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );
      },
    );

    it(
      "mengklasifikasikan permintaan laporan",
      () => {
        const result =
          analyzeQuestion(
            "Buatkan laporan penjualan bulan ini.",
          );

        assert.equal(
          result.category,
          "report",
        );

        assert.equal(
          result.intent,
          "report",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );
      },
    );

    it(
      "menganggap strategi umum sebagai general",
      () => {
        const result =
          analyzeQuestion(
            "Berikan strategi meningkatkan penjualan kafe.",
          );

        assert.equal(
          result.category,
          "general",
        );

        assert.equal(
          result.intent,
          "advice",
        );

        assert.equal(
          result.requiresBusinessData,
          false,
        );
      },
    );

    it(
      "mendeteksi permintaan stok bisnis",
      () => {
        const result =
          analyzeQuestion(
            "Berapa jumlah stok kopi Duratu saat ini?",
          );

        assert.equal(
          result.category,
          "product",
        );

        assert.equal(
          result.intent,
          "business_data",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );
      },
    );

    it(
      "menangani pertanyaan kosong",
      () => {
        const result =
          analyzeQuestion("   ");

        assert.equal(
          result.category,
          "general",
        );

        assert.equal(
          result.intent,
          "unknown",
        );

        assert.equal(
          result.confidence,
          0,
        );

        assert.equal(
          result.requiresBusinessData,
          false,
        );
      },
    );

    it(
      "tidak sensitif terhadap huruf kapital",
      () => {
        const result =
          analyzeQuestion(
            "BERAPA TOTAL TRANSAKSI HARI INI?",
          );

        assert.equal(
          result.category,
          "transaction",
        );

        assert.equal(
          result.intent,
          "business_data",
        );
      },
    );

    it(
      "mendeteksi permintaan kategori pengeluaran terbesar",
      () => {
        const result =
          analyzeQuestion(
            "Kategori pengeluaran terbesar bulan ini apa?",
          );

        assert.equal(
          result.category,
          "report",
        );

        assert.equal(
          result.intent,
          "business_data",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );
      },
    );

    it(
      "mendeteksi permintaan analisis kondisi keuangan",
      () => {
        const result =
          analyzeQuestion(
            "Bagaimana kondisi keuangan Duratu Kafe bulan ini?",
          );

        assert.equal(
          result.category,
          "report",
        );

        assert.equal(
          result.requiresBusinessData,
          true,
        );
      },
    );

  },
);
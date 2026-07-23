export const AGENT_TOOLS = [
  {
    type: "function",

    name: "get_transactions",

    description:
      "Mengambil data transaksi dan keuangan Duratu Kafe. Gunakan untuk pertanyaan tentang pendapatan, penjualan, omzet, pengeluaran, jumlah transaksi, laporan keuangan, laba, atau transaksi pada periode tertentu.",

    parameters: {
      type: "object",

      properties: {
        question: {
          type: "string",

          description:
            "Pertanyaan pengguna mengenai transaksi, penjualan, pendapatan, pengeluaran, atau laporan keuangan Duratu Kafe.",
        },
      },

      required: [
        "question",
      ],
    },
  },

  {
    type: "function",

    name: "get_inventory",

    description:
      "Mengambil data stok dan persediaan Duratu Kafe. Gunakan untuk pertanyaan tentang stok, persediaan, stok menipis, stok habis, atau kebutuhan restock.",

    parameters: {
      type: "object",

      properties: {
        question: {
          type: "string",

          description:
            "Pertanyaan pengguna mengenai inventory atau stok.",
        },
      },

      required: [
        "question",
      ],
    },
  },

  {
    type: "function",

    name: "get_supplier",

    description:
      "Mengambil data supplier Duratu Kafe. Gunakan untuk jumlah supplier, supplier aktif, kontak, telepon, email, alamat, atau detail supplier.",

    parameters: {
      type: "object",

      properties: {
        question: {
          type: "string",

          description:
            "Pertanyaan pengguna mengenai supplier.",
        },
      },

      required: [
        "question",
      ],
    },
  },

  {
    type: "function",

    name: "get_purchase_orders",

    description:
      "Mengambil data Purchase Order Duratu Kafe. Gunakan untuk PO terbaru, PO terbesar, status PO, PO belum selesai, atau detail Purchase Order.",

    parameters: {
      type: "object",

      properties: {
        question: {
          type: "string",

          description:
            "Pertanyaan pengguna mengenai Purchase Order.",
        },
      },

      required: [
        "question",
      ],
    },
  },

  {
    type: "function",

    name: "get_product",

    description:
      "Mengambil data master produk Duratu Kafe seperti harga jual, harga modal, margin, SKU, kategori, dan status produk. Jangan gunakan untuk stok.",

    parameters: {
      type: "object",

      properties: {
        question: {
          type: "string",

          description:
            "Pertanyaan pengguna mengenai produk.",
        },
      },

      required: [
        "question",
      ],
    },
  },

  {
    type: "function",

    name: "search_knowledge_base",

    description:
      "Mencari SOP, kebijakan, panduan, atau dokumentasi internal Duratu Kafe menggunakan semantic vector search.",

    parameters: {
      type: "object",

      properties: {
        question: {
          type: "string",

          description:
            "Pertanyaan mengenai SOP, kebijakan, prosedur, atau panduan internal.",
        },
      },

      required: [
        "question",
      ],
    },
  },
] as const;
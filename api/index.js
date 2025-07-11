// Mengimpor library yang diperlukan
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors"); // Untuk mengizinkan permintaan dari domain lain

// Inisialisasi aplikasi Express
const app = express();

// Menggunakan middleware
app.use(cors()); // Mengaktifkan CORS untuk semua rute
app.use(express.json()); // Mem-parsing body permintaan sebagai JSON

// Mengambil API Key dari Vercel Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Data tentang Anda, sekarang aman di backend
const aboutMeData = `
    Tolong bertindak sebagai asisten pribadi untuk Naftali. Jawab pertanyaan berdasarkan informasi berikut.
    Jangan menambahkan informasi di luar konteks ini. Jawab dengan ramah, singkat, dan dalam Bahasa Indonesia atau Inggris sesuai pertanyaan.

    Data tentang Naftali:
    - Nama: Naftali
    - Studi: Jurusan Informatika di PENS (Politeknik Elektronika Negeri Surabaya).
    - Lokasi: Surabaya, Indonesia.
    - Minat: Teknologi dan pengembangan perangkat lunak.
    - Sosial Media: Memiliki profil di LinkedIn, Instagram, dan Github yang bisa diakses melalui ikon di halaman.
`;

// Membuat endpoint API utama
app.post("/api/chat", async (req, res) => {
  try {
    // Mengambil prompt dari body permintaan frontend
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Memilih model Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Menggabungkan data Anda dengan prompt pengguna
    const fullPrompt = `${aboutMeData}\n\nPertanyaan Pengguna: "${userPrompt}"\n\nJawaban Asisten:`;

    // Menghasilkan konten
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Mengirim jawaban kembali ke frontend
    res.json({ answer: text });
  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Failed to generate response from AI" });
  }
});

// Ekspor aplikasi untuk Vercel
module.exports = app;

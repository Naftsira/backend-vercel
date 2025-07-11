// api/generate-content.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  // Tambahkan Header CORS di awal fungsi
  res.setHeader('Access-Control-Allow-Origin', 'https://naftali.it.student.pens.ac.id'); // GANTI DENGAN URL FRONTEND ANDA
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Izinkan metode POST dan OPTIONS (untuk preflight)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Izinkan header Content-Type

  // Tangani permintaan OPTIONS (preflight request dari browser)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Validasi Metode HTTP dan Keberadaan Prompt
  if (req.method !== 'POST' || !req.body || !req.body.prompt) {
    return res.status(400).json({ error: 'Permintaan tidak valid. Harap kirimkan permintaan POST dengan "prompt" di body.' });
  }

  // Sisa kode fungsi Anda di sini... (sama seperti yang disederhanakan sebelumnya)

  try {
      const apiKey = process.env.GOOGLE_API_KEY;

      if (!apiKey) {
          console.error("Kesalahan Server: GOOGLE_API_KEY tidak diatur di variabel lingkungan.");
          return res.status(500).json({ error: 'Kesalahan konfigurasi server: Kunci API tidak ditemukan.' });
      }

      const aboutMeData = `
          Jawab pertanyaan berdasarkan informasi berikut.
          Jangan menambahkan informasi di luar konteks ini. Jawab dengan ramah, singkat, dan dalam Bahasa Indonesia atau Inggris sesuai pertanyaan.

          Data tentang Naftali:
          - Nama: Naftali
          - Studi: Jurusan Informatika di PENS (Politeknik Elektronika Negeri Surabaya).
          - Lokasi: Surabaya, Indonesia.
          - Minat: Teknologi dan pengembangan perangkat lunak.
          - Sosial Media: Memiliki profil di LinkedIn, Instagram, dan Github yang bisa diakses melalui ikon di halaman.
          - Slogan: Dont wanna be Genius, already hard just to be a man
          - Pacar: Mitsuha
      `;

      const prompt = req.body.prompt;
      const fullPrompt = `${aboutMeData}\n\nPertanyaan Pengguna: "${prompt}"\n\nJawaban Asisten:`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const chatHistory = [{ role: "user", parts: [{ text: fullPrompt }] }];
      const payload = { contents: chatHistory };

      const result = await model.generateContent(payload);
      const response = await result.response;
      const text = response.text();

      res.status(200).json({ generatedText: text });

  } catch (error) {
      console.error("Error saat memanggil Google AI API:", error);

      let errorMessageForClient = 'Maaf, terjadi kesalahan saat memproses permintaan Anda.';
      if (error.message && error.message.includes('API key not valid')) {
          errorMessageForClient = 'Kesalahan otentikasi: Kunci API yang dikonfigurasi di server tidak valid.';
      } else if (error.message) {
          errorMessageForClient = `Terjadi kesalahan: ${error.message}`;
      }

      res.status(500).json({ error: errorMessageForClient });
  }
};
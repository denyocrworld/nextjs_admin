const fs = require('fs');
const path = require('path');

// Fungsi untuk mencari kode di antara //#TEMPLATE form dan //#END dalam sebuah teks
function extractTemplateCode(text) {
    const startPattern = /#\/\/TEMPLATE form/;
    const endPattern = /#\/\/END/;
    const startIndex = text.search(startPattern);
    const endIndex = text.search(endPattern);

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        return text.substring(startIndex, endIndex + endPattern.source.length);
    }

    return null;
}

// Fungsi untuk mencari dan mengekstrak kode dari file .ts
function findAndExtractTemplateCodeInFiles(directory) {
    fs.readdirSync(directory).forEach((file) => {
        const filePath = path.join(directory, file);

        if (fs.statSync(filePath).isDirectory()) {
            // Jika ini adalah direktori, rekursif cari di dalamnya
            findAndExtractTemplateCodeInFiles(filePath);
        } else if (path.extname(file) === '.ts') {
            // Jika ini adalah file dengan ekstensi .ts
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const extractedCode = extractTemplateCode(fileContent);

            if (extractedCode !== null) {
                // Jika kode berhasil diekstrak, simpan dalam file hasil_deteksi.txt
                fs.appendFileSync('hasil_deteksi.txt', extractedCode + '\n\n');
            }
        }
    });
}

// Direktori saat ini
const currentDirectory = process.cwd();

// Cari dan ekstrak kode dalam file .ts di direktori saat ini
findAndExtractTemplateCodeInFiles(currentDirectory);

console.log('Pencarian dan ekstraksi kode selesai. Hasil disimpan dalam hasil_deteksi.txt.');

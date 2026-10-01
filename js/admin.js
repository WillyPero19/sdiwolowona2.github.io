document.getElementById("btn-proses").addEventListener("click", function () {
    const fileInput = document.getElementById("excel-input");
    const file = fileInput.files[0];
    const statusMsg = document.getElementById("status-message");

    if (!file) {
        alert("Silakan pilih file Excel terlebih dahulu!");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Read Sheets
            const sheetStat = workbook.Sheets["Statistik"] || workbook.Sheets[workbook.SheetNames[0]];
            const sheetPengumuman = workbook.Sheets["Pengumuman"];
            const sheetResidu = workbook.Sheets["ResiduSiswa"];
            const sheetDataSiswa = workbook.Sheets["DataSiswa"];

            const jsonStat = XLSX.utils.sheet_to_json(sheetStat);
            const jsonPengumuman = sheetPengumuman ? XLSX.utils.sheet_to_json(sheetPengumuman) : [];
            const jsonResidu = sheetResidu ? XLSX.utils.sheet_to_json(sheetResidu) : [];
            const jsonDataSiswa = sheetDataSiswa ? XLSX.utils.sheet_to_json(sheetDataSiswa) : [];

            // Gabung menjadi struktur JSON tunggal
            const parsedData = {
                lastUpdate: new Date().toLocaleString("id-ID"),
                totalSiswa: getStatValue(jsonStat, "Total Siswa") || 0,
                totalGuru: getStatValue(jsonStat, "Total Guru") || 0,
                totalTendik: getStatValue(jsonStat, "Total Tendik") || 0,
                residuTotal: jsonResidu.length,
                listPengumuman: jsonPengumuman,
                listResidu: jsonResidu,
                listDataSiswa: jsonDataSiswa
            };

            // AUTO DOWNLOAD FILE database.json
            downloadJSON(parsedData, "database.json");

            statusMsg.style.color = "#10b981";
            statusMsg.textContent = "✅ File 'database.json' BERHASIL diunduh! Silakan timpa file lama di folder proyek lalu commit ke GitHub.";
        } catch (err) {
            statusMsg.style.color = "#ef4444";
            statusMsg.textContent = "❌ Gagal memproses file Excel. Pastikan nama sheet dan kolom sesuai.";
            console.error(err);
        }
    };

    reader.readAsArrayBuffer(file);
});

// Helper untuk mengunduh file JSON otomatis
function downloadJSON(objectData, filename) {
    const blob = new Blob([JSON.stringify(objectData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function getStatValue(jsonStat, keyName) {
    const row = jsonStat.find(r => r.Parameter && r.Parameter.toLowerCase() === keyName.toLowerCase());
    return row ? row.Jumlah : 0;
}
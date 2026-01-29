import React, { useState } from "react";
import * as XLSX from "xlsx";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const [excelData, setExcelData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  // Handle Excel Upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelData(json);
      setSelectedRow(null);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>BRE FOR AGRI LOAN</h1>
        <p className={styles.headerSubtitle}>
          Punjab National Bank
        </p>
      </header>

      {/* MAIN */}
      <main className={styles.main}>
        {/* Upload Excel */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Upload Excel File</h3>

          <input
            type="file"
            accept=".xlsx"
            onChange={handleExcelUpload}
          />

          <p className={styles.hint}>
            Upload Excel containing loan details
          </p>
        </div>

        {/* Excel Table */}
        {excelData.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Excel Records</h3>

            <table className={styles.table}>
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {excelData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                    <td>
                      <button
                        className={styles.verifyBtn}
                        onClick={() => setSelectedRow(row)}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Row JSON */}
        {selectedRow && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Selected Row JSON</h3>
            <pre className={styles.jsonBox}>
              {JSON.stringify(selectedRow, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        © 2025–2026 Punjab National Bank. All Rights Reserved.
      </footer>
    </div>
  );
}

export default Dashboard;

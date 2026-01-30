import React, { useState, useCallback, memo } from "react";
import * as XLSX from "xlsx";
import styles from "./Dashboard.module.css";

const API_BASE = "http://127.0.0.1:8001";

/* =============================
   Row Component (Optimized)
============================= */
const TableRow = memo(({ row, index, onVerify, loading }) => {
  return (
    <tr>
      {Object.values(row).map((val, i) => (
        <td key={i}>{val}</td>
      ))}
      <td>
        <button
          className={styles.verifyBtn}
          onClick={() => onVerify(row, index)}
          disabled={loading}
        >
          {loading ? "Wait.." : "Verify"}
        </button>
      </td>
    </tr>
  );
});

export default function Dashboard() {
  const [excelData, setExcelData] = useState([]);
  const [loadingRows, setLoadingRows] = useState({});
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);

  /* Upload Excel */
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      setExcelData(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  };

  /* Verify Loan */
  const handleVerify = useCallback(async (row, index) => {
    try {
      setLoadingRows((p) => ({ ...p, [index]: true }));
      setError(null);
      setResultData(null);

      const payload = {
        loanNumber:
          row.loanNumber ||
          row["Loan Number"] ||
          row["loan_number"] ||
          row["LoanNumber"],
      };

      const res = await fetch(`${API_BASE}/verify-loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Verification failed");

      const data = await res.json();
      setResultData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRows((p) => ({ ...p, [index]: false }));
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>BRE – AGRI LOAN</h1>
      <div className={styles.headerSubTitle}>Punjab National Bank</div>
    </div>


      <div className={styles.card}>
        <input type="file" accept=".xlsx" onChange={handleExcelUpload} />
        <p className={styles.hint}>Upload 20 percent data in Excel</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {excelData.length > 0 && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                {Object.keys(excelData[0]).map((k) => (
                  <th key={k}>{k}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, i) => (
                <TableRow
                  key={i}
                  row={row}
                  index={i}
                  loading={!!loadingRows[i]}
                  onVerify={handleVerify}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RESULT (Smooth Expand) */}
      <div className={styles.resultContainer}>
        {resultData && (
          <div className={styles.resultCard}>
            <h3>Verification Result</h3>

            <p><b>Loan Number:</b> {resultData.loanNumber}</p>
            <p><b>Documents Found:</b> {resultData.documentsFound}</p>

            {resultData.results?.map((r, i) => (
              <div key={i} className={styles.resultBlock}>
                <h4>{r.file}</h4>
                <pre className={styles.jsonBox}>
                  {JSON.stringify(r.extracted_data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

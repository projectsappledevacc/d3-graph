import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelToJsonConverter = () => {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = rows.shift(); // Extract headers
      const json = rows.reduce((acc, row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        acc[obj["Reference"]] = obj; // Use Reference as key
        return acc;
      }, {});

      setJsonData(json);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {jsonData && (
        <div>
          <h2>Converted JSON Data:</h2>
          <pre>{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExcelToJsonConverter;

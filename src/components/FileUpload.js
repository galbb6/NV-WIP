import React, { useState, useEffect } from "react";
import XLSX from "xlsx/dist/xlsx.full.min";

const FileUpload = ({ onFileUpload, searchString }) => {
  const [uploadedWorkbook, setUploadedWorkbook] = useState(null);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [RMA, setRMA] = useState(0);
  const [WH, setWH] = useState("ARRIBA");
  const [lastStationData, setLastStationData] = useState({});

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0];

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      setUploadedWorkbook(workbook);
      setLastStationData({}); // Clear lastStationData on file change
    };
    console.log("MADE BY : GAL BINYAMIN");
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleToggleRMA = () => {
    setRMA((prevRMA) => (prevRMA === 0 ? 1 : 0));
  };

  const handleToggleWoType = () => {
    setWH((prevWH) => (prevWH === "ARRIBA" ? "PBR" : "ARRIBA"));
  };

  useEffect(() => {
    if (uploadedWorkbook) {
      const newAnalyzedData = analyzeExcelData(uploadedWorkbook, searchString);
      setAnalyzedData(newAnalyzedData);
    }
  }, [uploadedWorkbook, searchString, RMA, WH]);

  useEffect(() => {
    // Update lastStationData here based on filtered rows
    if (uploadedWorkbook) {
      const newLastStationData = calculateLastStationData(
        uploadedWorkbook,
        searchString
      );
      setLastStationData(newLastStationData);
    }
  }, [uploadedWorkbook, searchString, RMA, WH]);

  const analyzeExcelData = (workbook, searchString) => {
    const analyzedResults = {
      Kanban: 0,
      "In Process": 0,
      Failed: 0,
    };

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headerRow = rows[0];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const pn = row[headerRow.indexOf("PN")];
      const lastStation = row[headerRow.indexOf("Last Station")];
      const returned = parseInt(row[headerRow.indexOf("Returned")]);
      const woType = row[headerRow.indexOf("Wo Type")];
      const condition = row[headerRow.indexOf("Condition")];

      if (
        pn.toLowerCase() === searchString.toLowerCase() &&
        lastStation &&
        returned === RMA &&
        woType === WH
      ) {
        if (lastStation === 1261 || lastStation === 1181) {
          analyzedResults.Kanban += 1;
        } else if (condition === "Fail") {
          analyzedResults.Failed += 1;
        } else if (condition === "Pass") {
          analyzedResults["In Process"] += 1;
        }
      }
    }

    return analyzedResults;
  };

  const calculateLastStationData = (workbook, searchString) => {
    const newLastStationData = {};

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headerRow = rows[0];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const pn = row[headerRow.indexOf("PN")];
      const lastStation = row[headerRow.indexOf("Last Station")];
      const returned = parseInt(row[headerRow.indexOf("Returned")]);
      const woType = row[headerRow.indexOf("Wo Type")];
      const condition = row[headerRow.indexOf("Condition")];

      if (
        pn.toLowerCase() === searchString.toLowerCase() &&
        lastStation &&
        returned === RMA &&
        woType === WH
      ) {
        if (!newLastStationData[lastStation]) {
          newLastStationData[lastStation] = {
            Fails: 0,
            Passes: 0,
          };
        }

        if (condition === "Fail") {
          newLastStationData[lastStation].Fails += 1;
        } else if (condition === "Pass") {
          newLastStationData[lastStation].Passes += 1;
        }
      }
    }

    return newLastStationData;
  };

  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileChange} accept=".xlsx" />

      <button
        className={`btn mt-3 ${RMA === 1 ? "btn-primary" : "btn-secondary"}`}
        style={{ position: "absolute", top: "10px", right: "10px" }}
        onClick={handleToggleRMA}
      >
        {RMA === 1 ? "RMA On" : "RMA Off"}
      </button>

      <button
        className={`btn mt-3 ${WH === "PBR" ? "btn-primary" : "btn-secondary"}`}
        style={{ position: "absolute", top: "50px", right: "10px" }}
        onClick={handleToggleWoType}
      >
        {WH === "PBR" ? "WH: PBR" : "WH: ARRIBA"}
      </button>

      {analyzedData && (
        <div className="row justify-content-center mt-4">
          <div className="col-lg-12">
            <div className="bg-light p-4 rounded shadow">
              <h2 className="mb-3">Analysis Results : {searchString}</h2>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Kanban</th>
                    <th>In Process</th>
                    <th>Failed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{analyzedData.Kanban}</td>
                    <td>{analyzedData["In Process"]}</td>
                    <td>{analyzedData.Failed}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {Object.keys(lastStationData).length > 0 && (
        <div className="row justify-content-center mt-4">
          <div className="col-lg-12">
            <div className="bg-light p-4 rounded shadow">
              <h2 className="mb-3">Summary by Last Station</h2>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Last Station</th>
                    <th>Passes</th>
                    <th>Fails</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(lastStationData).map((station) => (
                    <tr key={station}>
                      <td>{station}</td>
                      <td>{lastStationData[station].Passes}</td>
                      <td>{lastStationData[station].Fails}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [analyzedData, setAnalyzedData] = useState(null);
  const [searchString, setSearchString] = useState('');

  const handleFileUpload = (data) => {
    setAnalyzedData(data);
  };

  const handleSearchInputChange = (event) => {
    setSearchString(event.target.value);
  };
  

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Flex_logo_%282015%29.svg/1280px-Flex_logo_%282015%29.svg.png" alt="Flex Logo" style={{ maxWidth: '150px' }} />
        <h1 className="mt-2">Wip Top&SA Analyzer</h1>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              value={searchString}
              onChange={handleSearchInputChange}
              placeholder="Enter search string"
            />
          </div>
          <FileUpload searchString={searchString} onFileUpload={handleFileUpload} />
        </div>
      </div>
      
    </div>
  );
}

export default App;

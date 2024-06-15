import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

  
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });


      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      alert('File uploaded successfully');
    } catch (error) {
      console.error('There was a problem with the upload operation:', error);
      alert('File upload failed');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TemePDF.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>TemePDF</h1>
      </header>
      <main>
        <button onClick={handleExport}>Export File</button>
        <div>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload File</button>
        </div>
      </main>
    </div>
  );
}

export default App;

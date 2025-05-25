import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default function ExportBookmarks() {
  const [exportData, setExportData] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(null, (data) => {
      const bookmarksData = {};
      Object.keys(data).forEach(key => {
        if (key !== 'hideBookmarks') {
          bookmarksData[key] = data[key];
        }
      });
      setExportData(JSON.stringify(bookmarksData));
    });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
  };

  const exportToFile = () => {
    const fileName = 'youtube-bookmarker-export.txt';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportData));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };

  return (
    <div className="import-export-container">
      <div className="modal-content">
        <h3>Export Bookmarks</h3>
        <div className="export-instructions">
          Copy the text below to save your bookmarks
        </div>
        <textarea
          className="export-textarea"
          value={exportData}
          readOnly
        />
        <div className="modal-buttons">
          <button 
            onClick={copyToClipboard}
            disabled={!exportData}
          >
            Copy to Clipboard
          </button>

          <button 
            onClick={exportToFile}
            disabled={!exportData}
          >
            Export to file
          </button>
        </div>
      </div>
    </div>
  );
}

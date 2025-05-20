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
        </div>
      </div>
    </div>
  );
}

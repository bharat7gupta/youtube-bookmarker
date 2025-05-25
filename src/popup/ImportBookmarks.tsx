import { useState } from 'preact/hooks';

export default function ImportBookmarks() {
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  const handleImport = () => {
    try {
      const bookmarks = JSON.parse(importData);
      chrome.storage.sync.set(bookmarks, () => {
        window.close();
      });
    } catch (e) {
      setImportError('Invalid JSON format');
    }
  };

  return (
    <div className="import-export-container">
      <div className="modal-content">
        <h3>Import Bookmarks</h3>
        <textarea
          className="import-textarea"
          value={importData}
          onChange={(e) => setImportData((e.target as HTMLTextAreaElement).value)}
          placeholder="Paste your exported bookmarks here"
        />
        {importError && (
          <div className="error-message">
            {importError}
          </div>
        )}
        <div className="modal-buttons">
          <button 
            onClick={handleImport}
            disabled={!importData}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'preact/hooks';

export default function ImportBookmarks({ onImportComplete }: { onImportComplete: () => void }) {
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  const handleImportTextChange = (event: Event) => {
    setImportData((event.target as HTMLTextAreaElement).value);
  };

  const handleImport = () => {
    try {
      if (!importData.trim()) {
        setImportError('No data to import');
        return;
      }

      const bookmarks = JSON.parse(importData);
      chrome.storage.sync.set(bookmarks);
      onImportComplete();
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
          onChange={handleImportTextChange}
          onPaste={handleImportTextChange}
          placeholder="Paste your exported bookmarks here"
        />
        {importError && (
          <div className="error-message">
            {importError}
          </div>
        )}
        <div className="modal-buttons">
          <button onClick={handleImport} className="import-button">
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

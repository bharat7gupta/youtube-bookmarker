import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import CurrentBookmarks from './CurrentBookmarks';
import AllBookmarks from './AllBookmarks';
import ImportBookmarks from './ImportBookmarks';
import ExportBookmarks from './ExportBookmarks';

export type View = 'current' | 'all' | 'import' | 'export';

export function App() {
  const [currentView, setCurrentView] = useState<View>('current');
  const [hideBookmarksToggle, setHideBookmarksToggle] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('hideBookmarks', function (data) {
      setHideBookmarksToggle(data['hideBookmarks'] || false);
    });
  }, []);

  const onHideBookmarkCheckBoxClick = (e) => {
    chrome.tabs.query({ currentWindow: true, active: true }, function ([activeTab]) {
      chrome.tabs.sendMessage(activeTab.id, { type: 'HIDE_BOOKMARKS', hideBookmarks: e.target.checked });
      chrome.storage.sync.set({ 'hideBookmarks': e.target.checked });
      setHideBookmarksToggle(e.target.checked);
    });
  }

  const handleImportComplete = () => {
    setCurrentView('all');
  };

  const renderView = () => {
    switch (currentView) {
      case 'all':
        return <AllBookmarks />;
      case 'import':
        return <ImportBookmarks onImportComplete={handleImportComplete} />;
      case 'export':
        return <ExportBookmarks />;
      case 'current':
      default:
        return <CurrentBookmarks />;
    }
  };

  const isMainView = currentView === 'current';
  const showBackButton = !isMainView;

  return (
    <div class="app-container">
      <div class="top-row">
        <div className="nav-buttons">
          {showBackButton ? (
            <button className="nav-button" onClick={() => setCurrentView('current')}>
              ← Back
            </button>
          ) : (
            <>
              <button className="nav-button" onClick={() => setCurrentView('all')}>
                All Bookmarks
              </button>
              <button className="nav-button" onClick={() => setCurrentView('import')}>
                Import
              </button>
              <button className="nav-button" onClick={() => setCurrentView('export')}>
                Export
              </button>
            </>
          )}
        </div>
        {isMainView && (
          <button 
            className="hide-bookmarks nav-button"
            onClick={(e) => {
              const newValue = !hideBookmarksToggle;
              onHideBookmarkCheckBoxClick({ target: { checked: newValue } });
            }}
          >
            Hide bookmarks
            <input 
              type="checkbox" 
              className="hide-checkbox" 
              checked={hideBookmarksToggle} 
              onChange={() => {}} // No-op to suppress React warning
            />
          </button>
        )}
      </div>
      {renderView()}
    </div>
  );
}

render(<App />, document.getElementById('app'));

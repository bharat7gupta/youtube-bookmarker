import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import CurrentBookmarks from './CurrentBookmarks';
import AllBookmarks from './AllBookmarks';

import '../styles.css';

export function App() {
    const [toggle, setToggle] = useState(false);
    const [hideBookmarksToggle, setHideBookmarksToggle] = useState(false);

    useEffect(() => {
        chrome.storage.sync.get('hideBookmarks', function(data) {
            setHideBookmarksToggle(data['hideBookmarks'] || false);
        });
    }, []);

    const handleToggle = () => {
        setToggle(toggle => !toggle);
    };

    const onHideBookmarkCheckBoxClick = (e) => {
        chrome.tabs.query({currentWindow: true, active: true}, function([activeTab]) {
            chrome.tabs.sendMessage(activeTab.id, { type: 'HIDE_BOOKMARKS', value: e.target.checked });
            chrome.storage.sync.set({ 'hideBookmarks': e.target.checked });
            setHideBookmarksToggle(e.target.checked);
        });
    }

    return (
        <div class="app-container">
            <div class="row top-row">
                <div className="show-all-bookmarks">
                    <a href="javascript:void(0)" onClick={handleToggle}>Show all saved bookmarks</a>
                </div>
                <div className="hide-bookmarks">
                    <span>
                        Hide bookmarks&nbsp;
                        <input type="checkbox" checked={hideBookmarksToggle} onInput={onHideBookmarkCheckBoxClick} />
                    </span>
                </div>
            </div>

            {toggle ? <AllBookmarks /> : <CurrentBookmarks />}
        </div>
    );
}

function Resource(props) {
    return (
        <a href={props.href} target="_blank" class="resource">
            <h2>{props.title}</h2>
            <p>{props.description}</p>
        </a>
    );
}

render(<App />, document.getElementById('app'));

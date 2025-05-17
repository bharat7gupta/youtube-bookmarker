import { h, render } from 'preact';
import YouTubeIntegration from './page/YouTubeIntegration';
import './styles.css';

const initApp = (): void => {
  const appContainer = document.createElement('div');
  appContainer.id = 'youtube-bookmarker-extension';
  document.body.appendChild(appContainer);

  render(h(YouTubeIntegration, {}), appContainer);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
} 

import React from 'react';
import ReactDOM from 'react-dom/client';
import { getCurrentWindow } from '@tauri-apps/api/window';
import App from './App';
import { OverlayApp } from './components/overlay/OverlayApp';
import './shared/i18n';
import './App.css';

function Root() {
  const [windowLabel, setWindowLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    const label = getCurrentWindow().label;
    setWindowLabel(label);

    if (label === 'overlay') {
      document.body.classList.add('overlay-window');
    }
  }, []);

  if (windowLabel === null) {
    return null;
  }

  if (windowLabel === 'overlay') {
    return <OverlayApp />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

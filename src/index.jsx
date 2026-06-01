import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'leaflet/dist/leaflet.css';

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console only in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Application Error:', error, errorInfo);
    }
    // Here you could also log to an external service like Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
          padding: '20px',
          fontFamily: "'Hind Siliguri', sans-serif"
        }}>
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '15px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>দুঃখিত, কিছু একটা সমস্যা হয়েছে!</h2>
            <p style={{ marginBottom: '25px' }}>অ্যাপ্লিকেশনে একটি ত্রুটি ঘটেছে। দয়া করে পৃষ্ঠাটি রিলোড করুন।</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#f14f29',
                color: '#ffffff',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              পৃষ্ঠা রিলোড করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
// Console ASCII art when dev tools opens
console.log(`
___________   _______________________________________^__
 ___   ___ |||  ___   ___   ___    ___ ___  |   __  ,----\\
|   | |   |||| |   | |   | |   |  |   |   | |  |  | |_____\\
|___| |___|||| |___| |___| |___|  | O | O | |  |  |        \\
           |||                    |___|___| |  |__|         )
___________|||______________________________|______________/
           |||                                        /--------
-----------'''---------------------------------------'
`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

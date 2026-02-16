import Header from './Header';
import Footer from './Footer';

export default function FrontLayout({ children }) {
  return (
    <div className="front-container">
      {/* Dynamic Header */}
      <Header />

      {/* Main Content Area */}
      <main className="front-main" role="main">
        {children}
      </main>

      {/* Dynamic Footer */}
      <Footer />

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .front-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--bg-tertiary);
          font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif);
          position: relative;
        }

        /* Front container styles replaced */

        /* Main Content */
        .front-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

import { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppRouter from './router';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <AppRouter />
      </AnimatePresence>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { Home } from './pages/Home';
import { ImageGeneration } from './pages/ImageGeneration';
import { ComingSoon } from './pages/ComingSoon';

type Page = 'home' | 'image' | 'video' | 'text';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <>
      {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
      {currentPage === 'image' && <ImageGeneration onBack={() => setCurrentPage('home')} />}
      {currentPage === 'video' && <ComingSoon title="Video Generation" onBack={() => setCurrentPage('home')} />}
      {currentPage === 'text' && <ComingSoon title="Text Generation" onBack={() => setCurrentPage('home')} />}
    </>
  );
}

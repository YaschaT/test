import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { GrammarList } from './pages/grammar/GrammarList';
import { GrammarDetail } from './pages/grammar/GrammarDetail';
import { VocabularyHome } from './pages/vocabulary/VocabularyHome';
import { VocabReview } from './pages/vocabulary/VocabReview';
import { KanjiList } from './pages/kanji/KanjiList';
import { KanjiDetail } from './pages/kanji/KanjiDetail';
import { ReadingList } from './pages/reading/ReadingList';
import { ReadingDetail } from './pages/reading/ReadingDetail';
import { ListeningHome } from './pages/listening/ListeningHome';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useProgressSync } from './lib/progressSync';

// Code-split the marketing landing page (and GSAP with it) so people who live in the app — the vast
// majority of visits after the first — never download it, and the app bundle doesn't grow.
const LandingPage = lazy(() => import('./pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })));

function App() {
  useProgressSync();

  return (
    <TooltipProvider>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="min-h-screen bg-slate-950" aria-hidden="true" />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grammar" element={<GrammarList />} />
          <Route path="/grammar/:id" element={<GrammarDetail />} />
          <Route path="/vocabulary" element={<VocabularyHome />} />
          <Route path="/vocabulary/review" element={<VocabReview />} />
          <Route path="/kanji" element={<KanjiList />} />
          <Route path="/kanji/:id" element={<KanjiDetail />} />
          <Route path="/reading" element={<ReadingList />} />
          <Route path="/reading/:id" element={<ReadingDetail />} />
          <Route path="/listening" element={<ListeningHome />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

export default App;

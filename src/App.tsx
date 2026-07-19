import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { Layout } from './components/Layout';
import { useProgressSync } from './lib/progressSync';

// Every route is code-split so no visitor pays for screens they aren't on: the public homepage
// (and GSAP with it) never enters the app bundle, and `/` never downloads the learning modules —
// this is what keeps the marketing page's LCP inside its performance budget. The Layout shell
// stays static, so in-app navigation always paints the sidebar instantly while a page chunk loads.
const HomePage = lazy(() => import('./pages/home/HomePage').then((m) => ({ default: m.HomePage })));
const Login = lazy(() => import('./pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then((m) => ({ default: m.Register })));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback').then((m) => ({ default: m.AuthCallback })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const GrammarList = lazy(() => import('./pages/grammar/GrammarList').then((m) => ({ default: m.GrammarList })));
const GrammarDetail = lazy(() => import('./pages/grammar/GrammarDetail').then((m) => ({ default: m.GrammarDetail })));
const VocabularyHome = lazy(() => import('./pages/vocabulary/VocabularyHome').then((m) => ({ default: m.VocabularyHome })));
const VocabReview = lazy(() => import('./pages/vocabulary/VocabReview').then((m) => ({ default: m.VocabReview })));
const KanjiList = lazy(() => import('./pages/kanji/KanjiList').then((m) => ({ default: m.KanjiList })));
const KanjiDetail = lazy(() => import('./pages/kanji/KanjiDetail').then((m) => ({ default: m.KanjiDetail })));
const ReadingList = lazy(() => import('./pages/reading/ReadingList').then((m) => ({ default: m.ReadingList })));
const ReadingDetail = lazy(() => import('./pages/reading/ReadingDetail').then((m) => ({ default: m.ReadingDetail })));
const ListeningHome = lazy(() => import('./pages/listening/ListeningHome').then((m) => ({ default: m.ListeningHome })));

/** In-app pages suspend inside the Layout shell: sidebar stays put, content area fills in. */
function page(Page: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );
}

function App() {
  useProgressSync();

  return (
    <TooltipProvider>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#f6f1e7]" aria-hidden="true" />}>
              <HomePage />
            </Suspense>
          }
        />
        {/* Auth fallback matches the auth shell's paper canvas so there's no flash. */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#f6f1e7]" aria-hidden="true" />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#f6f1e7]" aria-hidden="true" />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <Suspense fallback={<div className="min-h-screen bg-[#f6f1e7]" aria-hidden="true" />}>
              <AuthCallback />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={page(Dashboard)} />
          <Route path="/grammar" element={page(GrammarList)} />
          <Route path="/grammar/:id" element={page(GrammarDetail)} />
          <Route path="/vocabulary" element={page(VocabularyHome)} />
          <Route path="/vocabulary/review" element={page(VocabReview)} />
          <Route path="/kanji" element={page(KanjiList)} />
          <Route path="/kanji/:id" element={page(KanjiDetail)} />
          <Route path="/reading" element={page(ReadingList)} />
          <Route path="/reading/:id" element={page(ReadingDetail)} />
          <Route path="/listening" element={page(ListeningHome)} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

export default App;

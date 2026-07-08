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

function App() {
  useProgressSync();

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
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

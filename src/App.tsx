/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { 
  generateProblem, 
  parseUserInput, 
  compareRadicalSums, 
  radicalSumToDisplay,
  RadicalSum
} from './utils/mathUtils';
import { CheckCircle2, XCircle, RefreshCw, Eraser, Calculator, HelpCircle, Trophy, ChevronRight } from 'lucide-react';

// Custom Square Root Icon
const SquareRootIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12h2l4 8 7-16h5" />
  </svg>
);
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [problem, setProblem] = useState<{ question: string; answer: RadicalSum; questionLatex: string } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nextProblem();
  }, []);

  const nextProblem = () => {
    setProblem(generateProblem());
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
  };

  const checkAnswer = () => {
    if (!problem) return;
    if (feedback?.isCorrect) {
      nextProblem();
      return;
    }
    
    // Normalize input for parsing
    let normalizedInput = userInput.replace(/√/g, '\\sqrt');
    // Ensure \sqrt{n} format if not already
    normalizedInput = normalizedInput.replace(/\\sqrt(\d+)/g, '\\sqrt{$1}');
    
    const userRadicalSum = parseUserInput(normalizedInput);
    const isCorrect = compareRadicalSums(userRadicalSum, problem.answer);
    
    setFeedback({
      isCorrect,
      message: isCorrect ? '對！' : '不正確，再試一次。'
    });
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const insertAtCursor = (text: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const newValue = userInput.substring(0, start) + text + userInput.substring(end);
    setUserInput(newValue);
    
    // Set focus back and move cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = start + text.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const renderMathPreview = () => {
    if (!userInput) return <span className="text-gray-400 italic">預覽答案...</span>;
    try {
      let latex = userInput.replace(/√(\d+)/g, '\\sqrt{$1}');
      latex = latex.replace(/√/g, '\\sqrt');
      return <InlineMath math={latex} />;
    } catch (e) {
      return <span className="text-red-400">格式錯誤</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#333] font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-lg mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Calculator className="text-stone-600" />
          <span>二次式挑戰</span>
        </div>
        <div className="flex items-center gap-2 text-stone-400 font-medium">
          <Trophy size={18} />
          <span>得分 : {score.correct} / {score.total}</span>
        </div>
      </header>

      <main className="w-full max-w-lg bg-white rounded-[40px] shadow-sm p-10 border border-stone-100">
        <div className="mb-8 text-center">
          <div className="text-stone-400 text-sm mb-4">計算並化簡</div>
          <div className="text-3xl py-8 bg-[#f8f9fa] rounded-3xl border border-stone-100 flex items-center justify-center min-h-[120px]">
            {problem && <BlockMath math={problem.questionLatex} />}
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full text-2xl p-6 bg-white border-2 rounded-3xl focus:outline-none transition-all ${
                feedback?.isCorrect ? 'border-[#00c897] text-[#00c897]' : 'border-stone-100 focus:border-stone-200'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '√'].map(char => (
              <button
                key={char}
                onClick={() => insertAtCursor(char)}
                className="w-12 h-12 flex items-center justify-center bg-stone-50 hover:bg-stone-100 rounded-xl font-medium text-xl transition-colors border border-stone-100"
              >
                {char}
              </button>
            ))}
            <button
              onClick={() => setUserInput('')}
              className="w-12 h-12 flex items-center justify-center bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors border border-stone-100 text-stone-400"
            >
              <Eraser size={20} />
            </button>
          </div>

          <button
            onClick={checkAnswer}
            className="w-full py-5 bg-[#1a1a1a] text-white rounded-3xl font-bold text-xl hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {feedback?.isCorrect ? (
              <>下一個題 <ChevronRight size={24} /></>
            ) : '提交答案'}
          </button>
        </div>

        <div className="mt-8 space-y-4">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-2 font-bold ${
                  feedback.isCorrect ? 'text-[#00c897]' : 'text-rose-500'
                }`}
              >
                {feedback.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                <span>{feedback.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium"
          >
            <HelpCircle size={18} />
            <span>查看解析</span>
          </button>

          <AnimatePresence>
            {showHint && problem && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-stone-500 text-sm">
                  <p>正確答案 : {radicalSumToDisplay(problem.answer)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-12 text-stone-400 text-xs text-center max-w-md leading-relaxed">
        <p>提示：使用完全平方公式 (a±b)² = a²±2ab+b² 或平方差公式 (a+b)(a-b) = a²-b² 進行展開。</p>
      </footer>
    </div>
  );
}


import React, { useState, useEffect, useCallback } from 'react';
import { sideStoryVolumes } from '../data/sideStories';
import { Language, SideStoryVolume, ReadingMode } from '../types';
import SideStoryVolumeList from '../components/sidestory/SideStoryVolumeList';
import SideStoryChapterList from '../components/sidestory/SideStoryChapterList';
import SideStoryExtraDirectory from '../components/sidestory/SideStoryExtraDirectory';
import SideStoryReader from '../components/sidestory/SideStoryReader';
import VisualNovelPage from '../pages/VisualNovelPage'; 
import SideCharacterModal from '../components/sidestory/SideCharacterModal';
import SideStoryEntryAnimation from '../components/SideStoryEntryAnimation';
import { ReaderFont } from '../components/fonts/fontConfig';
import TemporaryTerminal from '../components/TemporaryTerminal';

interface SideStoriesPageProps {
  language: Language;
  isLightTheme: boolean;
  onVolumeChange: (volumeId: string | null) => void;
  readerFont: ReaderFont;
  readingMode?: ReadingMode; // Accept reading mode
  onTerminalOpen?: () => void;
  onTerminalClose?: () => void;
  // Cross Navigation Props
  initialVolumeId?: string | null;
  onConsumeInitialVolume?: () => void;
  onJump?: (targetId: string) => void; // Added onJump prop
}

const SideStoriesPage: React.FC<SideStoriesPageProps> = ({ 
    language, isLightTheme, onVolumeChange, readerFont, readingMode = 'standard', 
    onTerminalOpen, onTerminalClose, initialVolumeId, onConsumeInitialVolume, onJump 
}) => {
  // Navigation State: 'volumes' -> 'chapters' -> 'extra_directory' (optional) -> 'reader' | 'game'
  const [viewMode, setViewMode] = useState<'volumes' | 'chapters' | 'extra_directory' | 'reader' | 'game'>('volumes');
  const [activeVolume, setActiveVolume] = useState<SideStoryVolume | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showCharModal, setShowCharModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  // Terminal State: Stores the ID of the script to play, null if closed
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);

  // Auto-jump to volume if ID provided via props
  useEffect(() => {
      if (initialVolumeId) {
          const vol = sideStoryVolumes.find(v => v.id === initialVolumeId);
          if (vol) {
              handleVolumeSelect(vol);
          }
          // Reset the prop trigger
          if (onConsumeInitialVolume) onConsumeInitialVolume();
      }
  }, [initialVolumeId]);

  // Trigger animation when entering a folder (Volume)
  const handleVolumeSelect = (vol: SideStoryVolume) => {
    setActiveVolume(vol);
    setCurrentChapterIndex(0); // Reset index to prevent out-of-bounds errors on volume switch
    onVolumeChange(vol.id); // Notify App.tsx to potentially play music
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setViewMode('chapters');
  };

  const handleChapterSelect = (index: number) => {
    setCurrentChapterIndex(index);
    
    // Check if it's the special terminal chapter
    if (activeVolume && activeVolume.chapters[index].id === 'special-terminal-discovery') {
       handleOpenTerminal('T001');
       return; 
    }

    // Logic: Respect Reading Mode preference, but allow override for specific highly-interactive volumes like DAILY if we want (Currently unified)
    if (readingMode === 'visual_novel') {
        setViewMode('game');
    } else {
        setViewMode('reader');
    }
  };

  const handleEnterExtraDirectory = () => {
    setViewMode('extra_directory');
  };

  const handleExtraChapterSelect = (chapterId: string) => {
      if (!activeVolume) return;
      const index = activeVolume.chapters.findIndex(c => c.id === chapterId);
      if (index !== -1) {
          setCurrentChapterIndex(index);
          // Extra chapters (like the diary) often look better as text, but let's respect preference
          setViewMode(readingMode === 'visual_novel' ? 'game' : 'reader');
      }
  };
  
  const handleBackToVolumes = () => {
      setActiveVolume(null);
      onVolumeChange(null); // Notify App.tsx we left the volume
      setViewMode('volumes');
  };

  // Wrap with useCallback to stabilize reference
  const handleOpenTerminal = useCallback((scriptId: string) => {
      setActiveTerminalId(scriptId);
      if (onTerminalOpen) onTerminalOpen();
  }, [onTerminalOpen]);

  const handleCloseTerminal = useCallback(() => {
      setActiveTerminalId(null);
      if (onTerminalClose) onTerminalClose();
  }, [onTerminalClose]);

  const handleTerminalComplete = useCallback(() => {
      handleCloseTerminal();
      // Auto-advance logic
      if (activeVolume) {
          // Find the index of the terminal chapter (usually via ID special-terminal-discovery)
          const termIndex = activeVolume.chapters.findIndex(c => c.id === 'special-terminal-discovery');
          const nextIndex = termIndex + 1;
          
          if (termIndex !== -1 && nextIndex < activeVolume.chapters.length) {
              const nextChapter = activeVolume.chapters[nextIndex];
              
              // HARD STOP: Explicitly prevent jumping to the secret diary chapter
              if (nextChapter.id === 'story-byaki-diary') {
                  return;
              }

              // Only advance if the next chapter is NOT locked/corrupted
              // This prevents the "jumping to locked chapter error"
              if (nextChapter.status !== 'locked' && nextChapter.status !== 'corrupted') {
                  setCurrentChapterIndex(nextIndex);
                  // Since we closed the terminal, we assume the user is still on the previous ViewMode (Chapter List likely)
                  // If we want to auto-open the reader for the next chapter:
                  // setViewMode(readingMode === 'visual_novel' ? 'game' : 'reader'); 
                  // However, staying on list is safer if the flow is just unlocking. 
                  // If intent is story flow:
                  // setCurrentChapterIndex(nextIndex);
              } else {
                  // Optional: You could unlock it here if that was the game logic,
                  // but for now we just stop the auto-jump.
                  console.log("Next chapter is locked, staying on current view.");
              }
          }
      }
  }, [activeVolume, handleCloseTerminal]);

  // Monitor chapter changes to trigger terminal if navigated to (e.g. from previous chapter in Game Mode)
  useEffect(() => {
      if (activeVolume && (viewMode === 'game' || viewMode === 'reader')) {
          const chapter = activeVolume.chapters[currentChapterIndex];
          if (chapter && chapter.id === 'special-terminal-discovery') {
              handleOpenTerminal('T001');
          }
      }
  }, [currentChapterIndex, activeVolume, viewMode, handleOpenTerminal]);

  // Render Animation if active
  if (isAnimating && activeVolume) {
    return (
        <SideStoryEntryAnimation 
            onComplete={handleAnimationComplete}
            language={language}
            volumeId={activeVolume.id}
        />
    );
  }

  // --- View 1: Volume Index (Directory) ---
  if (viewMode === 'volumes') {
    return (
        <>
            <SideStoryVolumeList 
                volumes={sideStoryVolumes}
                onSelectVolume={handleVolumeSelect}
                onOpenCharModal={() => setShowCharModal(true)}
                onOpenTerminal={() => handleOpenTerminal('T001')} // Default fallback if triggered here
                language={language}
                isLightTheme={isLightTheme}
            />
            <SideCharacterModal 
                isOpen={showCharModal}
                onClose={() => setShowCharModal(false)}
                language={language}
                isLightTheme={isLightTheme}
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
        </>
    );
  }

  // --- View 2: Chapter List (File Browser) ---
  if (viewMode === 'chapters' && activeVolume) {
      return (
        <>
            <SideStoryChapterList 
                key={activeVolume.id} // Ensure remount when volume changes to reset local state (e.g. timeline toggle)
                volume={activeVolume}
                onBack={handleBackToVolumes}
                onSelectChapter={handleChapterSelect}
                onEnterExtra={handleEnterExtraDirectory}
                onOpenTerminal={handleOpenTerminal}
                language={language}
                isLightTheme={isLightTheme}
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
        </>
      );
  }

  // --- View 2.5: Extra Fragmented Directory ---
  if (viewMode === 'extra_directory' && activeVolume) {
      const extraChapters = activeVolume.chapters.filter(c => c.id === 'story-byaki-diary');
      return (
          <SideStoryExtraDirectory 
            chapters={extraChapters}
            onBack={() => setViewMode('chapters')}
            onSelectChapter={handleExtraChapterSelect}
            language={language}
            isLightTheme={isLightTheme}
          />
      );
  }

  // --- View 3: Reader (Standard) ---
  if (viewMode === 'reader' && activeVolume) {
      // Ensure chapter exists before rendering
      const chapterExists = activeVolume.chapters[currentChapterIndex];
      if (!chapterExists) {
          // Fallback or error state
          return <div className="p-8 text-center text-red-500 font-mono">ERROR: CHAPTER_INDEX_OUT_OF_BOUNDS</div>;
      }

      return (
        <>
            <SideStoryReader 
                volume={activeVolume}
                currentIndex={currentChapterIndex} 
                onBack={() => {
                    const isExtra = activeVolume.chapters[currentChapterIndex]?.id === 'story-byaki-diary';
                    setViewMode(isExtra ? 'extra_directory' : 'chapters');
                }}
                language={language}
                isLightTheme={isLightTheme}
                readerFont={readerFont}
                onOpenTerminal={handleOpenTerminal}
                onJump={onJump} // Pass down the jump handler
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
        </>
      );
  }

  // --- View 4: Game Engine (Visual Novel) ---
  if (viewMode === 'game' && activeVolume) {
      const chapter = activeVolume.chapters[currentChapterIndex];
      if (!chapter) {
          return <div className="p-8 text-center text-red-500 font-mono">ERROR: CHAPTER_DATA_MISSING</div>;
      }

      return (
          <>
            <VisualNovelPage 
                chapter={chapter}
                onNextChapter={() => {
                    if (currentChapterIndex < activeVolume.chapters.length - 1) {
                        setCurrentChapterIndex(prev => prev + 1);
                    }
                }}
                onPrevChapter={() => {
                    if (currentChapterIndex > 0) {
                        setCurrentChapterIndex(prev => prev - 1);
                    }
                }}
                onExit={() => setViewMode('chapters')}
                language={language}
                isLightTheme={isLightTheme}
            />
            {activeTerminalId && (
                <TemporaryTerminal 
                    language={language}
                    onClose={handleCloseTerminal}
                    onComplete={handleTerminalComplete}
                    scriptId={activeTerminalId}
                />
            )}
          </>
      );
  }

  return null;
};

export default SideStoriesPage;

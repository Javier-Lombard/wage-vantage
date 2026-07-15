import { BarChart3, Sparkles, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { Icon, Text } from '@/shared/components/ui';

import type { LucideIcon } from 'lucide-react';

interface EnrichmentPhrase {
  text: string;
  /** Icono coherente con el texto — cambia junto a él, no por separado. */
  icon: LucideIcon;
}

/** Rota cada PHRASE_INTERVAL_MS mientras dure la carga — 3 frases, sin i18n en el proyecto. */
const PHRASES: EnrichmentPhrase[] = [
  { text: 'Enriching your data with AI...', icon: Sparkles },
  { text: 'Analyzing regional salary patterns...', icon: BarChart3 },
  { text: 'Almost there — refining the estimate...', icon: Target },
];

const PHRASE_INTERVAL_MS = 2000;

/**
 * Sustituye a SalaryCalculatorSkeleton en el mismo slot de MainChart
 * (isLoading || !baseAggregation). getWageInsights hace RPC y, si la muestra
 * es pequeña, tambien Gemini como una sola queryFn — no hay señal aparte para
 * "esperando Gemini" vs "esperando RPC", así que las frases rotan durante
 * toda la ventana de isFetching, no solo la fase de enriquecimiento.
 */
export function GeminiEnrichmentLoader() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % PHRASES.length);
    }, PHRASE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const phrase = PHRASES[phraseIndex];

  return (
    <div
      className="flex h-full min-h-80 w-full items-center justify-center rounded-xl p-6 text-center"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phraseIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <Text variant="body-lg" className="text-muted">
            {phrase.text}
          </Text>
          <Icon icon={phrase.icon} size={32} className="text-muted" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

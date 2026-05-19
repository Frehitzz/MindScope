/* =======================
    frontend controller for the AI insight feature
    - renders the Generate Insight btn
    - checks whether the reqst should be allowed
    - opens the modal
    - calls the backend throufh the API cliet
    - shows loading, success, or error state
*/
import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Sparkles, X } from 'lucide-react';

import { aiService, type InsightRequest } from '../../api/ai';

type GenerateInsightProps = {
  dashboardData: InsightRequest;
  disabled?: boolean;
};

export default function GenerateInsight({
  dashboardData,
  disabled = false,
}: GenerateInsightProps) {
  const [insight, setInsight] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // checks if theres any displayable data 
  const hasData = useMemo(() => {
    return (
      dashboardData.stats.length > 0 ||
      dashboardData.platformData.labels.length > 0 ||
      dashboardData.interactionData.labels.length > 0 ||
      dashboardData.scatterData.length > 0
    );
  }, [dashboardData]);

  function getFriendlyErrorMessage(message: string) {
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('high demand') ||
      normalizedMessage.includes('overloaded') ||
      normalizedMessage.includes('rate limit') ||
      normalizedMessage.includes('resource has been exhausted') ||
      normalizedMessage.includes('too many requests') ||
      normalizedMessage.includes('quota')
    ) {
      return 'AI insight generation is temporarily busy. Please try again in a moment.';
    }

    return 'Unable to generate an insight right now. Please try again.';
  }

  function isRateLimitError(error: unknown) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number'
        ? error.status
        : null;
    const message = error instanceof Error ? error.message : '';

    return status === 429 || getFriendlyErrorMessage(message) !== 'Unable to generate an insight right now. Please try again.';
  }

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  async function handleGenerateInsight() {
    // checks whether the request should be allowed
    // disabled - if the dashboard is still loading
    // isLoading - prevents spam-clicking multiple request
    // !hasData - prevents ai request when dashboard has no data
    if (disabled || isLoading || !hasData) {
      return;
    }

    setIsLoading(true);
    setIsModalOpen(true); // this opens the modal
    setInsight('');
    setError('');

    try {
      // calls the backend through API client
      const response = await aiService.generateInsight(dashboardData);
      setInsight(response.insight);
    } catch (requestError) {
      const rawMessage =
        requestError instanceof Error ? requestError.message : 'Failed to generate insight.';
      setError(
        isRateLimitError(requestError)
          ? 'AI insight generation is temporarily busy. Please try again in a moment.'
          : getFriendlyErrorMessage(rawMessage)
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="w-full lg:w-auto">
        {/*
        renders generate insight button
      */}
        <button
          type="button"
          onClick={handleGenerateInsight}
          disabled={disabled || isLoading || !hasData}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-sage/20 bg-sage px-3 py-2 text-xs font-medium text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:border-mist-light disabled:bg-mist disabled:text-white/80 sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm"
        >
          {isLoading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Sparkles size={16} />
          )}
          {/* button text changing depends on the action of the user */}
          <span>{isLoading ? 'Generating...' : 'Generate Insight'}</span>
        </button>
      </div>

      {/* modal opening */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/45 px-4"
          onClick={() => setIsModalOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-2xl rounded-md border border-mist-light bg-card p-6 shadow-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-insight-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="generate-insight-title" className="font-display text-2xl font-medium text-forest">
                  AI Insight
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Generated from the current dashboard metrics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mist-light text-text-muted transition hover:bg-cream hover:text-forest"
                aria-label="Close insight modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-md border border-mist-light bg-cream px-4 py-4">
              {isLoading ? (
                <div className="flex items-center gap-3 text-sm text-text-body">
                  <LoaderCircle size={18} className="animate-spin text-sage" />
                  <span>Generating insight from the latest dashboard data...</span>
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <p className="text-sm leading-6 text-dusk">{error}</p>
                  <button
                    type="button"
                    onClick={handleGenerateInsight}
                    disabled={disabled || isLoading || !hasData}
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-dusk/20 bg-dusk px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:border-mist-light disabled:bg-mist disabled:text-white/80"
                  >
                    <Sparkles size={16} />
                    <span>Retry</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm leading-7 text-text-body">{insight}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

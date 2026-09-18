'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import StatusChip from '@/components/ui/StatusChip';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import { Code2, Search, ArrowRight } from 'lucide-react';

export default function CodingChallengesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    fetchChallenges();
  }, [router]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = new URL('/api/coding-challenges', window.location.origin);
      if (difficultyFilter) url.searchParams.set('difficulty', difficultyFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setChallenges(data.challenges || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) fetchChallenges();
  }, [difficultyFilter]);

  const filtered = challenges.filter((c) =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading variant="spinner" fullScreen text="Loading challenges..." />;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6 pb-6 border-b border-rule">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-1">
              Skill Practice
            </span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              Coding Challenges
            </h1>
            <p className="text-sm text-graphite mt-1 max-w-xl">
              Solve technical algorithmic challenges, submit implementations, and test your code against test suites.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-graphite absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-sheet text-ink text-sm rounded-chip border border-rule-strong pl-10 pr-4 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-sheet text-ink text-sm rounded-chip border border-rule-strong px-3.5 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal cursor-pointer"
            >
              <option value="">All difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Challenges Grid */}
        {filtered.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto my-8">
            <Code2 className="w-12 h-12 text-graphite mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-ink mb-1">No challenges found</h3>
            <p className="text-xs text-graphite mb-4">
              Try adjusting your search query or difficulty filter.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('');
              }}
            >
              Reset filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((challenge) => {
              const diffVariant =
                challenge.difficulty === 'easy'
                  ? 'clean'
                  : challenge.difficulty === 'hard'
                  ? 'flagged'
                  : 'review';

              return (
                <Card key={challenge._id} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <StatusChip variant={diffVariant} size="sm">
                        {challenge.difficulty || 'General'}
                      </StatusChip>
                      <span className="text-[11px] text-graphite font-mono">
                        {challenge.points || 100} pts
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink mb-2 line-clamp-1">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-graphite leading-relaxed line-clamp-2 mb-4">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-rule flex items-center justify-between">
                    <span className="text-xs text-graphite">Python / JS / TS</span>
                    <Link href={`/coding/${challenge._id}`}>
                      <Button variant="primary" size="sm">
                        Solve challenge →
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

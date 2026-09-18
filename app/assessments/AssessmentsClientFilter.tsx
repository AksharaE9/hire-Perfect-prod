'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import CategoryCard from '@/components/ui/CategoryCard';
import Button from '@/components/ui/Button';
import { CategoryGroup } from '@/src/content/assessments';

interface AssessmentsClientFilterProps {
  categories: readonly any[] | any[];
  groups: CategoryGroup[];
}

export default function AssessmentsClientFilter({
  categories,
  groups,
}: AssessmentsClientFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');

  // If ?category=<slug> query param is present, redirect to clean route /assessments/<slug>
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      router.replace(`/assessments/${catParam}`);
    }
  }, [searchParams, router]);

  // Filter logic
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Filter by group
    if (selectedGroup !== 'all') {
      const activeGroup = groups.find((g) => g.id === selectedGroup);
      if (activeGroup) {
        result = result.filter((cat) => activeGroup.categories.includes(cat.slug));
      }
    }

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(q) ||
          cat.description?.toLowerCase().includes(q) ||
          (cat.subjects || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [categories, groups, selectedGroup, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Bar & Group Filter Chips */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-6 border-b border-rule">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-graphite absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by category, skill or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sheet text-ink text-sm rounded-btn border border-rule-strong pl-10 pr-10 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-graphite hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Group Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedGroup('all')}
            className={`text-xs font-medium px-3 py-1.5 rounded-chip border transition-all duration-150 ${
              selectedGroup === 'all'
                ? 'bg-signal text-white border-signal shadow-subtle'
                : 'bg-sheet text-graphite hover:text-ink border-rule hover:border-rule-strong'
            }`}
          >
            All Categories ({categories.length})
          </button>
          {groups.map((group) => {
            const isSelected = selectedGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroup(group.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-chip border transition-all duration-150 ${
                  isSelected
                    ? 'bg-signal text-white border-signal shadow-subtle'
                    : 'bg-sheet text-graphite hover:text-ink border-rule hover:border-rule-strong'
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.name}
              slug={category.slug}
              description={category.description}
              subjects={category.subjects}
              assessmentsCount={12}
            />
          ))}
        </div>
      ) : (
        <div className="bg-sheet border border-rule rounded-card p-12 text-center max-w-md mx-auto my-12">
          <h3 className="text-lg font-bold text-ink mb-2">No categories found</h3>
          <p className="text-sm text-graphite leading-relaxed mb-6">
            No categories match &quot;{searchQuery}&quot;. Try a broader word like &quot;data&quot;, &quot;cloud&quot; or &quot;AI&quot;.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedGroup('all');
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

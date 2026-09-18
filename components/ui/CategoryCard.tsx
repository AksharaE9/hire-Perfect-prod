import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  subjects?: readonly string[] | string[];
  assessmentsCount?: number;
}

export function CategoryCard({
  name,
  slug,
  description,
  subjects = [],
  assessmentsCount = 12,
}: CategoryCardProps) {
  const displaySubjects = subjects.slice(0, 4);

  return (
    <Link href={`/assessments/${slug}`} className="block h-full group">
      <div className="h-full bg-sheet border border-rule group-hover:border-rule-strong rounded-card p-6 flex flex-col justify-between transition-all duration-200 shadow-subtle group-hover:shadow-floating">
        <div>
          {/* Illustration Container */}
          <div className="relative aspect-[4/3] w-full rounded-chip overflow-hidden bg-paper border border-rule mb-5">
            <Image
              src={`/images/categories/${slug}.webp`}
              alt={`Illustration for ${name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Category Header & Tag */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-semibold text-signal bg-signal-soft px-2.5 py-0.5 rounded-chip">
              {assessmentsCount} assessments
            </span>
          </div>

          <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-signal transition-colors line-clamp-1">
            {name}
          </h3>

          <p className="text-xs text-graphite leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>

          {/* Topics List */}
          {displaySubjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {displaySubjects.map((sub, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-graphite bg-paper px-2 py-0.5 rounded-chip border border-rule line-clamp-1"
                >
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Hint Footer */}
        <div className="pt-4 border-t border-rule flex items-center justify-between text-[11px] text-graphite font-medium">
          <span>₹2,000 category</span>
          <span className="text-signal font-semibold group-hover:underline">View assessments →</span>
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;

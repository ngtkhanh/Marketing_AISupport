import React from 'react';

export function SkeletonIdeaList() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between pb-2">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="h-5 w-24 bg-slate-200 rounded-md" />
      </div>

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1 max-w-lg">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-200 rounded" />
            </div>
            <div className="h-9 w-28 bg-slate-200 rounded-xl" />
          </div>

          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>

          <div className="h-16 w-full bg-slate-100 rounded-xl" />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}


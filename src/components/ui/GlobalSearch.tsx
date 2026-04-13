"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IconlyIcon from "./IconlyIcon";
import Image from "next/image";

export type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  category: "Consortia" | "Networks" | "Pillars" | "Alignment" | "Impact" | "Other";
  icon?: string;
  logo?: string;
  action: () => void;
};

interface GlobalSearchProps {
  query: string;
  results: SearchResult[];
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ query, results, isOpen, onClose }: GlobalSearchProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen || query.length < 2) return null;

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[400px] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl">
      <div className="p-2">
        {results.length === 0 ? (
          <div className="p-8 text-center">
            <IconlyIcon name="search" size={32} color="#cbd5e1" className="mx-auto mb-3" />
            <p className="text-sm text-slate-500">No results found for "{query}"</p>
          </div>
        ) : (
          Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="mb-2 last:mb-0">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {category}
              </div>
              <div className="space-y-1">
                {items.map((item) => {
                  const isSelected = results.indexOf(item) === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                        isSelected ? "bg-au-dark-green/10" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 p-1 shadow-sm">
                        {item.logo ? (
                          <Image
                            src={item.logo}
                            alt=""
                            width={32}
                            height={32}
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        ) : (
                          <IconlyIcon name={item.icon || "Discovery"} size={20} color="var(--color-au-dark-green)" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
                        {item.subtitle && (
                          <div className="truncate text-xs text-slate-500">{item.subtitle}</div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="shrink-0 text-[10px] font-medium text-au-dark-green">
                          Enter ↵
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { ArrowUpDown, ChevronDown, Search, X, Download, SlidersHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SectionHeader } from '../components/SectionHeader';
import { supabase } from '../lib/supabase';
import type { DataTableRow } from '../types/teenMentalHealth';

type SortField = keyof DataTableRow;
type SortDir = 'asc' | 'desc';

// Compact custom filter dropdown — sizes to the displayed value, not the longest option
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative flex items-center gap-0.5">
      <span className="text-[13px] text-text-muted whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-0.5 text-[13px] font-medium text-forest hover:text-sage-dark transition-colors cursor-pointer whitespace-nowrap"
      >
        {selected}
        <ChevronDown size={12} className="shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-card border border-mist-light rounded-md shadow-card-hover py-1 min-w-max">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`
                w-full text-left px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors
                ${o.value === value
                  ? 'text-forest font-semibold bg-sage/10'
                  : 'text-text-body hover:bg-cream'}
              `}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 25;

const columns: { key: SortField; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'gender', label: 'Gender' },
  { key: 'social_interaction_level', label: 'Social Interaction' },
  { key: 'daily_social_media_hours', label: 'Daily Social Media' },
  { key: 'platform_usage', label: 'Primary Platform' },
  { key: 'depression_label', label: 'Depression Status' },
];

const DATA_TABLE_SELECT =
  'id, gender, social_interaction_level, daily_social_media_hours, platform_usage, depression_label';
const DATA_TABLE_SOURCE = 'public_teen_mental_health_table';

export function DataTablePage() {
  const [rows, setRows] = useState<DataTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [interactionFilter, setInteractionFilter] = useState('All');
  const [depressionFilter, setDepressionFilter] = useState('All');
  const [usageFilter, setUsageFilter] = useState('All');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let isMounted = true;

    async function fetchRows() {
      setLoading(true);
      setError(null);
      const rangeStart = (currentPage - 1) * PAGE_SIZE;
      const rangeEnd = rangeStart + PAGE_SIZE - 1;
      const trimmedSearch = deferredSearch.trim();
      const normalizedSearch = trimmedSearch.toLowerCase();
      const numericSearch = Number(trimmedSearch);
      let query = supabase
        .from(DATA_TABLE_SOURCE)
        .select(DATA_TABLE_SELECT, { count: 'exact' })
        .order(sortField, { ascending: sortDir === 'asc' })
        .range(rangeStart, rangeEnd);

      if (trimmedSearch) {
        const searchClauses = [
          `gender.ilike.%${trimmedSearch}%`,
          `social_interaction_level.ilike.%${trimmedSearch}%`,
          `platform_usage.ilike.%${trimmedSearch}%`,
        ];

        if (Number.isInteger(numericSearch)) {
          searchClauses.push(`id.eq.${numericSearch}`);
        }

        if (normalizedSearch === 'depressed') {
          searchClauses.push('depression_label.eq.1');
        }

        if (normalizedSearch === 'not depressed') {
          searchClauses.push('depression_label.eq.0');
        }

        query = query.or(searchClauses.join(','));
      }

      if (platformFilter !== 'All') {
        query = query.eq('platform_usage', platformFilter);
      }

      if (interactionFilter !== 'All') {
        query = query.eq('social_interaction_level', interactionFilter.toLowerCase());
      }

      if (depressionFilter === 'Depressed') {
        query = query.eq('depression_label', 1);
      }

      if (depressionFilter === 'Not Depressed') {
        query = query.eq('depression_label', 0);
      }

      if (usageFilter === '0-2h') {
        query = query.gte('daily_social_media_hours', 0).lte('daily_social_media_hours', 2);
      }

      if (usageFilter === '3-5h') {
        query = query.gte('daily_social_media_hours', 3).lte('daily_social_media_hours', 5);
      }

      if (usageFilter === '6h+') {
        query = query.gte('daily_social_media_hours', 6);
      }

      const { data, count, error: fetchError } = await query;

      if (!isMounted) return;

      if (fetchError) {
        console.error('Error fetching data table rows:', fetchError);
        setError('Could not load records from Supabase.');
        setRows([]);
        setTotalCount(0);
      } else {
        const nextTotalCount = count ?? 0;
        const nextTotalPages = Math.max(1, Math.ceil(nextTotalCount / PAGE_SIZE));

        if (currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
          return;
        }

        setRows(data ?? []);
        setTotalCount(nextTotalCount);
      }

      setLoading(false);
    }

    fetchRows();

    return () => {
      isMounted = false;
    };
  }, [currentPage, deferredSearch, depressionFilter, interactionFilter, platformFilter, sortDir, sortField, usageFilter]);

  const handleSort = (field: SortField) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const hasActiveFilters =
    Boolean(search) ||
    platformFilter !== 'All' ||
    interactionFilter !== 'All' ||
    depressionFilter !== 'All' ||
    usageFilter !== 'All';

  const clearFilters = () => {
    setSearch('');
    setPlatformFilter('All');
    setInteractionFilter('All');
    setDepressionFilter('All');
    setUsageFilter('All');
    setCurrentPage(1);
  };

  const formatDepressionStatus = (value: number | null) => {
    if (value === 1) return 'Depressed';
    if (value === 0) return 'Not Depressed';
    return 'Unknown';
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    const trimmedSearch = deferredSearch.trim();
    const normalizedSearch = trimmedSearch.toLowerCase();
    const numericSearch = Number(trimmedSearch);
    let exportQuery = supabase
      .from(DATA_TABLE_SOURCE)
      .select(DATA_TABLE_SELECT)
      .order(sortField, { ascending: sortDir === 'asc' });

    if (trimmedSearch) {
      const searchClauses = [
        `gender.ilike.%${trimmedSearch}%`,
        `social_interaction_level.ilike.%${trimmedSearch}%`,
        `platform_usage.ilike.%${trimmedSearch}%`,
      ];

      if (Number.isInteger(numericSearch)) {
        searchClauses.push(`id.eq.${numericSearch}`);
      }

      if (normalizedSearch === 'depressed') {
        searchClauses.push('depression_label.eq.1');
      }

      if (normalizedSearch === 'not depressed') {
        searchClauses.push('depression_label.eq.0');
      }

      exportQuery = exportQuery.or(searchClauses.join(','));
    }

    if (platformFilter !== 'All') {
      exportQuery = exportQuery.eq('platform_usage', platformFilter);
    }

    if (interactionFilter !== 'All') {
      exportQuery = exportQuery.eq('social_interaction_level', interactionFilter.toLowerCase());
    }

    if (depressionFilter === 'Depressed') {
      exportQuery = exportQuery.eq('depression_label', 1);
    }

    if (depressionFilter === 'Not Depressed') {
      exportQuery = exportQuery.eq('depression_label', 0);
    }

    if (usageFilter === '0-2h') {
      exportQuery = exportQuery.gte('daily_social_media_hours', 0).lte('daily_social_media_hours', 2);
    }

    if (usageFilter === '3-5h') {
      exportQuery = exportQuery.gte('daily_social_media_hours', 3).lte('daily_social_media_hours', 5);
    }

    if (usageFilter === '6h+') {
      exportQuery = exportQuery.gte('daily_social_media_hours', 6);
    }

    const { data, error: exportError } = await exportQuery;

    if (exportError) {
      console.error('Error exporting data table rows:', exportError);
      setError('Could not export filtered records from Supabase.');
      setExporting(false);
      return;
    }

    const exportData = (data ?? []).map((row) => ({
      'ID': row.id,
      'Gender': row.gender ?? 'Unknown',
      'Social Interaction': row.social_interaction_level ?? 'Unknown',
      'Daily Social Media Hours': row.daily_social_media_hours ?? 'Unknown',
      'Primary Platform': row.platform_usage ?? 'Unknown',
      'Depression Status': formatDepressionStatus(row.depression_label)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    XLSX.writeFile(workbook, 'MindScope_Data.xlsx');
    setExporting(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-forest mb-1">Data Table</h1>
          <p className="font-body text-sm text-text-muted">
            Browse and search individual student wellbeing records.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={loading || exporting}
          className="
            flex items-center gap-2 px-4 py-2 rounded-md font-body text-[13px] font-semibold
            bg-sage text-white hover:bg-sage-dark shadow-sm hover:-translate-y-0.5 hover:shadow-card-hover
            transition-all duration-300 ease-out shrink-0 disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          <Download size={15} />
          {exporting ? 'Exporting...' : 'Export Data'}
        </button>
      </div>

      <div className="sticky -top-5 z-20 bg-cream pt-5 pb-4 mb-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 flex-wrap md:flex-nowrap">
          <div className="relative min-w-0 flex-1 sm:w-48 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="table-search"
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="
                w-full pl-8 pr-3 py-2 rounded-md
                bg-card border border-mist-light
                font-body text-xs text-forest placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-sage/30
                transition-all duration-200
                min-h-[38px]
              "
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="
              flex min-h-[38px] shrink-0 items-center gap-2 rounded-md border border-mist-light bg-card px-3 py-2
              font-body text-xs font-semibold text-forest transition-colors duration-200 hover:bg-cream md:hidden
            "
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-sage px-1.5 py-0.5 text-[10px] leading-none text-white">
                Active
              </span>
            )}
          </button>

          <div className="hidden md:flex items-center gap-3 flex-wrap">
            <FilterSelect
              label="Platform:"
              value={platformFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: 'TikTok', label: 'TikTok' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'Both', label: 'Both' },
              ]}
              onChange={(v) => { setPlatformFilter(v); setCurrentPage(1); }}
            />

            <span className="w-1 h-1 rounded-full bg-mist-light"></span>

            <FilterSelect
              label="Interaction:"
              value={interactionFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              onChange={(v) => { setInteractionFilter(v); setCurrentPage(1); }}
            />

            <span className="w-1 h-1 rounded-full bg-mist-light"></span>

            <FilterSelect
              label="Depression:"
              value={depressionFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Depressed', label: 'Depressed' },
                { value: 'Not Depressed', label: 'Not Depressed' },
              ]}
              onChange={(v) => { setDepressionFilter(v); setCurrentPage(1); }}
            />

            <span className="w-1 h-1 rounded-full bg-mist-light"></span>

            <FilterSelect
              label="Usage:"
              value={usageFilter}
              options={[
                { value: 'All', label: 'All' },
                { value: '0-2h', label: '0-2h' },
                { value: '3-5h', label: '3-5h' },
                { value: '6h+', label: '6h+' },
              ]}
              onChange={(v) => { setUsageFilter(v); setCurrentPage(1); }}
            />
          </div>

          <div className="hidden md:block shrink-0 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={clearFilters}
              className="
                flex items-center justify-center p-2.5 rounded-md border border-mist-light bg-card
                text-text-muted hover:text-dusk hover:bg-cream
                transition-all duration-200 min-h-[38px] min-w-[38px]
              "
              disabled={!hasActiveFilters}
              aria-hidden={!hasActiveFilters}
              title="Clear all filters"
              style={{ visibility: hasActiveFilters ? 'visible' : 'hidden' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <span className="font-body text-xs text-text-muted whitespace-nowrap shrink-0 lg:ml-4">
          {loading ? 'Loading records...' : `${rows.length} shown of ${totalCount} records`}
        </span>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-forest/30 backdrop-blur-[2px]"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-10 rounded-t-3xl border border-mist-light bg-card px-5 pb-6 pt-5 shadow-card-hover">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-medium text-forest">Filters</h2>
                <p className="font-body text-xs text-text-muted">
                  Refine the data table for mobile view.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-mist-light text-text-muted transition-colors duration-200 hover:bg-cream hover:text-dusk"
                aria-label="Close filters"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  label="Platform:"
                  value={platformFilter}
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'TikTok', label: 'TikTok' },
                    { value: 'Instagram', label: 'Instagram' },
                    { value: 'Both', label: 'Both' },
                  ]}
                  onChange={(v) => { setPlatformFilter(v); setCurrentPage(1); }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  label="Interaction:"
                  value={interactionFilter}
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' },
                  ]}
                  onChange={(v) => { setInteractionFilter(v); setCurrentPage(1); }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  label="Depression:"
                  value={depressionFilter}
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'Depressed', label: 'Depressed' },
                    { value: 'Not Depressed', label: 'Not Depressed' },
                  ]}
                  onChange={(v) => { setDepressionFilter(v); setCurrentPage(1); }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect
                  label="Usage:"
                  value={usageFilter}
                  options={[
                    { value: 'All', label: 'All' },
                    { value: '0-2h', label: '0-2h' },
                    { value: '3-5h', label: '3-5h' },
                    { value: '6h+', label: '6h+' },
                  ]}
                  onChange={(v) => { setUsageFilter(v); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="
                  flex-1 rounded-md border border-mist-light bg-cream px-4 py-3 font-body text-sm font-medium
                  text-text-muted transition-colors duration-200 hover:bg-mist-light/40 disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="
                  flex-1 rounded-md bg-sage px-4 py-3 font-body text-sm font-semibold text-white
                  transition-colors duration-200 hover:bg-sage-dark
                "
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-mist-light rounded-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-mist-light">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="
                      text-left text-[11px] text-text-muted uppercase tracking-[0.1em]
                      px-4 py-3 font-semibold whitespace-nowrap
                      cursor-pointer select-none hover:text-forest
                      transition-colors duration-200
                    "
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown
                        size={12}
                        className={sortField === col.key ? 'text-forest' : 'text-mist'}
                      />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                    Loading records...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-dusk">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.map((row) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-mist-light/60 last:border-none
                    hover:bg-cream transition-colors duration-150
                    ${row.depression_label === 1 ? 'bg-dusk-light/40' : ''}
                  `}
                >
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-3 text-text-body whitespace-nowrap">{row.gender ?? 'Unknown'}</td>
                  <td className="px-4 py-3 text-text-body whitespace-nowrap">
                    {row.social_interaction_level ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-text-body">
                    {row.daily_social_media_hours ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-text-body whitespace-nowrap">
                    {row.platform_usage ?? 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-[11px] font-semibold border
                      ${row.depression_label === 1
                        ? 'bg-dusk-light border-dusk/30 text-dusk'
                        : 'bg-sage-light border-sage/30 text-sage-dark'}
                    `}>
                      {formatDepressionStatus(row.depression_label)}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-text-muted">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-xs text-text-muted">
            Page {activePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={activePage === 1}
              className="
                px-3 py-2 rounded-md border border-mist-light bg-card
                text-sm text-forest disabled:text-text-muted disabled:opacity-50
                disabled:cursor-not-allowed transition-colors duration-200 hover:bg-cream
              "
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
              disabled={activePage === totalPages}
              className="
                px-3 py-2 rounded-md border border-mist-light bg-card
                text-sm text-forest disabled:text-text-muted disabled:opacity-50
                disabled:cursor-not-allowed transition-colors duration-200 hover:bg-cream
              "
            >
              Next
            </button>
          </div>
        </div>
      )}

      <SectionHeader title="" />
    </div>
  );
}

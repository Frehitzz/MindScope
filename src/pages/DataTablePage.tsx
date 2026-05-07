import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Search, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SectionHeader } from '../components/SectionHeader';
import { supabase } from '../lib/supabase';

type TableRow = {
  id: number;
  gender: string | null;
  social_interaction_level: string | null;
  daily_social_media_hours: number | null;
  platform_usage: string | null;
  depression_label: number | null;
};

type SortField = keyof TableRow;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

const columns: { key: SortField; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'gender', label: 'Gender' },
  { key: 'social_interaction_level', label: 'Social Interaction' },
  { key: 'daily_social_media_hours', label: 'Daily Social Media' },
  { key: 'platform_usage', label: 'Primary Platform' },
  { key: 'depression_label', label: 'Depression Status' },
];

export function DataTablePage() {
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [interactionFilter, setInteractionFilter] = useState('All');
  const [depressionFilter, setDepressionFilter] = useState('All');
  const [usageFilter, setUsageFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function fetchRows() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('teen_mental_health_cleaned')
        .select('id, gender, social_interaction_level, daily_social_media_hours, platform_usage, depression_label')
        .order('id', { ascending: true });

      if (!isMounted) return;

      if (fetchError) {
        console.error('Error fetching data table rows:', fetchError);
        setError('Could not load records from Supabase.');
        setRows([]);
      } else {
        setRows((data ?? []) as TableRow[]);
      }

      setLoading(false);
    }

    fetchRows();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSort = (field: SortField) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const nextRows = rows.filter((row) => {
      if (q) {
        const matches = [
          String(row.id),
          row.gender ?? '',
          row.social_interaction_level ?? '',
          row.daily_social_media_hours?.toString() ?? '',
          row.platform_usage ?? '',
          row.depression_label === 1 ? 'depressed' : 'not depressed',
          row.depression_label?.toString() ?? '',
        ].some((value) => value.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (platformFilter !== 'All') {
        const platform = row.platform_usage?.trim().toLowerCase();
        if (platform !== platformFilter.toLowerCase()) return false;
      }

      if (interactionFilter !== 'All') {
        const interaction = row.social_interaction_level?.trim().toLowerCase();
        if (interaction !== interactionFilter.toLowerCase()) return false;
      }

      if (depressionFilter !== 'All') {
        const isDepressed = row.depression_label === 1;
        if (depressionFilter === 'Depressed' && !isDepressed) return false;
        if (depressionFilter === 'Not Depressed' && isDepressed) return false;
      }

      if (usageFilter !== 'All') {
        const hours = row.daily_social_media_hours ?? 0;
        if (usageFilter === '0-2h' && hours > 2) return false;
        if (usageFilter === '3-5h' && (hours < 3 || hours > 5)) return false;
        if (usageFilter === '6h+' && hours < 6) return false;
      }

      return true;
    });

    nextRows.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortDir === 'asc'
        ? String(aVal ?? '').localeCompare(String(bVal ?? ''))
        : String(bVal ?? '').localeCompare(String(aVal ?? ''));
    });

    return nextRows;
  }, [rows, search, platformFilter, interactionFilter, depressionFilter, usageFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, platformFilter, interactionFilter, depressionFilter, usageFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const formatDepressionStatus = (value: number | null) => {
    if (value === 1) return 'Depressed';
    if (value === 0) return 'Not Depressed';
    return 'Unknown';
  };

  const handleExport = () => {
    const exportData = filtered.map(row => ({
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
          className="
            flex items-center gap-2 px-4 py-2 rounded-md font-body text-[13px] font-semibold
            bg-sage text-white hover:bg-sage-dark shadow-sm hover:-translate-y-0.5 hover:shadow-card-hover
            transition-all duration-300 ease-out shrink-0
          "
        >
          <Download size={15} />
          Export Data
        </button>
      </div>

      <div className="sticky -top-5 z-20 bg-cream pt-5 pb-4 mb-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-48 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="table-search"
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-transparent border-none text-[13px] font-medium text-forest focus:ring-0 cursor-pointer hover:text-sage-dark transition-colors p-0"
            >
              <option value="All">Platform: All</option>
              <option value="TikTok">Platform: TikTok</option>
              <option value="Instagram">Platform: Instagram</option>
              <option value="Both">Platform: Both</option>
            </select>

            <span className="w-1 h-1 rounded-full bg-mist-light"></span>

            <select
              value={interactionFilter}
              onChange={(e) => setInteractionFilter(e.target.value)}
              className="bg-transparent border-none text-[13px] font-medium text-forest focus:ring-0 cursor-pointer hover:text-sage-dark transition-colors p-0"
            >
              <option value="All">Interaction: All</option>
              <option value="High">Interaction: High</option>
              <option value="Medium">Interaction: Medium</option>
              <option value="Low">Interaction: Low</option>
            </select>

            <span className="w-1 h-1 rounded-full bg-mist-light"></span>

            <select
              value={depressionFilter}
              onChange={(e) => setDepressionFilter(e.target.value)}
              className="bg-transparent border-none text-[13px] font-medium text-forest focus:ring-0 cursor-pointer hover:text-sage-dark transition-colors p-0"
            >
              <option value="All">Depression: All</option>
              <option value="Depressed">Depressed</option>
              <option value="Not Depressed">Not Depressed</option>
            </select>

            <span className="w-1 h-1 rounded-full bg-mist-light"></span>

            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="bg-transparent border-none text-[13px] font-medium text-forest focus:ring-0 cursor-pointer hover:text-sage-dark transition-colors p-0"
            >
              <option value="All">Usage: All</option>
              <option value="0-2h">Usage: 0-2h</option>
              <option value="3-5h">Usage: 3-5h</option>
              <option value="6h+">Usage: 6h+</option>
            </select>
          </div>

          {(search || platformFilter !== 'All' || interactionFilter !== 'All' || depressionFilter !== 'All' || usageFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPlatformFilter('All');
                setInteractionFilter('All');
                setDepressionFilter('All');
                setUsageFilter('All');
              }}
              className="
                p-2.5 rounded-md border border-mist-light bg-card
                text-text-muted hover:text-dusk hover:bg-cream
                transition-all duration-200 shrink-0
              "
              title="Clear all filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <span className="font-body text-xs text-text-muted whitespace-nowrap shrink-0 lg:ml-4">
          {loading ? 'Loading records...' : `${filtered.length} of ${rows.length} records`}
        </span>
      </div>

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
              {!loading && !error && paginatedRows.map((row) => (
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
              {!loading && !error && filtered.length === 0 && (
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

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-body text-xs text-text-muted">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
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
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
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

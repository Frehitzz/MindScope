import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Check, X } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { studentRecords, type StudentRecord } from '../data/mockData';

type SortField = keyof StudentRecord;
type SortDir = 'asc' | 'desc';

export function DataTablePage() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let rows = studentRecords.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.program.toLowerCase().includes(q) ||
        r.grade.toLowerCase().includes(q),
    );

    rows.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return rows;
  }, [search, sortField, sortDir]);

  const stressColor = (level: string) => {
    switch (level) {
      case 'Low':      return 'bg-sage-light text-sage-dark';
      case 'Moderate': return 'bg-card-alt text-text-body border border-mist-light';
      case 'High':     return 'bg-dusk-light text-dusk';
      default:         return 'bg-card-alt text-text-muted';
    }
  };

  const columns: { key: SortField; label: string }[] = [
    { key: 'id',           label: 'ID' },
    { key: 'name',         label: 'Name' },
    { key: 'age',          label: 'Age' },
    { key: 'grade',        label: 'Grade' },
    { key: 'moodScore',    label: 'Mood' },
    { key: 'stressLevel',  label: 'Stress' },
    { key: 'helpSeeking',  label: 'Help-Seeking' },
    { key: 'lastCheckIn',  label: 'Last Check-in' },
    { key: 'program',      label: 'Program' },
  ];

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl font-medium text-forest mb-1">Data Table</h1>
        <p className="font-body text-sm text-text-muted">
          Browse and search individual student wellbeing records.
        </p>
      </div>

      {/* Search + count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            id="table-search"
            type="text"
            placeholder="Search by name, ID, program…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="
              w-full pl-9 pr-4 py-2.5 rounded-md
              bg-card border border-mist-light
              font-body text-sm text-forest placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-sage/30
              transition-all duration-200
              min-h-[44px]
            "
          />
        </div>
        <span className="font-body text-xs text-text-muted">
          {filtered.length} of {studentRecords.length} records
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-mist-light rounded-md shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-mist-light">
                {columns.map(col => (
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
                      <ArrowUpDown size={12} className={
                        sortField === col.key ? 'text-forest' : 'text-mist'
                      } />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr
                  key={row.id}
                  className="
                    border-b border-mist-light/60 last:border-none
                    hover:bg-cream transition-colors duration-150
                  "
                >
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-forest whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 text-text-body">{row.age}</td>
                  <td className="px-4 py-3 text-text-body">{row.grade}</td>
                  <td className="px-4 py-3">
                    <span className="font-display text-lg text-forest">{row.moodScore}</span>
                    <span className="text-text-muted text-xs">/10</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-[11px] font-semibold ${stressColor(row.stressLevel)}
                    `}>
                      {row.stressLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.helpSeeking
                      ? <Check size={16} className="text-sage" />
                      : <X size={16} className="text-mist/40" />
                    }
                  </td>
                  <td className="px-4 py-3 text-text-body whitespace-nowrap">{row.lastCheckIn}</td>
                  <td className="px-4 py-3">
                    <span className="
                      inline-flex items-center px-2.5 py-0.5 rounded-full
                      text-[11px] font-semibold bg-sage-light border border-sage/30 text-sage-dark
                    ">
                      {row.program}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-text-muted">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SectionHeader title="" />
    </div>
  );
}

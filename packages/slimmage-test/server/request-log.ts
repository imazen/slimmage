/** In-memory request log for test assertions. */

export interface LogEntry {
  id: number;
  url: string;
  width: number;
  height: number;
  format: string;
  quality: number;
  timestamp: number;
}

let entries: LogEntry[] = [];
let nextId = 1;

export function logRequest(url: URL): LogEntry {
  const width = parseInt(url.searchParams.get('width') ?? url.searchParams.get('w') ?? '0', 10);
  const height = parseInt(url.searchParams.get('height') ?? url.searchParams.get('h') ?? '0', 10);
  const format = url.searchParams.get('format') ?? 'jpeg';
  const quality = parseInt(url.searchParams.get('quality') ?? '85', 10);

  const entry: LogEntry = {
    id: nextId++,
    url: url.pathname + url.search,
    width,
    height,
    format,
    quality,
    timestamp: Date.now(),
  };
  entries.push(entry);
  return entry;
}

export function getEntries(): LogEntry[] {
  return [...entries];
}

export function reset(): void {
  entries = [];
  nextId = 1;
}

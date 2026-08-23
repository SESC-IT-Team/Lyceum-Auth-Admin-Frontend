import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PageEntry = number | "ellipsis";

function buildPageList(current: number, total: number): PageEntry[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const keep = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: PageEntry[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
    previous = page;
  }
  return result;
}

interface UsersPaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function UsersPagination({
  page,
  pageCount,
  onPageChange,
}: UsersPaginationProps) {
  if (pageCount <= 1) return null;

  const pages = buildPageList(page, pageCount);

  return (
    <Pagination
      page={page}
      count={pageCount}
      pageSize={1}
      onPageChange={(details) => onPageChange(details.page)}
    >
      <PaginationPrevious className="disabled:pointer-events-none disabled:opacity-50" />

      {pages.map((entry, i) =>
        entry === "ellipsis" ? (
          <PaginationEllipsis key={`ellipsis-${i}`} index={i} />
        ) : (
          <PaginationItem key={entry} type="page" value={entry}>
            {entry}
          </PaginationItem>
        ),
      )}

      <PaginationNext className="disabled:pointer-events-none disabled:opacity-50" />
    </Pagination>
  );
}
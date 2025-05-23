import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { FaFilePdf } from "react-icons/fa6";
import Pdf from "./Pdf";
import { useState } from "react";

interface TableProps {
  title: string;
  rows: {
    document_id: string;
    document_name: string;
    title: string;
    url: string;
  }[];
}

const TableComponent = ({ title, rows }: TableProps) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(
    rows?.[0]?.document_id
  );
  return (
    <div className="flex md:flex-row flex-col gap-4">
      <Table className="overflow-auto">
        <TableCaption>{title}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Document ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows?.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={
                selectedRow === row.document_id
                  ? "bg-zinc-600"
                  : "hover:bg-zinc-600"
              }
            >
              <TableCell>{row.document_id}</TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRow(row.document_id)}
                >
                  <FaFilePdf className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pdf
        url={`https://yahuypxwczxcfxrcpudu.supabase.co/storage/v1/object/public/documents/${
          rows?.find((row) => row.document_id === selectedRow)?.url
        }`}
      />
    </div>
  );
};

export default TableComponent;

import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function GoodsReceipts() {
  const { data, isLoading } = useQuery({
    queryKey: ["gr"],
    queryFn: async () => {
      const response = await backend.gr.listGR({});
      return response.grs;
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Goods Receipts</h2>
          <p className="text-muted-foreground mt-1">Manage inbound inventory</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create GR
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading goods receipts...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doc Number</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt Date</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((gr) => (
                <TableRow key={gr.id}>
                  <TableCell className="font-medium">{gr.doc_number}</TableCell>
                  <TableCell>{gr.source_type}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">
                      {gr.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {gr.receipt_date ? new Date(gr.receipt_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{new Date(gr.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

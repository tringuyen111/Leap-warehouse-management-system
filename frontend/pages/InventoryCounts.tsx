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

export default function InventoryCounts() {
  const { data, isLoading } = useQuery({
    queryKey: ["ic"],
    queryFn: async () => {
      const response = await backend.ic.listIC({});
      return response.ics;
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Inventory Counts</h2>
          <p className="text-muted-foreground mt-1">Perform cycle counts and audits</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create IC
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading inventory counts...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doc Number</TableHead>
                <TableHead>Count Type</TableHead>
                <TableHead>Blind Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((ic) => (
                <TableRow key={ic.id}>
                  <TableCell className="font-medium">{ic.doc_number}</TableCell>
                  <TableCell>{ic.count_type}</TableCell>
                  <TableCell>{ic.blind_count ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-500">
                      {ic.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(ic.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

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

export default function PutawayBatches() {
  const { data, isLoading } = useQuery({
    queryKey: ["putaway"],
    queryFn: async () => {
      const response = await backend.putaway.listPutaway({});
      return response.batches;
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Putaway Batches</h2>
          <p className="text-muted-foreground mt-1">Manage inventory movement to storage</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Putaway
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading putaway batches...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Completed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_number}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-500">
                      {batch.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {batch.completed_at ? new Date(batch.completed_at).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

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

export default function GoodsIssues() {
  const { data, isLoading } = useQuery({
    queryKey: ["gi"],
    queryFn: async () => {
      const response = await backend.gi.listGI({});
      return response.gis;
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Goods Issues</h2>
          <p className="text-muted-foreground mt-1">Manage outbound inventory</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create GI
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading goods issues...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doc Number</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Issue Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((gi) => (
                <TableRow key={gi.id}>
                  <TableCell className="font-medium">{gi.doc_number}</TableCell>
                  <TableCell>{gi.source_type}</TableCell>
                  <TableCell>{gi.issue_mode}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/10 text-orange-500">
                      {gi.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(gi.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

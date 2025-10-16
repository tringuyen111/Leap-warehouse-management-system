import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Inventory() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-onhand"],
    queryFn: async () => {
      const response = await backend.inventory.getOnhand({});
      return response.records;
    },
  });

  const filteredData = data?.filter(
    (record) =>
      record.model_code.toLowerCase().includes(search.toLowerCase()) ||
      record.model_name.toLowerCase().includes(search.toLowerCase()) ||
      record.location_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Inventory On-hand</h2>
        <p className="text-muted-foreground mt-1">View current stock levels</p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by model code, name, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading inventory...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Model Code</TableHead>
                <TableHead>Model Name</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>UoM</TableHead>
                <TableHead>Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.location_code}</TableCell>
                  <TableCell>{record.model_code}</TableCell>
                  <TableCell>{record.model_name}</TableCell>
                  <TableCell>{record.lot_number || "-"}</TableCell>
                  <TableCell>{record.serial_number || "-"}</TableCell>
                  <TableCell>{record.qty}</TableCell>
                  <TableCell>{record.base_uom_code}</TableCell>
                  <TableCell>
                    {record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : "-"}
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

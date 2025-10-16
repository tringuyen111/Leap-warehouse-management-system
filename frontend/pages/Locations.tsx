import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function Locations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [zone, setZone] = useState("");
  const [bin, setBin] = useState("");
  const [capacity, setCapacity] = useState("");
  const [allowMixedLot, setAllowMixedLot] = useState(false);
  const [locationType, setLocationType] = useState("storage");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const response = await backend.organization.listWarehouses({});
      return response.warehouses;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await backend.organization.listLocations({});
      return response.locations;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await backend.organization.createLocation({
        warehouse_id: parseInt(warehouseId),
        code,
        name,
        zone,
        bin,
        capacity: capacity ? parseFloat(capacity) : undefined,
        allow_mixed_lot: allowMixedLot,
        location_type: locationType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsDialogOpen(false);
      setWarehouseId("");
      setCode("");
      setName("");
      setZone("");
      setBin("");
      setCapacity("");
      setAllowMixedLot(false);
      toast({ title: "Location created successfully" });
    },
    onError: (error) => {
      console.error("Failed to create location:", error);
      toast({
        title: "Failed to create location",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Locations</h2>
          <p className="text-muted-foreground mt-1">Manage storage locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bin">Bin</Label>
                <Input
                  id="bin"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="locationType">Location Type</Label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="receiving">Receiving</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowMixedLot"
                  checked={allowMixedLot}
                  onCheckedChange={(checked) => setAllowMixedLot(checked as boolean)}
                />
                <Label htmlFor="allowMixedLot">Allow Mixed Lot</Label>
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading locations...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Bin</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.code}</TableCell>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.zone || "-"}</TableCell>
                  <TableCell>{location.bin || "-"}</TableCell>
                  <TableCell>{location.location_type}</TableCell>
                  <TableCell>{location.capacity || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

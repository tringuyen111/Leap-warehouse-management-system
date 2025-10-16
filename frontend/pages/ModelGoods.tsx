import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function ModelGoods() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goodsTypeId, setGoodsTypeId] = useState("");
  const [trackingType, setTrackingType] = useState("none");
  const [baseUomCode, setBaseUomCode] = useState("");
  const [packOnly, setPackOnly] = useState(false);
  const [expiryRequired, setExpiryRequired] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goodsTypes } = useQuery({
    queryKey: ["goods-types"],
    queryFn: async () => {
      const response = await backend.goods.listGoodsTypes();
      return response.goods_types;
    },
  });

  const { data: uoms } = useQuery({
    queryKey: ["uoms"],
    queryFn: async () => {
      const response = await backend.goods.listUoMs();
      return response.uoms;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["model-goods"],
    queryFn: async () => {
      const response = await backend.goods.listModelGoods();
      return response.model_goods;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await backend.goods.createModelGoods({
        code,
        name,
        description,
        goods_type_id: goodsTypeId ? parseInt(goodsTypeId) : undefined,
        tracking_type: trackingType,
        base_uom_code: baseUomCode,
        pack_only: packOnly,
        expiry_required: expiryRequired,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["model-goods"] });
      setIsDialogOpen(false);
      setCode("");
      setName("");
      setDescription("");
      setGoodsTypeId("");
      setTrackingType("none");
      setBaseUomCode("");
      setPackOnly(false);
      setExpiryRequired(false);
      toast({ title: "Model goods created successfully" });
    },
    onError: (error) => {
      console.error("Failed to create model goods:", error);
      toast({
        title: "Failed to create model goods",
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
          <h2 className="text-3xl font-bold text-foreground">Model Goods</h2>
          <p className="text-muted-foreground mt-1">Manage product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Model Goods
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Model Goods</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="goodsType">Goods Type</Label>
                <Select value={goodsTypeId} onValueChange={setGoodsTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goods type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goodsTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trackingType">Tracking Type</Label>
                <Select value={trackingType} onValueChange={setTrackingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="serial">Serial</SelectItem>
                    <SelectItem value="lot">Lot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="baseUom">Base UoM</Label>
                <Select value={baseUomCode} onValueChange={setBaseUomCode} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    {uoms?.map((uom) => (
                      <SelectItem key={uom.code} value={uom.code}>
                        {uom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="packOnly"
                  checked={packOnly}
                  onCheckedChange={(checked) => setPackOnly(checked as boolean)}
                />
                <Label htmlFor="packOnly">Pack Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expiryRequired"
                  checked={expiryRequired}
                  onCheckedChange={(checked) => setExpiryRequired(checked as boolean)}
                />
                <Label htmlFor="expiryRequired">Expiry Required</Label>
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading model goods...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tracking Type</TableHead>
                <TableHead>Base UoM</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.code}</TableCell>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">
                      {model.tracking_type}
                    </span>
                  </TableCell>
                  <TableCell>{model.base_uom_code}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500">
                      {model.status}
                    </span>
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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("transactions");

  const { data: transactions } = useQuery({
    queryKey: ["transaction-log"],
    queryFn: async () => {
      const response = await backend.reports.getTransactionLog({});
      return response.records;
    },
    enabled: activeTab === "transactions",
  });

  const { data: lotAging } = useQuery({
    queryKey: ["lot-aging"],
    queryFn: async () => {
      const response = await backend.reports.getLotAging({});
      return response.records;
    },
    enabled: activeTab === "lot-aging",
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Reports & Analytics</h2>
        <p className="text-muted-foreground mt-1">View detailed reports and insights</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transaction Log</TabsTrigger>
          <TabsTrigger value="lot-aging">Lot Aging</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Doc Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Qty Change</TableHead>
                      <TableHead>UoM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {new Date(tx.transaction_date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">
                            {tx.transaction_type}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{tx.doc_number}</TableCell>
                        <TableCell>{tx.model_code}</TableCell>
                        <TableCell
                          className={tx.qty_change > 0 ? "text-green-500" : "text-red-500"}
                        >
                          {tx.qty_change > 0 ? "+" : ""}
                          {tx.qty_change}
                        </TableCell>
                        <TableCell>{tx.base_uom_code}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lot-aging">
          <Card>
            <CardHeader>
              <CardTitle>Lot Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days to Expiry</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotAging?.map((record, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{record.location_code}</TableCell>
                        <TableCell className="font-medium">{record.model_code}</TableCell>
                        <TableCell>{record.lot_number || "-"}</TableCell>
                        <TableCell>{record.qty}</TableCell>
                        <TableCell>
                          {record.expiry_date
                            ? new Date(record.expiry_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.days_to_expiry !== null &&
                          record.days_to_expiry !== undefined ? (
                            <span
                              className={
                                record.days_to_expiry < 30
                                  ? "text-red-500 font-semibold"
                                  : record.days_to_expiry < 90
                                  ? "text-yellow-500"
                                  : ""
                              }
                            >
                              {Math.round(record.days_to_expiry)} days
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FileUploadPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="file" accept=".pdf,.txt,.docx" />
        <Button className="w-full">Load Sample Data</Button>
      </CardContent>
    </Card>
  );
}
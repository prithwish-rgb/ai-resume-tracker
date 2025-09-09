"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumeViewerPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        const json = await res.json();
        if (res.ok) setData(json.data);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C63FF] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading resume...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Resume not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto p-6 print:p-0">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <Button onClick={handlePrint}>Download / Print</Button>
        </div>

        <Card className="shadow-none border print:border-0">
          <CardContent className="p-6 print:p-0">
            <div className="space-y-6">
              {(data.blocks || []).map((block: any) => (
                <section key={block.id} className="break-inside-avoid">
                  <h2 className="text-lg font-semibold mb-2 capitalize">{block.type}</h2>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {block.content}
                  </p>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white; }
          nav { display: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:border-0 { border: 0 !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}



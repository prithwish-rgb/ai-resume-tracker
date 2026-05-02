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

  const handleDownloadJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "resume"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadJSON}>Download JSON</Button>
            <Button onClick={handlePrint}>Download / Print</Button>
          </div>
        </div>

        <Card className="shadow-none border print:border-0">
          <CardContent className="p-6 print:p-0">
            <div className="space-y-6 print:space-y-4">
              {(data.blocks || []).map((block: any) => (
                <section key={block.id} className="break-inside-avoid print:mb-4">
                  <h2 className="text-lg font-bold mb-2 capitalize text-gray-900 border-b border-gray-300 pb-1 print:text-base print:mb-1">{block.type}</h2>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed print:text-sm print:leading-snug">
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
          @page { size: auto; margin: 20mm; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav { display: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:border-0 { border: 0 !important; }
          .break-inside-avoid { break-inside: avoid; }
          
          /* Typography adjustments for print */
          h1 { font-size: 24pt !important; margin-bottom: 8pt !important; text-align: center; }
          h2 { font-size: 14pt !important; margin-bottom: 4pt !important; border-bottom: 1px solid #ccc; padding-bottom: 2pt; }
          p { font-size: 11pt !important; line-height: 1.4 !important; }
        }
      `}</style>
    </div>
  );
}



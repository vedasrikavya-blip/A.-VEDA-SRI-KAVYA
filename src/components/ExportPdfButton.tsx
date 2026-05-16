import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  task: string;
  owner: string;
  deadline: string;
  priority: string;
  completed: boolean;
}

interface ExportPdfButtonProps {
  meeting: {
    title: string;
    summary: string;
    sentiment: string;
    keyPoints: string[];
    followUpEmail: string;
    topics: string[];
  };
  tasks: Task[];
}

export function ExportPdfButton({ meeting, tasks }: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...meeting,
          tasks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NoteGenius_${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Could not export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      className="bg-[#F59E0B] text-white px-5 h-9 rounded-xl text-xs font-bold shadow-sm hover:bg-[#D97706] transition-all flex items-center gap-2 group"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          <span>Export PDF</span>
        </>
      )}
    </Button>
  );
}

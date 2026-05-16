import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Busboy from "busboy";
import { generateMeetingPdf } from "./src/lib/pdf-generator";
import { generateFollowUpEmail } from "./src/lib/gemini";
import { Resend } from "resend";
// @ts-ignore
import * as pdfImport from "pdf-parse";
import mammoth from "mammoth";

// @ts-ignore
const pdf = pdfImport.default || pdfImport;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Document Parser
  app.post("/api/parse-document", (req, res) => {
    const busboy = Busboy({ headers: req.headers });
    let content = "";
    let fileName = "";
    let mimeType = "";

    busboy.on("file", (fieldname, file, info) => {
      fileName = info.filename;
      mimeType = info.mimeType;
      const chunks: any[] = [];

      file.on("data", (data) => {
        chunks.push(data);
      });

      file.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        try {
          if (mimeType === "application/pdf") {
            const data = await pdf(buffer);
            content = data.text;
          } else if (
            mimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            const data = await mammoth.extractRawText({ buffer });
            content = data.value;
          } else if (mimeType === "text/plain" || mimeType === "text/markdown") {
            content = buffer.toString("utf-8");
          } else {
             return res.status(400).json({ error: "Unsupported file type" });
          }
          res.json({ text: content, fileName });
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      });
    });

    req.pipe(busboy);
  });

  // API Route: PDF Export
  app.post("/api/export/pdf", async (req, res) => {
    try {
      const data = req.body;
      if (!data || !data.title) {
        return res.status(400).json({ error: "Missing required meeting data" });
      }

      const pdfBuffer = await generateMeetingPdf(data);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition", 
        `attachment; filename="NoteGenius_${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("PDF Export Error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // API Route: AI Email Generation
  app.post("/api/generate-email", async (req, res) => {
    try {
      const { meetingData } = req.body;
      if (!meetingData) {
        return res.status(400).json({ error: "Missing meeting data" });
      }
      const email = await generateFollowUpEmail(meetingData);
      res.json(email);
    } catch (error: any) {
      console.error("Email Generation Error:", error);
      res.status(500).json({ error: "Failed to generate email" });
    }
  });

  // API Route: Send Email (Resend)
  app.post("/api/send-email", async (req, res) => {
    try {
      const { to, subject, body } = req.body;
      if (!to || !subject || !body) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: "RESEND_API_KEY not configured" });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: "NoteGenius <onboarding@resend.dev>", // Default Resend test address
        to: [to],
        subject: subject,
        html: body.replace(/\n/g, "<br/>"),
      });

      if (error) {
        return res.status(400).json(error);
      }

      res.json(data);
    } catch (error: any) {
      console.error("Email Sending Error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

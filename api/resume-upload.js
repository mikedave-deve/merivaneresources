import { handleUpload } from "@vercel/blob/client";

const MAX_RESUME_BYTES = 15 * 1024 * 1024; // 15MB

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: MAX_RESUME_BYTES,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Resume blob upload completed:", blob.url);
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Blob upload token error:", error);
    return res.status(400).json({ error: error.message || "Upload failed." });
  }
}

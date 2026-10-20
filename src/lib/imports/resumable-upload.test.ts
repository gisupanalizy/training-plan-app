import { describe, expect, it } from "vitest";
import { uploadResumable } from "./resumable-upload";

describe("wznawiany upload", () => {
  it("po przerwaniu czyta offset i nie wysyła gotowego zakresu drugi raz", async () => {
    const sent: number[] = [];
    let patched = false;
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method;
      if (method === "POST") return new Response(null, { status: 201, headers: { Location: "https://upload.local/1", "Upload-Offset": "0" } });
      if (method === "HEAD") return new Response(null, { status: 200, headers: { "Upload-Offset": "4" } });
      const offset = Number((init?.headers as Record<string, string>)["upload-offset"]);
      sent.push(offset);
      if (!patched) { patched = true; return new Response(null, { status: 500 }); }
      return new Response(null, { status: 204, headers: { "Upload-Offset": "8" } });
    };
    await uploadResumable({ endpoint: "https://upload.local", token: "signed", apiKey: "anon", accessToken: "user", bucket: "training-imports", path: "a/source.pdf", file: new Blob(["12345678"]), contentType: "application/pdf", fetchImpl });
    expect(sent).toEqual([0, 4]);
  });
});

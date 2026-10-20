const CHUNK = 6_000_000;

type UploadOptions = {
  endpoint: string;
  token: string;
  apiKey: string;
  accessToken?: string | null;
  bucket: string;
  path: string;
  file: Blob;
  contentType: string;
  fetchImpl?: typeof fetch;
  onProgress?: (loaded: number, total: number) => void;
};

function metadata(values: Record<string, string>) {
  return Object.entries(values).map(([key, value]) => `${key} ${btoa(value)}`).join(",");
}

/** Podpisany upload TUS. Wznowienie czyta Upload-Offset i nie wysyła ukończonego zakresu ponownie. */
export async function uploadResumable(options: UploadOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = { "tus-resumable": "1.0.0", apikey: options.apiKey, "x-signature": options.token, authorization: `Bearer ${options.accessToken || options.apiKey}` };
  const created = await fetchImpl(options.endpoint, {
    method: "POST",
    headers: {
      ...headers,
      "upload-length": String(options.file.size),
      "upload-metadata": metadata({ bucketName: options.bucket, objectName: options.path, contentType: options.contentType }),
    },
  });
  if (!created.ok && created.status !== 201) throw new Error("Nie udało się rozpocząć wysyłania pliku.");
  const location = created.headers.get("Location");
  if (!location) throw new Error("Brak adresu wznowienia wysyłania.");
  let offset = Number(created.headers.get("Upload-Offset") ?? 0);
  while (offset < options.file.size) {
    const slice = options.file.slice(offset, offset + CHUNK);
    const patch = await fetchImpl(location, {
      method: "PATCH",
      headers: { ...headers, "upload-offset": String(offset), "content-type": "application/offset+octet-stream" },
      body: slice,
    });
    if (!patch.ok && patch.status !== 204) {
      const probe = await fetchImpl(location, { method: "HEAD", headers });
      const resumed = Number(probe.headers.get("Upload-Offset") ?? offset);
      if (!probe.ok || resumed <= offset) throw new Error("Wysyłanie pliku przerwało się. Możesz je wznowić.");
      offset = resumed;
      options.onProgress?.(offset, options.file.size);
      continue;
    }
    offset = Number(patch.headers.get("Upload-Offset") ?? offset + slice.size);
    options.onProgress?.(offset, options.file.size);
  }
}

const PINATA_API = "https://api.pinata.cloud";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.PINATA_JWT}`,
  };
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Pinata upload failed: ${res.statusText}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  return data.IpfsHash;
}

export async function uploadJSON(json: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: json,
    }),
  });

  if (!res.ok) {
    throw new Error(`Pinata JSON upload failed: ${res.statusText}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  return data.IpfsHash;
}

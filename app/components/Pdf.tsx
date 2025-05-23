"use client";

export default function Pdf({ url }: { url: string }) {
  return (
    <div>
      <iframe src={url} width="100%" height="300px"></iframe>
    </div>
  );
}

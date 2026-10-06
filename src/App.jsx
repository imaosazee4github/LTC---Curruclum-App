import { useState } from "react";
import CloudinaryUploadButton from "./components/uploads/CloudinaryUploadButton";

export default function App() {
  const [uploadedImage, setUploadedImage] =
    useState(null);

  function handleUploadComplete(uploadResult) {
    console.log(
      "Cloudinary upload result:",
      uploadResult,
    );

    setUploadedImage(uploadResult);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
          LTC Pioneer Tracking System
        </p>

        <h1 className="mt-2 text-3xl font-bold text-blue-950">
          Cloudinary Upload Test
        </h1>

        <p className="mt-3 text-slate-600">
          Upload an image to confirm that the
          tracking system is connected to
          Cloudinary.
        </p>

        <div className="mt-6">
          <CloudinaryUploadButton
            buttonText="Select and Upload Image"
            onUploadComplete={
              handleUploadComplete
            }
          />
        </div>

        {uploadedImage && (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="font-semibold text-green-800">
              Image uploaded successfully
            </p>

            <img
              src={uploadedImage.secureUrl}
              alt="Uploaded preview"
              className="mt-4 max-h-96 w-full rounded-lg object-contain"
            />

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>
                <strong>Public ID:</strong>{" "}
                {uploadedImage.publicId}
              </p>

              <p>
                <strong>Format:</strong>{" "}
                {uploadedImage.format}
              </p>

              <p>
                <strong>File size:</strong>{" "}
                {formatFileSize(
                  uploadedImage.bytes,
                )}
              </p>

              <a
                href={uploadedImage.secureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-semibold text-blue-900 underline"
              >
                Open uploaded image
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function formatFileSize(bytes) {
  if (!bytes) {
    return "Not available";
  }

  const megabytes =
    bytes / (1024 * 1024);

  return `${megabytes.toFixed(2)} MB`;
}
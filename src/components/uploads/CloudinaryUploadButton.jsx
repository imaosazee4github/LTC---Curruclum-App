import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function CloudinaryUploadButton({
  onUploadComplete,
  buttonText = "Upload Image",
}) {
  const widgetRef = useRef(null);
  const onUploadCompleteRef = useRef(
    onUploadComplete,
  );

  const [uploading, setUploading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const cloudName =
    import.meta.env
      .VITE_CLOUDINARY_CLOUD_NAME;

  const uploadPreset =
    import.meta.env
      .VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    onUploadCompleteRef.current =
      onUploadComplete;
  }, [onUploadComplete]);

  useEffect(() => {
    if (
      !window.cloudinary ||
      !cloudName ||
      !uploadPreset
    ) {
      return undefined;
    }

    widgetRef.current =
      window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,

          sources: [
            "local",
            "camera",
          ],

          multiple: false,
          resourceType: "image",

          clientAllowedFormats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
          ],

          maxFileSize: 5_000_000,
          cropping: false,
          showAdvancedOptions: false,
        },

        (error, result) => {
          if (error) {
            console.error(
              "Cloudinary upload failed:",
              error,
            );

            setErrorMessage(
              "The image could not be uploaded.",
            );

            setUploading(false);
            return;
          }

          if (
            result?.event ===
            "upload-added"
          ) {
            setUploading(true);
            setErrorMessage("");
          }

          if (
            result?.event === "success"
          ) {
            setUploading(false);

            onUploadCompleteRef.current?.({
              secureUrl:
                result.info.secure_url,

              publicId:
                result.info.public_id,

              originalFilename:
                result.info
                  .original_filename,

              format:
                result.info.format,

              width:
                result.info.width,

              height:
                result.info.height,

              bytes:
                result.info.bytes,

              resourceType:
                result.info.resource_type,
            });
          }

          if (
            result?.event === "close"
          ) {
            setUploading(false);
          }
        },
      );

    return () => {
      widgetRef.current?.destroy?.();
      widgetRef.current = null;
    };
  }, [cloudName, uploadPreset]);

  function openUploadWidget() {
    setErrorMessage("");

    if (!window.cloudinary) {
      setErrorMessage(
        "The upload service is unavailable. Refresh the page and try again.",
      );

      return;
    }

    if (!cloudName || !uploadPreset) {
      setErrorMessage(
        "Cloudinary configuration is missing.",
      );

      return;
    }

    if (!widgetRef.current) {
      setErrorMessage(
        "The upload widget is not ready. Refresh the page and try again.",
      );

      return;
    }

    widgetRef.current.open();
  }

  return (
    <div>
      <button
        type="button"
        onClick={openUploadWidget}
        disabled={uploading}
        className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading
          ? "Uploading..."
          : buttonText}
      </button>

      {errorMessage && (
        <p
          role="alert"
          className="mt-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
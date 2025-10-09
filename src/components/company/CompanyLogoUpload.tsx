import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FileUploadState, FileUploadActions } from "@/hooks/use-file-upload";

interface CompanyLogoUploadProps {
  fileState: FileUploadState;
  fileActions: FileUploadActions;
  companyLogo?: string;
  isUploadingImage: boolean;
  uploadError: string | null;
}

export function CompanyLogoUpload({
  fileState,
  fileActions,
  companyLogo,
  isUploadingImage,
  uploadError,
}: CompanyLogoUploadProps) {
  const hasPreview =
    (fileState.files.length > 0 && fileState.files[0].preview) || companyLogo;

  return (
    <div>
      <FormLabel>Upload Company logo</FormLabel>
      <div className="mt-2">
        <input {...fileActions.getInputProps()} className="hidden" />
        <div
          onClick={fileActions.openFileDialog}
          onDragEnter={fileActions.handleDragEnter}
          onDragLeave={fileActions.handleDragLeave}
          onDragOver={fileActions.handleDragOver}
          onDrop={fileActions.handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          {hasPreview ? (
            <div className="space-y-2">
              <img
                src={fileState.files[0]?.preview || companyLogo}
                alt="Company logo preview"
                className="mx-auto h-32 w-32 object-contain"
              />
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileActions.openFileDialog();
                  }}
                >
                  Choose file
                </Button>
                {fileState.files[0]?.file instanceof File && (
                  <span className="text-sm text-gray-600">
                    {fileState.files[0].file.name}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, WEBP up to 1MB
              </p>
            </div>
          )}
        </div>
        {fileState.errors.length > 0 && (
          <p className="text-sm text-destructive mt-1">{fileState.errors[0]}</p>
        )}
        {uploadError && (
          <p className="text-sm text-destructive mt-1">{uploadError}</p>
        )}
        {isUploadingImage && (
          <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
        )}
      </div>
    </div>
  );
}

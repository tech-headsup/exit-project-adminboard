import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUploadState, FileUploadActions } from "@/hooks/use-file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/company-utils";

interface ProfilePictureUploadProps {
  fileState: FileUploadState;
  fileActions: FileUploadActions;
  avatarURL?: string;
  isUploadingImage: boolean;
  uploadError: string | null;
  firstName?: string;
  lastName?: string;
}

export function ProfilePictureUpload({
  fileState,
  fileActions,
  avatarURL,
  isUploadingImage,
  uploadError,
  firstName,
  lastName,
}: ProfilePictureUploadProps) {
  const hasPreview =
    (fileState.files.length > 0 && fileState.files[0].preview) || avatarURL;

  return (
    <div>
      <Label>Profile Picture</Label>
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
              <Avatar className="mx-auto h-32 w-32">
                <AvatarImage
                  src={fileState.files[0]?.preview || getImageUrl(avatarURL) || ""}
                  alt="Profile picture preview"
                />
                <AvatarFallback className="text-4xl">
                  {firstName?.[0]}
                  {lastName?.[0]}
                </AvatarFallback>
              </Avatar>
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
              <Avatar className="mx-auto h-32 w-32 mb-4">
                <AvatarImage src="" alt="Profile picture" />
                <AvatarFallback className="text-4xl">
                  {firstName?.[0]}
                  {lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, JPEG, WEBP up to 1MB
              </p>
            </div>
          )}
        </div>
        {fileState.errors.length > 0 && (
          <p className="text-sm text-destructive mt-1">
            {fileState.errors[0]}
          </p>
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

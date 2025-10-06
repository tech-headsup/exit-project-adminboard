import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCompanyById, useUpdateCompany } from "@/hooks/useCompany";
import { UpdateCompanyRequest, CompanySize } from "@/types/companyTypes";
import {
  companyFormSchema,
  CompanyFormValues,
  companyFormSteps,
} from "@/lib/company-form-schema";
import { uploadImage, getImageUrl } from "@/lib/company-utils";
import { ColorPicker } from "@/components/company/ColorPicker";
import { CompanyLogoUpload } from "@/components/company/CompanyLogoUpload";
import { FormSteps } from "@/components/company/FormSteps";
import { CompanyBasicDetailsFields } from "@/components/company/CompanyBasicDetailsFields";
import { CompanyBillingAddressFields } from "@/components/company/CompanyBillingAddressFields";
export default function CompanyDetails() {
  const router = useRouter();
  const companyId = router.query.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch company data
  const { data: companyData, isLoading, error } = useCompanyById(companyId);

  // Update company mutation
  const { mutate: updateCompany, isPending: isUpdatingCompany } =
    useUpdateCompany();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    mode: "onChange",
    defaultValues: {
      companyEmail: "",
      nameOfCompany: "",
      companyLogo: "",
      themeColor: "#000000",
      companySize: "",
      industry: "",
      companyWebsiteURL: "",
      companyContactNo: "",
      gstNumber: "",
      billingAddress: {
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        landmark: "",
        country: "",
        city: "",
        state: "",
        pinCode: "",
      },
    },
  });

  const {
    formState: { isDirty: isFormDirty },
  } = form;

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      setUploadError(null);
      return await uploadImage(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 1,
    accept: "image/png, image/jpeg, image/jpg, image/webp",
    maxSize: 1 * 1024 * 1024, // 1MB
    onFilesChange: async (files) => {
      if (files.length > 0) {
        const fileWithPreview = files[0];
        if (fileWithPreview.preview) {
          // Show preview immediately
          form.setValue("companyLogo", fileWithPreview.preview, {
            shouldDirty: true,
          });
        }

        // Upload the actual file to backend
        if (fileWithPreview.file instanceof File) {
          const uploadedUrl = await handleImageUpload(fileWithPreview.file);
          if (uploadedUrl) {
            // Replace preview with actual URL from backend
            form.setValue("companyLogo", uploadedUrl, { shouldDirty: true });
          }
        }
      } else {
        form.setValue("companyLogo", "", { shouldDirty: true });
      }
    },
  });

  // Populate form when company data is loaded
  useEffect(() => {
    if (companyData?.data) {
      const company = companyData.data;
      form.reset({
        companyEmail: company.companyEmail || "",
        nameOfCompany: company.nameOfCompany || "",
        companyLogo: getImageUrl(company.companyLogo) || "",
        themeColor: company.companyThemeColor || "#000000",
        companySize: company.companySize || "",
        industry: company.industry || "",
        companyWebsiteURL: company.companyWebsiteURL || "",
        companyContactNo: company.companyContactNo || "",
        gstNumber: company.gstNumber || "",
        billingAddress: {
          addressLine1: company.billingAddress.addressLine1 || "",
          addressLine2: company.billingAddress.addressLine2 || "",
          addressLine3: company.billingAddress.addressLine3 || "",
          landmark: company.billingAddress.landmark || "",
          country: company.billingAddress.country || "",
          city: company.billingAddress.city || "",
          state: company.billingAddress.state || "",
          pinCode: company.billingAddress.pinCode || "",
        },
      });
    }
  }, [companyData, form]);

  const onSubmit = (data: CompanyFormValues) => {
    if (!companyId) {
      toast.error("Company ID is missing");
      return;
    }

    // Transform form data to match API requirements
    const updateData: UpdateCompanyRequest = {
      id: companyId,
      data: {
        nameOfCompany: data.nameOfCompany || "",
        companySize: (data.companySize as CompanySize) || CompanySize.STARTUP,
        industry: data.industry || "",
        companyWebsiteURL: data.companyWebsiteURL,
        companyContactNo: data.companyContactNo || "",
        companyEmail: data.companyEmail,
        companyLogo: data.companyLogo,
        companyThemeColor: data.themeColor,
        gstNumber: data.gstNumber,
        billingAddress: {
          addressLine1: data.billingAddress.addressLine1 || "",
          addressLine2: data.billingAddress.addressLine2,
          addressLine3: data.billingAddress.addressLine3,
          landmark: data.billingAddress.landmark,
          country: data.billingAddress.country || "",
          city: data.billingAddress.city || "",
          state: data.billingAddress.state || "",
          pinCode: data.billingAddress.pinCode || "",
        },
      },
    };

    updateCompany(updateData, {
      onSuccess: (response) => {
        console.log("Company updated successfully:", response);
        toast.success("Company updated successfully!", {
          description: `${data.nameOfCompany || "Company"} has been updated.`,
        });
        // Reset the form dirty state
        form.reset(data);
      },
      onError: (error) => {
        console.error("Failed to update company:", error);
        toast.error("Failed to update company", {
          description:
            error instanceof Error
              ? error.message
              : "An error occurred while updating the company.",
        });
      },
    });
  };

  const handleNext = () => {
    if (currentStep < companyFormSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <h1 className="text-2xl font-bold">Loading Company Details...</h1>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Error Loading Company
        </h1>
        <p>
          {error instanceof Error
            ? error.message
            : "Failed to load company details"}
        </p>
      </div>
    );
  }

  // No data state
  if (!companyData?.data) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <h1 className="text-2xl font-bold">Company Not Found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">Company Details</h1>

      <FormSteps
        steps={companyFormSteps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CompanyLogoUpload
                    fileState={fileState}
                    fileActions={fileActions}
                    companyLogo={form.watch("companyLogo")}
                    isUploadingImage={isUploadingImage}
                    uploadError={uploadError}
                  />

                  <FormField
                    control={form.control}
                    name="themeColor"
                    render={({ field }) => (
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <CompanyBasicDetailsFields control={form.control} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyContactNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company contact no</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST No.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <CompanyBillingAddressFields control={form.control} />
          )}

          <div className="flex justify-between space-x-4 pt-4 w-full">
            <div className="space-x-8">
              <Button
                type="button"
                variant="outline"
                className="w-32"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <Button
                type="button"
                className="w-32 "
                onClick={handleNext}
                disabled={currentStep === companyFormSteps.length}
              >
                Next
              </Button>
            </div>

            {isFormDirty && (
              <Button
                type="submit"
                variant="secondary"
                className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isUpdatingCompany || isUploadingImage}
              >
                {isUpdatingCompany ? "Updating..." : "Update"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

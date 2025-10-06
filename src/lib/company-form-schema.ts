import * as z from "zod";

export const companyFormSchema = z.object({
  companyEmail: z.string().email("Please enter a valid email address"),
  nameOfCompany: z.string().optional(),
  companyLogo: z.string().optional(),
  themeColor: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  companyWebsiteURL: z.string().optional(),
  companyContactNo: z.string().optional(),
  gstNumber: z.string().optional(),
  billingAddress: z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    addressLine3: z.string().optional(),
    landmark: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pinCode: z.string().optional(),
  }),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const companyFormSteps = [1, 2] as const;

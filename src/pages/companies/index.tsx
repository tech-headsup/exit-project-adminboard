import CompanyStats from "@/components/CompaniesComponents/companiesStats";
import CompaniesTableComponent from "@/components/CompaniesComponents/tableComponent";

import React from "react";

export default function CompaniesPage() {
  return (
    <>
      <CompanyStats
        stats={[
          { value: "12", label: "Total no of Active Companies" },
          { value: "3", label: "Total added Companies" },
          { value: "4", label: "Companies where the project is yet to start" },
          { value: "8", label: "Dormant Companies" },
        ]}
      />
      <CompaniesTableComponent />
    </>
  );
}

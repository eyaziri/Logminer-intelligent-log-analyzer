import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
import React from "react";


export default function FormElements() {
  return (
    <div className="flex flex-col">
      <PageBreadcrumb pageTitle="Server Configuration" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl"> {/* Contrôle la largeur maximale */}
          <DefaultInputs />
        </div>
      </div>
    </div>
  );
}
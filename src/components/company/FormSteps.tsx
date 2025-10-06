interface FormStepsProps {
  steps: readonly number[];
  currentStep: number;
  onStepClick: (step: number) => void;
  stepLabels?: string[];
}

export function FormSteps({
  steps,
  currentStep,
  onStepClick,
  stepLabels = ["Basic Company Details", "Billing Details"],
}: FormStepsProps) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-around gap-4">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => onStepClick(step)}
            className={`text-md font-normal${
              currentStep === step ? "" : " text-gray-600"
            }`}
          >
            {stepLabels[index]}
          </button>
        ))}
      </div>

      <div className="relative h-1 w-full bg-gray-300 rounded">
        <div
          className="absolute h-full bg-blue-600 rounded transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

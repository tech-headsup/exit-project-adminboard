interface ProjectFormStepsProps {
  steps: readonly number[];
  currentStep: number;
  stepLabels: string[];
}

export function ProjectFormSteps({
  steps,
  currentStep,
  stepLabels,
}: ProjectFormStepsProps) {
  return (
    <div className="space-y-2">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex flex-col items-center flex-1"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                currentStep >= step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {step}
            </div>
            <p
              className={`text-xs mt-2 text-center ${
                currentStep === step
                  ? "font-semibold text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {stepLabels[index]}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 w-full bg-gray-300 rounded">
        <div
          className="absolute h-full bg-blue-600 rounded transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

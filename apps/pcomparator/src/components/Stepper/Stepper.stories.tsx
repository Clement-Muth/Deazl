import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useState } from "react";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import useForm from "~/components/Form/useForm";
import { Stepper, type StepperProps } from "~/components/Stepper/Stepper";

export default {
  title: "components/Inputs/Stepper",
  component: Stepper,
  decorators: [
    (Story) => (
      <Template>
        <Story />
      </Template>
    )
  ]
} satisfies Meta<typeof Stepper>;

type StepperObjProps = StepperProps & RegisterOptions<FieldValues, any>;

const defaultProps: StepperObjProps = {
  steps: [
    { label: "Contact Details", completed: true },
    { label: "Shipping Information", completed: false },
    { label: "Billing Address", completed: false },
    { label: "Payment & Review", active: false }
  ],
  currentStep: 1,
  size: "sm"
};

const Template = (_: { children: ReactNode }) => {
  const form = useForm();
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <form.Form
        encType="multipart/form-data"
        actions={{
          prevProps: {
            title: "Previous",
            onPress: () => currentStep - 1 >= 1 && setCurrentStep((currentStep) => currentStep - 1)
          },
          nextProps: {
            title: "Next",
            color: "primary",
            onPress: () =>
              currentStep + 1 <= defaultProps.steps.length && setCurrentStep((currentStep) => currentStep + 1)
          }
        }}
        methods={form.methods}
        onSubmit={() => null}
        className="flex flex-col gap-4 max-w-lg w-full"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <Stepper {...defaultProps} currentStep={currentStep} size="xl" />
        </div>
      </form.Form>
    </div>
  );
};

export const Default: StoryObj = {
  args: {
    ...defaultProps
  }
};

import { render } from "~/test/componentUtils";
import { Stepper, type StepperProps } from "./Stepper";
import "@testing-library/jest-dom";

describe("Stepper Component", () => {
  const defaultProps: StepperProps = {
    steps: [{ label: "Step 1", completed: true }, { label: "Step 2" }, { label: "Step 3" }],
    currentStep: 2,
    size: "md"
  };

  it("renders correctly with default props", () => {
    const { getByText } = render(<Stepper {...defaultProps} />);

    expect(getByText("Step 2")).toBeInTheDocument();
    expect(getByText("Next: Step 3")).toBeInTheDocument();
  });

  it("calculates progress percentage correctly", () => {
    const { getByTestId } = render(<Stepper {...defaultProps} currentStep={1} />);

    const svgCircle = getByTestId("progression");
    const radius = 29;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (1 / defaultProps.steps.length) * circumference;

    const strokeDashoffset = Number.parseFloat(svgCircle.getAttribute("stroke-dashoffset")!);

    expect(strokeDashoffset).toBeCloseTo(offset, 2);
  });

  it("renders correct attributes for size sm", () => {
    const { getByTestId, getByText } = render(<Stepper {...defaultProps} size="sm" />);
    const svgCircle = getByTestId("stepper-svg");

    expect(svgCircle).toHaveAttribute("width", "56");
    expect(svgCircle).toHaveAttribute("height", "56");
    const circle = getByText(`${defaultProps.currentStep} of ${defaultProps.steps.length}`);
    expect(circle).toHaveClass("text-xs");
  });

  it("renders correct attributes for size md", () => {
    const { getByTestId, getByText } = render(<Stepper {...defaultProps} size="md" />);
    const svgCircle = getByTestId("stepper-svg");

    expect(svgCircle).toHaveAttribute("width", "64");
    expect(svgCircle).toHaveAttribute("height", "64");
    const circle = getByText(`${defaultProps.currentStep} of ${defaultProps.steps.length}`);
    expect(circle).toHaveClass("text-sm");
  });

  it("renders correct attributes for size lg", () => {
    const { getByTestId, getByText } = render(<Stepper {...defaultProps} size="lg" />);
    const svgCircle = getByTestId("stepper-svg");

    expect(svgCircle).toHaveAttribute("width", "72");
    expect(svgCircle).toHaveAttribute("height", "72");
    const circle = getByText(`${defaultProps.currentStep} of ${defaultProps.steps.length}`);
    expect(circle).toHaveClass("text-base");
  });

  it("renders correct attributes for size xl", () => {
    const { getByTestId, getByText } = render(<Stepper {...defaultProps} size="xl" />);
    const svgCircle = getByTestId("stepper-svg");

    expect(svgCircle).toHaveAttribute("width", "86");
    expect(svgCircle).toHaveAttribute("height", "86");
    const circle = getByText(`${defaultProps.currentStep} of ${defaultProps.steps.length}`);
    expect(circle).toHaveClass("text-lg");
  });

  it("renders 'Done' when currentStep is the last step", () => {
    const { getByText } = render(<Stepper {...defaultProps} currentStep={defaultProps.steps.length} />);

    expect(getByText("Next: Done")).toBeInTheDocument();
  });
});

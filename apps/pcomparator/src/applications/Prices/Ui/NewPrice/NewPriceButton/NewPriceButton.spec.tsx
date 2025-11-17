import { fireEvent, render, waitFor } from "~/test/componentUtils";
import { NewPriceButton } from ".";

jest.mock("~/applications/Prices/Api/createPrice", () => ({ createPrice: () => Promise.resolve() }));
jest.mock("react-barcode-scanner", () => ({ BarcodeScanner: () => <></> }));

describe("NewPriceButton", () => {
  it("renders button with Plus icon", () => {
    const { getByRole } = render(<NewPriceButton />);

    expect(getByRole("button")).toBeInTheDocument();
  });

  it("opens the dropdown menu when button is clicked", () => {
    const { getByText, getByRole } = render(<NewPriceButton />);
    const button = getByRole("button");

    fireEvent.click(button);

    expect(getByText("Scan barcode")).toBeInTheDocument();
    expect(getByText("Type barcode")).toBeInTheDocument();
  });

  it("opens the BarcodeScannerModal when 'Scan barcode' is clicked", async () => {
    const { getByRole, getByTestId } = render(<NewPriceButton />);

    fireEvent.click(getByRole("button")); // Ouvre le dropdown
    fireEvent.click(getByTestId("scan-barcode"));

    await waitFor(() => {
      expect(getByTestId("modal-barcode-scanner")).toBeInTheDocument();
    });
  });

  it("opens the NewPriceModal when 'Type barcode' is clicked", async () => {
    const { getByRole, getByTestId, getByText } = render(<NewPriceButton />);

    fireEvent.click(getByRole("button"));
    fireEvent.click(getByTestId("type-barcode"));

    await waitFor(() => {
      expect(getByText("Step")).toBeInTheDocument();
    });
  });
});

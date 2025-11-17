import { toast } from "react-toastify";
import { updateAvatar } from "~/applications/Profile/Api/updateAvatar";
import { SettingsAvatar } from "~/applications/Profile/Ui/Settings/Avatar";
import { fireEvent, render, waitFor } from "~/test/componentUtils";

jest.mock("~/applications/Profile/Api/updateAvatar", () => ({
  updateAvatar: jest.fn()
}));
jest.mock("react-toastify", () => ({
  toast: jest.fn()
}));

describe("SettingsAvatar Component", () => {
  const defaultAvatar = "default-avatar.jpg";

  beforeEach(() => {
    (updateAvatar as jest.MockedFunction<typeof updateAvatar>).mockClear();
    (updateAvatar as jest.Mock).mockClear();
  });

  it("renders correctly with default avatar", () => {
    const { getByText } = render(<SettingsAvatar defaultValue={defaultAvatar} />);

    (updateAvatar as jest.Mock).mockResolvedValue({ image: "" });
    expect(getByText("Avatar")).toBeInTheDocument();
    expect(getByText("This is your avatar.")).toBeInTheDocument();
    expect(getByText("Click on the avatar to upload a custom one from your files.")).toBeInTheDocument();
  });

  it("updates avatar when a new file is selected", async () => {
    const newAvatarUrl = "updated-avatar.jpg";
    (updateAvatar as jest.Mock).mockResolvedValue({ image: newAvatarUrl });

    const { getByAltText, container } = render(<SettingsAvatar defaultValue={defaultAvatar} />);

    const inputFile = container.querySelector("#avatar") as HTMLInputElement;
    const file = new File(["dummy content"], "avatar.jpg", { type: "image/jpeg" });

    Object.defineProperty(inputFile, "files", {
      value: [file]
    });

    fireEvent.change(inputFile);

    await waitFor(() => expect(updateAvatar).toHaveBeenCalledWith({ image: file }));
    await waitFor(() => expect(getByAltText("avatar")).toHaveAttribute("src", newAvatarUrl));
    expect(toast).toHaveBeenCalled();

    const toastArgs = (toast as unknown as jest.Mock).mock.calls[0][1];
    expect(toastArgs).toEqual(
      expect.objectContaining({
        type: "success"
      })
    );
  });
});

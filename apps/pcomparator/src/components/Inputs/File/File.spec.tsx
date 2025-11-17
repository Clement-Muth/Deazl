import { useLingui } from "@lingui/react/macro";
import type React from "react";
import useForm from "~/components/Form/useForm";
import { fireEvent, render } from "~/test/componentUtils";
import { File as FileComponent } from "./File";

class File {
  public name: string;
  public size: number;
  public mimeType: string;
  public blob = new Blob();

  constructor(name: string, size: number, mimeType: string) {
    this.name = name || "mock.txt";
    this.size = size || 1024;
    this.mimeType = mimeType || "plain/txt";

    function range(count: number) {
      let output = "";

      for (let i = 0; i < count; i++) output += "a";

      return output;
    }

    this.blob = new Blob([range(size)], { type: mimeType });
  }
}

class DataTransfer {
  items: DataTransferItemList;

  constructor() {
    this.items = new DataTransferItemList();
  }

  get files() {
    return this.items.files;
  }
}

class DataTransferItemList {
  private filesList: File[];

  constructor() {
    this.filesList = [];
  }

  add(file: File) {
    this.filesList.push(file);
  }

  get files() {
    return this.filesList;
  }
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm();

  return (
    <form.Form
      encType="multipart/form-data"
      actions={{
        prevProps: {
          title: "Go Back",
          onClick: () => form.reset()
        },
        nextProps: {
          title: "Continue"
        },
        className: "flex-col"
      }}
      methods={form.methods}
      onSubmit={() => null}
      className="flex flex-col gap-4"
    >
      {children}
    </form.Form>
  );
};

describe("File Component", () => {
  it("should render the file input", () => {
    const { i18n } = useLingui();
    const { getByPlaceholderText } = render(
      <Wrapper>
        <FileComponent name="testFile" />
      </Wrapper>
    );

    expect(getByPlaceholderText(i18n._("Select your file"))).toBeInTheDocument();
  });

  it("should display file names when files are selected", () => {
    const { getByText, container } = render(
      <Wrapper>
        <FileComponent name="testFile" multiple />
      </Wrapper>
    );

    global.URL.createObjectURL = jest.fn();

    const fileInput = container.querySelector("#inner-file-input")!;

    const file = new File("testFile.png", 1024 * 1024 + 1, "image/png");
    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(file);
    fireEvent.change(fileInput, { target: { files: dataTransfer.files } });

    expect(getByText("testFile.png")).toBeInTheDocument();
  });

  it("should display an error message when file size exceeds limit", () => {
    const maxSize = 1;
    const { i18n } = useLingui();

    const { container, getByText } = render(
      <Wrapper>
        <FileComponent name="testFile" maxSize={maxSize} />
      </Wrapper>
    );

    global.URL.createObjectURL = jest.fn();

    const fileInput = container.querySelector("#inner-file-input")!;

    const file = new File("testFile.png", 1048576 * 2, "image/png"); // 2Mo
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fireEvent.change(fileInput, { target: { files: dataTransfer.files } });

    expect(getByText(i18n._("Your file exceeded the limit ${maxSize}Mo"))).toBeInTheDocument();
  });

  it("should display multiple file previews when multiple files are selected", () => {
    const { container, getByText } = render(
      <Wrapper>
        <FileComponent name="testFile" multiple />
      </Wrapper>
    );

    global.URL.createObjectURL = jest.fn();

    const fileInput = container.querySelector("#inner-file-input")!;

    const file1 = new File("file1.png", 1048576, "image/png");
    const file2 = new File("file2.png", 1048576, "image/png");
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file1);
    dataTransfer.items.add(file2);
    fireEvent.change(fileInput, { target: { files: dataTransfer.files } });

    expect(getByText("file1.png")).toBeInTheDocument();
    expect(getByText("file2.png")).toBeInTheDocument();
  });

  it("should handle drag and drop", () => {
    const { getByRole, getByText } = render(
      <Wrapper>
        <FileComponent name="testFile" multiple />
      </Wrapper>
    );

    global.URL.createObjectURL = jest.fn();

    const fileInput = getByRole("textbox", { name: /select your file/i });

    const file = new File("draggedFile.png", 1048576, "image/png");
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fireEvent.dragOver(fileInput);
    fireEvent.drop(fileInput, { dataTransfer });

    expect(getByText("draggedFile.png")).toBeInTheDocument();
  });
});

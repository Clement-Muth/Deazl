import type { Meta, StoryObj } from "@storybook/react";
import _ from "lodash";
import { FileIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import useForm from "~/components/Form/useForm";
import { File, type FileProps } from "~/components/Inputs/File/File";

export default {
  title: "components/Inputs/File",
  component: File,
  decorators: [
    (Story) => (
      <Template>
        <Story />
      </Template>
    )
  ]
} satisfies Meta<typeof File>;

type FileObjProps = FileProps & RegisterOptions<FieldValues, any>;

const defaultProps: FileObjProps = {
  name: "avatar",
  label: "Your Avatar",
  accept: ".png,.jpg,.jpeg,.pdf"
};

const Template = ({ children }: { children: ReactNode }) => {
  const form = useForm();

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <form.Form
        encType="multipart/form-data"
        actions={{
          prevProps: {
            title: "Reset",
            onClick: () => form.reset()
          },
          nextProps: {
            title: "Submit"
          }
        }}
        methods={form.methods}
        onSubmit={async () => {}}
        className="flex flex-col gap-4 max-w-lg w-full"
      >
        <div className="flex flex-col items-center justify-center">{children}</div>
      </form.Form>
    </div>
  );
};

export const Default: StoryObj = {
  args: {
    ...defaultProps
  }
};

export const Required: StoryObj = {
  args: {
    ...defaultProps,
    required: { message: "this field is requried", value: true }
  }
};

export const Disabled: StoryObj = {
  args: {
    ...defaultProps,
    isDisabled: true
  }
};

export const Multiple: StoryObj = {
  args: {
    ...defaultProps,
    multiple: true
  }
};

export const Variants: StoryObj<{ name: string }> = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-4">
      <File {...args} label="Bordered" variant="bordered" />
      <File {...args} label="Faded" variant="faded" />
      <File {...args} label="Flat" variant="flat" />
      <File {...args} label="Underlined" variant="underlined" />
    </div>
  ),
  args: {
    ...defaultProps
  }
};

export const WithoutPreview: StoryObj = {
  args: {
    ...defaultProps,
    disablePreview: true
  }
};

export const WithoutFileName: StoryObj = {
  args: {
    ...defaultProps,
    disableFileName: true
  }
};

export const WithoutPreviewAndFileName: StoryObj = {
  args: {
    ...defaultProps,
    disablePreview: true,
    disableFileName: true
  }
};

export const WithMinFile: StoryObj = {
  args: {
    ...defaultProps,
    label: "Minimum 2 files",
    minFile: 2,
    multiple: true
  }
};

export const WithMaxFile: StoryObj = {
  args: {
    ...defaultProps,
    label: "Maximum 2 files",
    maxFile: 2,
    multiple: true
  }
};

export const WithMaxSize: StoryObj = {
  args: {
    ...defaultProps,
    label: "Maximum 2Mo",
    maxSize: 2
  }
};

export const WithoutLabel: StoryObj = {
  args: {
    ..._.omit(defaultProps, "label")
  }
};

export const WithDescription: StoryObj = {
  args: {
    ...defaultProps,
    description: "Hello everyone"
  }
};

export const StartContent: StoryObj = {
  args: {
    ...defaultProps,
    startContent: <FileIcon className="text-gray-500" width={20} height={20} />
  }
};

export const EndContent: StoryObj = {
  args: {
    ...defaultProps,
    endContent: <FileIcon className="text-gray-500" width={20} height={20} />
  }
};

export const WithErrorMessage: StoryObj = {
  args: {
    ...defaultProps,
    errorMessage: "Please provide a file"
  }
};

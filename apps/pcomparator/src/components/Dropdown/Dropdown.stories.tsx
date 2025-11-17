import type { Meta, StoryObj } from "@storybook/react";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import { Dropdown, type DropdownProps } from "~/components/Dropdown/Dropdown";
import "react-spring-bottom-sheet/dist/style.css";
import { useDisclosure } from "@heroui/react";

export default {
  title: "components/Dropdown",
  component: Dropdown
} satisfies Meta<typeof Dropdown>;

type FileObjProps = DropdownProps & RegisterOptions<FieldValues, any>;

// @ts-ignore
const defaultProps: FileObjProps = {
  isOpen: true,
  onClose: () => null,
  body: <p>Hello guys</p>
};

const Template = (props: any) => {
  const { isOpen, onClose } = useDisclosure({ defaultOpen: true });

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      body={props.body}
      dropdownItems={[
        { label: "New file", key: "newfile" },
        { label: "Copy link", key: "copylink" },
        { label: "Edit file", key: "editfile" },
        { label: "Delete file", color: "danger", className: "text-danger", key: "deletefile" }
      ]}
    />
  );
};

export const Default: StoryObj = {
  render: Template,

  args: {
    ...defaultProps
  }
};

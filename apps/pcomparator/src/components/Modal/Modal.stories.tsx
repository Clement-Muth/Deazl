import type { Meta, StoryObj } from "@storybook/react";
import type { FieldValues, RegisterOptions } from "react-hook-form";
import { Modal, type ModalProps } from "~/components/Modal/Modal";
import "react-spring-bottom-sheet/dist/style.css";
import { useDisclosure } from "@heroui/react";

export default {
  title: "components/Modal",
  component: Modal
} satisfies Meta<typeof Modal>;

type FileObjProps = ModalProps & RegisterOptions<FieldValues, any>;

const defaultProps: FileObjProps = {
  isOpen: true,
  onClose: () => null,
  body: <p>Hello guys</p>
};

const Template = (props: any) => {
  const { isOpen, onClose } = useDisclosure({ defaultOpen: true });

  return <Modal isOpen={isOpen} onClose={onClose} body={props.body} />;
};

export const Default: StoryObj = {
  render: Template,

  args: {
    ...defaultProps
  }
};

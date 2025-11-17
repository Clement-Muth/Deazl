import { Button, Modal, ModalBody, ModalContent, ModalFooter } from "@heroui/react";
import { Camera as CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Camera } from "react-camera-pro";

interface TakePictureProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onProofTaken: (proof: string) => void;
}

export const TakePicture = ({ isOpen, onClose, onOpenChange, onProofTaken }: TakePictureProps) => {
  const camera = useRef<{ takePhoto: () => string }>(null);
  const [image, setImage] = useState(null);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalBody>
          <div className="min-h-[75dvh]">
            <Camera errorMessages={{}} ref={camera} aspectRatio="cover" />
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            startContent={<CameraIcon />}
            radius="full"
            className="min-w-fit w-12 h-14"
            onPress={() => {
              if (camera.current) {
                const photo = camera.current.takePhoto();

                onProofTaken(photo);
                onClose();
              }
            }}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

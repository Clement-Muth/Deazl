"use client";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { ExternalLink, Info } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import useIosInstallPrompt from "~/core/pwa/useIos";
import useWebInstallPrompt from "~/core/pwa/useWebInstall";

const InstallPrompt = () => {
  const [iosInstallPrompt, handleIOSInstallDeclined] = useIosInstallPrompt();
  const [webInstallPrompt, handleWebInstallDeclined, handleWebInstallAccepted] = useWebInstallPrompt();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (!iosInstallPrompt && !webInstallPrompt) return;
    setTimeout(onOpen, 3000);
  }, [webInstallPrompt, iosInstallPrompt]);

  if (!iosInstallPrompt && !webInstallPrompt) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {iosInstallPrompt ? (
          <>
            <ModalHeader>
              <Trans>Install Our App for a Better Experience!</Trans>
            </ModalHeader>
            <ModalBody>
              <p>
                <Trans>Get faster access, work offline, and enjoy a smoother experience.</Trans>
              </p>
              <Card className="mb-4">
                <CardBody className="flex !flex-row gap-6 bg-yellow-200/[0.2] dark:bg-yellow-200/[0.06]">
                  <Info color="#e3c84b" size="22px" />
                  <div className="flex-1">
                    <span className="text-small">
                      <b>App can not be automatically installed on Ios</b>
                    </span>
                    <span className="text-small flex items-center gap-x-1">
                      Tap
                      <ExternalLink />
                      then &quot;Add to Home Screen&quot;
                    </span>
                  </div>
                </CardBody>
              </Card>
              <ul>
                <li>
                  <Checkbox isSelected readOnly>
                    Instant access with one tap
                  </Checkbox>
                </li>
                <li>
                  <Checkbox isSelected readOnly>
                    No need for app store downloads
                  </Checkbox>
                </li>
                <li>
                  <Checkbox isSelected readOnly>
                    Works offline and loads faster
                  </Checkbox>
                </li>
                <li>
                  <Checkbox isSelected readOnly>
                    Stay updated with notifications
                  </Checkbox>
                </li>
              </ul>
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={() => {
                  handleIOSInstallDeclined();
                  onClose();
                }}
              >
                <Trans>Maybe later</Trans>
              </Button>
              <Button
                onPress={() => {
                  handleIOSInstallDeclined();
                  onClose();
                }}
                color="primary"
              >
                <span>Have installed it</span>
              </Button>
            </ModalFooter>
          </>
        ) : webInstallPrompt ? (
          <>
            <ModalHeader>
              <Trans>Install Our App for a Better Experience!</Trans>
            </ModalHeader>
            <ModalBody>
              <p>
                <Trans>Get faster access, work offline, and enjoy a smoother experience.</Trans>
              </p>
              <ul>
                <li>
                  <Checkbox isSelected readOnly>
                    Instant access with one tap
                  </Checkbox>
                </li>
                <li>
                  <Checkbox isSelected readOnly>
                    No need for app store downloads
                  </Checkbox>
                </li>
                <li>
                  <Checkbox isSelected readOnly>
                    Works offline and loads faster
                  </Checkbox>
                </li>
                <li>
                  <Checkbox isSelected readOnly>
                    Stay updated with notifications
                  </Checkbox>
                </li>
              </ul>
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={() => {
                  handleWebInstallDeclined();
                  onClose();
                }}
              >
                <Trans>Maybe later</Trans>
              </Button>
              <Button
                onPress={() => {
                  handleWebInstallAccepted();
                  onClose();
                }}
                color="primary"
              >
                <span>Install our app 👋</span>
              </Button>
            </ModalFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  );
};

export const InstallPWA = dynamic(() => Promise.resolve(InstallPrompt), {
  ssr: false
});

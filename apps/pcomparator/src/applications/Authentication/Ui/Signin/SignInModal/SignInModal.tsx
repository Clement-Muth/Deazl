import { SigninWithGoogleButton } from "~/applications/Authentication/Ui/Signin/SignButton/SigninWithGoogleButton";
import { Modal } from "~/components/Modal/Modal";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => (
  <Modal
    body={
      <div>
        <SigninWithGoogleButton />
      </div>
    }
    header="Sign in to your account"
    isOpen={isOpen}
    onClose={onClose}
  />
);

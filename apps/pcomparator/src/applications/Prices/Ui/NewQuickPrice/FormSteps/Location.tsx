import { Button, ModalBody, ModalFooter, Radio, RadioGroup, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { Search } from "lucide-react";
import { useRef, useState } from "react";
import useForm from "~/components/Form/useForm";
import { Input } from "~/components/Inputs/Input/Input";
import useLocation from "~/hooks/useLocation";

interface LocationProps {
  onNextStep: (data: { storeName: string; location: string }) => Promise<void>;
  onPrevious: () => void;
}

export const Location = ({ onNextStep, onPrevious }: LocationProps) => {
  const form = useForm();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [choosenLocation, setChoosenLocation] = useState<{ storeName: string; location: string } | null>(
    null
  );
  const { location, loading, getLocation } = useLocation();

  return (
    <form.Form
      methods={form.methods}
      onSubmit={async () => {
        if (choosenLocation?.storeName && choosenLocation?.location)
          await onNextStep({ storeName: choosenLocation.storeName, location: choosenLocation.location });
      }}
      actions={{
        nextProps: { title: <Trans>Next</Trans>, color: "primary" },
        prevProps: { title: <Trans>Previous</Trans>, onPress: onPrevious },
        wrapper: ModalFooter
      }}
    >
      <ModalBody>
        <RadioGroup label="Select the store" color="default">
          {loading ? (
            <Spinner />
          ) : (
            location?.map(({ name, address }) => (
              <Radio
                value={name}
                description={address}
                key={address}
                onChange={() => {
                  setChoosenLocation({ storeName: name, location: address });
                }}
              >
                {name}
              </Radio>
            ))
          )}
        </RadioGroup>
        <Input
          name="location"
          label={<Trans>Custom location</Trans>}
          placeholder="4 rue du dôme, 67000, Strasbourg"
          endContent={
            <Button
              startContent={<Search />}
              variant="flat"
              onPress={() => getLocation(searchRef.current?.value)}
            >
              <Trans>Search</Trans>
            </Button>
          }
          ref={searchRef}
        />
      </ModalBody>
    </form.Form>
  );
};

import { Button, Card, CardBody, Radio, RadioGroup, Spinner } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { MapPin, Search, Store } from "lucide-react";
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
        nextProps: {
          title: <Trans>Confirm</Trans>,
          color: "primary",
          isDisabled: !choosenLocation
        },
        prevProps: { title: <Trans>Back</Trans>, onPress: onPrevious }
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Store size={24} />
            <h3 className="text-lg font-semibold">
              <Trans>Select store</Trans>
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            <Trans>Where did you see this price?</Trans>
          </p>
        </div>

        {/* Nearby stores from geolocation */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : location && location.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MapPin size={16} />
              <Trans>Nearby stores</Trans>
            </div>
            <RadioGroup
              value={choosenLocation?.storeName}
              onValueChange={(value) => {
                const selected = location.find((loc) => loc.name === value);
                if (selected) {
                  setChoosenLocation({ storeName: selected.name, location: selected.address });
                }
              }}
            >
              {location.map(({ name, address }) => (
                <Card
                  key={name}
                  className={`cursor-pointer transition-all ${
                    choosenLocation?.storeName === name
                      ? "border-2 border-primary shadow-md"
                      : "border border-gray-200 hover:border-gray-300"
                  }`}
                  isPressable
                  onPress={() => setChoosenLocation({ storeName: name, location: address })}
                >
                  <CardBody className="p-3">
                    <Radio value={name} description={address} classNames={{ base: "m-0 max-w-full" }}>
                      <span className="font-medium">{name}</span>
                    </Radio>
                  </CardBody>
                </Card>
              ))}
            </RadioGroup>
          </div>
        ) : null}

        {/* Search custom location */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Trans>Or search manually</Trans>
          </div>
          <div className="flex gap-2">
            <Input
              name="location"
              placeholder="Carrefour, Strasbourg"
              ref={searchRef}
              size="lg"
              classNames={{ base: "flex-1" }}
            />
            <Button
              startContent={<Search size={18} />}
              variant="flat"
              color="primary"
              onPress={() => getLocation(searchRef.current?.value)}
              size="lg"
            >
              <Trans>Search</Trans>
            </Button>
          </div>
        </div>
      </div>
    </form.Form>
  );
};

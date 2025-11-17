"use client";

import { Button, Card, CardBody, CardHeader, Chip, Spinner, addToast } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { CheckCircle2Icon, MapPinIcon, RefreshCwIcon, StoreIcon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  enrichAllStores,
  enrichSingleStore,
  listStoresWithoutCoordinates
} from "~/applications/ShoppingLists/Api/stores/enrichStores.api";

interface StoreWithoutCoords {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  _count: {
    prices: number;
  };
}

export const StoreEnrichmentPanel = () => {
  const [stores, setStores] = useState<StoreWithoutCoords[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await listStoresWithoutCoordinates();
      setStores(result);
    } catch (error) {
      console.error("Error loading stores:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Unable to load stores</Trans>,
        color: "danger",
        variant: "solid"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEnrichSingle = useCallback(
    async (storeId: string) => {
      setEnrichingIds((prev) => new Set(prev).add(storeId));
      try {
        const result = await enrichSingleStore(storeId);

        if (result.success) {
          addToast({
            title: <Trans>Success</Trans>,
            description: result.message,
            color: "success",
            variant: "solid"
          });
          await loadStores();
        } else {
          addToast({
            title: <Trans>Warning</Trans>,
            description: result.message,
            color: "warning",
            variant: "solid"
          });
        }
      } catch (error) {
        console.error("Error enriching store:", error);
        addToast({
          title: <Trans>Error</Trans>,
          description: <Trans>Unable to enrich this store</Trans>,
          color: "danger",
          variant: "solid"
        });
      } finally {
        setEnrichingIds((prev) => {
          const next = new Set(prev);
          next.delete(storeId);
          return next;
        });
      }
    },
    [loadStores]
  );

  const handleEnrichAll = useCallback(async () => {
    setEnrichingAll(true);
    try {
      const result = await enrichAllStores();

      addToast({
        title: result.success ? <Trans>Completed</Trans> : <Trans>Error</Trans>,
        description: result.message,
        color: result.success ? "success" : "danger",
        variant: "solid"
      });

      if (result.success) {
        await loadStores();
      }
    } catch (error) {
      console.error("Error enriching all stores:", error);
      addToast({
        title: <Trans>Error</Trans>,
        description: <Trans>Unable to enrich stores</Trans>,
        color: "danger",
        variant: "solid"
      });
    } finally {
      setEnrichingAll(false);
    }
  }, [loadStores]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            <Trans>Store GPS Enrichment</Trans>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            <Trans>Add GPS coordinates to stores for distance-based optimization</Trans>
          </p>
        </div>
        <Button
          color="primary"
          onPress={handleEnrichAll}
          isLoading={enrichingAll}
          isDisabled={stores.length === 0}
          startContent={<RefreshCwIcon className="h-4 w-4" />}
        >
          <Trans>Enrich All</Trans>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <StoreIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                <Trans>Without coordinates</Trans>
              </p>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <MapPinIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                <Trans>In progress</Trans>
              </p>
              <p className="text-2xl font-bold text-gray-900">{enrichingIds.size}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2Icon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                <Trans>Total prices</Trans>
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stores.reduce((sum, s) => sum + s._count.prices, 0)}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Stores List */}
      {stores.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <CheckCircle2Icon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Trans>All stores enriched!</Trans>
            </h3>
            <p className="text-sm text-gray-600">
              <Trans>All stores now have GPS coordinates for distance-based optimization</Trans>
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => {
            const isEnriching = enrichingIds.has(store.id);
            const hasPartialCoords =
              (store.latitude && !store.longitude) || (!store.latitude && store.longitude);

            return (
              <Card key={store.id}>
                <CardBody className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <StoreIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{store.name}</h3>
                        {hasPartialCoords && (
                          <Chip size="sm" color="warning" variant="flat">
                            <Trans>Partial</Trans>
                          </Chip>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{store.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {store._count.prices} <Trans>prices</Trans>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasPartialCoords ? (
                      <Chip
                        color="warning"
                        variant="flat"
                        size="sm"
                        startContent={<XCircleIcon className="h-3 w-3" />}
                      >
                        <Trans>Incomplete</Trans>
                      </Chip>
                    ) : (
                      <Chip
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<MapPinIcon className="h-3 w-3" />}
                      >
                        <Trans>Missing</Trans>
                      </Chip>
                    )}

                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => handleEnrichSingle(store.id)}
                      isLoading={isEnriching}
                      startContent={!isEnriching && <RefreshCwIcon className="h-4 w-4" />}
                    >
                      <Trans>Enrich</Trans>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Panel */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-900">
            <Trans>How does it work?</Trans>
          </h3>
        </CardHeader>
        <CardBody className="space-y-2 text-sm text-gray-600">
          <p>
            <Trans>
              This tool uses the Photon API (Komoot) to automatically find GPS coordinates for stores based on
              their name and location.
            </Trans>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <Trans>Click "Enrich" for a single store to get its coordinates</Trans>
            </li>
            <li>
              <Trans>Click "Enrich All" to process all stores at once (500ms delay between each)</Trans>
            </li>
            <li>
              <Trans>New stores will automatically be enriched when created</Trans>
            </li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            <Trans>⚠️ The Photon API is free but rate-limited. Enriching many stores may take time.</Trans>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

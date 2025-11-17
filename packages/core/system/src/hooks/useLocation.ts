"use client";

import ky from "ky";
import { useCallback, useEffect, useState } from "react";

interface Location {
  name: string;
  address: string;
}

interface LocationResponse {
  features: {
    properties: { name: string; street: string; postcode: string; state: string; country: string };
  }[];
}

const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location[] | null>(null);

  const fetchLocations = async (url: string) => {
    try {
      setLoading(true);
      const data = await ky.get(url).json<LocationResponse>();

      setLocation(
        data.features.map(({ properties }) => ({
          name: properties.name,
          address: `${properties.street} ${properties.postcode} ${properties.state} ${properties.country}`
        }))
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = useCallback((value?: string) => {
    if (value) {
      fetchLocations(`https://photon.komoot.io/api/?q=${value}&limit=5&osm_tag=shop&osm_tag=amenity`);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchLocations(
            `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}&limit=5&osm_tag=shop&osm_tag=amenity`
          );
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { location, loading, getLocation };
};

export default useLocation;

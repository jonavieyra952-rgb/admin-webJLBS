import React, { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Escribe una dirección...",
  className = "form-control",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("No se encontró VITE_GOOGLE_MAPS_API_KEY en el frontend.");
      return;
    }

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        console.error("Google Maps Places no está disponible.");
        return;
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "mx" },
          fields: ["formatted_address", "geometry", "name"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (place?.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    };

    const existingScript = document.querySelector(
      'script[data-google-maps="true"]'
    ) as HTMLScriptElement | null;

    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", initAutocomplete);
      return () => {
        existingScript.removeEventListener("load", initAutocomplete);
      };
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initAutocomplete;
    script.onerror = () => {
      console.error("No se pudo cargar el script de Google Maps.");
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
}
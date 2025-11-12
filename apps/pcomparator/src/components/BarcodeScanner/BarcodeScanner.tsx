import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Camera, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScanned: (barcode: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  continuous?: boolean;
}

export const BarcodeScanner = ({
  onScanned,
  onClose,
  title = "Scanner un code-barres",
  description = "Positionnez le code-barres dans le cadre",
  continuous = false
}: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScanningRef = useRef(false);

  // Références stables pour les callbacks
  const onScannedRef = useRef(onScanned);
  const onCloseRef = useRef(onClose);

  // Mettre à jour les références quand les props changent
  useEffect(() => {
    onScannedRef.current = onScanned;
    onCloseRef.current = onClose;
  }, [onScanned, onClose]);

  // Initialiser le code reader
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    startCamera();

    return () => {
      stopScanning();
      stopCamera();
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (e) {
          console.warn("Erreur lors du reset du scanner:", e);
        }
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier si on est en HTTPS ou localhost
      const isSecureContext =
        window.isSecureContext ||
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecureContext) {
        throw new Error(
          "La caméra nécessite une connexion HTTPS sécurisée. Veuillez accéder au site via HTTPS."
        );
      }

      // Vérifier le support de l'API avec plusieurs fallbacks
      if (!navigator.mediaDevices) {
        console.error("navigator.mediaDevices n'est pas disponible");
        throw new Error(
          "L'API de caméra n'est pas disponible sur ce navigateur. Veuillez utiliser un navigateur récent (Chrome, Safari, Firefox)."
        );
      }

      if (!navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia n'est pas disponible");
        throw new Error(
          "Votre navigateur ne supporte pas l'accès à la caméra. Veuillez mettre à jour votre navigateur."
        );
      }

      // Demander les permissions avec des contraintes optimisées pour mobile
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Wait for video metadata to load before playing
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();

          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });

        try {
          await videoRef.current.play();
          console.log("✅ Vidéo démarrée avec succès");

          // Wait for video to be actually playing
          await new Promise<void>((resolve) => {
            if (!videoRef.current) return resolve();

            const checkPlaying = setInterval(() => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                clearInterval(checkPlaying);
                resolve();
              }
            }, 100);

            // Timeout après 5 secondes
            setTimeout(() => {
              clearInterval(checkPlaying);
              resolve();
            }, 5000);
          });

          console.log("✅ Vidéo prête, démarrage du scan");
          setIsLoading(false);

          // Démarrer le scan après que la vidéo soit vraiment prête
          setTimeout(() => {
            startScanning();
          }, 500);
        } catch (playError) {
          console.error("Erreur de lecture vidéo:", playError);
          setError("Impossible de démarrer la vidéo");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erreur accès caméra:", err);
      setHasPermission(false);

      // Messages d'erreur plus spécifiques selon le type d'erreur
      let errorMessage = "Impossible d'accéder à la caméra";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage =
            "Permission caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage = "Aucune caméra détectée sur cet appareil.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMessage =
            "La caméra est déjà utilisée par une autre application. Veuillez fermer les autres applications et réessayer.";
        } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
          errorMessage = "Les paramètres de la caméra ne sont pas supportés. Essayez avec un autre appareil.";
        } else if (err.name === "NotSupportedError") {
          errorMessage = "L'API de caméra n'est pas supportée sur ce navigateur.";
        } else if (err.name === "TypeError") {
          errorMessage = "Erreur de configuration de la caméra.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const startScanning = useCallback(() => {
    console.log("🔍 Tentative démarrage scan...", {
      hasCodeReader: !!codeReaderRef.current,
      hasVideo: !!videoRef.current,
      videoReadyState: videoRef.current?.readyState,
      alreadyScanning: isScanningRef.current
    });

    if (!codeReaderRef.current || !videoRef.current) {
      console.error("❌ Impossible de démarrer le scan: codeReader ou video manquant");
      return;
    }

    if (isScanningRef.current) {
      console.log("⚠️ Scan déjà en cours, skip");
      return;
    }

    console.log("✅ Démarrage du scan...");
    isScanningRef.current = true;
    setIsScanning(true);

    try {
      codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          console.log("🎉 Code-barres détecté:", result.getText());

          if (typeof onScannedRef.current === "function") {
            onScannedRef.current(result.getText());
          } else {
            console.error("❌ onScannedRef.current n'est pas une fonction:", typeof onScannedRef.current);
            return;
          }

          if (!continuous) {
            if (typeof onCloseRef.current === "function") {
              onCloseRef.current();
            }
            return;
          }

          // En mode continu, arrêter temporairement et redémarrer
          stopScanning();
          scanTimeoutRef.current = setTimeout(() => {
            startScanning();
          }, 2000);
        }

        if (error && !(error instanceof NotFoundException)) {
          console.error("Erreur de scan:", error);
        }
      });
      console.log("✅ decodeFromVideoDevice lancé avec succès");
    } catch (err) {
      console.error("❌ Erreur lors du démarrage du scan:", err);
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, [continuous]);

  const stopScanning = () => {
    console.log("🛑 Arrêt du scan");
    isScanningRef.current = false;
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    // Arrêter le scan en cours si nécessaire
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {
        console.warn("Erreur lors de l'arrêt du scan:", e);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      setStream(null);
    }
  };

  const handleManualInput = () => {
    const barcode = prompt("Entrez le code-barres manuellement:");
    if (barcode?.trim()) {
      if (typeof onScannedRef.current === "function") {
        onScannedRef.current(barcode.trim());
      }
      if (!continuous && typeof onCloseRef.current === "function") {
        onCloseRef.current();
      }
    }
  };

  const simulateScanning = () => {
    const testBarcode = "3017620422003"; // Code-barres Nutella

    if (typeof onScannedRef.current === "function") {
      onScannedRef.current(testBarcode);
      if (!continuous && typeof onCloseRef.current === "function") {
        onCloseRef.current();
      }
    } else {
      console.error("❌ onScannedRef.current n'est pas une fonction dans simulateScanning");
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => onCloseRef.current?.()}
      size="full"
      classNames={{
        base: "m-0 max-h-screen",
        wrapper: "w-full h-full",
        backdrop: "bg-black/80"
      }}
    >
      <ModalContent className="h-full flex flex-col">
        <ModalHeader className="flex justify-between items-center bg-black text-white">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-300">{description}</p>
          </div>
          <Button isIconOnly variant="light" onPress={() => onCloseRef.current?.()} className="text-white">
            <X className="h-6 w-6" />
          </Button>
        </ModalHeader>

        <ModalBody className="flex-1 p-0 bg-black relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                <p>Initialisation de la caméra...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
              <div className="text-center p-6">
                <X className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-400 mb-4">{error}</p>
                <div className="space-y-3">
                  <Button color="primary" onPress={startCamera} startContent={<Camera className="h-4 w-4" />}>
                    Réessayer
                  </Button>
                  <Button variant="bordered" onPress={handleManualInput} className="text-white border-white">
                    Saisie manuelle
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasPermission && !error && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                webkit-playsinline="true"
                x-webkit-airplay="allow"
                style={{ backgroundColor: "black" }}
              />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-64 h-32 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary-500 opacity-75 animate-pulse" />
                  </div>

                  <p className="text-white text-center mt-4 text-sm bg-black/50 px-3 py-1 rounded">
                    {isScanning ? "🔍 Scan en cours..." : "Alignez le code-barres dans le cadre"}
                  </p>
                </div>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter className="bg-black">
          <div className="flex justify-center gap-4 w-full">
            <Button variant="bordered" onPress={handleManualInput} className="text-white border-white">
              Saisie manuelle
            </Button>

            {process.env.NODE_ENV === "development" && (
              <Button color="warning" onPress={simulateScanning} startContent={<Zap className="h-4 w-4" />}>
                Test Scanner
              </Button>
            )}

            {isScanning && (
              <Button color="success" onPress={stopScanning}>
                Arrêter scan
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

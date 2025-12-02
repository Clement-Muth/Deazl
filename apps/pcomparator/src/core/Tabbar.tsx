"use client";

import { useSession } from "next-auth/react";
import { QuickAddProduct } from "~/applications/Prices/Ui/QuickAddProduct/QuickAddProduct";
import { Tabbar as TabbarComponent } from "~/components/Tabbar/Tabbar";

export function Tabbar() {
  const { data: session } = useSession();

  return <TabbarComponent mainButton={<QuickAddProduct />} isSignedIn={!!session?.user} />;
  // const [result, setResult] = useState<string | null>(null);

  // const handleScan = async () => {
  //   try {
  //     const res = await CapacitorBarcodeScanner.scanBarcode({
  //       hint: CapacitorBarcodeScannerTypeHint.ALL,
  //       cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK
  //     });
  //     // res.ScanResult contient la donnée lue
  //     setResult(res.ScanResult);
  //   } catch (err) {
  //     console.error("Scan erreur:", err);
  //   }
  // };

  // return (
  //   <div style={{ padding: 20 }}>
  //     <h1>Scanner (QR / code‑barres)</h1>
  //     <Button onClick={handleScan}>Scanner</Button>
  //     {result && (
  //       <div style={{ marginTop: 20 }}>
  //         <strong>Résultat :</strong> {result}
  //       </div>
  //     )}
  //   </div>
  // );
}

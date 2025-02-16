import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThirdwebProvider } from "thirdweb/react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThirdwebProvider>
      <TonConnectUIProvider manifestUrl="https://89x6lg-5173.csb.app/tonconnect-manifest.json">
        <App />
      </TonConnectUIProvider>
    </ThirdwebProvider>
  </StrictMode>
);

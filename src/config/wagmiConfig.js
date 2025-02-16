import { createConfig } from "wagmi";
import { mainnet, polygon, base } from "wagmi/chains";
const wagmiConfig = createConfig({
  autoConnect: true,
  appName: "Prime Mates",
  projectId: "0172cf3cfab54f05b2ad8a6bd21b79ac",
  chains: [mainnet, polygon, base],
});
export default wagmiConfig;

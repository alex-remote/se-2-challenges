export const preContent = `
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
`;

// CHALLENGE-TODO: 更新 metadataOverrides 以反映你的挑战
export const metadataOverrides = {
  title: "YOUR CHALLENGE TITLE | Speedrun Ethereum",
  description: "Built with 🏗 Scaffold-ETH 2",
};

export const htmlClassNames = "${spaceGrotesk.variable} font-space-grotesk";

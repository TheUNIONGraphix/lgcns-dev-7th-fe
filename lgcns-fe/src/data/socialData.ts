import GitHubIcon from "../components/svg/GitHubIcon";
import DiscordIcon from "../components/svg/DiscordIcon";
import XcomIcon from "../components/svg/XcomIcon";
import BlueSkyIcon from "../components/svg/BlueSkyIcon";
import type { socialDataType } from "../types/initialTypes";

const socialData: socialDataType[] = [
  {
    id: 1,
    name: "Discord",
    url: "https://discord.com",
    icon: DiscordIcon,
  },
  {
    id: 2,
    name: "GitHub",
    url: "https://github.com",
    icon: GitHubIcon,
  },
  {
    id: 3,
    name: "X.com",
    url: "https://x.com",
    icon: XcomIcon,
  },
  {
    id: 4,
    name: "Bluesky",
    url: "https://bsky.app",
    icon: BlueSkyIcon,
  },
];

export default socialData as socialDataType[];

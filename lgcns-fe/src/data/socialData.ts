import GitHubIcon from "@/components/atoms/svg/GitHubIcon";
import DiscordIcon from "@/components/atoms/svg/DiscordIcon";
import XcomIcon from "@/components/atoms/svg/XcomIcon";
import BlueSkyIcon from "@/components/atoms/svg/BlueSkyIcon";
import type { socialDataType } from "@/types/initialTypes";

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

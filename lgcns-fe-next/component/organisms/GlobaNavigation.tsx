import { Nav } from "@/components/ui/landmark";
import MobileNavigation from "../molecules/MobileNavigation";
import DesktopNavigation from "../molecules/DesktopNavigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/posts", label: "Posts" },
];

export default function GlobalNavigation() {
  return (
    <Nav className="flex items-center">
      <MobileNavigation items={items} />
      <DesktopNavigation items={items} />
    </Nav>
  );
}

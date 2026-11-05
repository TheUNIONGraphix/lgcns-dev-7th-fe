import type { socialDataType } from "../types/initialTypes";

export default function SocialIconItem({
  social,
  target = "_blank",
}: {
  social: socialDataType;
  target: "_blank" | "_self" | "_parent" | "_top";
}) {
  return (
    <li>
      <a href={social.url} target={target}>
        <social.icon />
        {social.name}
      </a>
    </li>
  );
}

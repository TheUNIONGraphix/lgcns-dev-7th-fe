import socialData from "@/data/socialData";
import SocialIconItem from "@/components/atoms/SocialIconItem";
export default function SocialIconList() {
  return (
    <ul>
      {socialData.map((social) => (
        <SocialIconItem key={social.id} social={social} target="_blank" />
      ))}
    </ul>
  );
}

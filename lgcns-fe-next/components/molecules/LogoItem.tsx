import Link from "next/link";
import Image from "next/image";

export default function LogoItem() {
  return (
    <Link href="https://www.lgcns.com/" target="_blank">
      <Image
        src="https://www.lgcns.com/etc.clientlibs/lgcns/clientlibs/clientlib-site/resources/image/common/logo.svg"
        alt="logo"
        width={100}
        height={100}
      />
    </Link>
  );
}

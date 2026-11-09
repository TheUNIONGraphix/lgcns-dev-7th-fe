"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileNavigation({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  return (
    <Sheet>
      <SheetTrigger
        className="md:hidden"
        render={<Button variant="outline" size="icon" className="md:hidden" />}
      >
        <Menu />
        <span className="sr-only">메뉴 열기</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
          <SheetDescription className="sr-only">사이트 메뉴</SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-1 px-2">
          {items.map((item) => (
            <li key={item.href}>
              <SheetClose
                render={
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                  />
                }
              >
                {item.label}
              </SheetClose>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

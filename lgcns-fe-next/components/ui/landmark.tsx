import * as React from "react"
import { cn } from "cn"

function Main({ className, ...props }: React.ComponentProps<"main">) {
  return <main data-slot="main" className={cn(className, "min-h-dvh bg-[#f3f4f6]")} {...props} />
}

function Header({ className, ...props }: React.ComponentProps<"header">) {
  return <header data-slot="header" className={cn(className)} {...props} />
}

function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  return <footer data-slot="footer" className={cn(className)} {...props} />
}

function Nav({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="nav" className={cn(className)} {...props} />
}

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="section" className={cn(className, "px-4 pt-10 pb-16")} {...props} />
}

export { Main, Header, Footer, Nav, Section }

import SignupProgress from "@/component/molecules/SignupProgress";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return <>
    
    {/* signup header */}
    <SignupProgress />
    {children}
    {/* signup footer */}
    </>;
}
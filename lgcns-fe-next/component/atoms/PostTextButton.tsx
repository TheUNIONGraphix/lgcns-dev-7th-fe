export default function PostTextButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      className="font-medium text-[#2563eb]"
      aria-expanded={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

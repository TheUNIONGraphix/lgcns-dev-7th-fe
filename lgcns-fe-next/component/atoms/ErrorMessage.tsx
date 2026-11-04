export default function ErrorMessage({
    id,
    error,
    className = "py-4 text-red-500",
}: {
    id: string;
    error?: string;
    className?: string;
}) {
    return (
        <p
            className={className}
            id={id}
            role="alert"
            style={{ transition: "opacity 0.3s ease-in-out", opacity: error ? 1 : 0 }}
        >
            {error}
        </p>
    );
}
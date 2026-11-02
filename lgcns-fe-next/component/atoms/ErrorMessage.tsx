export default function ErrorMessage({ id, error }: { id: string; error?: string }) {
    // if (!error) return null;

    return (
        <p className={"text-red-500 py-4"} id={id} role="alert"
           style={{ transition: "opacity 0.3s ease-in-out", opacity: error ? 1 : 0 }}
        
        >{error}</p>
    );
}
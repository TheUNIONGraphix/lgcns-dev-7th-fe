import { useState } from "react";

export default function CountBtn() {
  const [count, setCount] = useState<number>(0);
  return (
    <button
      type="button"
      className="counter"
      onClick={() => setCount((count || 0) + 1)}
    >
      Count is {count}
    </button>
  );
}

import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useState } from "react";

export default function WhyThisDecision({ reasoning, onOpen }) {
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) onOpen?.();
  }

  return <div className={open ? "why-decision open" : "why-decision"}>
    <button type="button" onClick={toggle} aria-expanded={open}>
      <Lightbulb size={14} /> Why this recommendation? {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {open && <p>{reasoning}</p>}
  </div>;
}

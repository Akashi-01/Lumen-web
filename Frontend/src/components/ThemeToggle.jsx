import { useEffect, useRef, useState } from "react";
import { faSun, faMoon, faCircleHalfStroke, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../hooks/useTheme.js";
import "./ThemeToggle.css";

const OPTIONS = [
  { value: "light", label: "Light", icon: faSun },
  { value: "dark", label: "Dark", icon: faMoon },
  { value: "auto", label: "Auto", icon: faCircleHalfStroke },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="theme-toggle" ref={wrapperRef}>
      <button
        className="theme-toggle__button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={current.icon} />
      </button>

      {open && (
        <div className="theme-toggle__menu" role="menu">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="theme-toggle__item"
              role="menuitem"
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
            >
              <FontAwesomeIcon icon={opt.icon} className="theme-toggle__item-icon" />
              <span className="theme-toggle__item-label">{opt.label}</span>
              {theme === opt.value && (
                <FontAwesomeIcon icon={faCheck} className="theme-toggle__item-check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
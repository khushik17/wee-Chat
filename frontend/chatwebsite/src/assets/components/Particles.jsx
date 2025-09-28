import { useMemo } from "react";

export default function Particles() {
  function getRandomColor() {
    const colors = ["#7A1CAC", "#AD49E1", "#E14BE1", "#49C6E1", "#58E17A", "#FFD700"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const bubbles = useMemo(() => {
    return [...Array(30)].map((_, i) => {
      const size = Math.random() * 30 + 10;
      const color = getRandomColor();
      return (
        <li
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 100}px`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${Math.random() * 10 + 5}s`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        ></li>
      );
    });
  }, []);

  return <ul className="particles">{bubbles}</ul>;
}

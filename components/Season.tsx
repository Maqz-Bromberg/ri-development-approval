import type { CSSProperties } from "react";
import type { Season } from "@/lib/timelines";

/**
 * Small hand-drawn accents in the manner of a sticker sheet: a warm brown outline, flat fills, darker veins and a few pale speckles.
 * The outline colour is the `--sm-ink` custom property, set on `.season-mark` in globals.css, so it can change with the theme.
 */
const INK: CSSProperties = { stroke: "var(--sm-ink)", strokeWidth: 0.9, strokeLinejoin: "round", strokeLinecap: "round" };

/** A filled shape with the ink outline. */
function S({ d, c }: { d: string; c: string }) {
  return <path d={d} fill={c} style={INK} />;
}

/** An unfilled line: veins and stalks in ink, or another colour when given. */
function V({ d, w = 0.55, c }: { d: string; w?: number; c?: string }) {
  return <path d={d} fill="none" style={{ ...INK, strokeWidth: w, ...(c ? { stroke: c } : {}) }} />;
}

/** Pale speckles on a fill. */
function Dots({ p, r = 0.42 }: { p: [number, number][]; r?: number }) {
  return <g fill="#fff" fillOpacity={0.6}>{p.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={r} />)}</g>;
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const ARMS = [0, 60, 120, 180, 240, 300];
const PETALS = [0, 72, 144, 216, 288];

export type Accent = { name: string; ground: boolean };

/** Four whimsical accents per season, in the order lanes use them. Grounded ones stand on the bottom of the wash, floating ones drift higher. */
export const ACCENTS: Record<Season, Accent[]> = {
  spring: [{ name: "blossom", ground: true }, { name: "bird", ground: false }, { name: "tulip", ground: true }, { name: "butterfly", ground: false }],
  summer: [{ name: "tree", ground: true }, { name: "sun", ground: false }, { name: "sailboat", ground: true }, { name: "kite", ground: false }],
  fall: [{ name: "leaf", ground: false }, { name: "pumpkin", ground: true }, { name: "acorn", ground: false }, { name: "mushroom", ground: true }],
  winter: [{ name: "snowman", ground: true }, { name: "snowflake", ground: false }, { name: "pine", ground: true }, { name: "star", ground: false }],
};

function Drawing({ name }: { name: string }) {
  switch (name) {
    case "blossom":
      return (
        <g>
          <V d="M16 31C16 25 15.5 18 16 12" w={0.9} />
          <S c="#8dbb5a" d="M15.8 25C12 25.5 9.5 23.5 9 20.5C12.5 20.3 15 22 15.8 25Z" />
          <S c="#8dbb5a" d="M16 20.5C19.5 20.7 22 18.8 22.6 15.7C19 15.7 16.6 17.5 16 20.5Z" />
          <V d="M15.6 24.6C13 23.2 11 22 9.4 20.7M16.2 20.2C18.5 18.6 20.5 17.3 22.3 15.9" />
          {PETALS.map((a) => (
            <g key={a} transform={`rotate(${a} 16 10)`}>
              <S c="#f5a9bc" d="M16 10C13.6 8.6 13 5.5 14.4 3.9C15 3.2 15.6 3.4 16 4C16.4 3.4 17 3.2 17.6 3.9C19 5.5 18.4 8.6 16 10Z" />
              <V d="M16 9.4V6" />
            </g>
          ))}
          <circle cx="16" cy="10" r="1.9" fill="#f2c230" style={INK} />
          <Dots p={[[13.6, 6.2], [19.9, 8.2], [11.8, 11.6], [20.5, 12.9], [11.6, 22.3], [20, 17.4]]} r={0.35} />
        </g>
      );
    case "bird":
      return (
        <g>
          <S c="#5d97c8" d="M8.5 18.5L2.8 15.5L4.6 19.4L3 22.6L8.8 21.2Z" />
          <S c="#86b9df" d="M8 19.5C7.5 14 11.5 10.5 16.5 10.5C20.5 10.5 23.8 13 24 16.5C24.2 21 20.5 24 15.5 24C12 24 9 22.5 8 19.5Z" />
          <path d="M9.8 21.2C13 22.8 18.3 23 22.7 20.2C21.3 22.8 18.6 24 15.5 24C13 24 11 23 9.8 21.2Z" fill="#e6f0f6" />
          <S c="#f2a83b" d="M23.8 15.1L27.6 16.3L23.9 17.6Z" />
          <S c="#5d97c8" d="M10.3 15.3C13 13.2 17.6 13.8 19.2 16.8C16.6 19.6 12.4 19.5 10.3 15.3Z" />
          <V d="M12.6 16.6C14 16.2 15.4 16.4 16.6 17.2M13.4 15.1C14.6 14.9 15.9 15.2 17 15.9" />
          <circle cx="21" cy="14.4" r="0.75" style={{ fill: "var(--sm-ink)" }} />
          <Dots p={[[14, 12.3], [17.5, 12], [20.5, 18.7], [11, 18.8], [18.7, 20.7]]} />
        </g>
      );
    case "tulip":
      return (
        <g>
          <V d="M16 16V31" w={0.9} />
          <S c="#7fae4a" d="M16 30.5C11 29.5 8.5 24.5 9.5 19C12.5 21.5 15 25 16 30.5Z" />
          <V d="M15.8 30C13 26.5 11 22.5 9.7 19.3" />
          <S c="#e55a6a" d="M10.5 6.5C10 12 12 16 16 16C20 16 22 12 21.5 6.5L18.8 9L16 5L13.2 9Z" />
          <V d="M13.2 9C13.5 12 14.5 14.5 16 16M18.8 9C18.5 12 17.5 14.5 16 16" />
          <Dots p={[[12.2, 10.2], [19.8, 10.6], [16, 8.8], [13.3, 13.8], [18.8, 13.6], [11.6, 23.4]]} />
        </g>
      );
    case "butterfly":
      return (
        <g>
          <S c="#f2a83b" d="M15.5 14C13 7 7 4.5 4.5 7C2.5 9.5 4.5 14.5 9 15.5C11.5 16 13.5 15.2 15.5 14Z" />
          <S c="#f2a83b" d="M16.5 14C19 7 25 4.5 27.5 7C29.5 9.5 27.5 14.5 23 15.5C20.5 16 18.5 15.2 16.5 14Z" />
          <S c="#e9783a" d="M15.5 15.5C12 16 8 18 8 21.5C8 24 10.5 25 12.5 23.5C14.5 22 15.5 19 15.5 15.5Z" />
          <S c="#e9783a" d="M16.5 15.5C20 16 24 18 24 21.5C24 24 21.5 25 19.5 23.5C17.5 22 16.5 19 16.5 15.5Z" />
          <V d="M15.3 14C12 11 9 9.5 6 8.5M15.3 14C12 13 9.5 13 7 13.5M16.7 14C20 11 23 9.5 26 8.5M16.7 14C20 13 22.5 13 25 13.5M15.2 16C13 18 11.5 20 10.2 22.5M16.8 16C19 18 20.5 20 21.8 22.5" />
          <ellipse cx="16" cy="16" rx="1.1" ry="6" fill="#7b4a2c" style={INK} />
          <V d="M15.6 10.5C15 8 13.5 6.5 12.5 6M16.4 10.5C17 8 18.5 6.5 19.5 6" />
          <circle cx="12.4" cy="5.9" r="0.6" style={{ fill: "var(--sm-ink)" }} />
          <circle cx="19.6" cy="5.9" r="0.6" style={{ fill: "var(--sm-ink)" }} />
          <Dots p={[[5.6, 8.6], [4.9, 11], [26.4, 8.6], [27.1, 11], [9.6, 22.3], [22.4, 22.3], [8.6, 14.4], [23.4, 14.4]]} r={0.55} />
        </g>
      );
    case "tree":
      return (
        <g>
          <S c="#a8703f" d="M14.5 31L15 22L12 19L13 18.5L15.3 20.5L15.5 17H16.8L17 20L19.5 17.5L20.3 18.3L17.3 22L17.8 31Z" />
          <S c="#7fae4a" d="M8.5 20C5 20 3.5 17 4.5 14.5C5 12.5 6.5 11.5 8 11.5C8 8 10.5 5.5 13.5 5.5C15 3.5 18.5 3.3 20.5 5.2C23.5 4.8 26 7 26 10C28.5 11 29 14 28 16.5C27 19 25 20 23 20Z" />
          <V d="M9.5 15C10.5 13.5 12.2 13 13.8 13.6M17.5 9.5C19 8.4 20.8 8.6 22 9.8M19.5 16C21 15 22.8 15.2 24 16.2M12 8.8C12.6 8 13.5 7.6 14.4 7.6" />
          <V d="M16 26V29M16.2 23.5C16.5 24.5 16.5 25.2 16.3 25.8" />
          <Dots p={[[7, 15.5], [11, 10.5], [15.5, 11.5], [21, 6.8], [24.5, 12], [26.5, 15], [14, 17], [18, 18], [10.5, 18.3]]} />
        </g>
      );
    case "sun":
      return (
        <g>
          {RAYS.map((a, i) => (
            <path key={a} d={i % 2 ? "M14.7 9.2L16 5.2L17.3 9.2Z" : "M14.4 8.6L16 3.4L17.6 8.6Z"} fill="#f2a83b" style={INK} transform={`rotate(${a} 16 16)`} />
          ))}
          <circle cx="16" cy="16" r="6.4" fill="#f6c638" style={INK} />
          <V d="M12.3 13.3C13 11.8 14.4 10.9 16 10.8" w={0.8} c="#fff" />
          <Dots p={[[18.5, 14], [13.6, 18.2], [17.6, 19.4], [19.8, 17.2], [14.8, 15.3]]} />
        </g>
      );
    case "sailboat":
      return (
        <g>
          <V d="M16 23.5V3.5" w={0.9} />
          <S c="#e0613a" d="M16 3.5L19.6 4.6L16 5.7Z" />
          <S c="#fbf1dc" d="M17 5.5C21.5 9.5 24.5 15 25.5 21.5H17Z" />
          <V d="M17 11L22.6 12.2M17 16.5L24.4 17.3" />
          <S c="#e0613a" d="M15 8C12 11.5 9 16 7.5 21.5H15Z" />
          <V d="M15 13L11 15.5M15 17.5L9.3 19.2" />
          <S c="#b9774a" d="M4.5 23.5H27.5L24 28.5H8Z" />
          <V d="M6.3 26H25.7" />
          <V d="M3 30.3C5 29.3 6.5 29.3 8.5 30.3S12 31.3 14 30.3S18 29.3 20 30.3S24 31.3 26 30.3S29 29.3 30 30.3" w={0.9} c="#5aa0d0" />
          <Dots p={[[20.5, 9.5], [22, 15], [19.5, 19.5], [12.6, 14], [11.3, 19.6], [10, 25], [21, 27]]} />
        </g>
      );
    case "kite":
      return (
        <g>
          <S c="#e0613a" d="M16 2L8 10H16Z" />
          <S c="#f2c230" d="M16 2L24 10H16Z" />
          <S c="#f2c230" d="M8 10L16 21V10Z" />
          <S c="#e0613a" d="M24 10L16 21V10Z" />
          <V d="M16 21C14 24 18 25.5 16 28.5C15 30 15.5 31 16.5 31.5" w={0.7} />
          <S c="#5aa0d0" d="M13.8 23.4L15.4 24.4L13.8 25.4ZM17 23.4L15.4 24.4L17 25.4Z" />
          <S c="#5aa0d0" d="M15.3 27.2L16.9 28.2L15.3 29.2ZM18.5 27.2L16.9 28.2L18.5 29.2Z" />
          <Dots p={[[13, 7.5], [19, 7.5], [12.5, 13], [19.5, 13], [14.5, 4.8], [17.8, 16.8]]} />
        </g>
      );
    case "leaf":
      return (
        <g>
          <g transform="rotate(18 16 16) translate(16 16) scale(.88) translate(-16 -16)">
            <V d="M16 19L16 26C16 28 15.3 29.5 14 30.5" w={1} />
            <S c="#d9532a" d="M16 2.5L17.8 6.5L20 5.6L19.5 10.5L23 7.5L23.6 9.6L27.5 8.8L26.2 12.8L28 13.6L23.5 17.6L24.4 19.8L19 19.3L18.6 21.4L16.6 19.6H15.4L13.4 21.4L13 19.3L7.6 19.8L8.5 17.6L4 13.6L5.8 12.8L4.5 8.8L8.4 9.6L9 7.5L12.5 10.5L12 5.6L14.2 6.5Z" />
            <V d="M16 19.4V4.5M16 17.5L25.5 10.5M16 17.5L6.5 10.5M16 18.6L22.2 18.2M16 18.6L9.8 18.2M21 13.8L21.6 9.6M11 13.8L10.4 9.6" />
            <Dots p={[[14, 9], [18, 12], [13.8, 14.6], [22.8, 12.2], [9.2, 12.2], [24.8, 15.4], [7.2, 15.4], [18.4, 6.8]]} />
          </g>
        </g>
      );
    case "pumpkin":
      return (
        <g>
          <S c="#ec8a2c" d="M16 10C10 8.5 3.5 11.5 3.5 19C3.5 26 9 29.5 16 29C23 29.5 28.5 26 28.5 19C28.5 11.5 22 8.5 16 10Z" />
          <S c="#f3a043" d="M16 10C12 11.5 11 16 11 19.5C11 24 12.5 27.5 16 29C19.5 27.5 21 24 21 19.5C21 16 20 11.5 16 10Z" />
          <V d="M9.5 11.5C6.5 15 6.5 24 9.5 28M22.5 11.5C25.5 15 25.5 24 22.5 28" />
          <S c="#8d6a3a" d="M15 10.5C15 8 15.3 6 14.5 4L17 3.6C17.8 6 17.5 8 17.2 10.5Z" />
          <S c="#7fae4a" d="M17.4 7.5C19 5 22 4.5 24 5.5C22.5 8 19.5 8.5 17.4 7.5Z" />
          <V d="M17.8 7.3C19.6 6.7 21.4 6.1 23.4 5.7" />
          <V d="M14.8 8C12.5 7.5 11.5 5.5 12.8 4.5C14 3.8 14.5 5.5 13.5 6" />
          <Dots p={[[6, 17], [7.5, 23.5], [13.5, 15], [17.5, 21.5], [14.5, 25.2], [25.5, 17.5], [24, 23.8], [18.6, 14]]} />
        </g>
      );
    case "acorn":
      return (
        <g transform="rotate(-16 16 16)">
          <V d="M16 6C16 4.5 16.8 3 18.5 2.5" w={1.1} />
          <S c="#e0a04a" d="M8 14.6C8 21 11.5 26 16 28C20.5 26 24 21 24 14.6Z" />
          <V d="M16 28V29.6" w={0.9} />
          <V d="M11 17C11.5 20.5 13 23 15 24.5" w={0.9} c="#fff" />
          <S c="#9b6a3c" d="M6 13C6 8.5 10.5 6 16 6C21.5 6 26 8.5 26 13C26 14.2 25 14.6 24 14.6H8C7 14.6 6 14.2 6 13Z" />
          <V d="M8.5 10.5Q10 12 11.5 10.5Q13 12 14.5 10.5Q16 12 17.5 10.5Q19 12 20.5 10.5Q22 12 23.5 10.5M7.5 13Q9 14.4 10.5 13Q12 14.4 13.5 13Q15 14.4 16.5 13Q18 14.4 19.5 13Q21 14.4 22.5 13Q24 14.4 25 13M11 8.3Q12.3 9.5 13.6 8.3Q15 9.5 16.4 8.3Q17.7 9.5 19 8.3Q20.3 9.5 21.2 8.5" />
          <Dots p={[[18.5, 18], [20.5, 16.5], [17, 22], [19.5, 21], [13.5, 17.2]]} />
        </g>
      );
    case "mushroom":
      return (
        <g>
          <S c="#f3e6c8" d="M12 19.8C11.5 23.5 11 27 10.5 30H21.5C21 27 20.5 23.5 20 19.8Z" />
          <V d="M14 22C13.8 25 13.6 27 13.5 29M18.2 22.5C18.4 24.5 18.6 26 18.7 27.5" />
          <S c="#d24a2c" d="M3.5 18C3.5 10.5 9 5.5 16 5.5C23 5.5 28.5 10.5 28.5 18C28.5 19.3 27.5 19.8 26 19.8H6C4.5 19.8 3.5 19.3 3.5 18Z" />
          <ellipse cx="10" cy="12" rx="2.2" ry="1.8" fill="#fbf3e0" style={{ ...INK, strokeWidth: 0.55 }} />
          <ellipse cx="17" cy="9" rx="1.8" ry="1.4" fill="#fbf3e0" style={{ ...INK, strokeWidth: 0.55 }} />
          <ellipse cx="22.5" cy="13.5" rx="2" ry="1.6" fill="#fbf3e0" style={{ ...INK, strokeWidth: 0.55 }} />
          <ellipse cx="14.5" cy="15.5" rx="1.3" ry="1.1" fill="#fbf3e0" style={{ ...INK, strokeWidth: 0.55 }} />
          <ellipse cx="6.8" cy="16.6" rx="1" ry="0.8" fill="#fbf3e0" style={{ ...INK, strokeWidth: 0.55 }} />
          <V d="M7 30.5C7.5 28.5 8 27.5 9 27M9 30.5C9 28.8 9.2 28 10 27.5M23 30.5C23 28.5 22.5 27.5 21.8 27M25 30.5C25 28.5 25.5 27.8 26.5 27" w={0.9} c="#6f8a35" />
          <V d="M5 30.5H27" w={0.7} />
          <Dots p={[[19.5, 16.5], [25.5, 16.8], [12.5, 8], [20.5, 7.5], [8.8, 15.5]]} />
        </g>
      );
    case "snowman":
      return (
        <g>
          <circle cx="16" cy="25" r="5.6" fill="#fdfdfb" style={INK} />
          <circle cx="16" cy="16.5" r="4.2" fill="#fdfdfb" style={INK} />
          <circle cx="16" cy="9.3" r="3.3" fill="#fdfdfb" style={INK} />
          <path fill="#dbe7f2" d="M19.96 21.04A5.6 5.6 0 0 1 18.8 29.85C21 27.5 21.3 23.8 19.96 21.04ZM18.97 13.53A4.2 4.2 0 0 1 18.1 20.14C19.7 18.5 20 15.8 18.97 13.53ZM18.33 6.97A3.3 3.3 0 0 1 17.65 12.16C18.9 10.9 19.1 8.8 18.33 6.97Z" />
          <g fill="none" style={INK}><circle cx="16" cy="25" r="5.6" /><circle cx="16" cy="16.5" r="4.2" /><circle cx="16" cy="9.3" r="3.3" /></g>
          <V d="M12.1 15.5L6.6 12.5M8.4 13.5L7.6 11.3M19.9 15.5L25.4 12.5M23.6 13.5L24.4 11.3" w={0.9} c="#8d5a32" />
          <S c="#d9532a" d="M12.4 11.9C14.5 13.1 17.5 13.1 19.6 11.9L19.8 13.5C17.5 14.5 14.5 14.5 12.2 13.5Z" />
          <S c="#d9532a" d="M17.5 13.8L18.5 18L20.2 17.5L19.2 13.5Z" />
          <S c="#4a4a52" d="M13.3 6.6V2.2H18.7V6.6Z" />
          <V d="M13.3 5.3H18.7" w={0.9} c="#d9532a" />
          <V d="M11.8 6.6H20.2" w={1.2} />
          <S c="#ec8a2c" d="M16.3 9.4L20 10.3L16.3 10.9Z" />
          <g style={{ fill: "var(--sm-ink)" }}>
            <circle cx="15" cy="8.4" r="0.45" /><circle cx="17.4" cy="8.4" r="0.45" />
            <circle cx="16" cy="15.9" r="0.55" /><circle cx="16" cy="18.3" r="0.55" /><circle cx="16" cy="23.3" r="0.55" /><circle cx="16" cy="26" r="0.55" />
          </g>
          <V d="M5 30.6C9 29.5 23 29.5 27 30.6" w={0.6} />
        </g>
      );
    case "snowflake":
      return (
        <g>
          {ARMS.map((a) => (
            <g key={a} transform={`rotate(${a} 16 16)`}>
              <path d="M16 16V4.5M16 9L13.2 6.6M16 9L18.8 6.6M16 12.5L14 11M16 12.5L18 11" fill="none" style={{ ...INK, strokeWidth: 2.3 }} />
            </g>
          ))}
          {ARMS.map((a) => (
            <g key={a} transform={`rotate(${a} 16 16)`}>
              <path d="M16 16V4.5M16 9L13.2 6.6M16 9L18.8 6.6M16 12.5L14 11M16 12.5L18 11" fill="none" stroke="#bfdcf2" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
          <path d="M16 13L18.6 14.5V17.5L16 19L13.4 17.5V14.5Z" fill="#9cc4e6" style={INK} />
          <Dots p={[[16, 16]]} r={0.6} />
        </g>
      );
    case "pine":
      return (
        <g>
          <S c="#8d5a32" d="M14.6 24.5H17.4V30H14.6Z" />
          <S c="#4f7f4a" d="M16 12L26 25C24 24 22.5 25.5 20.5 24.5C18.5 25.5 17.5 24.3 16 25.2C14.5 24.3 13.5 25.5 11.5 24.5C9.5 25.5 8 24 6 25Z" />
          <S c="#5c8f52" d="M16 7L23.5 17.5C22 16.8 20.8 18 19.2 17.2C17.8 18 17 17.1 16 17.8C15 17.1 14.2 18 12.8 17.2C11.2 18 10 16.8 8.5 17.5Z" />
          <S c="#6a9e5c" d="M16 2.5L21 10.2C19.8 9.7 18.8 10.6 17.6 10C16.8 10.6 16.4 10 16 10.4C15.6 10 15.2 10.6 14.4 10C13.2 10.6 12.2 9.7 11 10.2Z" />
          <S c="#fdfdfb" d="M16 2.5L18 5.6C17.1 5.1 16.6 6 16 5.4C15.4 6 14.9 5.1 14 5.6Z" />
          <V d="M11.5 22L14.3 20M20.5 22L17.7 20M12.6 15.5L14.6 14.2M19.4 15.5L17.4 14.2" />
          <Dots p={[[10, 22.8], [14.6, 22.8], [18.6, 21.8], [22.4, 22.9], [12.4, 16], [16, 15.6], [19.8, 16.2], [14.6, 8.6], [17.6, 9]]} r={0.5} />
          <V d="M6 30.5C10 29.3 22 29.3 26 30.5" w={0.7} />
        </g>
      );
    case "star":
      return (
        <g>
          <S c="#f6c638" d="M16 3.5L19.4 10.6L27.2 11.6L21.5 17L23 24.8L16 21L9 24.8L10.5 17L4.8 11.6L12.6 10.6Z" />
          <V d="M16 15.4L16 3.9M16 15.4L26.6 11.8M16 15.4L22.7 24.3M16 15.4L9.3 24.3M16 15.4L5.4 11.8" w={0.45} />
          <S c="#f6c638" d="M27 22.5L27.6 23.9L29 24.5L27.6 25.1L27 26.5L26.4 25.1L25 24.5L26.4 23.9Z" />
          <S c="#f6c638" d="M5 23.8L5.45 24.85L6.5 25.3L5.45 25.75L5 26.8L4.55 25.75L3.5 25.3L4.55 24.85Z" />
          <Dots p={[[14, 9.5], [18.2, 12.8], [12, 13.4], [20.5, 14.4], [14.3, 18.5], [18.5, 19.5], [16, 7]]} />
        </g>
      );
    default:
      return null;
  }
}

/** One whimsical accent, drawn in its own colours. */
export function SeasonAccent({ season, name, size = 34 }: { season: Season; name?: string; size?: number }) {
  return (
    <svg className={`season-mark s-${season}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <Drawing name={name ?? ACCENTS[season][0].name} />
    </svg>
  );
}

export interface SeasonBand { key: string; season: Season; left: string; width: string }

/** A number from 0 to 1 fixed by the text, so the scatter is the same on the server and in the browser. */
function rand(text: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * A few accents per lane, in the wash below the month labels. Each run of a season gets one with probability `share`
 * (0.3 by default, a third of the one-per-run there once was), and its accent, its place across the run and, for a
 * floating one, its height are drawn at random. The draw is seeded by `seed`, the lane and the run, so it doesn't
 * change between renders. Meant to be hardly noticed.
 */
export function SeasonAccents({ bands, lane = 0, seed = "", share = 0.3 }: { bands: SeasonBand[]; lane?: number; seed?: string; share?: number }) {
  const runs: SeasonBand[][] = [];
  bands.forEach((b) => {
    const last = runs[runs.length - 1];
    if (last && last[0].season === b.season) last.push(b); else runs.push([b]);
  });
  return (
    <span className="sscat" aria-hidden="true">
      {runs.map((run) => {
        const r = rand(`${seed}|${lane}|${run[0].key}`);
        if (r() >= share) return null;
        const at = run[Math.floor(r() * run.length)];
        const a = ACCENTS[at.season][Math.floor(r() * 4)];
        const frac = 0.15 + r() * 0.7;
        const top = `${Math.round(4 + r() * 26)}%`;
        return (
          <span key={run[0].key} className={`sscat-at s-${at.season}${a.ground ? " is-ground" : ""}`} style={{ left: `calc(${at.left} + ${at.width} * ${frac})`, ...(a.ground ? {} : { top }) }}>
            <SeasonAccent season={at.season} name={a.name} />
          </span>
        );
      })}
    </span>
  );
}

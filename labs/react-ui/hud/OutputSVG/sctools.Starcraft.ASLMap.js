import React from "react"

const Component = (props) => {
  const p = { ...props }

  const style = [
    { fill: "#1C1C1C" }, //0
    { fill: "" }, //1
    { fill: "#3F3F3F" }, //2
    { fill: "none", stroke: "#3F3F3F", strokeWidth: 2, strokeMiterlimit: 10 }, //3
    { stroke: "#3F3F3F", strokeWidth: 3, strokeMiterlimit: 10 }, //4
    { fill: "#FFFFFF" }, //5
    { fontFamily: "Arial-BoldMT" }, //6
    { fontSize: 12 }, //7
    { fontFamily: "Arial-Black" }, //8
    { fontSize: 16 }, //9
    { fontSize: 13 }, //10
    { fill: "#FFFFFF", fontFamily: "Arial-BoldMT", fontSize: 12 }, //d11 -> 5 6 7
    { fill: "#FFFFFF", fontFamily: "Arial-BoldMT", fontSize: 16 }, //d12 -> 5 8 9,
    { fill: "#FFFFFF", fontFamily: "Arial-BoldMT", fontSize: 13 }, //d12 -> 5 8 10,
  ]

  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 346.5 115"
      style={{ enableBackground: "new 0 0 346.5 115" }}
      xmlSpace="preserve"
      width="100%"
    >
      <rect x="2" y="2" style={style[0]} width="342.5" height="111" />
      <rect x="2" y="2" style={style[1]} width="342.5" height="111" />
      <g>
        <path
          style={style[2]}
          d="M346.5,115H0V0h346.5V115z M4,111h338.5V4H4V111z"
        />
      </g>
      <line style={style[3]} x1="344.5" y1="44.5" x2="2" y2="44.5" />
      <line style={style[3]} x1="173.3" y1="78.8" x2="173.3" y2="44.5" />
      <polygon
        style={style[4]}
        points="244,78.8 175.9,78.8 102.5,78.8 79.9,113.4 175.9,113.4 266.6,113.4 "
      />
      <text transform="matrix(1 0 0 1 21.1758 30.5208)" style={style[11]}>
        {p["map.name"]}
      </text>
      <text transform="matrix(1 0 0 1 145.6953 100.5146)" style={style[12]}>
        {p["player1.points"]}:{p["player2.points"]}
      </text>
      <text transform="matrix(1 0 0 1 21.1758 100.5146)" style={style[12]}>
        {p["player1.race"]}
      </text>
      <text transform="matrix(1 0 0 1 292.426 100.5146)" style={style[12]}>
        {p["player2.race"]}
      </text>
      <text transform="matrix(1 0 0 1 21.1758 65.5208)" style={style[13]}>
        {p["player1.name"]}
      </text>
      <text transform="matrix(1 0 0 1 183.7241 65.5208)" style={style[13]}>
        {p["player2.name"]}
      </text>
    </svg>
  )
}

Component.defaultProps = {
  "player1.name": "Flash",
  "player1.race": "T4",
  "player1.points": "0",
  "player2.name": "Jaedong",
  "player2.race": "Z10",
  "player2.points": "0",
  "map.name": "Fighting Spirit",
}

export default Component

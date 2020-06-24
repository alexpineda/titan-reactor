import React from "react"
import Color from "color"

function TwitchVs(props) {
  const p = { ...props }
  let { onElementClick } = props
  const baseColor = Color(p["style.baseColor"])
  const colors = {
    baseColor,
    baseColorA: baseColor.darken(0.7).hex(),
    baseColorB: baseColor.darken(0.1).hex(),
    baseColorC: baseColor.darken(0.4).rotate(10).hex(),
    textColor: p["style.textColor"],
  }

  const styles = [
    { display: "none" }, //  0
    { fill: colors.baseColorA, clipPath: "url(#SVGID_2_)" }, //  1
    { fill: colors.baseColorB, clipPath: "url(#SVGID_2_)" }, //  2
    { opacity: 0.6, clipPath: "url(#SVGID_2_)", fill: "url(#SVGID_3_)" }, //  3
    { clipPath: "url(#SVGID_2_)" }, //  4
    { fill: "none" }, //  5
    { fill: "#FFFFFF" }, //  6
    {}, //  7
    { fontSize: "25px" }, //  8
    { clipPath: "url(#SVGID_5_)", fill: colors.baseColorA }, //  9
    { clipPath: "url(#SVGID_5_)", fill: colors.baseColorB }, // 10
    { opacity: 0.6, clipPath: "url(#SVGID_5_)", fill: "url(#SVGID_6_)" }, // 11
    { clipPath: "url(#SVGID_5_)" }, // 12
    //678
    {
      fill: colors.textColor,
      fontSize: "25px",
      cursor: onElementClick ? "pointer" : "inherit",
    }, //13
  ]

  onElementClick = onElementClick || function () {}

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 301.7 64.8"
      style={{ enableBackground: "new 0 0 301.7 64.8" }}
      xmlSpace="preserve"
      width="100%"
    >
      <g id="Layer_1">
        <g>
          <clipPath id="SVGID_2_">
            <rect
              y="35.3"
              width="301.7"
              height="29.5"
              style={{ overflow: "visible" }}
            />
          </clipPath>
          <rect
            x="29.5"
            y="35.3"
            style={styles[1]}
            width="272.2"
            height="29.5"
          />
          <rect y="35.3" style={styles[2]} width="29.5" height="29.5" />

          <linearGradient
            id="SVGID_3_"
            gradientUnits="userSpaceOnUse"
            x1="66.6768"
            y1="38.4191"
            x2="-66.928"
            y2="38.4191"
            gradientTransform="matrix(1 0 0 1 170.3333 11.5809)"
          >
            <stop offset="0" style={{ stopColor: colors.baseColorC }} />
            <stop
              offset="1"
              style={{ stopColor: colors.baseColorC, stopOpacity: "0" }}
            />
          </linearGradient>
          <rect x="29" y="35.3" style={styles[3]} width="272.7" height="29.5" />
          <g style={styles[4]}>
            <text
              transform="matrix(1 0 0 1 11.7899 58.167)"
              style={styles[13]}
              onClick={(e) => onElementClick("player2.points")}
            >
              {p["player2.points"]}
            </text>
          </g>
          <g style={styles[4]}>
            <text
              transform="matrix(1 0 0 1 38.8319 58.167)"
              style={styles[13]}
              onClick={(e) => onElementClick("player2.race")}
            >
              {p["player2.race"]}
            </text>
          </g>
          <g style={styles[4]}>
            <text
              transform="matrix(1 0 0 1 90.6668 58.1667)"
              style={styles[13]}
              onClick={(e) => onElementClick("player2.name")}
            >
              {p["player2.name"]}
            </text>
          </g>
        </g>
        <g id="_x31_">
          <defs></defs>
          <clipPath id="SVGID_5_">
            <rect width="301.7" height="29.5" style={{ overflow: "visible" }} />
          </clipPath>
          <rect x="29.5" style={styles[9]} width="272.2" height="29.5" />
          <rect style={styles[10]} width="29.5" height="29.5" />

          <linearGradient
            id="SVGID_6_"
            gradientUnits="userSpaceOnUse"
            x1="66.6768"
            y1="3.1691"
            x2="-66.928"
            y2="3.1691"
            gradientTransform="matrix(1 0 0 1 170.3333 11.5809)"
          >
            <stop offset="0" style={{ stopColor: colors.baseColorC }} />
            <stop
              offset="1"
              style={{ stopColor: colors.baseColorC, stopOpacity: "0" }}
            />
          </linearGradient>
          <rect x="29" style={styles[11]} width="272.7" height="29.5" />
          <g style={styles[12]}>
            <text
              transform="matrix(1 0 0 1 11.5438 22.917)"
              style={styles[13]}
              onClick={(e) => onElementClick("player1.points")}
            >
              {p["player1.points"]}
            </text>
          </g>
          <g style={styles[12]}>
            <text
              transform="matrix(1 0 0 1 38.3221 22.917)"
              style={styles[13]}
              onClick={(e) => onElementClick("player1.race")}
            >
              {p["player1.race"]}
            </text>
          </g>
          <g style={styles[12]}>
            <text
              transform="matrix(1 0 0 1 90.6668 22.9167)"
              style={styles[13]}
              onClick={(e) => onElementClick("player1.name")}
            >
              {p["player1.name"]}
            </text>
          </g>
        </g>
      </g>
    </svg>
  )
}

TwitchVs.defaultProps = {
  "player1.name": "Flash",
  "player1.race": "T",
  "player1.points": "0",

  "player2.name": "Jaedong",
  "player2.race": "Z",
  "player2.points": "0",

  "style.baseColor": "#e91e63",
  "style.textColor": "#FFFFFF",
}

// TwitchVs.formTypes = {
//   'player1.name': FormTypes.Text,
//   'player1.race': FormTypes.Text,
//   'player1.points': FormTypes.Text,

//   'player2.name': FormTypes.Text,
//   'player2.race': FormTypes.Text,
//   'player2.points': FormTypes.Text,

//   'style.baseColor': FormTypes.Color,
//   'style.textColor': FormTypes.Color
// };

export default TwitchVs

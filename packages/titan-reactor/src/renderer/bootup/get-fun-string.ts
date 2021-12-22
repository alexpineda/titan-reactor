
const funStrings = [
    "It's a zergling Lester.",
    "Drop your socks and grab your throttle.",
    "We shall win through, no matter the cost.",
    "I got your Zerg right here. hehehehe.",
    "Taking us into orbit.",
    "Do you seek knowledge of time travel?",
    "I see you have an appetite for destruction.",
    "I like your style, friend.",
    "Shields up, weapons online.",
    "You know who the best star fighter in the fleet is?",
];
export default () =>
    funStrings[Math.floor(Math.random() * funStrings.length)];
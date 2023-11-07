import discordLogo from "@image/assets/discord.png";
import youtubeLogo from "@image/assets/youtube.png";
import githubLogo from "@image/assets/github.png";
import patreonLogo from "@image/assets/patreon.png";
import paypalLogo from "@image/assets/paypal.png";
import { useState } from "react";

const iconStyle = {
    width: "var(--size-8)",
    height: "var(--size-8)",
    cursor: "pointer",
    filter: "grayscale(1)",
};

const IconLink = ( {
    href,
    style = {},
    imageUrl,
}: {
    href: string;
    style: React.CSSProperties;
    imageUrl: string;
} ) => {
    const [ isHovered, setIsHovered ] = useState( false );
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setIsHovered( true )}
            onMouseLeave={() => setIsHovered( false )}>
            <img
                src={imageUrl}
                style={{ ...iconStyle, ...style, opacity: isHovered ? "0.4" : "0.2" }}
            />
        </a>
    );
};

export const Socials = () => (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
        }}>
        <IconLink
            href="https://github.com/alexpineda/titan-reactor"
            imageUrl={githubLogo}
            style={{ filter: "grayscale(1) invert(1)" }}
        />
        <IconLink
            href="https://www.youtube.com/channel/UCj7TSQvBRYebRDIL0FW1MBQ"
            imageUrl={youtubeLogo}
            style={{ filter: "grayscale(1) invert(1) brightness(1.2)" }}
        />
        <IconLink
            href="https://discord.gg/MKb8E2DFMa"
            imageUrl={discordLogo}
            style={{ filter: "grayscale(1) contrast(2) invert(1) brightness(1.4)" }}
        />
        <IconLink
            href="https://patreon.com/imbateam"
            imageUrl={patreonLogo}
            style={{}}
        />
        <IconLink
            href="https://paypal.me/alexpineda86?country.x=CA&locale.x=en_US"
            imageUrl={paypalLogo}
            style={{ filter: "grayscale(1) contrast(2) invert(1) brightness(1.4)" }}
        />
    </div>
);

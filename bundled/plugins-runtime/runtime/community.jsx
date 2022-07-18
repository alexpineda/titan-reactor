import React, { useState, useEffect } from "react";
import { openUrl, useRSSItems, proxyFetch } from "titan-reactor";

const Repmastered = () => {
  const items = useRSSItems("https://repmastered.app/games-rss.xml");
  return (
    <div>
      <a href="https://repmastered.app">Visit Repmastered.app</a>
      <p onClick={() => openUrl("https://repmastered.app")}>
        Visit Repmastered.app
      </p>
      <ul>
        {items.map((item) => (
          <li>
            <a href="#" onClick={() => openUrl(item.link)}>
              {item.title}
            </a>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const StarcraftWorld = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await proxyFetch(
        "https://www.starcraftworld.net/index.php?action=league&mode=recentgames"
      );
      const text = await response.text();
      const html = new DOMParser().parseFromString(text, "text/html");
      const rows = html.querySelectorAll(".league_t tr:not(:first-child)");

      const items = [];
      rows.forEach((row) => {
        const item = {};
        let i = 0;
        for (const cell of row.children) {
          if (i === 0) {
            item.title = cell.textContent;
          } else if (i === 1) {
            item.title += cell.textContent;
          } else if (i === 2) {
            const href = cell.querySelector("a")?.attributes["href"]?.value;
            item.link = `https://www.starcraftworld.net${href}`;
          } else if (i === 3) {
            item.description = cell.textContent;
          }
          i++;
        }
        items.push(item);
      });
      setItems(items);
    })();
  }, []);

  return (
    <div>
      <p onClick={() => openUrl("https://www.starcraftworld.net")}>
        Visit StarCraftWorld.net
      </p>
      <ul>
        {items.map((item) => (
          <li>
            <a href="#" onClick={() => openUrl(item.link)}>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SSCAIT = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await proxyFetch(
        "https://sscaitournament.com/api/games.php?count=10&future=False&page=1"
      );
      const json = (await response.json()).map((res) => {
        return {
          title: `${res.host} vs ${res.guest}`,
          link: res.replay,
          description: res.map,
        };
      });
      setItems(json);
    })();
  }, []);

  return (
    <div>
      <p onClick={() => openUrl("https://sscaitournament.com/")}>
        Visit SSCAIT Tournament
      </p>
      <ul>
        {items.map((item) => (
          <li>
            <a href="#" onClick={() => openUrl(item.link)}>
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Community = () => {
  const [tab, selectTab] = useState("repmastered");
  const _s = (id) => () => selectTab(id);

  return (
    <>
      <p>Community</p>
      <ul>
        <li onClick={_s("repmastered")}>Repmastered.app - Recent Replays</li>
        <li onClick={_s("fastest")}>
          StarcraftWorld.com (Fastest Map League) - Recent Matches
        </li>
        {/* <li>BSL - Top Replays</li> */}
        <li onClick={_s("sscait")}>
          Student StarCraft AI Tournament (Bots) - Recent Matches
        </li>
      </ul>
      <div
        style={{
          maxHeight: "50vh",
          overflow: "scroll",
        }}
      >
        {tab === "repmastered" && <Repmastered />}
        {tab === "fastest" && <StarcraftWorld />}
        {tab === "sscait" && <SSCAIT />}
      </div>
    </>
  );
};

import React, { useState, useEffect } from "react";
import { registerComponent } from "titan-reactor";

const FeedItem = ({ item }) => {
  return (
    <tr>
      <td>{item.title}</td>
      <td>{item.description}</td>
      <td>{item.link}</td>
      <td>{item.date}</td>
    </tr>
  );
};
registerComponent(
  {
    pluginId: "_plugin_id_",
    screen: "@home/ready",
    snap: "center",
  },
  ({ config }) => {
    const [gamesFeed, setGamesFeed] = useState([]);

    const _loadFeed = async () => {
      const response = await fetch(config.url.value);
      const content = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/xml");

      const feed = [];
      for (const item of doc.querySelectorAll("item")) {
        feed.push({
          title: item.querySelector("title").textContent,
          link: item.querySelector("link").textContent,
          description: item.querySelector("description").textContent,
          date: item.querySelector("pubDate").textContent,
        });
      }

      setGamesFeed(feed);
    };

    useEffect(() => {
      _loadFeed();
    }, []);

    return (
      <table>
        {gamesFeed.map((item) => (
          <FeedItem item={item} />
        ))}
      </table>
    );
  }
);

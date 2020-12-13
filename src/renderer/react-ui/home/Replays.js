import React, { useEffect, useState } from "react";
import { getRssFeed } from "../../invoke";
import Tab from "../components/Tab";
import TabSelector from "../components/TabSelector";

const Tabs = {
  Local: "Local",
  // Pro: "Pro",
  Community: "Community",
};

export default ({ settings, lang }) => {
  const [tab, setTab] = useState(Tabs.Local);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeeds = async (feedUrls) => {
    const feeds = [];
    for (const url of feedUrls) {
      try {
        const feed = await getRssFeed(url);
        feeds.push(feed);
      } catch (e) {}
    }
    setFeeds(feeds);
    console.log(feeds);
    setLoading(false);
  };

  useEffect(() => {
    const feedUrls = settings.replaysRss.split("\n");
    if (feedUrls.length) {
      loadFeeds(feedUrls);
    }
  }, []);

  return (
    <>
      {" "}
      <ul className="mb-6 flex">
        <TabSelector
          activeTab={tab}
          tab={Tabs.Local}
          setTab={setTab}
          label={lang["LOCAL_REPLAYS"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Community}
          setTab={setTab}
          label={lang["COMMUNITY_REPLAYS"]}
        />
      </ul>
      <Tab tabName={Tabs.Local} activeTab={tab}>
        file/folder
      </Tab>
      <Tab tabName={Tabs.Community} activeTab={tab}>
        {feeds.map(({ title, description, link, items }) => {
          return (
            <div key={link}>
              <header>
                <div>
                  <a href={link} target="_blank">
                    {title}
                  </a>
                </div>
                <div>{description}</div>
              </header>

              <ul>
                {items.map(({ title, link, isoDate, content, guid }) => {
                  return (
                    <li key={guid}>
                      <div>
                        <a href={link} target="_blank">
                          {title}
                        </a>
                      </div>
                      <div>{content}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Tab>
    </>
  );
};

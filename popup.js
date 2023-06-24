const chromeTabs = await chrome.tabs.query({
  url: [
    "https://developer.chrome.com/docs/webstore/*",
    "https://developer.chrome.com/docs/extensions/*"
  ]
});
const tablelessTabs = await chrome.tabs.query({
  url: ["https://tableless.com.br/*"],
});

const tabs = [...chromeTabs, ...tablelessTabs];

const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split("-")[0].trim();
  const url = new URL(tab.url);
  const pathname = url.host.includes('chrome') ? url.pathname.slice("/docs".length) : url.pathname;

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector("ul").append(...elements);

const button = document.querySelector("button");
button.addEventListener("click", async () => {
  const byId = ({ id }) => id;
  const chromeTabIds = tabs
    .filter((tab) => tab.url.includes('chrome'))
    .map(byId);
  const tablelessTabIds = tabs
    .filter((tab) => tab.url.includes('tableless'))
    .map(byId);
  if (chromeTabIds.length) {
    const group1 = await chrome.tabs.group({ tabIds: chromeTabIds });
    await chrome.tabGroups.update(group1, { color: "pink", title: "EXTENSION DOCS" });
  }
  if (tablelessTabIds.length) {
    const group2 = await chrome.tabs.group({ tabIds: tablelessTabIds });
    await chrome.tabGroups.update(group2, { color: "red", title: "TABLELESS ROCKS" });
  }
})

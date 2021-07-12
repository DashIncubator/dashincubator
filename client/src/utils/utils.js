import { useEffect } from "react";

export default function useOutsideAlerter(ref, callback) {
  /**
   * Alert if clicked on outside of element
   */
  function handleClickOutside(event) {
    if (ref.current && !ref.current.contains(event.target)) {
      callback(false);
    }
  }

  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
}

export function truncate(source, size) {
  return source.length > size ? source.slice(0, size - 1) + "…" : source;
}

export const Breakpoints = {
  xs: 320,
  sm: 768,
  md: 1200,
  lg: 1600,
};

export const toolbarConfig = {
  display: [
    "BLOCK_TYPE_DROPDOWN",
    "INLINE_STYLE_BUTTONS",
    "BLOCK_TYPE_BUTTONS",
  ],
  INLINE_STYLE_BUTTONS: [
    {
      label: "Bold",
      style: "BOLD",
    },
    { label: "Italic", style: "ITALIC" },
    { label: "Underline", style: "UNDERLINE" },
    { label: "Strikethrough", style: "STRIKETHROUGH" },
  ],
  BLOCK_TYPE_DROPDOWN: [
    { label: "Normal", style: "unstyled" },
    { label: "Heading Large", style: "header-one" },
    { label: "Heading Medium", style: "header-two" },
    { label: "Heading Small", style: "header-three" },
  ],
  BLOCK_TYPE_BUTTONS: [
    { label: "UL", style: "unordered-list-item" },
    { label: "OL", style: "ordered-list-item" },
  ],
};

export const randomColor = () => {
  const colors = [
    "#94F1CA",
    "#AFB2FC",
    "#FCAFC6",
    "#EAF194",
    "#9DE6F5",
    "#D5D3D3",
  ];
  return colors[Math.floor(Math.random() * (5 - 0 + 1) + 0)];
};

export const bountyTags = [
  "Front-End",
  "Back-End",
  "Design",
  "Product",
  "Content",
];

export const bountyStatus = ["active", "paused", "completed"];

export const bountyTypes = ["project", "job", "service", "programme"];

export const taskTypes = ["spec", "production", "qa"];

export const conceptStatus = ["open"];

export const formatLink = (link) => {
  return link
    .replace("https://", "")
    .replace("http://", "")
    .replace("www.", "");
};

export const shorthandRelative = {
  future: "in %s",
  past: "%s ago",
  s: "seconds",
  ss: "%ss",
  m: "a minute",
  mm: "%dm",
  h: "an hour",
  hh: "%dh",
  d: "a day",
  dd: "%dd",
  M: "a month",
  MM: "%dM",
  y: "a year",
  yy: "%dY",
};

export const longhandRelative = {
  future: "in %s",
  past: "%s ago",
  s: "a few seconds",
  ss: "%d seconds",
  m: "a minute",
  mm: "%d minutes",
  h: "an hour",
  hh: "%d hours",
  d: "a day",
  dd: "%d days",
  w: "a week",
  ww: "%d weeks",
  M: "a month",
  MM: "%d months",
  y: "a year",
  yy: "%d years",
};

export const formatTask = (task, taskUser) =>
  task.status === "complete"
    ? "Complete"
    : !task.assignee
    ? task.requests?.find((user) => user.username === taskUser.username) !==
      undefined
      ? "Requested to reserve"
      : "Open"
    : task.assignee && task.status === "modify"
    ? "Changes requested"
    : task.assignee && task.status === "open"
    ? "In progress"
    : task.assignee && task.status === "pending"
    ? "Pending admin approval"
    : "Open";

export function usernameIsValid(username) {
  return /^[0-9a-zA-Z_.-]+$/.test(username);
}

export function isValidURL(string) {
  var res = string.match(
    //eslint-disable-next-line
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

export function cleanString(input) {
  var output = "";
  for (var i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127) {
      output += input.charAt(i);
    }
  }
  return output;
}

export function addHTTPS(url) {
  //eslint-disable-next-line
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "https://" + url;
  }
  return url;
}

export const getHighlightedText = (text, highlight) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span style={{ backgroundColor: "#eaf194" }}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};

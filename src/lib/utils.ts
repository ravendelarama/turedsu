import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge";


export const regex = {
  text: /((?:@|#|https?:\/\/)(?:\[)?[\w=?&.\/\-_:\s]+(?:\]\()?[\w=?&.\/:\-_]+(?:\))?)/g,
  url: /(https?:\/\/(?:[a-z0-9\-]+\.)?[a-z0-9\-]+\.[a-z0-9]{2,4}(?:\/[@!?&#_+=.a-z0-9\-]+)*(?:\?(?:[@!?&#_+=.a-zA-Z0-9]+=[@!?&#_+=.a-zA-Z0-9]+&?)+)?)/,
  username: /(?:@\[)([a-z0-9_]{3,})(?:\]\()([a-z0-9_]+)(?:\))/,
  tag: /(?:#\[)(\w+)(?:\]\()(\w+)(?:\))/,
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function tagExtractor(text?: string | null) {
  if (!text) {
    return null;
  }

  const markupRegex = /\s?(#\w+)/g;
  const textRegex = /\w+/g;

  const tagMarkups = text.match(markupRegex);

  const tags: {name: string}[] = [];

  if (!tagMarkups) {
    return null;
  }

  for (var i = 0; i < tagMarkups?.length; i++) {
    const result = tagMarkups[i].match(textRegex)?.flat(Infinity);

    if (result) {
      tags.push({ name: result[0] });
    }
  }

  return tags;
}


export function tagParser(text: string | null) {
  if (text) {
    const splitted = text?.split(/(#\w+)/g);
  
    const replaced = splitted.map((item) => {
      if (/(#\w+)/.test(item)) {
        const e = item.match(/\w+/)
        return `#[${e}](${e})`
      }
      return item
    }).join('');

    return replaced
  }
  return '';
}


export function tagFilter(text: string | null) {
  if (!text) {
    return null;
  }

  const regex = /(?:#\[)(\w+)(?:\]\()(\w+)(?:\))/g;
  const markup = text.match(regex);

  const filtered = markup?.map((item) => {
    if (item) {
      const res = item?.match(/(\w+)/g);
      if (res) {
        return res[0];
      }
    }
  });

  return filtered;
}
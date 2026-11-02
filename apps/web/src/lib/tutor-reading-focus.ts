import type { ReadingFocus } from "./tutor-retrieval";

export function readingFocus(selectedText: string): ReadingFocus {
  const candidates=[...document.querySelectorAll<HTMLElement>("main pre code")].map(element=>{
    const rect=element.getBoundingClientRect();
    const visible=Math.max(0,Math.min(rect.bottom,window.innerHeight)-Math.max(rect.top,0));
    return {text:element.textContent??"",score:rect.width>0?Math.min(visible,400):0};
  }).filter(item=>item.score>30).sort((a,b)=>b.score-a.score);
  const first=candidates[0];
  return {
    selectedText,
    visibleCode:first&&(!candidates[1]||first.score>candidates[1].score*1.5)?first.text:undefined,
  };
}

import { clipTokens } from "@physical-ai/shared";

export interface LessonDocument { id: string; title: string; content: string }
export interface ReadingFocus { selectedText?: string | undefined; visibleCode?: string | undefined }
interface Block { document: LessonDocument; title: string; content: string; start: number; code: number; language: string }
export interface RetrievedContext { text: string; state: "none" | "found" | "ambiguous" | "not_found" }
const normal = (text: string) => text.replace(/\s+/g, " ").trim();
const stop = new Set(["코드","번째","설명","설명해","설명해줘","설명해주세요","알려주세요","왜","필요한가요","무엇","이것","이거","지금","본문","강의","여기","어떻게","주세요","the","this","that","line","code"]);
function terms(question: string) {
  return [...new Set((question.toLowerCase().match(/[\p{L}_][\p{L}\p{N}_.-]*/gu) ?? []).map((word) => word.replace(/(?:에서는|에서|인가요|인가|은|는|을|를|의|이|가|에|과|와)$/u, "")).filter((word) => word.length > 1 && !stop.has(word)))];
}
function blocks(document: LessonDocument): Block[] {
  const lines = document.content.split("\n"), result: Block[] = [];
  let title = document.title, prose: string[] = [], start = 1, code = 0;
  const flush = () => { if (prose.join("\n").trim()) result.push({document,title,content:prose.join("\n"),start,code:0,language:""}); prose=[]; };
  for (let i=0;i<lines.length;i++) {
    const line=lines[i]!;
    const heading=/^#{1,6}\s+(.+)/.exec(line);
    if(heading){flush();title=heading[1]!.replace(/\s*\{[^}]+\}\s*$/," ").trim();}
    const fence=/^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if(fence){
      flush();const begin=i+2, body:string[]=[];const marker=fence[1]!;
      while(++i<lines.length){if(new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[i]!))break;body.push(lines[i]!);}
      result.push({document,title,content:body.join("\n"),start:begin,code:++code,language:fence[2]!.trim()});
    }else if(!line.trim()){flush();start=i+2;}
    else {if(!prose.length)start=i+1;prose.push(line);}
  }
  flush();return result;
}
export function requestedLine(question: string) {
  const numeric=/(\d+)\s*(?:번째\s*)?줄|(?:line\s*)(\d+)/i.exec(question);
  if(numeric)return Number(numeric[1]??numeric[2]);
  const words=["첫","두","세","네","다섯","여섯","일곱","여덟","아홉","열"];
  for(let i=0;i<words.length;i++)if(new RegExp(`${words[i]}\\s*번째\\s*줄`).test(question))return i+1;
  return undefined;
}
const label=(block:Block)=>`[출처: ${block.document.title} / ${block.title} / ${block.code?`코드 ${block.code}`:`본문 ${block.start}줄부터`}; 자료 ID: ${block.document.id}]`;
function codeExcerpt(block: Block, question: string) {
  const lines=block.content.split("\n"), target=requestedLine(question);
  if(target!==undefined&&(target<1||target>lines.length))return `${label(block)}\n이 코드는 ${lines.length}줄입니다. 요청한 ${target}번째 줄이 존재하지 않으므로 줄 번호를 확인해야 합니다.`;
  const full=lines.map((line,index)=>`${index+1}: ${line}`).join("\n");
  const center=target?target-1:Math.max(0,lines.findIndex(line=>terms(question).some(term=>line.toLowerCase().includes(term))));
  const numbered=full.length<2400?full:lines.slice(Math.max(0,center-4),center+7).map((line,index)=>`${Math.max(0,center-4)+index+1}: ${line.slice(0,1000)}`).join("\n");
  return `${label(block)}\nコード内の行番号は空行を含めて1から数えています。${target?`質問対象: ${target}行目。`:""}\n\`\`\`${block.language}\n${numbered}\n\`\`\``;
}
export function retrieveLessonContext(question:string, documents:LessonDocument[], focus:ReadingFocus={}):RetrievedContext {
  const all=documents.flatMap(blocks), codes=all.filter(block=>block.code), query=terms(question);
  const identifiers=[...question.matchAll(/\b[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+(?:\(\))?|\b[A-Za-z_]\w*(?=\s*\()/g)].map(match=>match[0].replace(/\(\)$/," ").trim().toLowerCase());
  if(identifiers.length&&!all.some(block=>identifiers.some(name=>block.content.toLowerCase().includes(name))))return {state:"not_found",text:"[자료 상태: 요청한 함수·식별자를 찾지 못함] 다른 예제의 동작으로 대체하지 말고 추가 조회 또는 코드 확인을 요청하세요."};
  const score=(block:Block)=>identifiers.filter(name=>block.content.toLowerCase().includes(name)).length*20+query.reduce((sum,term)=>sum+(block.content.toLowerCase().includes(term)?2:0)+(block.title.toLowerCase().includes(term)?3:0),0);
  const deicticCode=/이\s*코드|위\s*코드|아래\s*코드|해당\s*코드|본문.*코드|여기.*코드|this\s+code/i.test(question)||requestedLine(question)!==undefined;
  const codeQuestion=/코드|함수|명령어|스크립트|code|\bline\b/i.test(question)||requestedLine(question)!==undefined;
  const focusRelevant=deicticCode||/이\s*(?:내용|문장|부분|수식|개념|것)|이거|여기|선택|왜|어떻게/.test(question)||query.some(term=>(focus.selectedText??"").toLowerCase().includes(term));
  const selected=focusRelevant?normal(focus.selectedText??""):"";
  const codeMatches=selected?codes.filter(block=>normal(block.content).includes(selected)):[];
  const visible=normal(focus.visibleCode??"");
  const visibleMatches=visible?codes.filter(block=>normal(block.content)===visible):[];
  const explicitNumber=/(?:코드|예제)\s*(\d+)\s*번|(\d+)\s*번째\s*(?:코드|예제)/.exec(question);
  const ordinalCode=["첫","두","세","네","다섯"].findIndex(word=>new RegExp(`${word}\\s*번째\\s*(?:코드|예제)`).test(question));
  const codeNumber=explicitNumber?Number(explicitNumber[1]??explicitNumber[2]):ordinalCode>=0?ordinalCode+1:undefined;
  const numberedCodes=codeNumber===undefined?[]:codes.filter(block=>block.code===codeNumber);
  let target:Block|undefined;
  if(codeQuestion){
    if(numberedCodes.length===1)target=numberedCodes[0];
    else if(codeMatches.length===1)target=codeMatches[0];
    else if(visibleMatches.length===1&&(deicticCode||score(visibleMatches[0]!)>0))target=visibleMatches[0];
    else if(codes.length===1&&deicticCode)target=codes[0];
    else {
      const ranked=codes.map(block=>({block,score:score(block)})).sort((a,b)=>b.score-a.score);
      if(ranked[0]&&ranked[0].score>0&&ranked[0].score>(ranked[1]?.score??0))target=ranked[0].block;
    }
    if(!target&&codes.length>1&&deicticCode)return {state:"ambiguous",text:`[자료 상태: 지칭 대상 불명확]\n질문에 해당하는 코드가 여러 개입니다. 임의로 골라 답하지 말고 코드 선택 또는 제목을 확인해 주세요.\n${codes.slice(0,8).map(label).join("\n")}`};
    if(!target&&!codes.length&&deicticCode)return {state:"not_found",text:"[자료 상태: 현재 검색 범위에서 코드를 찾지 못함] 코드를 지어내지 마세요."};
  }
  const selectedBlocks=selected?all.filter(block=>normal(block.content).includes(selected)):[];
  const ranked=all.map(block=>({block,score:score(block)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score);
  const relevant=target?[target]:selectedBlocks.length?selectedBlocks.slice(0,2):ranked.slice(0,3).map(item=>item.block);
  if(!relevant.length)return {state:"none",text:""};
  const snippets=relevant.map(block=>{
    if(block.code)return codeExcerpt(block,question);
    const lower=block.content.toLowerCase();
    const positions=query.map(term=>lower.indexOf(term)).filter(index=>index>=0);
    const at=selected?normal(block.content).indexOf(selected):positions.length?Math.min(...positions):0;
    return `${label(block)}\n${block.content.slice(Math.max(0,at-200),Math.max(0,at-200)+1200)}`;
  });
  // Include the prose immediately around the target code, without sending the full lesson.
  if(target){const index=all.indexOf(target);for(const neighbor of [all[index-1],all[index+1]])if(neighbor&&!neighbor.code&&neighbor.document.id===target.document.id)snippets.push(`${label(neighbor)}\n${neighbor.content.slice(0,450)}`);}
  return {state:"found",text:clipTokens(snippets.join("\n\n").slice(0,4000),2_000)};
}

"""Record individually reviewed teaching visuals; no network/model invocation."""
import argparse, hashlib, html, json, re, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def esc(t): return html.escape(t,quote=True)
def svg(spec):
    import textwrap
    title=spec['title'];kind=spec.get('kind','flow');rows=spec['rows'];w=640
    def lines(t,n): return textwrap.wrap(t,n,break_long_words=True,break_on_hyphens=False) or ['']
    titlelines=lines(title,22);top=46+len(titlelines)*34
    heights=[65+len(lines(detail,23))*29+max(0,len(lines(label,21))-1)*29 for label,detail in rows]
    h=top+sum(heights)+30*(len(rows)-1)+42+(45 if kind=='loop' else 0)
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{esc(title)}</title><desc id="desc">{esc(spec["alt"])}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#52647b"/></marker></defs><rect width="640" height="{h}" rx="20" fill="#f4f7fb"/><g font-family="sans-serif" fill="#17283e">']
    for j,line in enumerate(titlelines):out+=[f'<text x="28" y="{42+j*34}" font-size="26" font-weight="700">{esc(line)}</text>']
    y=top
    for i,((label,detail),height) in enumerate(zip(rows,heights)):
        fill=['#e4efff','#e4f4ee','#fff1dc','#eeeafa'][i%4]
        out+=[f'<rect x="34" y="{y}" width="558" height="{height}" rx="12" fill="{fill}" stroke="#a5b6cc"/>']
        label_lines=lines(label,21)
        for j,line in enumerate(label_lines):out+=[f'<text x="52" y="{y+33+j*29}" font-size="24" font-weight="700">{esc(line)}</text>']
        for j,line in enumerate(lines(detail,23)):out+=[f'<text x="52" y="{y+35+len(label_lines)*29+j*29}" font-size="22">{esc(line)}</text>']
        y+=height
        if i<len(rows)-1 and kind!='compare':out+=[f'<path d="M314 {y+2}v24" stroke="#52647b" stroke-width="3" marker-end="url(#arrow)"/>']
        y+=30
    if kind=='loop':out+=[f'<path d="M592 {y-75}h25V{top+43}h-22" fill="none" stroke="#52647b" stroke-width="3" marker-end="url(#arrow)"/><text x="34" y="{h-22}" font-size="20">새 관측을 다음 판단으로 되돌림</text>']
    return ''.join(out+['</g></svg>'])

def apply(plan):
    topic=plan['topic'];source=ROOT/f'ebook/curriculum/{topic[:3]}/{topic}.md';raw=source.read_text();before=sha(source)
    state=ROOT/'doc/visual-review/inventory.json';prior=json.loads(state.read_text())['units'][topic]
    existing=prior.get('assets',[]) if plan.get('append') else []
    images=plan.get('images',[]);assets=list(existing)
    for i,spec in enumerate(images,len(existing)):
        name=f'{topic}-{spec.get("name",str(i+1))}';ext=spec.get('extension','svg');dest=ROOT/f'apps/web/public/textbook-visuals/{name}.{ext}'
        if 'rows'in spec: dest.write_text(svg(spec))
        elif 'svg'in spec: dest.write_text(spec['svg'])
        else:
            original=ROOT/spec['source'];dest.write_bytes(original.read_bytes())
        assert dest.stat().st_size>0
        url=f'/textbook-visuals/{dest.name}'
        caption=spec['caption'];block=f'\n\n[![{spec["alt"]}]({url})]({url})\n\n*그림 {topic}-{i+1}. {caption}*\n'
        # Insert immediately after the specified paragraph/section, never in the solution.
        anchor=spec['after'];assert anchor in raw.split('\n## 실습')[0],(topic,anchor)
        raw=raw.replace(anchor,anchor+block,1)
        assets.append({'path':str(dest.relative_to(ROOT)),'sha256':sha(dest),'method':spec.get('method','original-svg'),'model':spec.get('model'), 'prompt':spec.get('prompt'), 'alt':spec['alt'],'caption':caption})
    source.write_text(raw)
    evidence=f'doc/visual-review/units/{topic}.md'
    note=f'# {topic} 본문 시각자료 검토\n\n- 검토: 2026-11-11, 작성자 자기검수\n- 판단: {plan["reason"]}\n- 조치: '+('그림 '+str(len(assets))+'개 제공.' if assets else '추가 이미지 없음.')+'\n- 원고 지문: `'+sha(source)+'`\n\n'
    for a in assets:note+=f'- [{Path(a["path"]).name}](../../../{a["path"]}): {a["caption"]} 제작: {a["method"]}'+(f' / {a["model"]}'if a['model']else'')+'.\n'
    note+='\n그림과 본문의 용어/방향/가정·대체 텍스트·파일 연결을 대조했다. 생성 장면은 실물/측정 결과가 아니다. 기존 목표·실습·해설의 계산/학습 범위는 유지한다.\n'
    (ROOT/evidence).write_text(note)
    for registry in sorted((ROOT/'doc/v2/inventory').glob('*-reviews.json')):
        d=json.loads(registry.read_text())
        if topic in d.get('topics',{}):
            d['topics'][topic]['sourceSha256']=sha(source)
            # Keep the original content review and add a link to this visual follow-up.
            old=ROOT/d['topics'][topic]['evidenceRef'];s=old.read_text();link=f'\n\n2026-11-11 시각자료 후속 검토: [{topic}](../../visual-review/units/{topic}.md). 현재 원고 지문은 단위별 후속 근거에 기록한다.\n'
            if link not in s:old.write_text(s+link)
            registry.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');break
    d=json.loads(state.read_text());d['units'][topic]={'status':'reviewed','source':str(source.relative_to(ROOT)),'sourceSha256':sha(source),'reason':plan['reason'],'assets':assets,'evidence':evidence};state.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    return topic
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('plan');p.add_argument('--topic');p.add_argument('--commit',action='store_true');a=p.parse_args();plans=json.loads(Path(a.plan).read_text());plans=plans if isinstance(plans,list)else[plans]
    for plan in plans:
        if a.topic and a.topic!=plan['topic']:continue
        topic=apply(plan)
        subprocess.run(['node','scripts/prepare-authored.mjs'],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
        subprocess.run(['node','scripts/check-visuals.mjs','--partial'],cwd=ROOT,check=True)
        if a.commit:
            subprocess.run(['git','add','ebook/curriculum','apps/web/public/textbook-visuals','doc/visual-review','doc/v2/inventory','doc/v2/work_items','packages/shared/src/authored-data.ts'],cwd=ROOT,check=True)
            subprocess.run(['git','commit','-m',f'docs({topic}): review and supply explanatory visuals'],cwd=ROOT,check=True)

"""Record individually reviewed teaching visuals; no network/model invocation."""
import argparse, hashlib, html, json, re, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def esc(t): return html.escape(t,quote=True)
def svg(spec):
    title=spec['title'];kind=spec.get('kind','flow');rows=spec['rows'];w=960
    # Vertical rows keep each label readable on narrow screens; fixed, bounded labels.
    h=126+len(rows)*112+(50 if kind=='loop' else 0)
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{esc(title)}</title><desc id="desc">{esc(spec["alt"])}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#52647b"/></marker></defs><rect width="960" height="{h}" rx="24" fill="#f4f7fb"/><g font-family="sans-serif" fill="#17283e"><text x="48" y="54" font-size="29" font-weight="700">{esc(title)}</text>']
    for i,row in enumerate(rows):
        label,detail=row
        assert len(label)<=37 and len(detail)<=55,(label,detail)
        y=86+i*112;fill=['#e4efff','#e4f4ee','#fff1dc','#eeeafa'][i%4]
        out += [f'<rect x="70" y="{y}" width="820" height="84" rx="14" fill="{fill}" stroke="#bdcbdc"/><text x="94" y="{y+33}" font-size="25" font-weight="700">{esc(label)}</text><text x="94" y="{y+63}" font-size="21">{esc(detail)}</text>']
        if i<len(rows)-1 and kind!='compare':out += [f'<path d="M480 {y+86}v22" stroke="#52647b" stroke-width="3" marker-end="url(#arrow)"/>']
    if kind=='loop':out += [f'<path d="M890 {y+44}h36V128h-32" fill="none" stroke="#52647b" stroke-width="3" marker-end="url(#arrow)"/><text x="94" y="{h-26}" font-size="21">결과의 새 관측을 다음 판단에 되돌린다</text>']
    out+=['</g></svg>'];return ''.join(out)
def apply(plan):
    topic=plan['topic'];source=ROOT/f'ebook/curriculum/{topic[:3]}/{topic}.md';raw=source.read_text();before=sha(source)
    images=plan.get('images',[]);assets=[]
    for i,spec in enumerate(images):
        name=f'{topic}-{spec.get("name",str(i+1))}';ext=spec.get('extension','svg');dest=ROOT/f'apps/web/public/textbook-visuals/{name}.{ext}'
        if 'rows'in spec: dest.write_text(svg(spec))
        elif 'svg'in spec: dest.write_text(spec['svg'])
        else:
            original=ROOT/spec['source'];dest.write_bytes(original.read_bytes())
        assert dest.stat().st_size>0
        url=f'/textbook-visuals/{dest.name}'
        caption=spec['caption'];block=f'\n\n![{spec["alt"]}]({url})\n\n*그림 {topic}-{i+1}. {caption}*\n'
        # Insert immediately after the specified paragraph/section, never in the solution.
        anchor=spec['after'];assert anchor in raw.split('\n## 실습')[0],(topic,anchor)
        raw=raw.replace(anchor,anchor+block,1)
        assets.append({'path':str(dest.relative_to(ROOT)),'sha256':sha(dest),'method':spec.get('method','original-svg'),'model':spec.get('model'), 'prompt':spec.get('prompt'), 'alt':spec['alt'],'caption':caption})
    source.write_text(raw)
    evidence=f'doc/visual-review/units/{topic}.md'
    note=f'# {topic} 본문 시각자료 검토\n\n- 검토: 2026-11-11, 작성자 자기검수\n- 판단: {plan["reason"]}\n- 조치: '+('그림 '+str(len(images))+'개 추가.' if images else '추가 이미지 없음.')+'\n- 원고 지문: `'+sha(source)+'`\n\n'
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
    state=ROOT/'doc/visual-review/inventory.json';d=json.loads(state.read_text());d['units'][topic]={'status':'reviewed','source':str(source.relative_to(ROOT)),'sourceSha256':sha(source),'reason':plan['reason'],'assets':assets,'evidence':evidence};state.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
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

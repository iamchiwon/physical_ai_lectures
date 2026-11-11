"""Create the original, code-drawn social card (Pillow + a Korean font)."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
p=argparse.ArgumentParser();p.add_argument('--font',default='/System/Library/Fonts/AppleSDGothicNeo.ttc');a=p.parse_args()
out=Path(__file__).resolve().parents[1]/'apps/web/public/social-card.png'
im=Image.new('RGB',(1200,630),'#eff6ff');d=ImageDraw.Draw(im)
for y in range(630):
 t=y/630;d.line((0,y,1200,y),fill=(int(245-20*t),int(249-12*t),255))
font=lambda n:ImageFont.truetype(a.font,n)
d.rounded_rectangle((68,61,155,148),radius=22,fill='#155eef');d.line([(91,124),(91,97),(111,82),(132,97),(132,124)],fill='white',width=7);d.ellipse((105,76,117,88),fill='#bfdbfe')
d.text((182,82),'PHYSICAL AI · 한국어 자습 과정',font=font(29),fill='#1d4ed8')
d.text((68,204),'피지컬 AI',font=font(92),fill='#142d52')
d.text((68,319),'로봇 제어와 학습을 잇는 한국어 교재',font=font(48),fill='#142d52')
d.text((72,430),'ROS 2  ·  시뮬레이션  ·  비전  ·  모방학습',font=font(29),fill='#435b7b')
d.line((70,510,1130,510),fill='#b9d2f8',width=2)
d.text((72,548),'본문 · 장비 없는 실습 · 확인 문제',font=font(28),fill='#1d4ed8')
im.save(out,optimize=True)
print(out)

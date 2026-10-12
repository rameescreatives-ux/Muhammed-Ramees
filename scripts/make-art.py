#!/usr/bin/env python3
"""Generates the original (copyright-free) illustrations used for banners and recipe cards.
Run: python3 scripts/make-art.py   -> writes SVGs to public/assets/img/art and public/assets/img/recipes
All art is drawn from code, so there are no third-party image rights involved."""
import math, random, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 'img')

def svg(w, h, body, defs=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid slice"><defs>{defs}</defs>{body}</svg>'
def lg(id, stops, x1=0, y1=0, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'
def rg(id, stops):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<radialGradient id="{id}">{s}</radialGradient>'
def write(folder, name, content):
    p = os.path.join(ROOT, folder, name); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(content)

# ---------------------------------------------------------------- flowers
def sunflower(cx, cy, r, rot=0):
    petals = ''.join(f'<ellipse cx="0" cy="{-r*1.0:.1f}" rx="{r*0.3:.1f}" ry="{r*0.62:.1f}" fill="{"#F6B81A" if i%2 else "#FFCC33"}" transform="rotate({i*360/16+rot:.1f})"/>' for i in range(16))
    return (f'<g transform="translate({cx:.1f},{cy:.1f})">{petals}<circle r="{r*0.62:.1f}" fill="#5B3A1E"/>'
            f'<circle r="{r*0.46:.1f}" fill="#3F2812"/><circle r="{r*0.2:.1f}" fill="#6B4423"/></g>')
def stalk(x, y1, y2, c='#4C7A2E', w=6):
    return f'<path d="M{x},{y1} C{x+10},{(y1+y2)/2} {x-10},{(y1+y2)/2} {x},{y2}" stroke="{c}" stroke-width="{w}" fill="none" stroke-linecap="round"/>'
def leaf(x, y, s, rot, c='#5E9A36'):
    return f'<path d="M0,0 C{s*0.5},{-s*0.5} {s},{-s*0.2} {s*1.2},0 C{s},{s*0.25} {s*0.5},{s*0.3} 0,0Z" fill="{c}" transform="translate({x:.1f},{y:.1f}) rotate({rot})"/>'

def hills(y, color, amp=40, w=1600, h=700, seed=1, n=3):
    random.seed(seed); pts = f'M0,{h} L0,{y}'
    for i in range(0, w + 100, 100):
        pts += f' L{i},{y + math.sin(i / 220 + seed) * amp:.1f}'
    return f'<path d="{pts} L{w},{h}Z" fill="{color}"/>'

def scene_sunflower():
    random.seed(4); b = '<rect width="1600" height="700" fill="url(#sky)"/><circle cx="1280" cy="170" r="110" fill="#FFE9A8" opacity=".8"/><circle cx="1280" cy="170" r="70" fill="#FFF3CC"/>'
    b += hills(430, '#8DBF5A', 30, seed=1) + hills(500, '#6FA244', 26, seed=2)
    for row, (y, rmin, rmax, n) in enumerate([(470, 26, 34, 14), (540, 40, 52, 11), (630, 62, 80, 8)]):
        for i in range(n):
            x = (i + random.random() * .6) * (1600 / n) + 30; r = random.uniform(rmin, rmax)
            b += stalk(x, y + r, 720, w=max(4, r / 7)) + leaf(x, y + r * 2.2, r * 1.1, -25 + random.random() * 10) + leaf(x, y + r * 2.9, r * 1.0, 205) + sunflower(x, y, r, random.random() * 20)
    return svg(1600, 700, b, lg('sky', [(0, '#7EC8E3'), (1, '#FFF1C4')]))

def corn_cob(x, y, s, rot=0):
    kern = ''.join(f'<line x1="{-s*0.3 + i*s*0.1:.1f}" y1="{-s*0.9:.1f}" x2="{-s*0.3 + i*s*0.1:.1f}" y2="{s*0.9:.1f}" stroke="#E0A915" stroke-width="2"/>' for i in range(7))
    return (f'<g transform="translate({x:.1f},{y:.1f}) rotate({rot})"><ellipse rx="{s*0.32:.1f}" ry="{s:.1f}" fill="#FFD23F"/>{kern}'
            f'<path d="M{-s*0.34},{s*0.2} Q{-s*0.5},{s*0.95} 0,{s*1.15} Q{s*0.5},{s*0.95} {s*0.34},{s*0.2} Q0,{s*0.5} {-s*0.34},{s*0.2}Z" fill="#6FA244"/>'
            f'<path d="M{-s*0.3},{s*0.3} Q{-s*0.15},{s*1.05} 0,{s*1.15} Q{-s*0.45},{s*0.9} {-s*0.34},{s*0.2}Z" fill="#5E9A36"/></g>')
def scene_corn():
    random.seed(7); b = '<rect width="1600" height="700" fill="url(#sky)"/><circle cx="260" cy="150" r="90" fill="#FFF3CC" opacity=".9"/>' + hills(420, '#B5D17A', 25, seed=3) + hills(480, '#8DB54B', 25, seed=5)
    for (y, s, n) in [(470, 70, 12), (560, 105, 9), (650, 150, 6)]:
        for i in range(n):
            x = (i + random.random() * .5) * (1600 / n) + 60
            b += stalk(x, y - s * 1.5, 720, '#4C7A2E', max(6, s / 9))
            for k in range(4):
                b += leaf(x, y - s * 0.5 + k * s * 0.55, s * 1.3, (-35 if k % 2 == 0 else 215) + random.random() * 12, '#5E9A36' if k % 2 else '#79B043')
            b += corn_cob(x + s * 0.15, y - s * 0.4, s * 0.8, 12)
    return svg(1600, 700, b, lg('sky', [(0, '#9AD3F0'), (1, '#FFF4D2')]))

def scene_canola():
    random.seed(11); b = '<rect width="1600" height="700" fill="url(#sky)"/><ellipse cx="400" cy="130" rx="160" ry="38" fill="#fff" opacity=".8"/><ellipse cx="1100" cy="90" rx="200" ry="40" fill="#fff" opacity=".7"/>'
    b += hills(330, '#9BCB57', 25, seed=2) + f'<rect y="360" width="1600" height="340" fill="url(#field)"/>'
    for i in range(650):
        y = 360 + (random.random() ** 0.7) * 340; sc = 0.5 + (y - 360) / 340 * 2.4; x = random.random() * 1600
        b += f'<g transform="translate({x:.0f},{y:.0f}) scale({sc:.2f})" fill="#FFD91A"><circle cx="-3" cy="0" r="3"/><circle cx="3" cy="0" r="3"/><circle cx="0" cy="-3" r="3"/><circle cx="0" cy="3" r="3"/><circle r="1.6" fill="#7A5A00"/></g>' if i % 1 == 0 else ''
    b += hills(345, '#6C9C3C', 10, seed=9)[:0]
    return svg(1600, 700, b, lg('sky', [(0, '#6EC1E8'), (1, '#E8F6FF')]) + lg('field', [(0, '#F7DE35'), (1, '#E9B800')]))

def wheat(x, y, h, rot=0):
    g = f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot})"><line x1="0" y1="0" x2="0" y2="{-h}" stroke="#C99A3B" stroke-width="5"/>'
    for i in range(9):
        yy = -h + i * 22
        g += f'<ellipse cx="-10" cy="{yy}" rx="8" ry="16" fill="#E8B84A" transform="rotate(-30 -10 {yy})"/><ellipse cx="10" cy="{yy}" rx="8" ry="16" fill="#F0C65E" transform="rotate(30 10 {yy})"/>'
    return g + f'<ellipse cx="0" cy="{-h-18}" rx="8" ry="18" fill="#F0C65E"/></g>'
def loaf(x, y, w, h):
    return (f'<g transform="translate({x},{y})"><ellipse cx="0" cy="{h*0.55}" rx="{w*0.55}" ry="{h*0.12}" fill="#000" opacity=".12"/>'
            f'<path d="M{-w/2},{h*0.5} Q{-w/2},{-h*0.4} 0,{-h*0.4} Q{w/2},{-h*0.4} {w/2},{h*0.5} Z" fill="#C97F2A"/>'
            f'<path d="M{-w/2+8},{h*0.45} Q{-w/2+8},{-h*0.3} 0,{-h*0.3} Q{w/2-8},{-h*0.3} {w/2-8},{h*0.45} Z" fill="#E09A3E"/>'
            + ''.join(f'<path d="M{-w*0.3+i*w*0.3},{-h*0.2} q{w*0.08},{h*0.2} {-w*0.02},{h*0.35}" stroke="#B3691B" stroke-width="5" fill="none" stroke-linecap="round"/>' for i in range(3)) + '</g>')
def croissant(x, y, s):
    segs = ''
    for i, k in enumerate([-2, -1, 0, 1, 2]):
        w = s * (0.34 - abs(k) * 0.045); segs += f'<ellipse cx="{k*s*0.3:.1f}" cy="{abs(k)*s*0.1:.1f}" rx="{w:.1f}" ry="{s*0.34:.1f}" fill="{"#E3A244" if i%2 else "#D18B2E"}" transform="rotate({k*14} {k*s*0.3:.1f} {s*0.3})"/>'
    return f'<g transform="translate({x},{y})"><ellipse cx="0" cy="{s*0.42}" rx="{s*0.9}" ry="{s*0.08}" fill="#000" opacity=".12"/>{segs}</g>'
def scene_fats():
    random.seed(3); b = '<rect width="1600" height="700" fill="url(#bg)"/>'
    for x in [120, 220, 1380, 1480, 1560, 330]:
        b += wheat(x, 700, 380 + random.random() * 120, random.uniform(-10, 10))
    b += '<rect y="560" width="1600" height="140" fill="#9A6A33"/><rect y="560" width="1600" height="14" fill="#B58145"/>'
    b += loaf(560, 520, 260, 150) + loaf(860, 530, 220, 130) + croissant(1100, 500, 130) + croissant(380, 520, 100)
    b += '<g transform="translate(760,380)"><rect x="-90" y="0" width="180" height="90" rx="12" fill="#FFE27A"/><rect x="-90" y="0" width="180" height="26" rx="12" fill="#FFF0A8"/></g>'
    return svg(1600, 700, b, lg('bg', [(0, '#FBE3B8'), (1, '#F4C987')]))

def scene_about():
    random.seed(2); b = '<rect width="1600" height="700" fill="url(#sky)"/><circle cx="1200" cy="260" r="150" fill="#FFD59A" opacity=".75"/><circle cx="1200" cy="260" r="100" fill="#FFE8C2"/>'
    sk = '<g fill="#6B5B73" opacity=".85">'
    x = 150
    for w, h in [(60, 180), (50, 260), (70, 210), (44, 340), (64, 230), (90, 150), (50, 290), (56, 200), (70, 250), (46, 170)]:
        sk += f'<rect x="{x}" y="{520-h}" width="{w}" height="{h}"/><rect x="{x+w*0.4}" y="{520-h-24}" width="{w*0.2}" height="24"/>'; x += w + 14
    sk += '<path d="M690,520 v-120 h160 v120Z"/><path d="M700,400 Q770,300 840,400Z"/><rect x="866" y="330" width="14" height="190"/><circle cx="773" cy="302" r="6"/></g>'
    b += sk + hills(500, '#E2B06A', 30, seed=1) + hills(560, '#D19A52', 36, seed=4) + hills(630, '#B97F3A', 30, seed=7)
    for px in [100, 1480, 1560]:
        b += f'<path d="M{px},700 Q{px+10},560 {px},420" stroke="#6B4423" stroke-width="12" fill="none"/>' + ''.join(f'<path d="M{px},420 q{60*math.cos(a)},{-50+30*math.sin(a)} {120*math.cos(a)},{40*math.sin(a)+10}" stroke="#3E7A3A" stroke-width="10" fill="none" stroke-linecap="round"/>' for a in [0.3, 1.2, 2, 2.9, 3.6, 5.4])
    return svg(1600, 700, b, lg('sky', [(0, '#F7B589'), (1, '#FFE7C7')]))

def scene_products():
    random.seed(8); b = '<rect width="1600" height="700" fill="url(#bg)"/>'
    for i in range(26):
        x, y, r = random.random() * 1600, random.random() * 700, random.uniform(14, 90)
        b += f'<g transform="translate({x:.0f},{y:.0f}) scale({r/50:.2f})"><path d="M0,-50 C34,-10 40,14 40,24 A40,40 0 0 1 -40,24 C-40,14 -34,-10 0,-50Z" fill="url(#drop)" opacity="{random.uniform(.5,.95):.2f}"/><ellipse cx="-13" cy="12" rx="8" ry="14" fill="#fff" opacity=".45" transform="rotate(20 -13 12)"/></g>'
    b += '<path d="M0,560 Q200,500 400,560 T800,560 T1200,560 T1600,560 V700 H0Z" fill="#F2B51D" opacity=".85"/><path d="M0,610 Q200,560 400,610 T800,610 T1200,610 T1600,610 V700 H0Z" fill="#E59E0B"/>'
    return svg(1600, 700, b, lg('bg', [(0, '#FFF3C4'), (1, '#FFD76A')]) + lg('drop', [(0, '#FFE16B'), (1, '#E9A000')]))

def scene_health():
    random.seed(5); b = '<rect width="1600" height="700" fill="url(#bg)"/>'
    for i in range(28):
        x, y, s, rot = random.random() * 1600, random.random() * 700, random.uniform(50, 130), random.uniform(0, 360)
        b += leaf(x, y, s, rot, random.choice(['#6FA244', '#4C8A3A', '#8DBF5A', '#3E7A3A']))
    for i in range(10):
        x, y, r = random.random() * 1600, random.random() * 700, random.uniform(24, 46)
        b += f'<g transform="translate({x:.0f},{y:.0f})"><circle r="{r}" fill="#E8412C"/><path d="M0,{-r} l-8,-12 M0,{-r} l8,-12" stroke="#3E7A3A" stroke-width="5"/></g>'
    for i in range(7):
        x, y, r = random.random() * 1600, random.random() * 700, random.uniform(30, 52)
        b += f'<g transform="translate({x:.0f},{y:.0f})"><circle r="{r}" fill="#FFD84A"/><circle r="{r*0.86}" fill="#FFF0A0"/>' + ''.join(f'<line x1="0" y1="0" x2="{r*0.8*math.cos(a):.1f}" y2="{r*0.8*math.sin(a):.1f}" stroke="#FFD84A" stroke-width="3"/>' for a in [i*math.pi/4 for i in range(8)]) + '</g>'
    for i in range(6):
        x, y = random.random() * 1600, random.random() * 700
        b += f'<g transform="translate({x:.0f},{y:.0f}) rotate({random.uniform(0,360):.0f})"><ellipse rx="20" ry="30" fill="#6B8E23"/><ellipse rx="6" ry="9" fill="#C23B3B" cx="0" cy="-6"/></g>'
    return svg(1600, 700, b, lg('bg', [(0, '#EAF5DA'), (1, '#CDE6A8')]))

def scene_buy():
    random.seed(6); b = '<rect width="1600" height="700" fill="url(#bg)"/>'
    for i in range(7):
        x = 40 + i * 230; b += f'<rect x="{x}" y="60" width="200" height="60" fill="{"#E0262D" if i%2 else "#fff"}"/>' + f'<path d="M{x},120 a25,25 0 0 0 50,0 a25,25 0 0 0 50,0 a25,25 0 0 0 50,0 a25,25 0 0 0 50,0Z" fill="{"#E0262D" if i%2 else "#fff"}"/>'
    for sy in [260, 400, 540]:
        b += f'<rect x="0" y="{sy}" width="1600" height="12" fill="#B8956A"/>'
        for i in range(24):
            x = 20 + i * 66 + random.random() * 6; h = random.uniform(70, 120); b += f'<rect x="{x:.0f}" y="{sy-h:.0f}" width="46" height="{h:.0f}" rx="8" fill="{random.choice(["#F2B51D","#E0262D","#6FA244","#fff","#2B2B2B"])}"/><rect x="{x+8:.0f}" y="{sy-h*0.6:.0f}" width="30" height="{h*0.25:.0f}" fill="#fff" opacity=".7"/>'
    for (x, y) in [(300, 330), (900, 470), (1350, 250)]:
        b += f'<g transform="translate({x},{y}) scale(1.6)"><path d="M0,0 C-30,-30 -30,-70 0,-70 C30,-70 30,-30 0,0Z" fill="#B71C22" stroke="#fff" stroke-width="3"/><circle cy="-48" r="9" fill="#fff"/></g>'
    return svg(1600, 700, b, lg('bg', [(0, '#FFF1E0'), (1, '#F5D9B5')]))

def scene_recipes():
    random.seed(12); b = '<rect width="1600" height="700" fill="url(#bg)"/>'
    for i in range(10):
        x, y = random.random() * 1600, random.random() * 700; r = random.uniform(50, 110)
        b += f'<g transform="translate({x:.0f},{y:.0f})"><circle r="{r}" fill="#fff" opacity=".85"/><circle r="{r*0.82}" fill="#F3E3C8"/></g>'
    for i in range(9):
        x, y = random.random() * 1600, random.random() * 700; rot = random.uniform(0, 360)
        b += f'<g transform="translate({x:.0f},{y:.0f}) rotate({rot:.0f})"><rect x="-6" y="0" width="12" height="140" rx="6" fill="#9AA0A6"/><ellipse cy="-20" rx="26" ry="40" fill="#B7BCC2"/></g>'
    for i in range(14):
        x, y = random.random() * 1600, random.random() * 700
        b += f'<g transform="translate({x:.0f},{y:.0f}) rotate({random.uniform(0,360):.0f})"><path d="M0,0 C20,-14 50,-6 60,10 C40,16 20,14 0,0Z" fill="#D7261E"/><path d="M0,0 l-10,-6" stroke="#3E7A3A" stroke-width="5" stroke-linecap="round"/></g>'
    b += ''.join(leaf(random.random() * 1600, random.random() * 700, random.uniform(40, 90), random.uniform(0, 360), '#5E9A36') for _ in range(22))
    return svg(1600, 700, b, lg('bg', [(0, '#E9D3B0'), (1, '#D8B98A')]))

# ---------------------------------------------------------------- recipe illustrations (800x500)
def plate(cx, cy, r, rim='#FFFFFF', inner='#F7F2EA'):
    return f'<ellipse cx="{cx}" cy="{cy+r*0.18}" rx="{r*1.05}" ry="{r*0.9}" fill="#000" opacity=".12"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="{rim}"/><circle cx="{cx}" cy="{cy}" r="{r*0.86}" fill="{inner}"/>'
def table_bg(c1='#C98C4B', c2='#A9703A'):
    planks = ''.join(f'<rect x="0" y="{i*100}" width="800" height="4" fill="#000" opacity=".12"/>' for i in range(1, 5))
    return f'<rect width="800" height="500" fill="url(#t)"/>{planks}'
TBL = lg('t', [(0, '#D9A066'), (1, '#B67A41')])

def r_biryani():
    random.seed(21); b = table_bg() + plate(400, 255, 205, '#fff', '#F9E6B8')
    b += '<circle cx="400" cy="255" r="150" fill="#F2C94C"/>'
    for i in range(420):
        a = random.random() * 6.283; rr = (random.random() ** 0.55) * 150; x, y = 400 + rr * math.cos(a), 255 + rr * math.sin(a)
        c = random.choice(['#FFF6D6', '#F7D774', '#E8A93A', '#FFFFFF', '#F4C24A', '#D9892B']); b += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="9" ry="2.6" fill="{c}" transform="rotate({random.uniform(0,180):.0f} {x:.1f} {y:.1f})"/>'
    for (x, y, rot) in [(350, 215, 20), (440, 230, -30), (385, 290, 60), (455, 300, 10), (330, 270, -20)]:
        b += f'<g transform="translate({x},{y}) rotate({rot})"><ellipse rx="42" ry="26" fill="#B5651D"/><ellipse rx="34" ry="19" cy="-3" fill="#CF7F2B"/><ellipse rx="10" ry="6" cx="-8" cy="-8" fill="#E8A157" opacity=".7"/></g>'
    for (x, y) in [(300, 220), (500, 250), (420, 190), (360, 330), (470, 340)]:
        b += f'<path d="M{x},{y} q14,-24 30,-4 q-10,16 -30,4Z" fill="#3E9A3A"/>'
    for i in range(14):
        a = random.random() * 6.283; rr = random.uniform(30, 140); b += f'<circle cx="{400+rr*math.cos(a):.0f}" cy="{255+rr*math.sin(a):.0f}" r="6" fill="#7A3E12"/>'
    b += '<g><circle cx="620" cy="130" r="48" fill="#C8372D"/><circle cx="620" cy="130" r="38" fill="#E3503F"/></g><path d="M130,380 q-40,-60 20,-90 q40,60 -20,90Z" fill="#3E9A3A"/>'
    return svg(800, 500, b, TBL)

def r_falafel():
    random.seed(22); b = table_bg('#CFA06A') + plate(400, 262, 215, '#F4F1EC', '#FFFFFF')
    b += '<ellipse cx="405" cy="230" rx="76" ry="52" fill="#EFE3C4"/><ellipse cx="405" cy="230" rx="60" ry="40" fill="#F8EFD6"/><path d="M370,226 q35,-18 70,0" stroke="#C99B3C" stroke-width="5" fill="none"/><circle cx="405" cy="226" r="7" fill="#5C7A2B"/>'
    for (x, y) in [(260, 270), (330, 330), (420, 350), (500, 320), (540, 255), (300, 205), (500, 190), (410, 150), (330, 140)]:
        r = random.uniform(38, 46)
        b += f'<g><ellipse cx="{x}" cy="{y+r*0.2}" rx="{r}" ry="{r*0.86}" fill="#000" opacity=".15"/><circle cx="{x}" cy="{y}" r="{r}" fill="#8A5A1D"/><circle cx="{x-3}" cy="{y-4}" r="{r*0.88}" fill="#A8712A"/>'
        b += ''.join(f'<circle cx="{x+random.uniform(-r*.6,r*.6):.1f}" cy="{y+random.uniform(-r*.6,r*.6):.1f}" r="{random.uniform(1.5,3.2):.1f}" fill="{random.choice(["#4D8B2A","#6B3F10","#C8923A"])}"/>' for _ in range(14)) + '</g>'
    b += '<g transform="translate(610,420)"><circle r="42" fill="#D7261E"/><circle r="34" fill="#E8503F"/><circle r="12" fill="#F7B3A5"/></g><path d="M150,400 q-30,-60 30,-80 q30,60 -30,80Z" fill="#3E9A3A"/>'
    return svg(800, 500, b, TBL)

def r_samosa():
    random.seed(23); b = table_bg('#C79257') + plate(400, 262, 215, '#fff', '#F6EEDF')
    for (x, y, rot, s) in [(330, 270, -15, 1.0), (470, 250, 18, 1.0), (400, 350, 4, 0.95), (400, 175, 0, 0.9)]:
        b += (f'<g transform="translate({x},{y}) rotate({rot}) scale({s})"><path d="M-80,60 L0,-80 L80,60Z" fill="#000" opacity=".14" transform="translate(6,10)"/><path d="M-80,60 L0,-80 L80,60Z" fill="#C57A22" stroke="#9A5A12" stroke-width="3" stroke-linejoin="round"/>'
              '<path d="M-60,50 L0,-58 L60,50Z" fill="#DE9535"/>' + ''.join(f'<circle cx="{random.uniform(-40,40):.0f}" cy="{random.uniform(-30,45):.0f}" r="{random.uniform(2,4.5):.1f}" fill="#B0661A" opacity=".8"/>' for _ in range(24)) + '<path d="M-80,60 L80,60" stroke="#9A5A12" stroke-width="4" stroke-dasharray="6 5"/></g>')
    b += '<g transform="translate(610,150)"><ellipse rx="70" ry="48" fill="#fff"/><ellipse rx="56" ry="36" fill="#4F9A3A"/><ellipse rx="40" ry="24" fill="#6BB84F"/></g><g transform="translate(180,380)"><circle r="40" fill="#F3C13A"/><circle r="28" fill="#FFE27A"/></g>'
    return svg(800, 500, b, TBL)

def r_pancakes():
    b = '<rect width="800" height="500" fill="url(#t)"/>' + '<ellipse cx="400" cy="430" rx="250" ry="44" fill="#000" opacity=".12"/>' + '<ellipse cx="400" cy="400" rx="260" ry="52" fill="#fff"/><ellipse cx="400" cy="394" rx="226" ry="40" fill="#F4F1EC"/>'
    for i in range(5):
        y = 372 - i * 40
        b += f'<path d="M180,{y} a220,40 0 0 1 440,0 v22 a220,40 0 0 1 -440,0Z" fill="#B96F22"/><ellipse cx="400" cy="{y}" rx="220" ry="40" fill="#E9AE55"/>' if i < 4 else ''
    b += '<ellipse cx="400" cy="212" rx="220" ry="40" fill="#D68B34"/><path d="M180,212 v26 a220,40 0 0 0 440,0 v-26" fill="#B96F22"/><ellipse cx="400" cy="212" rx="220" ry="40" fill="#E9AE55"/>'
    b += '<path d="M260,208 q60,50 120,10 q40,30 90,-10 q60,40 80,10 q-40,60 -150,60 q-120,10 -140,-70Z" fill="#8A3F0E" opacity=".92"/><path d="M300,230 q10,55 22,10 M440,240 q8,60 22,14" stroke="#8A3F0E" stroke-width="12" fill="none" stroke-linecap="round"/>'
    b += '<rect x="360" y="150" width="80" height="48" rx="8" fill="#FFE27A"/><rect x="360" y="150" width="80" height="14" rx="8" fill="#FFF3B0"/>'
    for (x, y, c) in [(310, 188, '#C2185B'), (490, 192, '#3F51B5'), (330, 160, '#3F51B5'), (470, 168, '#C2185B'), (520, 200, '#C2185B')]:
        b += f'<circle cx="{x}" cy="{y}" r="16" fill="{c}"/><circle cx="{x-5}" cy="{y-5}" r="5" fill="#fff" opacity=".4"/>'
    b += '<g transform="translate(640,360)"><path d="M0,0 h70 l-8,80 h-54Z" fill="#E0E0E0" opacity=".9"/><rect y="-6" width="70" height="16" rx="6" fill="#B71C22"/></g>'
    return svg(800, 500, b, TBL)

def r_salad():
    random.seed(25); b = '<rect width="800" height="500" fill="url(#t)"/>' + '<ellipse cx="400" cy="440" rx="270" ry="38" fill="#000" opacity=".14"/>' + '<ellipse cx="400" cy="270" rx="290" ry="200" fill="#fff"/><ellipse cx="400" cy="270" rx="262" ry="176" fill="#F3EFE8"/>'
    for i in range(30):
        a = random.random() * 6.283; rr = (random.random() ** 0.6) * 0.9; x, y = 400 + 230 * rr * math.cos(a), 270 + 150 * rr * math.sin(a)
        b += leaf(x, y, random.uniform(40, 70), random.uniform(0, 360), random.choice(['#4C8A3A', '#6FA244', '#8DBF5A']))
    for i in range(26):
        a = random.random() * 6.283; rr = (random.random() ** 0.6) * 0.85; x, y = 400 + 220 * rr * math.cos(a), 270 + 140 * rr * math.sin(a)
        b += f'<g transform="translate({x:.0f},{y:.0f})"><circle r="20" fill="#D8EBB2"/><circle r="15" fill="#B6D681"/><circle r="6" fill="#E9F5CC"/></g>'
    for i in range(18):
        a = random.random() * 6.283; rr = (random.random() ** 0.6) * 0.85; x, y = 400 + 220 * rr * math.cos(a), 270 + 140 * rr * math.sin(a)
        b += f'<g transform="translate({x:.0f},{y:.0f}) rotate({random.randint(0,90)})"><rect x="-17" y="-17" width="34" height="34" rx="9" fill="#E03C2B"/><rect x="-10" y="-10" width="20" height="20" rx="6" fill="#F26B58"/></g>'
    for i in range(10):
        a = random.random() * 6.283; rr = random.random() * 0.8; x, y = 400 + 220 * rr * math.cos(a), 270 + 140 * rr * math.sin(a)
        b += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="16" ry="11" fill="#556B2F"/>'
    for i in range(5):
        x = 250 + i * 70; b += f'<path d="M{x},230 q40,-60 80,0" stroke="#B05AA8" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/>'
    b += '<g transform="translate(675,150)"><rect x="-26" y="-30" width="52" height="140" rx="20" fill="#6B7B1F"/><rect x="-12" y="-70" width="24" height="50" rx="8" fill="#6B7B1F"/><rect x="-30" y="-80" width="60" height="16" rx="6" fill="#333"/><rect x="-26" y="20" width="52" height="46" fill="#F6E7B0"/></g><g transform="translate(120,380)"><circle r="52" fill="#F5CF2E"/><circle r="42" fill="#FFE97A"/><path d="M0,0 L0,-40 M0,0 L35,-20 M0,0 L35,20 M0,0 L0,40 M0,0 L-35,20 M0,0 L-35,-20" stroke="#F5CF2E" stroke-width="4"/></g>'
    return svg(800, 500, b, TBL)

def r_granola():
    random.seed(26); b = '<rect width="800" height="500" fill="url(#t)"/>' + '<ellipse cx="400" cy="450" rx="250" ry="34" fill="#000" opacity=".14"/>' + '<path d="M150,230 Q150,440 400,440 Q650,440 650,230Z" fill="#fff"/><path d="M165,236 Q170,420 400,424 Q630,420 635,236Z" fill="#F0EADF"/><ellipse cx="400" cy="230" rx="250" ry="56" fill="#fff"/><ellipse cx="400" cy="232" rx="232" ry="46" fill="#D8A85E"/>'
    for i in range(180):
        x = random.uniform(190, 610); y = random.uniform(200, 262); c = random.choice(['#C7933F', '#E3B866', '#A56F27', '#F0CC82', '#8A5A1D'])
        if (x - 400) ** 2 / 225 ** 2 + (y - 232) ** 2 / 38 ** 2 <= 1: b += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{random.uniform(7,14):.0f}" ry="{random.uniform(4,8):.0f}" fill="{c}" transform="rotate({random.randint(0,180)} {x:.0f} {y:.0f})"/>'
    for i in range(34):
        x = random.uniform(200, 600); y = random.uniform(205, 258)
        if (x - 400) ** 2 / 215 ** 2 + (y - 232) ** 2 / 34 ** 2 <= 1: b += f'<path d="M{x:.0f},{y:.0f} q10,-8 20,0 q-10,6 -20,0Z" fill="#FFF8E7"/>'
    for (x, y, c) in [(330, 224, '#C2185B'), (470, 230, '#C2185B'), (400, 240, '#7B1FA2'), (520, 238, '#E65100'), (290, 240, '#E65100')]:
        b += f'<circle cx="{x}" cy="{y}" r="10" fill="{c}"/>'
    b += '<g transform="translate(640,370)"><path d="M-6,-10 L50,-10 L38,70 L6,70Z" fill="#E0E0E0"/><rect x="-14" y="-24" width="72" height="20" rx="6" fill="#8D6E63"/></g><g transform="translate(130,380)"><path d="M0,0 C-40,-40 -40,-90 0,-100 C40,-90 40,-40 0,0Z" fill="#fff"/><path d="M0,0 C-30,-34 -30,-76 0,-86 C30,-76 30,-34 0,0Z" fill="#E8DCC6"/></g>'
    return svg(800, 500, b, TBL)

if __name__ == '__main__':
    banners = {'hero-sunflower': scene_sunflower, 'hero-corn': scene_corn, 'hero-canola': scene_canola, 'hero-fats': scene_fats,
               'about': scene_about, 'products': scene_products, 'health': scene_health, 'buy': scene_buy, 'recipes': scene_recipes}
    for n, f in banners.items(): write('art', n + '.svg', f())
    dishes = {'ghee-chicken-biryani': r_biryani, 'crispy-falafel': r_falafel, 'golden-samosas': r_samosa, 'fluffy-pancakes': r_pancakes, 'olive-oil-salad': r_salad, 'coconut-granola': r_granola}
    for n, f in dishes.items(): write('recipes', n + '.svg', f())
    print('art written')

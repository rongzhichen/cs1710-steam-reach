import csv,ast,math,random,statistics,textwrap,json
from pathlib import Path
from collections import Counter,defaultdict
import numpy as np
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
P=Path(__file__).resolve().parent
rows=[]
with (P.parent.parent/'dataset/games.csv').open() as f:
 reader=csv.reader(f); header=next(reader); header[7:8]=['Discount','DLC count']
 for values in reader:
  assert len(values)==len(header),(len(values),len(header))
  r=dict(zip(header,values)); num=lambda k: float(r[k] or 0)
  try: langs=ast.literal_eval(r['Supported languages'])
  except (ValueError,SyntaxError): langs=[]
  lo,hi=map(int,r['Estimated owners'].split(' - ')); total=num('Positive')+num('Negative')
  rows.append(dict(id=r['AppID'],name=r['Name'],genres=r['Genres'].split(','),price=num('Price'),lo=lo,hi=hi,owners=(lo+hi)/2,ccu=num('Peak CCU'),rating=100*num('Positive')/total if total else None,reviews=total,hours=num('Average playtime forever')/60,languages=len(set(langs)),platforms=sum(r[k]=='True' for k in ['Windows','Mac','Linux']),achievements=num('Achievements'),dlc=num('DLC count'),critic=num('Metacritic score'),year=int(r['Release date'][-4:]) if r['Release date'][-4:].isdigit() else None))
genres=['Action','Adventure','Casual','Indie','RPG','Simulation','Strategy','Sports']
bygenre={g:[r for r in rows if g in r['genres']] for g in genres}
rng=random.Random(1710)
W,H=792,612
c=canvas.Canvas(str(P/'steam-sketchbook.pdf'),pagesize=(W,H))
c.setTitle('Steam Games - Map to Sketch');c.setAuthor('CS1710 project sketch references')
ink='#242424'; teal='#287C79'; orange='#B66435';gray='#8A8983'
notes=[]
def line(x1,y1,x2,y2,color=ink,width=1.3,dash=False):
 c.setStrokeColor(HexColor(color));c.setLineWidth(width);c.setDash(4,3) if dash else c.setDash()
 c.line(x1,H-y1,x2,H-y2);c.setDash()
def text(x,y,s,size=10,color=ink):
 c.setFillColor(HexColor(color));c.setFont('Helvetica',size);c.drawString(x,H-y,str(s))
def dot(x,y,r=3,color=ink,open=False):
 c.setStrokeColor(HexColor(color));c.setFillColor(HexColor(color));c.setLineWidth(1.1);c.circle(x,H-y,r,stroke=1,fill=0 if open else 1)
def rect(x,y,w,h,color=ink,fill=False):
 c.setStrokeColor(HexColor(color));c.setFillColor(HexColor(color));c.setLineWidth(1);c.rect(x,H-y-h,w,h,stroke=1,fill=int(fill))
def para(x,y,s,width=113,size=10):
 for t in textwrap.wrap(s,width): text(x,y,t,size);y+=14
 return y

def start(n,title,q):
 c.setFillColor(HexColor('#FFFEF9'));c.rect(0,0,W,H,fill=1,stroke=0)
 text(35,28,'STEAM / MAP TO SKETCH',10,teal);text(590,28,f'PEN-AND-PAPER REFERENCE  {n:02}',9)
 text(35,58,title,23);para(35,80,q,119,10)
 text(35,111,'Computed from the local CSV. Digital sketch reference; redraw with pen on paper.',9,gray)

def end(n,title,q,legend,draw,caveat):
 line(35,439,757,439,gray,.6)
 text(35,460,'LEGEND / MARKS + CHANNELS',10,teal)
 y=477
 for s in legend: y=para(35,y,s,120,9.5)+2
 y=para(35,max(y+5,538),'DRAW: '+draw,122,9)
 para(35,y+3,'READ WITH CARE: '+caveat,122,9)
 notes.append((n,title,q,legend,draw,caveat));c.showPage()
def median(a):return statistics.median(a) if a else 0
def mean(a):return statistics.mean(a) if a else 0
def fmt(v):return f'{v/1e6:.1f}m' if v>=1e6 else f'{v/1000:.0f}k' if v>=1000 else f'{v:.0f}'
def axes(x,y,w,h,xlab,ylab):
 line(x,y,x,y+h);line(x,y+h,x+w,y+h);text(x,y-12,ylab,10);text(x+w/2-55,y+h+30,xlab,10) if xlab else None
def sample(rs,n):return rng.sample(rs,min(n,len(rs)))

# 1: interval flags plus average reach, in a log-like owner scale.
start(1,'The genre race','Q1. Which game genres tend to attract the largest number of players?')
order=sorted(genres,key=lambda g:mean([r['owners'] for r in bygenre[g]]),reverse=True)
def ox(v):return 190+500*math.log10(1+v)/7
for v in [0,1000,10000,100000,1000000,10000000]:
 x=ox(v);line(x,137,x,385,'#DDDAD0',.5);text(x-10,411,fmt(v),9)
for i,g in enumerate(order):
 rs=[r for r in bygenre[g] if r['hi']>0];y=154+i*31
 vals=[r['owners'] for r in rs];q1,med,q3=np.percentile(vals,[25,50,75]);avg=mean(vals)
 text(38,y+3,g,11);line(ox(q1),y,ox(q3),y,teal,5);dot(ox(med),y,4,ink);dot(ox(avg),y,5,orange,True)
 text(704,y+3,f'n={len(rs):,}',8)
text(240,430,'Estimated owners per title (uneven numeric spacing: powers of ten)',10)
end(1,'The genre race','Q1: genre and audience reach',[
 'Horizontal strokes = middle half of owner-band midpoints; black dot = median; open orange ring = mean (quantitative).',
 'Row position + text = genre (nominal); x position = estimated owners (quantitative approximation). n = eligible games.'
], 'Draw eight lanes, a thick interval, a dot and an open ring in each. Label the powers-of-ten ruler.',
 'Owners are not active players. Exclude 0-0 bands. Multi-genre games appear in each genre; lanes overlap.')

# 2 bead strings
start(2,'Review bead strings','Q2. Which genres receive the highest percentage of positive user reviews?')
for i,g in enumerate(genres):
 rs=[r for r in bygenre[g] if r['reviews']>=50];rate=mean([r['rating'] for r in rs]);y=153+i*32
 text(40,y+3,g,11);line(174,y,564,y,gray,.6)
 for k in range(20):dot(180+k*20,y,5,teal if k<round(rate/5) else gray,open=k>=round(rate/5))
 text(602,y+4,f'{rate:.1f}%   n={len(rs):,}',10)
end(2,'Review bead strings','Q2: genre and positive-review percentage',[
 'Each bead = 5 percentage points of the mean per-game positive-review share; filled teal = positive, hollow = remainder.',
 'Row/text = genre (nominal); filled-bead count = percentage (quantitative). Exact labels override rounded bead counts.'
], 'Draw a 20-bead necklace per genre and shade the positive portion. Add the exact percentage at its end.',
 'Use games with >=50 reviews. Each game gets equal weight; this differs from pooling all review votes.')

# 3 clocks
start(3,'The playtime clock shop','Q7. Which genres have the highest average player playtime?')
mx=max(mean([r['hours'] for r in bygenre[g] if r['hours']>0]) for g in genres);scale=math.ceil(mx/10)*10
for i,g in enumerate(genres):
 rs=[r for r in bygenre[g] if r['hours']>0];avg=mean([r['hours'] for r in rs]);med=median([r['hours'] for r in rs]);x=125+(i%4)*180;y=204+(i//4)*145
 c.setStrokeColor(HexColor(gray));c.circle(x,H-y,43,stroke=1,fill=0)
 for quarter in range(4):
  a=quarter*math.pi/2-math.pi/2;line(x+39*math.cos(a),y+39*math.sin(a),x+43*math.cos(a),y+43*math.sin(a),gray,.7)
 for v,col,length in [(avg,orange,38),(med,ink,27)]:
  a=2*math.pi*v/scale-math.pi/2;line(x,y,x+length*math.cos(a),y+length*math.sin(a),col,2.3)
 dot(x,y,2);text(x-40,y-56,g,11);text(x-53,y+60,f'mean {avg:.1f}h / med {med:.1f}h',9)
text(280,428,f'Every dial: 0 hours at top; one full turn = {scale} hours',10)
end(3,'The playtime clock shop','Q7: genre and average playtime',[
 'Circle = one genre (nominal); hand angle clockwise from 12 = hours (quantitative), all dials share the same scale.',
 'Long orange hand = mean of game-average lifetime playtime; short black hand = median of those averages.'
], 'Draw eight clocks with two differently sized hands. Label both hour values; add 0, quarter and half-turn ticks.',
 'Zeros are omitted as unavailable/ambiguous. This is a per-title summary, not a player-weighted average.')

# 4 shelf cards price and success
start(4,'Price shelves','Q3-Q5. How does price relate to owners and reviews, and which price bands contain more high-reach games?')
bins=[('Free',lambda v:v==0),('$0-5',lambda v:0<v<=5),('$5-10',lambda v:5<v<=10),('$10-20',lambda v:10<v<=20),('$20-40',lambda v:20<v<=40),('$40+',lambda v:v>40)]
for i,(label,test) in enumerate(bins):
 x=43+i*122;rs=[r for r in rows if test(r['price']) and r['hi']>0];rev=[r['rating'] for r in rs if r['reviews']>=50];reach=100*sum(r['lo']>=1000000 for r in rs)/len(rs)
 text(x,150,label,15);line(x,173,x+105,173)
 text(x,197,'Median owner',10);text(x,216,'band midpoint',10);text(x,242,fmt(median([r['owners'] for r in rs])),19)
 text(x,271,'Mean review share',9);text(x,294,f'{mean(rev):.1f}%',17,teal)
 for k in range(20):dot(x+(k%5)*18,328+(k//5)*18,4,orange if k<round(reach/5) else gray,open=k>=round(reach/5))
 text(x,404,f'{reach:.1f}% high reach',10);text(x,421,f'n={len(rs):,}; rated={len(rev):,}',8)
end(4,'Price shelves','Q3, Q4, Q5: price, owners, reviews and success',[
 'Shelf position/text = ordered USD price bins; printed number = median owner midpoint; teal number = mean review share.',
 '20-dot stamp = 100% of games in a shelf; filled orange dots = share with owner lower bound >=1m (rounded to 5%).'
], 'Draw six shelf labels with an owner number, a review number and a small 20-dot stamp underneath.',
 'High reach is a chosen success proxy, not profit. Prices are snapshot prices. Exclude 0-0 owners; reviews need >=50.')

# 5 scatter
start(5,'The engagement constellation','Q6. Is average playtime associated with higher user review ratings?')
rs=[r for r in rows if r['hours']>0 and r['reviews']>=50];ss=sample(rs,130)
axes(100,148,605,236,'Average lifetime playtime (hours)','Positive reviews (%)')
for v in [0,25,50,75,100]:text(66,388-2.36*v,v,9)
for v in [0,1,10,100,1000,10000]:text(100+605*math.log10(1+v)/4.1-8,404,str(v),9)
for r in ss:dot(100+605*math.log10(1+r['hours'])/4.1,384-r['rating']*2.36,2.4,teal,True)
text(453,137,f'{len(ss)} sampled / {len(rs):,} eligible games',9)
end(5,'The engagement constellation','Q6: playtime and reviews',[
 'One open circle = one game (nominal identity); x = average lifetime hours; y = positive / total reviews x 100.',
 'Both positions encode quantities. x uses log10(1+hours) to expose the long tail; point area is constant.'
], 'Draw two axes and a loose cloud of circles. Circle interesting outliers and write their game names in a later version.',
 'Only nonzero playtime and >=50 reviews. A seeded sample shows the design; association does not establish causation.')

# 6 paired ladders
start(6,'Reach ladders: languages and platforms','Q8-Q9. Do more supported languages or operating systems accompany higher player reach?')
for panel,key,cats in [(0,'languages',[(1,'1'),(2,'2-5'),(6,'6-10'),(11,'11+')]),(1,'platforms',[(1,'1 OS'),(2,'2 OS'),(3,'3 OS')])]:
 x0=90+panel*373;axes(x0,169,278,202,'','Peak CCU (snapshot field)')
 for v in [0,10,1000,100000,10000000]:text(x0-38,374-213*math.log10(1+v)/7,fmt(v),8)
 for j,(v,label) in enumerate(cats):
  test=(lambda r,v=v: r[key]==v) if key=='platforms' or v==1 else (lambda r,v=v: v<=r[key]<({2:6,6:11,11:10000}[v]))
  rs=[r for r in rows if test(r)];x=x0+43+j*65
  for r in sample(rs,35):dot(x+rng.uniform(-17,17),371-213*math.log10(1+r['ccu'])/7,1.8,teal,True)
  yy=371-213*math.log10(1+median([r['ccu'] for r in rs]))/7;line(x-22,yy,x+22,yy,orange,3)
  text(x-15,394,label,9);text(x-24,410,f'n={len(rs):,}',8)
 text(x0+42,135,'Supported languages' if panel==0 else 'Operating systems',12)
end(6,'Reach ladders','Q8, Q9: localization, platforms and reach',[
 'Each circle = a sampled game; column position = ordered language-count or platform-count group; y = Peak CCU.',
 'Orange rung = full-group median CCU. Within-column sideways jitter is only separation. y uses log10(1+CCU).'
], 'Draw two ladders of point clouds. Cross each cloud with a median rung. Write group counts below.',
 'Unknown/zero support counts omitted; CCU zeros retained. The snapshot does not establish the CCU measurement window.')

# 7 grouped medians
start(7,'Achievement and DLC trails','Q10-Q11. Are achievements or DLCs associated with playtime or popularity?')
for p,key in enumerate(['achievements','dlc']):
 x=85+p*374;groups=[(0,0,'0'),(1,10,'1-10'),(11,50,'11-50'),(51,float('inf'),'51+')]
 stats=[]
 for lo,hi,label in groups:
  rs=[r for r in rows if lo<=r[key]<=hi];playing=[r['hours'] for r in rs if r['hours']>0];stats.append((label,median(playing),median([r['ccu'] for r in rs]),len(playing),len(rs)))
 text(x,144,'Achievements' if p==0 else 'DLC count',15)
 for k,metric in enumerate(['Median avg. playtime (h)','Median Peak CCU']):
  yy=180+k*128;vals=[s[k+1] for s in stats];limit=max(max(vals)*1.25,1);text(x,yy,metric,10)
  for j,s in enumerate(stats):
   xx=x+15+j*69;top=yy+83-65*s[k+1]/limit
   line(xx,yy+83,xx,top,teal if k==0 else orange,2);dot(xx,top,4,teal if k==0 else orange);text(xx-8,top-8,f'{s[k+1]:.1f}',9);text(xx-8,yy+101,s[0],9)
end(7,'Achievement and DLC trails','Q10, Q11: features and engagement',[
 'Stem + dot = one count bin; x order = achievement/DLC count (quantitative bins); stem length = group median.',
 'Teal = hours among games with nonzero playtime; orange = Peak CCU including zeros. Each panel has its own scale.'
], 'Draw two pairs of four lollipops: achievements on the left, DLCs on the right. Label every tip value.',
 'These are associations; successful games may add features later. Zero playtime is omitted, so group populations differ.')

# 8 score bridge real selected varied examples
start(8,'Critic-player bridges','Q12. How closely do Metacritic scores align with Steam user reviews?')
rs=[r for r in rows if r['critic']>0 and r['reviews']>=50];ss=sorted(sample(rs,8),key=lambda r:r['critic']-r['rating'])
for i,r in enumerate(ss):
 y=150+i*33;name=r['name'];text(35,y+4,name[:29]+('...' if len(name)>29 else ''),9)
 xa=285+4*r['critic'];xb=285+4*r['rating'];line(xa,y,xb,y,gray,2);rect(xa-3,y-3,6,6,orange,True);dot(xb,y,3.5,teal)
 text(705,y+4,f'{r["rating"]-r["critic"]:+.1f}',9)
for v in [0,25,50,75,100]:text(280+4*v,431,str(v),9)
text(297,414,'Shared 0-100 ruler; right-hand value = Steam minus critic',9)
end(8,'Critic-player bridges','Q12: Metacritic vs Steam',[
 'Row = named game; orange square = Metacritic score; teal circle = Steam positive-review %. x position = value.',
 'Connecting stroke length = absolute numeric gap; signed label = direction and size of the gap (percentage points).'
], 'Draw a square and circle on a shared ruler for each game, then bridge them. Long bridges reveal disagreement.',
 'Eight real sampled titles, not a ranking. Critics and Steam use different scoring systems; missing critics are excluded.')

# 9: monochrome small-multiple line sketches using one clear percentage.
saved_colors=(teal,orange,gray);teal=orange=gray=ink
start(9,'Which genres make up popular games?','Q13. How have popular game genres changed over time?')
text(72,130,'Popular = owner-band lower bound >=100,000. Compare genre shares among popular releases in each period.',9)
years=[(1997,2009,'97-09'),(2010,2014,'10-14'),(2015,2019,'15-19'),(2020,2024,'20-24'),(2025,2025,'2025')]
audit=[]
for i,g in enumerate(genres[:6]):
 x=72+(i%3)*243;y=158+(i//3)*143
 text(x,y-15,g,12)
 line(x,y,x,y+83,ink,1);line(x,y+83,x+190,y+83,ink,1)
 text(x-28,y+4,'100%',8);text(x-13,y+86,'0',8)
 points=[]
 for j,(lo,hi,lab) in enumerate(years):
  rs=[r for r in rows if r['year'] and lo<=r['year']<=hi and r['lo']>=100000]
  count=sum(g in r['genres'] for r in rs);pct=100*count/len(rs)
  xx=x+10+j*43;yy=y+83-.83*pct;points.append((xx,yy))
  text(xx-11,yy-7,f'{pct:.0f}%',8)
  text(xx-13,y+99,lab,8)
  audit.append(dict(genre=g,cohort=lab,popular_games=len(rs),popular_games_in_genre=count,genre_share_percent=round(pct,4)))
 for p1,p2 in zip(points,points[1:]):line(*p1,*p2,ink,1.3)
 for xx,yy in points:dot(xx,yy,2.5,ink)
text(72,414,'Release periods: 1997-2009, 2010-2014, 2015-2019, 2020-2024, 2025. All panels use 0-100%.',9)
pop_counts=[sum(bool(r['year']) and lo<=r['year']<=hi and r['lo']>=100000 for r in rows) for lo,hi,_ in years]
text(72,430,'Popular games per period (denominators): '+', '.join(f'{v:,}' for v in pop_counts)+'. Six selected genres.',9)
with (P/'plot-09-owner-shares.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=list(audit[0]));writer.writeheader();writer.writerows(audit)
end(9,'Which genres make up popular games?','Q13: How have popular game genres changed over time? (release-cohort proxy)',[
 'Black dot = one genre/period; height = % of popular games from that period belonging to the genre (quantitative).',
 'Left-to-right position = ordered release cohort; panel title = genre. Lines connect cohorts; labels round to whole %. '
], 'Draw six sets of axes. In each, place five dots, connect them with straight lines, and write the percentages.',
 'Games may have several genres, so shares overlap. Snapshot owners favor older titles; this is not past player activity.')
teal,orange,gray=saved_colors

# 10 comparative prevalence fingerprints
start(10,'The high-reach fingerprint','Q15. What characteristics commonly co-occur among highly successful Steam games?')
valid=[r for r in rows if r['hi']>0];high=[r for r in valid if r['lo']>=1000000]
features=[('Indie',lambda r:'Indie' in r['genres']),('Action',lambda r:'Action' in r['genres']),('Price <= $10',lambda r:r['price']<=10),('Reviews >= 80% *',lambda r:r['reviews']>=50 and r['rating']>=80),('Avg. playtime >= 10h *',lambda r:r['hours']>=10),('2 or 3 platforms',lambda r:r['platforms']>=2)]
for i,(label,fn) in enumerate(features):
 y=149+i*40;text(37,y+6,label,11);a=100*sum(fn(r) for r in valid)/len(valid);b=100*sum(fn(r) for r in high)/len(high)
 line(230,y,230+4.3*a,y,gray,5);line(230,y+13,230+4.3*b,y+13,teal,5);text(680,y+9,f'{a:.0f}% / {b:.0f}%',9)
joint=lambda r:'Action' in r['genres'] and r['price']<=10 and r['platforms']>=2
text(37,411,f'Example joint profile: Action + <=$10 + 2/3 OS = {100*sum(joint(r) for r in high)/len(high):.1f}% of high-reach games',10)
text(37,428,f'All known-owner games n={len(valid):,}; high-reach games n={len(high):,}',9)
end(10,'The high-reach fingerprint','Q15: common characteristics and combinations',[
 'Paired strokes = share of games satisfying a feature; length on a shared 0-100% scale = prevalence (quantitative).',
 'Gray = all known-owner games; teal = owner lower bound >=1m. Labels = categorical/binary features. Joint count below.'
], 'Draw paired bars like fingerprints. Then connect selected features and write their jointly matching share underneath.',
 '* Missing reviews/playtime do not satisfy the feature. Marginal bars cannot identify the most common joint combination.')

c.save()
md='''# Map to Sketch: Steam games\n\nThese are digital reference sketches for a pen-and-paper assignment. Redraw at least five with a Sharpie, include each legend, and photograph the physical sketches for submission. Ten references cover Q1-Q12 and Q15, plus an explicit cohort proxy for Q13. The simplified ninth sketch focuses on owner reach; Q14 is no longer shown. Each explores a separate question or closely related question family rather than one dashboard answering everything.\n\n## Grounding and processing\n\nSource: `MS2.docx` and `dataset/games.csv` in this project. The CSV header has 39 names for 40 values; split `DiscountDLC count` into `Discount` and `DLC count` before reading later fields. Every row is checked for the corrected width. The CSV, not the JSON twin, is the canonical source for these sketches because they have different row counts.\n\n'''
md+=f'Parsed {len(rows):,} CSV rows. Owner ranges are estimates; 0-0 bands are excluded from owner comparisons. No owner measure is sales, revenue or unique active players. Steam sentiment = Positive/(Positive+Negative), restricted to >=50 reviews. Lifetime average playtime is converted from minutes to hours; zero reports are excluded as ambiguous/missing. Peak CCU is used under its field name because its time window is not independently documented here. Language count is the count of distinct parsed list entries; platform count is the sum of Windows/Mac/Linux flags.\n\n'
md+='Selected genres are examples, not an exhaustive ranking. Multi-genre membership is retained, so genre counts overlap. Group means use equal title weights; pooled review-vote percentages answer a different question. Real sampled dots are seeded for reproducibility and should not be used to claim whole-dataset trends. Price bands are (0,5], (5,10], (10,20], (20,40], >40 and free separately. High reach means owner-band lower bound >=1,000,000; it is an adjustable, nonfinancial definition of success.\n\nNo chart establishes that adding languages, platforms, achievements or DLC causes success. The dataset does not identify studio headcount, development costs or historical ownership/player trajectories. Q13 needs repeated dated snapshots for an actual historical-popularity answer. The fingerprint gives marginal prevalence and one real joint example; a later explorer must count candidate combinations directly to rank joint profiles, ideally within genre and release cohorts.\n\n'
for n,title,q,legend,draw,caveat in notes:
 md+=f'## {n}. {title}\n\n**Question:** {q}.\n\n![{title}](sketch-{n:02}.png)\n\n**Visual encoding legend**\n\n'+''.join('- '+s+'\n' for s in legend)+f'\n**Paper drawing:** {draw}\n\n**Interpretation:** {caveat}\n\n'
md+='## Implementation direction\n\nAll sketches can be implemented with basic text, points, strokes, circles and rectangles. Group and aggregate before rendering; use AppID for title-level drill-down. Later interactions could reveal game names and owner bands, change the success threshold, compare genre and release cohorts, or expand platform counts to actual OS combinations. For the clock shop, add quarter-turn ticks when redrawing; the shared scale and printed hour labels prevent confusing clock time with duration.\n\nKeep the hand sketches rough: aim for 3-5 minutes per concept. Retain alternative forms rather than choosing a final design now.\n'
(P/'sketch-notes.md').write_text(md)
(P/'data-audit.json').write_text(json.dumps({'csv_rows':len(rows),'corrected_columns':len(header),'questions':list(range(1,16)),'q13':'Release-cohort proxy only; historical trajectories unavailable','high_reach_games':len(high)},indent=2))
print('Created 10-page PDF, sketch notes and data audit:',len(rows),'CSV rows')

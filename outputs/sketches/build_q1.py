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
c=canvas.Canvas(str(P/'q1-alternatives.pdf'),pagesize=(W,H))
c.setTitle('Q1 - Three alternative sketches');c.setAuthor('CS1710 project sketch references')
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

q='Q1. Which game genres tend to attract the largest number of players?'
known={g:[r for r in bygenre[g] if r['hi']>0] for g in genres}
avgs={g:mean([r['owners'] for r in known[g]]) for g in genres}
order=sorted(genres,key=avgs.get,reverse=True)
start(1,'A / The audience balloon garden',q)
for i,g in enumerate(order):
 x=125+(i%4)*181;y=203+(i//4)*149;v=avgs[g];radius=43*math.sqrt(v/max(avgs.values()))
 line(x,y+radius,x,y+57,gray,.8);dot(x,y,radius,teal,True)
 text(x-38,y-55,g,12);text(x-c.stringWidth(fmt(v),'Helvetica',13)/2,y+4,fmt(v),13)
 text(x-60,y+73,f'mean owners; n={len(known[g]):,}',8.5)

end(1,'Audience balloon garden',q,[
 'Circle area = mean owner-band midpoint per game (quantitative); radius is proportional to square root of that mean.',
 'Label + grid position identify genre (nominal). Strings are decorative. Printed values show approximate mean owners.'
], 'Draw eight balloons of different sizes, label the genre above and mean owners inside. Keep one common area scale.',
 'A few blockbusters can inflate means. Excludes 0-0 owner bands; genres overlap. Owners are not active players.')

start(2,'B / A hundred games in each genre',q)
proportions={}
for i,g in enumerate(order):
 rs=known[g];counts=[sum(r['owners']<100000 for r in rs),sum(100000<=r['owners']<1000000 for r in rs),sum(r['owners']>=1000000 for r in rs)]
 vals=[100*n/len(rs) for n in counts];allocated=[math.floor(v) for v in vals]
 for k in sorted(range(3),key=lambda k:vals[k]-allocated[k],reverse=True)[:100-sum(allocated)]:allocated[k]+=1
 proportions[g]=vals;x=60+(i%4)*185;y=163+(i//4)*139
 text(x,y-12,g,12)
 for k in range(100):
  col=gray if k<allocated[0] else teal if k<allocated[0]+allocated[1] else orange
  dot(x+(k%10)*11,y+(k//10)*8,2.4,col,open=col==gray)
 text(x-5,y+88,f'<100k {vals[0]:.1f}% | 100k-1m {vals[1]:.1f}%',8)
 text(x-5,y+101,f'>=1m {vals[2]:.1f}% | n={len(rs):,}',8)
end(2,'A hundred games in each genre',q,[
 'Each 10x10 grid = 100% of eligible titles in one genre; each dot = 1 percentage point, not one literal game.',
 'Hollow gray = midpoint <100k; solid teal = 100k to <1m; solid orange = >=1m estimated owners (ordered bands).'
], 'Draw 100 small circles per genre, then shade by reach band. For a faster rough sketch, use a rectangle split into bands.',
 'Dots use largest-remainder rounding to total 100%; labels show unrounded shares to 0.1%. Excludes 0-0 owner bands.')

start(3,'C / Genre fireflies: concurrent players',q)
# Display sampled real games; full-group mean and median retain the genre-level comparison.
maxccu=max(r['ccu'] for r in rows);logmax=math.ceil(math.log10(1+maxccu))
def xx(v):return 169+477*math.log10(1+v)/logmax
for v in [0,10,100,1000,10000,100000,1000000]:
 if math.log10(1+v)<=logmax:
  x=xx(v);line(x,139,x,382,'#DDDAD0',.6);text(x-8,402,fmt(v),8)
ccuorder=sorted(genres,key=lambda g:mean([r['ccu'] for r in bygenre[g]]),reverse=True)
for i,g in enumerate(ccuorder):
 rs=bygenre[g];y=154+i*30;v=mean([r['ccu'] for r in rs]);med=median([r['ccu'] for r in rs]);text(35,y+4,g,11)
 for r in sample(rs,70):dot(xx(r['ccu']),y+rng.uniform(-8,8),1.8,gray,True)
 dot(xx(v),y,4,teal);line(xx(med),y-10,xx(med),y+10,orange,2)
 text(664,y+3,f'mean {v:.0f}; med {med:.0f}',8)
text(248,426,'Peak CCU: 0, then powers of ten (log10(1+CCU))',10)
end(3,'Genre fireflies',q,[
 'Hollow dot = one real sampled title (70 per genre); x = Peak CCU (quantitative); y lane = genre (nominal).',
 'Solid teal dot = full-genre mean; orange vertical tick = full-genre median. Vertical jitter only separates overlapping dots.'
], 'Draw one horizontal swarm per genre on a shared ruler. Add a large mean dot and a short median tick.',
 'Includes CCU zeros. CCU is not total owners or unique genre players; the field\'s observation window is unverified.')
c.save()
md='# Q1: Three additional sketch alternatives\n\n**Question:** Which game genres tend to attract the largest number of players?\n\nThese are digital references to redraw on paper. All values come from the corrected local CSV (125,855 games); the original sketchbook is unchanged. Eight selected genre labels are compared, not the complete set of genres. Games can belong to multiple genres, so no genre totals should be added as unique players.\n\n'
for n,title,question,legend,draw,caveat in notes:
 md+=f'## {n}. {title}\n\n![{title}](q1-{n}.png)\n\n'+''.join('- '+x+'\n' for x in legend)+f'\n**Draw:** {draw}\n\n**Limit:** {caveat}\n\n'
md+='## Which is most useful?\n\nThe hundred-game grids best answer which genres *tend* to reach a large audience because they expose the proportion of titles in each reach band. The balloons give an immediate comparison but are sensitive to blockbuster outliers. The fireflies provide a different definition of players: concurrent users rather than estimated owners. None of these measures is revenue or profitability.\n'
(P/'q1-notes.md').write_text(md)
print('Created q1-alternatives.pdf and q1-notes.md')

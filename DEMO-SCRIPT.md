# Demo script · 5 minutes

Page: http://127.0.0.1:5173/cs1710-steam-reach/ (fallback: https://rongzhichen.github.io/cs1710-steam-reach/)
Start state: reloaded, threshold 100,000, nothing selected, three Peer-lab boxes off.
[Brackets] are actions for the driver. Everything else is spoken.

## 0:00 · Opening

[Top of the page. Do not scroll yet.]

"Our data story is for solo developers and small studios about to put a game on Steam. They are choosing a genre, a price and a scope, usually with one chance to get it right. Our data is the Kaggle Steam Games Dataset, about 125,000 games, of which 99,754 have a SteamSpy owner estimate and a genre. 'Reach' throughout means the lower bound of that owner band. It is not sales, revenue or active players."

## 0:30 · Section 1, the hook

[Scroll to the large 85% figure.]

"We open with the number every developer hears. Eighty-five percent of games that reached a hundred thousand owners cost ten dollars or less, free games included. Half of them sit on the zero-to-five-dollar shelf alone. The obvious lesson is: price low. But this chart only says where the successful games are. It does not say how often a game on that shelf succeeds."

## 0:55 · Section 2, counts mislead

[Scroll to the grey-and-blue bars. Point at $0–5, then $20–40.]

"Divide each shelf by itself and the picture flips. Grey is the share of all hits on each shelf. Blue is the reach rate inside the shelf. Among paid games, about seven percent of the zero-to-five shelf reaches a hundred thousand owners. On the twenty-to-forty shelf it is about eighteen percent. The cheap shelf has the most hits simply because it has sixty-one thousand games on it. We are careful here: this does not mean raising your price raises your reach. Thirty-dollar games are made by different teams with different budgets. It means the right comparison is a rate among comparable games."

## 1:25 · Section 3, genre

[Scroll to the genre chart. Change the dropdown from RPG to Action. Pause one second. Change it back to RPG.]

"The store-wide rate is still the wrong baseline, because genres differ. This selector compares any genre with the store. For RPGs, the twenty-to-forty shelf reaches a hundred thousand owners about twenty-two percent of the time, against eighteen percent across all genres."

## 1:45 · Section 4, traits

[Scroll to the trait tiles. Point at the playtime tile.]

"Once the peer group is right, the profile of its successful games changes too. Successful RPGs priced ten to twenty dollars report six or more hours of average playtime eighty-two percent of the time, against forty-seven percent for all successful games. Only a quarter of them ship on two or more platforms. These are observed traits of games that made it, not a recipe."

## 2:05 · Section 6, the comparison tool

[Scroll to the bubbles. Hover the RPG bubble so the tooltip shows. Click RPG. Click the $10–20 shelf. Point at the tiles, then the table.]

"The message of the story is: compare rates among your real peers. This tool is that message as an interaction. Bubble area is the reach rate per genre, so the first thing a visitor sees is a rate, not a count. I pick RPG, and the shelves recompute for RPGs only. I pick the ten-to-twenty shelf. The tiles now compare successful RPGs on that shelf with all successful games, and the table names the actual peers. The threshold control at the top changes what counts as success."

## 2:40 · Explore

[Scroll to the scatter. Drag a box across the dense middle of the plot. Click the RPG bar on the right. Click 'Clear selection'.]

"For visitors who want to ask their own question, every dot is one game, price against owner band, about a hundred thousand of them on a canvas with SVG axes and a D3 brush on top. I brush a region, and the genre mix and trait panels recompute for the selected games against the all-games tick. Clicking a genre highlights its dots and narrows the trait panel. Clear resets it."

## 3:05 · Peer lab, the new work

[Scroll to the Peer lab. Point at the selects showing RPG and $10–20. Tick '5+ languages'. Tick 'One platform'. Tick 'Early Access'. Open 'View exact counts and intervals'.]

"This is the main addition since our first check. The genre and price I chose above came along; they are shared state. Each checkbox keeps only the games that pass every condition so far, and each row shows the rate, the count, and a ninety-five percent Wilson interval. RPG at ten to twenty dollars starts at three hundred fifteen of two thousand four hundred six, about thirteen percent. Add five or more languages: twenty-six percent. Add one platform: still about twenty-six. Add Early Access: twenty of one hundred twenty-two, about sixteen percent. The rate went up, but look at the whiskers. The interval is now eleven to twenty-four percent, and the page flags the group as small. A tighter comparison is not automatically a stronger answer. That is the point of this section."

## 3:55 · Threshold

[Change 'Owner threshold' in the Peer lab to 500,000. Point at the result. Change it back to 100,000.]

"We can also move the definition of success. At five hundred thousand owners, the same one hundred twenty-two games give five hits, about four percent. The threshold is one shared value across the tool, the explorer and the lab. The opening story stays fixed at a hundred thousand on purpose, so its argument does not change while you read it."

## 4:15 · Release year and language

[Scroll to the release-year chart. Point at 2025 and 2026. Then scroll to the language chart and point at the '10+ languages' pair.]

"Two context checks follow. Release year shows that older games have had longer to find an audience; it is a snapshot, not a sales history. The 2026 group is zero of thirty-one, which is a real zero and is shown differently from no data. Language support compares the store in grey with our peers in orange inside the same language band. For ten or more languages it is twenty-one percent against thirty-one. An association, not evidence that translations cause reach."

## 4:45 · Close

[Stay on the language chart.]

"So the narrative is complete and every interaction you saw is live. What remains is tightening the wording where the page sounds like advice, making the explorer's empty selection say 'no data' like the new charts do, and finishing the process book. We have two design questions for you when you are ready."

[Hand over.]

## If you are running long

Cut in this order: the Action-to-RPG dropdown switch (section 3), the 'Clear selection' click, the release-year chart. Never cut the Peer lab ladder or the threshold change.

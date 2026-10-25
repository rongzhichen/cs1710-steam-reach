#!/usr/bin/env python3
"""Build the small JSON files the website loads from the raw Kaggle CSV.

Input : dataset/games.csv  (Steam Games Dataset, Kaggle; not committed, ~383 MB)
Output: static/data/games.json    one compact row per game with an owner estimate
        static/data/summary.json  pre-aggregated tables and the numbers quoted in the story

Cleaning rules (documented in the process book, MS3 and MS5):
  * The CSV header has 39 names for 40 values: "DiscountDLC count" is split into
    "Discount" and "DLC count" so later columns line up.
  * Games whose estimated-owner band is "0 - 0" have no SteamSpy estimate and are
    excluded from every reach comparison (they are counted separately as noEstimate).
  * Reach = lower bound of the owner band. "Successful" = lower bound >= 100,000 by
    default; the site can raise it to 200k, 500k or 1M, so rows keep the raw bound.
  * Positive-review share uses only games with >= 50 reviews; others get -1.
  * Average lifetime playtime is converted from minutes to hours.
  * Language count = distinct entries in the parsed "Supported languages" list.
  * Platform count = number of true flags among Windows, Mac, Linux.
  * Genres: "Early Access" and "Free To Play" are store labels, not genres, and are
    dropped from the genre list (Early Access is kept as a per-game flag). The ten most
    common remaining genres become a bitmask; a game may hold several. Games in none
    of the ten (about 1,500, mostly utilities and software) are excluded, which is the
    rule the MS5 prototypes used; they are counted as noGenre.
  * Names are kept only for games at or above 100,000 owners (the named-games tables
    only ever show successful titles), which keeps games.json small.
Run:  python3 pipeline/build_data.py [--csv dataset/games.csv] [--out static/data]
"""
import argparse, ast, csv, json, os, sys, time
from collections import Counter, defaultdict

csv.field_size_limit(sys.maxsize)

PRICE_BANDS = [("Free", lambda p: p == 0), ("$0–5", lambda p: 0 < p <= 5),
               ("$5–10", lambda p: 5 < p <= 10), ("$10–20", lambda p: 10 < p <= 20),
               ("$20–40", lambda p: 20 < p <= 40), (">$40", lambda p: p > 40)]
THRESHOLDS = [100_000, 200_000, 500_000, 1_000_000]
OWNER_LABELS = {0: "0–20k", 20000: "20–50k", 50000: "50–100k", 100000: "100–200k",
                200000: "200–500k", 500000: "500k–1M", 1000000: "1–2M", 2000000: "2–5M",
                5000000: "5–10M", 10000000: "10–20M", 20000000: "20–50M",
                50000000: "50–100M", 100000000: "100M+"}


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def read_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        if header[7] == "DiscountDLC count":
            header[7:8] = ["Discount", "DLC count"]
        width = len(header)
        bad = 0
        for raw in reader:
            if len(raw) != width:
                bad += 1
                continue
            yield dict(zip(header, raw))
        if bad:
            print(f"skipped {bad} rows with unexpected width", file=sys.stderr)


def parse_game(r):
    try:
        lo, hi = (int(x) for x in r["Estimated owners"].split(" - "))
    except ValueError:
        return None
    try:
        langs = ast.literal_eval(r["Supported languages"]) or []
    except (ValueError, SyntaxError):
        langs = []
    pos, neg = num(r["Positive"]), num(r["Negative"])
    total = pos + neg
    rel = r["Release date"][-4:]
    return dict(
        name=r["Name"], price=round(num(r["Price"]), 2), lo=lo, hi=hi,
        genres=[g.strip() for g in r["Genres"].split(",") if g.strip()],
        pos=round(100 * pos / total, 1) if total >= 50 else -1, reviews=int(total),
        hours=round(num(r["Average playtime forever"]) / 60, 1),
        platforms=sum(r[k] == "True" for k in ("Windows", "Mac", "Linux")),
        languages=len(set(langs)), year=int(rel) if rel.isdigit() else 0,
        dlc=int(num(r["DLC count"])), achievements=int(num(r["Achievements"])),
    )


def band_index(price):
    return next(i for i, (_, test) in enumerate(PRICE_BANDS) if test(price))


def rate_table(games, key_fn, keys, thr):
    """Rows of {key, n, hits, rate, shareOfSuccess} for a grouping function."""
    n, hits = Counter(), Counter()
    for g in games:
        k = key_fn(g)
        if k is None:
            continue
        n[k] += 1
        hits[k] += g["lo"] >= thr
    total_hits = sum(hits.values())
    return [dict(key=k, n=n[k], hits=hits[k], rate=round(hits[k] / n[k], 4) if n[k] else 0,
                 shareOfSuccess=round(hits[k] / total_hits, 4) if total_hits else 0) for k in keys]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="dataset/games.csv")
    ap.add_argument("--out", default="static/data")
    a = ap.parse_args()
    t0 = time.time()

    all_rows = 0
    no_estimate = 0
    games = []
    for r in read_rows(a.csv):
        all_rows += 1
        g = parse_game(r)
        if g is None:
            continue
        if g["lo"] == 0 and g["hi"] == 0:
            no_estimate += 1
            continue
        games.append(g)
    print(f"parsed {all_rows:,} rows: {len(games):,} with an owner estimate, {no_estimate:,} without "
          f"({time.time() - t0:.0f}s)")

    NOT_GENRES = {"Early Access", "Free To Play"}
    genre_counts = Counter(x for g in games for x in g["genres"] if x not in NOT_GENRES)
    top_genres = [k for k, _ in genre_counts.most_common(10)]
    gidx = {k: i for i, k in enumerate(top_genres)}
    for g in games:
        g["mask"] = sum(1 << gidx[x] for x in g["genres"] if x in gidx)
        g["band"] = band_index(g["price"])
        g["ea"] = int("Early Access" in g["genres"])
    no_genre = sum(g["mask"] == 0 for g in games)
    games = [g for g in games if g["mask"]]
    print(f"kept {len(games):,} games in at least one of the ten genres; {no_genre:,} in none")

    # ---- games.json: compact rows -------------------------------------------------
    cols = ["name", "price", "ownerLow", "genreMask", "posPct", "hours", "platforms",
            "languages", "reviews", "year", "earlyAccess"]
    rows = [[g["name"] if g["lo"] >= 100_000 else "", g["price"], g["lo"], g["mask"], g["pos"],
             g["hours"], g["platforms"], g["languages"], g["reviews"], g["year"], g["ea"]]
            for g in games]
    os.makedirs(a.out, exist_ok=True)
    meta = dict(source="Steam Games Dataset (Kaggle), games.csv", csvRows=all_rows,
                N=len(games), noEstimate=no_estimate, noGenre=no_genre, defaultThreshold=100_000,
                built=time.strftime("%Y-%m-%d"))
    with open(os.path.join(a.out, "games.json"), "w", encoding="utf-8") as f:
        json.dump(dict(meta=meta, genres=top_genres, cols=cols, games=rows), f,
                  separators=(",", ":"), ensure_ascii=False)

    # ---- summary.json: aggregates for the story and a canonical number sheet --------
    paid = [g for g in games if g["price"] > 0]
    by_thr = {}
    for thr in THRESHOLDS:
        succ = [g for g in games if g["lo"] >= thr]
        by_thr[str(thr)] = dict(
            successful=len(succ),
            successfulAtMost10=round(sum(g["price"] <= 10 for g in succ) / len(succ), 4),
            price=rate_table(games, lambda g: PRICE_BANDS[g["band"]][0], [b for b, _ in PRICE_BANDS], thr),
            pricePaidOnly=rate_table(paid, lambda g: PRICE_BANDS[g["band"]][0], [b for b, _ in PRICE_BANDS][1:], thr),
            genre=                  [dict(key=k, n=sum(1 for g in games if g["mask"] >> i & 1),
                        hits=sum(1 for g in games if g["mask"] >> i & 1 and g["lo"] >= thr))
                   for i, k in enumerate(top_genres)],
        )
        for r in by_thr[str(thr)]["genre"]:
            i = gidx[r["key"]]
            r["rate"] = round(r["hits"] / r["n"], 4) if r["n"] else 0
            r["meanMid"] = round(sum((g["lo"] + g["hi"]) / 2 for g in games if g["mask"] >> i & 1) / max(1, r["n"]))
        # genre x price band rate matrix (rows = genres, cols = price bands)
        by_thr[str(thr)]["genrePrice"] = [
            [dict(n=len(s), hits=sum(g["lo"] >= thr for g in s))
             for b in range(len(PRICE_BANDS))
             for s in [[g for g in games if g["mask"] >> i & 1 and g["band"] == b]]]
            for i in range(len(top_genres))]

    owners = Counter(g["lo"] for g in games)
    owner_rows = [dict(band=OWNER_LABELS.get(k, str(k)), low=k, n=owners[k],
                       share=round(owners[k] / len(games), 4)) for k in sorted(owners)]

    # Storyboard numbers, each with its exact definition, so site and process book agree.
    thr = 100_000
    succ = [g for g in games if g["lo"] >= thr]
    rpg = gidx.get("RPG")
    rpg_20_40 = [g for g in games if g["mask"] >> rpg & 1 and g["band"] == 4]
    all_20_40 = [g for g in games if g["band"] == 4]
    paid_20_40 = [g for g in paid if g["band"] == 4]
    paid_0_5 = [g for g in paid if g["band"] == 1]
    rpg_10_20_succ = [g for g in succ if g["mask"] >> rpg & 1 and g["band"] == 3]
    indie = gidx.get("Indie")
    paid_indie = [g for g in paid if g["mask"] >> indie & 1]
    share = lambda s, f: round(sum(f(g) for g in s) / len(s), 4) if s else None
    story = dict(
        hook_successfulCostAtMost10=dict(value=share(succ, lambda g: g["price"] <= 10), n=len(succ),
                                         definition="share of games with >=100k owners priced <= $10, free included"),
        counts_rate_0_5=dict(value=share(paid_0_5, lambda g: g["lo"] >= thr), n=len(paid_0_5),
                             definition="paid games priced ($0, $5]: share with >=100k owners"),
        counts_rate_20_40=dict(value=share(paid_20_40, lambda g: g["lo"] >= thr), n=len(paid_20_40),
                               definition="paid games priced ($20, $40]: share with >=100k owners"),
        genre_rate_all_20_40=dict(value=share(all_20_40, lambda g: g["lo"] >= thr), n=len(all_20_40),
                                  definition="all genres, ($20, $40]: share with >=100k owners"),
        genre_rate_rpg_20_40=dict(value=share(rpg_20_40, lambda g: g["lo"] >= thr), n=len(rpg_20_40),
                                  definition="RPG, ($20, $40]: share with >=100k owners"),
        traits_hours6_allSuccessful=dict(value=share(succ, lambda g: g["hours"] >= 6), n=len(succ),
                                         definition="successful games with avg playtime >= 6 h"),
        traits_hours6_rpg_10_20=dict(value=share(rpg_10_20_succ, lambda g: g["hours"] >= 6), n=len(rpg_10_20_succ),
                                     definition="successful RPGs priced ($10, $20] with avg playtime >= 6 h"),
        traits_platforms2_allSuccessful=dict(value=share(succ, lambda g: g["platforms"] >= 2), n=len(succ),
                                             definition="successful games on 2+ operating systems"),
        traits_platforms2_rpg_10_20=dict(value=share(rpg_10_20_succ, lambda g: g["platforms"] >= 2), n=len(rpg_10_20_succ),
                                         definition="successful RPGs priced ($10, $20] on 2+ operating systems"),
        langs_paidIndie_5plus=dict(value=share([g for g in paid_indie if g["languages"] >= 5], lambda g: g["lo"] >= thr),
                                   n=sum(g["languages"] >= 5 for g in paid_indie),
                                   definition="paid Indie games with 5+ languages: share with >=100k owners"),
        langs_paidIndie_1to4=dict(value=share([g for g in paid_indie if 1 <= g["languages"] <= 4], lambda g: g["lo"] >= thr),
                                  n=sum(1 <= g["languages"] <= 4 for g in paid_indie),
                                  definition="paid Indie games with 1-4 languages: share with >=100k owners"),
        longTail_under20k=dict(value=round(owners[0] / len(games), 4), n=len(games),
                               definition="share of games with an estimate whose band is 0-20k"),
        longTail_reach100k=dict(value=round(len(succ) / len(games), 4), n=len(games),
                                definition="share of games with an estimate at >=100k owners"),
    )

    # Release-year cohorts (for the launch-window draft) and language groups.
    years = Counter(g["year"] for g in games if g["year"])
    year_rows = [dict(year=y, n=years[y], hits=sum(1 for g in games if g["year"] == y and g["lo"] >= thr))
                 for y in sorted(years) if years[y] >= 100]
    lang_groups = [("1", lambda n: n == 1), ("2–4", lambda n: 2 <= n <= 4), ("5–9", lambda n: 5 <= n <= 9),
                   ("10+", lambda n: n >= 10)]
    lang_rows = rate_table(games, lambda g: next((k for k, t in lang_groups if t(g["languages"])), None),
                           [k for k, _ in lang_groups], thr)

    summary = dict(meta=meta, genres=top_genres, priceBands=[b for b, _ in PRICE_BANDS],
                   thresholds=THRESHOLDS, owners=owner_rows, byThreshold=by_thr,
                   years=year_rows, languages=lang_rows, story=story)
    with open(os.path.join(a.out, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=1, ensure_ascii=False)

    # ---- audit printout -------------------------------------------------------------
    print("top genres:", top_genres)
    print(f"successful at 100k: {len(succ):,}")
    for k, v in story.items():
        print(f"  {k:36s} {v['value']:.3f}  (n={v['n']:,})  {v['definition']}")
    for p in ("games.json", "summary.json"):
        print(f"wrote {a.out}/{p}: {os.path.getsize(os.path.join(a.out, p)) / 1e6:.2f} MB")


if __name__ == "__main__":
    main()

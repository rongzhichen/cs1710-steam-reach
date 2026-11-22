# Final TF project check：演示与问答准备

会议：2026-11-04，15 分钟。准备稿核对日期：2026-11-03。
本稿依据当前本地代码、JSON 和浏览器实测。英文可直接练习；中文说明讲法和操作。

## 先记住这五句话

1. **Audience:** Solo Steam developers and small studios choosing a comparison group.
2. **Story:** Compare reach rates within similar games, rather than the number of visible hits.
3. **Definition:** Reach uses the lower bound of a SteamSpy owner band. It is not revenue or active players.
4. **Progress:** Three former drafts now run on game rows, with shared filters, counts and Wilson intervals.
5. **Remaining work:** Clarify the scope of the data and controls, test the deployed version, and finish the process book.

中文主线：看到低价爆款很多 → 发现分母不同 → 加入 genre → 比较同类特征 → 亲自筛选 → 发现样本越细，结论也越不确定。

## 会前启动

如果开发服务器已运行，直接打开页面。否则，在项目目录执行：

```bash
npm run dev -- --host 127.0.0.1
```

本地页面：[Steam prototype](http://127.0.0.1:5173/cs1710-steam-reach/)。保留终端运行。
如果端口被占用，使用终端实际显示的 URL，并保留 `/cs1710-steam-reach/` 路径。

已构建的生产版本也可预览：

```bash
npm run preview -- --host 127.0.0.1
```

预览通常使用 4173 端口，以终端输出为准。
仓库登记的[线上地址](https://rongzhichen.github.io/cs1710-steam-reach/)尚未在本次准备中核实。

## 5 分钟 live demo

先刷新页面，确认 threshold 为 100,000、没有 peer 筛选、三个复选框未勾选。
保留默认的 `share of successful games` bubble 指标。
按网页顺序走；每张图只讲一个信息。计时包含点击和滚动。

### 0:00–0:30｜入口与 hook

**操作：** 显示标题、85% 和第一张价格条形图。

> Our story is for solo developers and small studios deciding how to position a Steam game.
> We start with a tempting observation: about 85% of games reaching 100,000 owners cost ten dollars or less, including free games.
> But that describes where the high-reach games are. It does not tell us the reach rate within each price group.

**中文：** 先交代受众，再提出问题。85% 的分母是 8,703 个达到门槛的游戏。

### 0:30–0:55｜Counts mislead

**操作：** 显示第二张图，指向 $0–5 和 $20–40。

> Here we change the denominator. About 7% of paid games priced up to five dollars reach the threshold, compared with about 18% in the twenty-to-forty-dollar group.
> That does not mean raising the price causes greater reach. The games and teams in these groups differ.

**中文：** 灰色看成功游戏分布；蓝色看各价格组内部的触达率。不要把两个条件概率混为一谈。

### 0:55–1:15｜Genre

**操作：** 在第三张图把 RPG 切到 Action，再切回 RPG。

> Genre changes the comparison too. The selector compares each genre with the store baseline.
> For RPGs priced above twenty and up to forty dollars, the reach rate is about 22%, compared with 18% overall.

**中文：** 让 TF 看到选择后图确实更新。这里的 genre 控件只属于叙事图。

### 1:15–1:35｜Traits 与 Aha

**操作：** 显示第四张图，再经过 Aha 文案。

> The profile of successful peers also differs. For example, 82% of successful RPGs in the ten-to-twenty-dollar group report at least six hours of average playtime, compared with 47% of all successful games.
> These are observed characteristics, not a recipe for success.

**中文：** 这里的分母已变成“成功的 peers”。不能把玩家游玩时间当成开发者可直接选择的投入。

### 1:35–2:15｜Comparison tool

**操作：** 悬停 RPG bubble 显示 tooltip；点击 RPG，再点击 `$10–20` shelf。指向 trait tiles 和游戏表。

> The comparison tool turns that message into an interaction. I choose RPG, then the ten-to-twenty-dollar price group.
> The shelves show reach rates and sample sizes. The tiles compare successful peers with all successful games, and the table provides named examples.
> The bubble area defaults to reach rate, so the main encoding matches our story.

**中文：** tooltip 显示数量和触达率。20 格 shelf 每格约 5 个百分点，精确值看标签和 tooltip。

### 2:15–2:45｜Scatter explorer

**操作：** 进入 Explore；拖框选中有点的区域，再点击右侧/下方的 RPG 条形。窄屏时汇总面板在散点图下方。

> Visitors can also explore individual games. I brush a region of the scatterplot, and the genre and trait summaries update for those games.
> Clicking a genre highlights its dots and narrows the trait summary.
> We use Canvas for the roughly 100,000 dots, with SVG axes and a D3 brush.

**中文：** y 轴是 owner band，带内抖动用于减少重叠，不代表精确 owner 数。此处 genre 高亮与 Peer lab 的 genre 独立。

### 2:45–3:40｜Peer ladder：本次进展重点

**操作：** 进入 Peer lab。确认 RPG 和 `$10–20` 已带过来。依次勾选三个条件，展开精确数据表。

> The main addition is the peer lab. Genre and price carry over from the comparison tool.
> At 100,000 owners, this group has 315 qualifying games out of 2,406, or 13.1%.
> Each checkbox filters the previous group. After all three conditions, 20 of 122 games qualify, or 16.4%.
> The smaller denominator triggers a warning. The interval is much wider, so a more specific group is not automatically a stronger answer.

**中文：** 条件是 5+ languages、One platform、Early Access。最终 Wilson 区间为 10.9%–24.0%。

### 3:40–4:00｜Threshold 联动

**操作：** 在 Peer lab 将 Owner threshold 改为 500,000，指向 5/122；随后改回 100,000。

> We can test another reach definition. At 500,000 owners, five of these same 122 games qualify, or 4.1%.
> The threshold is shared across the interactive tools. The opening narrative stays fixed at 100,000 so its argument remains consistent.

**中文：** 阈值改变的是分子；genre、price 和三个特征不变时，分母仍为 122。

### 4:00–4:20｜Release year

**操作：** 显示 release-year 图，指向最近两个数据年份。

> This view checks release-year context within the selected genre and price group.
> It is a snapshot, not a sales timeline. Recorded dates can include scheduled releases, so lower rates in recent groups need careful interpretation.

**中文：** 当前显示 2015–2026。它们是数据中的最后 12 年，不是实时最近 12 年。

### 4:20–4:40｜Language support

**操作：** 显示 language 图，指向 store 与 peers 的一组对比。

> The language view compares the store and our peers within each language group.
> We include zero or unreported languages, and distinguish no matching data from zero qualifying games.
> These patterns do not prove that adding translations causes greater reach.

**中文：** 三个特征复选框只影响 ladder。下方两张图使用 genre、price 和 threshold。

### 4:40–5:00｜进度与反馈

> The narrative and the main interactions are implemented. The remaining work is to tighten the wording, verify the deployed build, and finish our process-book evidence.
> Our main design question is whether the peer lab makes the tradeoff between a closer comparison and a smaller sample clear enough.

**中文：** 如果实测后发现其他待办，按实际情况替换最后这段。不要承诺尚未确认的截止日期。

## 演示时可核对的数字

以下数字来自当前提交的 JSON；不是实时 Steam 数据。`built=2026-10-25` 是派生文件生成日期，不证明原始数据采集日期。

| 条件 | 达到 100k | 分母 | 触达率 | 95% Wilson 区间 |
|---|---:|---:|---:|---|
| 全部 eligible games | 8,703 | 99,754 | 8.7% | 8.6%–8.9% |
| 加 RPG | 2,208 | 18,624 | 11.9% | 11.4%–12.3% |
| 加 price > $10 且 ≤ $20 | 315 | 2,406 | 13.1% | 11.8%–14.5% |
| 再加 5+ languages | 191 | 735 | 26.0% | 22.9%–29.3% |
| 再加 One platform | 146 | 570 | 25.6% | 22.2%–29.4% |
| 再加 Early Access | 20 | 122 | 16.4% | 10.9%–24.0% |

最后一组若改为 **500k**：5/122，**4.1%**，区间 **1.8%–9.2%**。
只需熟记 85%、7% vs 18%、315/2,406 和 20/122；其余现场读图。

## TF 可能追问：全组都应会答

### 1. What is the main takeaway?

> Compare reach rates within a defined peer group, and read the denominator alongside the rate. Counts of visible hits can give a different impression.

中文：这是描述性比较工具，不是最优定价模型，也不预测你的游戏成功概率。

### 2. Where does the data come from? What did you exclude?

> We use a Kaggle Steam Games Dataset containing Steam API and SteamSpy fields. The raw file has 125,855 rows. We exclude 24,579 games without an owner estimate, then 1,522 without any of our ten selected genres. That leaves 99,754 eligible games.

中文：`0–0` 表示没有 owner estimate；`0–20k` 是有效区间，仍保留。排除规则会造成覆盖偏差。
不要把 99,754 说成所有 Steam 游戏。原始 CSV 未提交，本次也未重跑原始清洗。

### 3. How is the data loaded and transformed?

> A Python pipeline repairs a malformed CSV header, derives fields, and writes two JSON files. The browser fetches both files once. It expands compact rows for the interactive views and uses precomputed summaries for the narrative charts.

中文：表头 `DiscountDLC count` 要拆成两列，避免后续字段错位。数据随静态文件发布，没有后端查询。
`onMount` 在浏览器取数据，避免把约 4 MB 的游戏数据直接塞入预渲染 HTML。

### 4. What exactly does successful mean?

> The lower bound of the estimated-owner band must reach the selected threshold. We default to 100,000 and offer three higher thresholds. Ownership is not sales, revenue, profit or active players.

中文：门槛是项目选择，不能把“成功”解释为商业盈利。Free games 也可能达到 owner 门槛。

### 5. Why is 85% different from 7%?

> The 85% figure asks what fraction of high-reach games cost at most ten dollars, including free games. The 7% figure asks what fraction of paid games priced up to five dollars reach 100,000 owners. Their denominators and price groups differ.

中文公式：`P(price ≤ $10 | reach ≥ 100k)` 与 `P(reach ≥ 100k | $0 < price ≤ $5)`。
低价组游戏多，能容纳许多高触达游戏，同时组内触达率仍然较低。

### 6. How do linked views work?

> Svelte writable stores hold the dataset, threshold, peer genre and peer price. Derived values recompute the groups, and effects update the D3 views. The trait checkboxes are local state in the peer lab.

中文：

| 状态 | 影响范围 |
|---|---|
| `threshold` | Comparison tool、Explorer、Peer lab；不改变开头叙事 |
| `peerGenre`、`peerBand` | Comparison tool 和 Peer lab 的三张图 |
| 三个 trait checkboxes | 仅 Peer ladder |
| Explorer 的 brush、genre、Show | 仅 Explorer 内部；它也读取共享 threshold |
| StoryGenre 的下拉框 | 仅第三张叙事图 |

`Reset peer filters` 清空 peer 条件和三个复选框，**不重置 threshold**。
`Clear selection` 清除 Explorer 框选和局部 genre 高亮，**不把 Show 改回 all games**。

### 7. How is the ladder calculated?

> The ladder starts with all eligible games. Each enabled step filters the previous pool. For each pool, we count games whose owner-band lower bound reaches the threshold, then divide by the pool size.

中文：条件之间是 AND。可以跳过条件。条件顺序固定，不会因勾选顺序改变。
分母随条件缩小，触达率可以上升也可以下降。

### 8. Why show Wilson intervals? What do they mean?

> Wilson intervals describe binomial proportion uncertainty and remain bounded between zero and one. They work at zero hits and all hits. They do not account for SteamSpy estimation error, missing games or selection bias.

中文：不能把横线说成 SteamSpy owner 数的误差范围。数据也不是随机抽出的所有潜在游戏。
这里的区间用于提示小组比较不稳定，不证明总体成功概率。`n < 200` 是项目的提醒规则，不是显著性检验。

### 9. How do you distinguish missing data from zero?

> An empty group has no rate and displays No data. A nonempty group with no qualifying games has a zero rate and an interval. We also keep a separate zero-or-unreported language category.

中文例子：RPG、$10–20 下，0/unreported language 组是 No data；2026 release-year 组是 0/31，即 0%。
这一区分已在新增 RateChart 中实现；旧 Explorer 的空框选汇总仍把比例显示为 0%，是待统一的边界情况。

### 10. Why Canvas and SVG? How does brushing work?

> Canvas draws the game dots without creating roughly 100,000 SVG nodes. SVG supplies the axes and brush overlay. The brush tests each visible game's plotted coordinates, and the selected rows feed the linked summaries.

中文：选区变化后按当前显示条件重新计算。genre 点击高亮点，同时把 traits 限定到所选 genre。
y 轴按 band 排列；抖动种子固定为 42。$60 以上的点集中在 `$60+` 位置，原始价格仍保留。

### 11. Why use rates and these visual encodings?

> Rates expose the denominator. Bars support comparison against a common baseline. The ladder also shows counts and intervals. Bubble area uses a square-root radius scale so area represents the selected metric.

中文：新增三张图固定 0–100% 轴，方便切换条件后比较。代价是低触达率差别显得较小，可以请 TF 评价。
旧 shelf 的 20 格表达近似比例；不是每格一个游戏。

### 12. Does the language chart show that localization helps?

> It shows an association within observed groups. Budget, genre and game age can differ. Language support may also change after launch, so the chart cannot estimate the effect of adding translations.

中文：筛选之后依然没有控制所有混杂变量。playtime 和 review sentiment 属于结果特征，因此未作为 ladder 筛选条件。

### 13. What do the release-year groups tell you?

> They provide context for interpreting reach rates. Older games may have had more time to accumulate owners. We show the last twelve recorded years in this dataset, including dates that may have been scheduled releases.

中文：没有同一个游戏随时间的重复观测，不能讲成销量趋势、增速或玩家口味变化。

### 14. What are the main limitations?

> The data is a snapshot with estimated owner bands. We exclude games with no estimate. Prices and features may differ from their launch values. Genre groups overlap, and the data includes studios of many sizes. The comparisons are descriptive.

中文：面向小团队，不代表已筛出全是小团队的样本。genre 是多标签，各 genre 数量不能直接相加。
如果有人问精确采集日期：说明当前 metadata 只记录派生日期，需要核对原始来源，不猜日期。

## 代码现场导航

先在编辑器打开这些文件。TF 问到某段时，先用一句话解释，再跳到函数。

| TF 问题 | 文件与入口 | 需要指出的逻辑 |
|---|---|---|
| 页面结构和数据入口 | [page](/Users/rongzhi/Documents/CS1710groupProject/src/routes/+page.svelte:18) | `onMount` → `loadData` → `dataset.set`；错误提示 |
| CSV 修复和派生字段 | [pipeline](/Users/rongzhi/Documents/CS1710groupProject/pipeline/build_data.py:50) | `read_rows`、`parse_game`；owner/genre 排除 |
| 浏览器加载与字段映射 | [data](/Users/rongzhi/Documents/CS1710groupProject/src/lib/data.js:39) | Promise 缓存、两份 JSON、compact rows、固定抖动 |
| 跨视图联动 | [stores](/Users/rongzhi/Documents/CS1710groupProject/src/lib/stores.js:1) | `threshold`、`dataset`、`peerGenre`、`peerBand` |
| Bubble 与 shelf | [ComparisonTool](/Users/rongzhi/Documents/CS1710groupProject/src/lib/components/ComparisonTool.svelte:22) | D3 data join、sqrt radius、点击事件、下游 derived sets |
| Canvas 与 brush | [Explorer](/Users/rongzhi/Documents/CS1710groupProject/src/lib/components/Explorer.svelte:23) | `setup`、`draw`、`brushed`；`panel` 汇总 |
| 累积过滤 | [PeerLab](/Users/rongzhi/Documents/CS1710groupProject/src/lib/components/PeerLab.svelte:13) | 逐步过滤 pool；cohort 和 language 使用独立 peers |
| 分母和区间 | [analysis](/Users/rongzhi/Documents/CS1710groupProject/src/lib/analysis.js:2) | `reachStats`：空集返回 null；hits/n；Wilson |
| 区间与精确表格绘制 | [RateChart](/Users/rongzhi/Documents/CS1710groupProject/src/lib/components/RateChart.svelte:1) | 固定轴、SVG、No data、折叠表 |
| 自动验证 | [tests](/Users/rongzhi/Documents/CS1710groupProject/tests/analysis.test.js:1) | 真实计数、语言分组、空值/零值、阈值单调性 |

## “比第一次 check 改了什么”

以下对比由仓库的 V1/V2 文档和最新提交支持。第一次会议实际展示过什么，需要全组回忆确认。
只使用当时尚未完成的项目，不把本来已有的功能说成新增。

> Since the earlier prototype, we have implemented the three drafted views using the cleaned game rows: the cumulative peer ladder, release-year groups, and language comparisons.
> We linked genre and price to the existing comparison tool, and made the reach threshold shared across the interactive tools.
> We added sample sizes, Wilson intervals, small-group warnings and exact-count tables to make the limits of narrow comparisons visible.
> We also changed the default bubble metric to reach rate and replaced the draft's Windows-only filter with One platform, because the compact data stores platform count rather than platform identity.

中文迭代理由：

| 变化 | 为什么 |
|---|---|
| 三张静态 draft → 真数据交互 | 让访客检验自己的比较组 |
| 分散选择 → 共享 genre/price | 避免重新选组；保持比较对象一致 |
| 加 n、区间、提醒和表格 | 防止小样本的高比例给人过强信心 |
| 默认 midpoint mean → reach rate | 与主线指标一致；减少长尾均值的影响 |
| Windows only → One platform | 当前数据只有平台数，无法恢复具体平台 |

## 距离完成还剩什么

以下是建议的收尾顺序，尚未代替团队分配负责人或承诺时间。

1. **统一数据口径文案。** 把“whole store”解释为 eligible dataset。不要把无 owner estimate 等同于零销量。
2. **收紧推断语言。** 当前页面的“never pass 20,000”只能说明快照时处于低 owner band，不能说明以后也不会超过。
3. **统一空集显示。** 新增 RateChart 已区分 No data 和 0%；旧 Explorer 的空框选仍需同样区分。
4. **核实部署版本。** 本地可运行不等于线上已更新。会议前确认线上含 Peer lab，并保留本地备份。
5. **完成交互与可访问性检查。** 复查空框、极小组、键盘、窄屏、tooltip 和表格。筛选当前直接更新，不要声称已有动画过渡。
6. **补齐 process book。** 记录修改理由、实际贡献者、截图和已知限制。准备稿不能替代课程要求的 process book。

另一个可向 TF 请教的文案问题：页面的“one shot”和“budget for what peers share”可能让描述性分析听起来像投入建议。
讲解时强调探索和比较，不声称数据支持因果性的预算建议。

## 带去问 TF 的问题

选两个优先问，保留时间听反馈。

> Does the transition from successful-game counts to within-group reach rates make the change in denominator clear?

中文：观众是否真的理解 85% 和触达率回答不同的问题？

> Does the ladder communicate the tradeoff between a closer comparison and a smaller sample, or do the percentages still look too certain?

中文：样本量、区间和小样本提醒是否够用？

> Would you keep the fixed zero-to-one-hundred-percent axis for stable comparisons, or use another approach to make the low rates easier to compare?

中文：统一坐标轴与可读性怎么平衡？

> Would you keep the release-year view as context, given the snapshot and scheduled-release limitations?

中文：这张图是否值得保留，还是限制让它容易误导？

## 今晚全组排练与明天检查

全员必须到场；全员都要能回答任何部分。主讲分工不能替代交叉学习。

1. 确认 TF 时间、地点或会议链接。
2. 确认三名成员都能出席。
3. 指定一位成员控制浏览器，另一位计时。
4. 按上面的路线完整演示一次，限制为 5 分钟。
5. 交换提问：每人解释一个不是自己写的组件。
6. 分别口述数据流、linked views、分母和空数据逻辑。
7. 确认各人实际贡献，避免凭提交作者推定职责。
8. 开会前 10 分钟启动服务器并刷新原型。
9. 检查所有图已加载，恢复默认筛选。
10. 打开准备稿、核心代码文件和 process book。
11. 保留本地页面作为演示备份。

15 分钟可按以下节奏准备：5 分钟 demo；约 7 分钟问答；约 3 分钟讨论剩余工作与反馈。
实际以 TF 的安排为准。若 TF 提前打断，直接回答，随后接回当前视图。

## 本次核实记录（2026-11-03）

- `npm run build`：通过，静态站点写入 `build/`。
- `node --test tests/analysis.test.js`：4/4 通过。
- 浏览器实测：StoryGenre 切换；RPG bubble 与 price shelf 点击；tooltip；trait tiles 和游戏表更新。
- 浏览器实测：Peer lab 继承选择；三个 checkbox；20/122；精确表与区间；500k 后 5/122；reset。
- 浏览器实测：scatter 框选；genre 高亮与 trait 联动；clear；successful only 显示 8,703。
- 当前检查操作后，浏览器日志未返回 error 或 warn。
- 未核实：线上部署、所有筛选组合、完整键盘路径、所有屏幕尺寸、网络失败复现、从原始 CSV 重建。

本次没有修改应用代码，没有提交或部署。

## 补充核实（2026-11-03 晚）

- 线上地址已核实：https://rongzhichen.github.io/cs1710-steam-reach/ 与本地 `build/` 内容一致，含 Peer lab；最近一次部署来自 Jack 的提交 `41f7e6d`（GitHub Actions 成功）。
- 线上实测：RPG → $10–20 → 三个复选框 → 20/122，16.4%，区间 10.9%–24.0%；阈值 500k → 5/122；散点框选、genre 高亮和 trait 联动均正常。
- 端口 5173 已被你自己运行中的 `vite dev --host 127.0.0.1` 占用，明天直接使用 http://127.0.0.1:5173/cs1710-steam-reach/ 即可。
- 一页英文速查卡见 [MEETING-CARD.md](MEETING-CARD.md)。

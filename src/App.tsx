import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const POSTER_WIDTH = 1280;
const POSTER_HEIGHT = 1920;
const BLUE = "#124f90";
const RULE = "#a8aaad";

type PosterData = {
  date: string;
  station: string;
  banner: string;
  title: string;
  body: string;
  tip: string;
  bodyColor: string;
  titleColor: string;
  stationColor: string;
  tipColor: string;
};

const initialData: PosterData = {
  date: "2026-08-21",
  station: "南京内保",
  banner: "高校反诈在行动  平安守护你我他",
  title: "盗取账号类诈骗",
  body: "8月12日，某高校学生小明在浏览黄色网站时，出于好奇下载了一款色情卡牌类游戏APP，并使用自己的手机号注册登录，短暂使用后便将APP删除，并未察觉异常。次日，小明发现自己手机上的微信被异常登出，其重新登录后并未引起重视。直至8月18日，小明收到美团还款提示，才发现其美团月付账号产生多笔非本人操作消费，被盗刷损失共计3000余元。",
  tip: "账号安全时刻设防\n陌生软件切勿下载",
  bodyColor: "#050505",
  titleColor: "#124f90",
  stationColor: "#555b62",
  tipColor: "#e59a4b",
};

type LunarInfo = { monthDay: string; yearName: string; zodiac: string };

function lunarDayName(value: string) {
  const day = Number(value);
  if (day <= 0 || day > 30) return value;
  if (day === 10) return "初十";
  if (day === 20) return "二十";
  if (day === 30) return "三十";
  const prefix = day < 10 ? "初" : day < 20 ? "十" : "廿";
  return `${prefix}${"一二三四五六七八九"[(day - 1) % 10]}`;
}

function getLunarInfo(dateText: string): LunarInfo {
  const date = new Date(`${dateText}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return { monthDay: "", yearName: "", zodiac: "" };
  const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const relatedYear = Number(value("relatedYear")) || date.getFullYear();
  const zodiac = "鼠牛虎兔龙蛇马羊猴鸡狗猪"[(relatedYear - 4) % 12] ?? "";
  return { monthDay: `${value("month")}${lunarDayName(value("day"))}`, yearName: value("yearName"), zodiac };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function asset(path: string) {
  return new URL(path, document.baseURI).href;
}

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width = 3) {
  ctx.beginPath();
  ctx.strokeStyle = RULE;
  ctx.lineWidth = width;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function wrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    if (char === "\n") {
      if (current) lines.push(current);
      current = "";
    } else if (current && ctx.measureText(current + char).width > maxWidth) {
      lines.push(current);
      current = char;
    } else current += char;
  }
  if (current) lines.push(current);
  return lines;
}

function drawFittedBody(ctx: CanvasRenderingContext2D, text: string, color: string) {
  const maxWidth = 750;
  const maxHeight = 880;
  let size = 52;
  let lines: string[] = [];
  let lineHeight = 76;
  while (size >= 38) {
    ctx.font = `${size}px "Noto Serif SC Variable", serif`;
    lineHeight = Math.round(size * 1.48);
    lines = wrappedLines(ctx, text, maxWidth);
    if (lines.length * lineHeight <= maxHeight) break;
    size -= 2;
  }
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  lines.forEach((line, index) => ctx.fillText(line, 56, 730 + index * lineHeight));
}

function drawVerticalText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  [...text].forEach((char, index) => ctx.fillText(char, x, y + index * spacing));
}

function drawFooterItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  label: string,
  kind: "report" | "warning" | "identity" | "query",
) {
  const color = "#7885b8";
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (kind === "report") {
    ctx.beginPath();
    ctx.moveTo(x - 39, 1717);
    ctx.quadraticCurveTo(x - 30, 1763, x + 13, 1780);
    ctx.quadraticCurveTo(x + 28, 1786, x + 37, 1772);
    ctx.lineTo(x + 17, 1756);
    ctx.quadraticCurveTo(x + 8, 1765, x - 3, 1757);
    ctx.lineTo(x - 18, 1744);
    ctx.quadraticCurveTo(x - 26, 1735, x - 18, 1727);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(x + 1, 1704, 42, 31);
    ctx.beginPath();
    ctx.moveTo(x + 11, 1714); ctx.lineTo(x + 34, 1714);
    ctx.moveTo(x + 11, 1724); ctx.lineTo(x + 27, 1724);
    ctx.stroke();
  } else if (kind === "warning") {
    ctx.beginPath();
    ctx.moveTo(x, 1705); ctx.lineTo(x + 43, 1778); ctx.lineTo(x - 43, 1778); ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, 1728); ctx.lineTo(x, 1753); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, 1766, 3, 0, Math.PI * 2); ctx.fill();
  } else if (kind === "identity") {
    const s = 34;
    ctx.beginPath();
    ctx.moveTo(x - s, 1723); ctx.lineTo(x - s, 1708); ctx.lineTo(x - 18, 1708);
    ctx.moveTo(x + 18, 1708); ctx.lineTo(x + s, 1708); ctx.lineTo(x + s, 1723);
    ctx.moveTo(x - s, 1762); ctx.lineTo(x - s, 1778); ctx.lineTo(x - 18, 1778);
    ctx.moveTo(x + 18, 1778); ctx.lineTo(x + s, 1778); ctx.lineTo(x + s, 1762);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x, 1734, 15, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, 1765, 24, Math.PI, Math.PI * 2); ctx.stroke();
  } else {
    ctx.strokeRect(x - 31, 1704, 52, 72);
    ctx.beginPath();
    ctx.moveTo(x - 18, 1722); ctx.lineTo(x + 8, 1722);
    ctx.moveTo(x - 18, 1737); ctx.lineTo(x + 2, 1737);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 23, 1758, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 36, 1771); ctx.lineTo(x + 49, 1784); ctx.stroke();
  }

  ctx.font = "28px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x, 1834);
  ctx.restore();
}

async function paintPoster(canvas: HTMLCanvasElement, data: PosterData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  await document.fonts?.ready;
  const [qr, emblem, officer] = await Promise.all([
    loadImage(asset("media/anti-fraud-qr.png")),
    loadImage(asset("media/police-emblem.png")),
    loadImage(asset("media/officer-tip.png")),
  ]);
  const [year = "", rawMonth = "", rawDay = ""] = data.date.split("-");
  const month = String(Number(rawMonth || 0));
  const day = String(Number(rawDay || 0));
  const lunar = getLunarInfo(data.date);

  ctx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  ctx.fillStyle = BLUE;
  ctx.font = "500 160px 'LXGW WenKai', cursive";
  ctx.textAlign = "center";
  ctx.fillText("反诈日历", 443, 295);

  drawLine(ctx, 875, 96, 875, 327, 4);
  drawLine(ctx, 1114, 96, 1114, 327, 4);
  drawLine(ctx, 913, 146, 1080, 146, 2);
  drawLine(ctx, 913, 277, 1080, 277, 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "#163e65";
  ctx.font = "48px 'Noto Serif SC Variable', serif";
  ctx.fillText(`${year}/${month}`, 995, 135);
  ctx.fillStyle = BLUE;
  ctx.font = "100 112px 'Noto Serif SC Variable', serif";
  ctx.fillText(day, 995, 258);
  ctx.fillStyle = "#163e65";
  ctx.font = "38px 'Noto Serif SC Variable', serif";
  ctx.fillText(lunar.monthDay, 995, 320);
  ctx.fillStyle = "#164a79";
  ctx.font = "30px 'Noto Serif SC Variable', serif";
  drawVerticalText(ctx, `农历${lunar.yearName}年/${lunar.zodiac}年`, 1180, 86, 33);

  ctx.fillStyle = "#27568d";
  ctx.fillRect(38, 405, 810, 88);
  ctx.fillStyle = "#fff";
  ctx.font = "43px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "center";
  ctx.fillText(data.banner, 443, 465);
  ctx.drawImage(emblem, 886, 395, 80, 80);
  ctx.fillStyle = data.stationColor;
  ctx.font = "700 49px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "left";
  ctx.fillText(data.station, 978, 460);

  drawLine(ctx, 27, 503, 1228, 503, 4);
  drawLine(ctx, 875, 503, 875, 1652, 3);
  ctx.fillStyle = data.titleColor;
  ctx.textAlign = "center";
  ctx.font = "500 68px 'LXGW WenKai', cursive";
  ctx.fillText(data.title, 451, 643);
  drawFittedBody(ctx, data.body, data.bodyColor);

  ctx.drawImage(officer, 890, 560, 205, 191);
  ctx.fillStyle = BLUE;
  ctx.font = "700 54px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "left";
  ctx.fillText("警方", 1094, 625);
  ctx.fillText("提示", 1094, 707);
  const tipColumns = data.tip.split(/\n+/).filter(Boolean).slice(0, 2);
  ctx.fillStyle = data.tipColor;
  ctx.font = "52px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "center";
  tipColumns.forEach((column, index) => drawVerticalText(ctx, column, 1125 - index * 100, 850, 78));

  drawLine(ctx, 57, 1652, 1262, 1652, 4);
  ctx.drawImage(qr, 176, 1692, 172, 172);
  ctx.fillStyle = "#8b8f94";
  ctx.font = "16px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "center";
  ctx.fillText("国家反诈中心APP", 262, 1892);
  drawLine(ctx, 426, 1674, 426, 1894, 1);
  drawFooterItem(ctx, 530, "报案", "report");
  drawFooterItem(ctx, 710, "预警", "warning");
  drawFooterItem(ctx, 895, "身份核实", "identity");
  drawFooterItem(ctx, 1085, "风险查询", "query");
  ctx.fillStyle = "#6f7899";
  ctx.font = "32px 'Noto Serif SC Variable', serif";
  ctx.textAlign = "center";
  ctx.fillText("就下“国家反诈中心APP”", 805, 1890);
}

export default function Home() {
  const [data, setData] = useState<PosterData>(initialData);
  const [notice, setNotice] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lunar = useMemo(() => getLunarInfo(data.date), [data.date]);
  const update = (field: keyof PosterData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((previous) => ({ ...previous, [field]: event.target.value }));
  const render = useCallback(async () => {
    if (!canvasRef.current) return;
    try { await paintPoster(canvasRef.current, data); }
    catch { setNotice("素材加载失败，请刷新页面后重试"); }
  }, [data]);
  useEffect(() => { void render(); }, [render]);

  const reset = () => { setData(initialData); setNotice("已恢复示例内容"); };
  const download = async () => {
    if (!canvasRef.current) return;
    setNotice("正在生成高清海报…");
    await paintPoster(canvasRef.current, data);
    canvasRef.current.toBlob((blob) => {
      if (!blob) { setNotice("生成失败，请刷新页面后重试"); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `反诈日历-${data.date || "海报"}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("1280 × 1920 PNG 已开始下载");
    }, "image/png");
  };

  return (
    <>
    <main className="app-shell">
      <section className="editor-panel">
        <div className="brand"><span>●</span> 反诈日历生成器</div>
        <p className="intro">填写内容，海报会按示例版式实时更新；预览与下载使用同一画布。</p>
        <div className="form-grid">
          <label>阳历日期<input type="date" value={data.date} onChange={update("date")} /></label>
          <label>自动匹配农历<input value={`农历${lunar.yearName}年/${lunar.zodiac}年 ${lunar.monthDay}`} readOnly className="read-only" /></label>
          <label>派出所名称<input value={data.station} onChange={update("station")} maxLength={8} /></label>
          <label>派出所名称颜色<span className="color-field"><input aria-label="派出所名称颜色" type="color" value={data.stationColor} onChange={update("stationColor")} /><code>{data.stationColor}</code></span></label>
          <label className="full">横幅宣传语<input value={data.banner} onChange={update("banner")} maxLength={24} /></label>
          <label>案例标题<input value={data.title} onChange={update("title")} maxLength={14} /></label>
          <label>正文标题颜色<span className="color-field"><input aria-label="正文标题颜色" type="color" value={data.titleColor} onChange={update("titleColor")} /><code>{data.titleColor}</code></span></label>
          <label className="full">警方提示语<textarea value={data.tip} onChange={update("tip")} maxLength={24} rows={3} /></label>
          <label>警方提示标语颜色<span className="color-field"><input aria-label="警方提示标语颜色" type="color" value={data.tipColor} onChange={update("tipColor")} /><code>{data.tipColor}</code></span></label>
          <label>正文颜色<span className="color-field"><input aria-label="正文颜色" type="color" value={data.bodyColor} onChange={update("bodyColor")} /><code>{data.bodyColor}</code></span></label>
          <label className="full">案例正文<textarea value={data.body} onChange={update("body")} maxLength={230} rows={9} /></label>
        </div>
        <p className="help">农历、干支和生肖会随阳历日期自动变化；正文会在固定区域内自动换行和缩放。</p>
        <div className="actions"><button className="secondary" onClick={reset}>恢复示例</button><button className="primary" onClick={download}>下载高清 PNG</button></div>
        <div className="notice" aria-live="polite">{notice}</div>
      </section>
      <section className="preview-wrap" aria-label="反诈日历海报预览"><canvas ref={canvasRef} className="poster-canvas" width={POSTER_WIDTH} height={POSTER_HEIGHT} /></section>
    </main>
    <footer className="disclaimer" role="note">免责声明：本网站仅提供海报生成功能，供反诈宣传使用；使用者应自行审核所填内容，本网站不对生成内容及其使用承担责任。</footer>
    </>
  );
}

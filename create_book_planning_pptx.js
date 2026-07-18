const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ── Nordic Modern Color Palette ──
const C = {
  darkBg: "1B2838",      // Deep navy
  medBg: "2C3E50",       // Medium navy
  lightBg: "F5F7FA",     // Off-white
  accent: "5B9BD5",      // Soft blue
  accentDark: "2E75B6",  // Deeper blue
  warm: "D4A574",        // Warm sand
  text: "2D3436",        // Dark text
  textLight: "636E72",   // Muted text
  white: "FFFFFF",
  cardBg: "EDF2F7",      // Light gray card
  green: "48BB78",       // Soft green
  coral: "E8735A",       // Soft coral
  sage: "7FB069",        // Sage green
};

// ── Icon Helpers ──
const { FaBook, FaChartLine, FaUsers, FaBullseye, FaRocket, FaLightbulb, FaCogs, FaBrain, FaMoneyBillWave, FaBullhorn, FaCalendarAlt, FaHandshake, FaCheckCircle, FaGlobe, FaSearch } = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── Slide Note Helper ──
function slideNote(text) {
  return { notes: text };
}

// ── Shadow Factory ──
const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.10 });

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "ABC-RAG Team";
  pres.title = "AI 시대, 데이터로 도서를 기획하다";

  // Pre-render icons
  const icons = {
    book: await iconToBase64Png(FaBook, "#5B9BD5"),
    chart: await iconToBase64Png(FaChartLine, "#5B9BD5"),
    users: await iconToBase64Png(FaUsers, "#5B9BD5"),
    bullseye: await iconToBase64Png(FaBullseye, "#5B9BD5"),
    rocket: await iconToBase64Png(FaRocket, "#5B9BD5"),
    lightbulb: await iconToBase64Png(FaLightbulb, "#D4A574"),
    cogs: await iconToBase64Png(FaCogs, "#5B9BD5"),
    brain: await iconToBase64Png(FaBrain, "#5B9BD5"),
    money: await iconToBase64Png(FaMoneyBillWave, "#48BB78"),
    bullhorn: await iconToBase64Png(FaBullhorn, "#5B9BD5"),
    calendar: await iconToBase64Png(FaCalendarAlt, "#5B9BD5"),
    handshake: await iconToBase64Png(FaHandshake, "#D4A574"),
    check: await iconToBase64Png(FaCheckCircle, "#48BB78"),
    globe: await iconToBase64Png(FaGlobe, "#5B9BD5"),
    search: await iconToBase64Png(FaSearch, "#5B9BD5"),
    bookWhite: await iconToBase64Png(FaBook, "#FFFFFF"),
    rocketWhite: await iconToBase64Png(FaRocket, "#FFFFFF"),
    lightbulbWhite: await iconToBase64Png(FaLightbulb, "#FFFFFF"),
    checkWhite: await iconToBase64Png(FaCheckCircle, "#FFFFFF"),
    chartWhite: await iconToBase64Png(FaChartLine, "#FFFFFF"),
    brainWhite: await iconToBase64Png(FaBrain, "#FFFFFF"),
    cogsWhite: await iconToBase64Png(FaCogs, "#FFFFFF"),
    moneyWhite: await iconToBase64Png(FaMoneyBillWave, "#FFFFFF"),
    bullhornWhite: await iconToBase64Png(FaBullhorn, "#FFFFFF"),
    calendarWhite: await iconToBase64Png(FaCalendarAlt, "#FFFFFF"),
    usersWhite: await iconToBase64Png(FaUsers, "#FFFFFF"),
    globeWhite: await iconToBase64Png(FaGlobe, "#FFFFFF"),
  };

  // ═══════════════════════════════════════════
  // SLIDE 1: Title
  // ═══════════════════════════════════════════
  let s1 = pres.addSlide();
  s1.background = { color: C.darkBg };
  // Top accent line
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });
  // Icon
  s1.addImage({ data: icons.bookWhite, x: 4.5, y: 0.8, w: 1, h: 1 });
  // Title
  s1.addText("AI 시대,\n데이터로 도서를 기획하다", {
    x: 0.5, y: 2.0, w: 9, h: 1.6, fontSize: 38, fontFace: "Georgia",
    color: C.white, bold: true, align: "center", lineSpacingMultiple: 1.3
  });
  // Subtitle
  s1.addText("YES24 IT/모바일 베스트셀러 데이터 기반 신규 도서 기획 제안", {
    x: 1, y: 3.7, w: 8, h: 0.6, fontSize: 16, fontFace: "Calibri",
    color: C.accent, align: "center"
  });
  // Divider
  s1.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 4.5, w: 3, h: 0.02, fill: { color: C.warm } });
  // Date & author
  s1.addText("ABC-RAG Team  |  2026.07", {
    x: 1, y: 4.7, w: 8, h: 0.5, fontSize: 12, fontFace: "Calibri",
    color: C.textLight, align: "center"
  });
  s1.addNotes("안녕하세요. 오늘은 ABC-RAG 팀이 YES24 IT 모바일 베스트셀러 1,000여 권의 데이터를 분석하여 도출한 인사이트를 바탕으로, AI 시대에 맞는 신규 도서 기획안을 제안드리겠습니다. 데이터 기반 출판 의사결정의 새로운 패러다임을 제시하겠습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 2: Agenda
  // ═══════════════════════════════════════════
  let s2 = pres.addSlide();
  s2.background = { color: C.lightBg };
  s2.addText("Today's Agenda", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 32, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 1.5, h: 0.03, fill: { color: C.accent } });

  const agenda = [
    { num: "01", title: "프로젝트 개요", desc: "ABC-RAG란 무엇인가" },
    { num: "02", title: "시장 분석", desc: "YES24 IT 베스트셀러 데이터 인사이트" },
    { num: "03", title: "타겟 독자", desc: "주요 독자 페르소나" },
    { num: "04", title: "경쟁 도서 분석", desc: "상위 도서 트렌드 파악" },
    { num: "05", title: "도서 기획안", desc: "핵심 주제 및 구성 제안" },
    { num: "06", title: "RAG 기술 활용", desc: "데이터 기반 기획 프로세스" },
    { num: "07", title: "추천 시스템", desc: "AI 도서 추천 챗봇" },
    { num: "08", title: "가격 전략", desc: "최적 가격대 설정" },
    { num: "09", title: "마케팅 전략", desc: "데이터 기반 마케팅" },
    { num: "10", title: "로드맵", desc: "출판 일정 및 단계" },
    { num: "11", title: "예산", desc: "투자 대비 기대 효과" },
    { num: "12", title: "기대 효과", desc: "예상 성과 및 KPI" },
  ];

  agenda.forEach((item, i) => {
    const col = i < 6 ? 0 : 1;
    const row = i < 6 ? i : i - 6;
    const xBase = col === 0 ? 0.7 : 5.2;
    const yBase = 1.5 + row * 0.62;

    s2.addShape(pres.shapes.RECTANGLE, { x: xBase, y: yBase, w: 0.55, h: 0.45, fill: { color: C.accent } });
    s2.addText(item.num, { x: xBase, y: yBase, w: 0.55, h: 0.45, fontSize: 13, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
    s2.addText(item.title, { x: xBase + 0.65, y: yBase - 0.02, w: 3.5, h: 0.28, fontSize: 13, fontFace: "Calibri", color: C.text, bold: true, margin: 0 });
    s2.addText(item.desc, { x: xBase + 0.65, y: yBase + 0.22, w: 3.5, h: 0.25, fontSize: 10, fontFace: "Calibri", color: C.textLight, margin: 0 });
  });
  s2.addNotes("오늘 발표의 전체 아젠다를 설명드리겠습니다. 크게 12개 섹션으로 나뉘어 있으며, 프로젝트 소개부터 시장 분석, 도서 기획, 기술 활용, 마케팅, 로드맵, 예산, 기대 효과까지 데이터 기반 도서 기획의 전체 여정을 다루겠습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 3: Project Overview
  // ═══════════════════════════════════════════
  let s3 = pres.addSlide();
  s3.background = { color: C.white };
  // Left color bar
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.accent } });
  s3.addText("프로젝트 개요", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Two columns
  // Left: description
  s3.addImage({ data: icons.globe, x: 0.7, y: 1.5, w: 0.4, h: 0.4 });
  s3.addText("ABC-RAG란?", { x: 1.2, y: 1.5, w: 3.5, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });
  s3.addText([
    { text: "YES24 IT/모바일 베스트셀러 1,000여 권의", options: { breakLine: true } },
    { text: "데이터를 자동 수집하고 분석하는", options: { breakLine: true } },
    { text: "RAG(Retrieval-Augmented Generation) 기반", options: { breakLine: true } },
    { text: "도서 인텔리전스 플랫폼입니다." }
  ], { x: 0.7, y: 2.1, w: 4.2, h: 1.5, fontSize: 13, fontFace: "Calibri", color: C.textLight, lineSpacingMultiple: 1.5 });

  // Right: stats cards
  const stats = [
    { val: "1,000+", label: "수집 도서", color: C.accent },
    { val: "50+", label: "출판사", color: C.warm },
    { val: "9.7+", label: "평균 평점", color: C.green },
    { val: "15,000+", label: "리뷰 분석", color: C.coral },
  ];

  stats.forEach((st, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 5.5 + col * 2.1;
    const y = 1.4 + row * 1.8;

    s3.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.9, h: 1.5, fill: { color: C.cardBg }, shadow: makeShadow() });
    s3.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.9, h: 0.06, fill: { color: st.color } });
    s3.addText(st.val, { x, y: y + 0.3, w: 1.9, h: 0.6, fontSize: 28, fontFace: "Georgia", color: C.darkBg, bold: true, align: "center", margin: 0 });
    s3.addText(st.label, { x, y: y + 0.95, w: 1.9, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.textLight, align: "center", margin: 0 });
  });
  s3.addNotes("ABC-RAG는 YES24 IT 모바일 종합 베스트셀러 전체 목록을 웹 크롤링하여 자동 수집하고, ChromaDB 벡터 데이터베이스와 KLUE BERT 모델을 활용한 RAG 기반 분석 시스템입니다. 현재 1,000권 이상의 도서 데이터를 보유하고 있으며, 50개 이상의 출판사, 평균 평점 9.7 이상, 15,000건 이상의 리뷰 데이터를 확보했습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 4: Market Analysis - Key Trends
  // ═══════════════════════════════════════════
  let s4 = pres.addSlide();
  s4.background = { color: C.lightBg };
  s4.addText("시장 분석: 핵심 트렌드", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // 4 trend cards in 2x2 grid
  const trends = [
    { icon: icons.brain, title: "AI/LLM 도서 폭발적 성장", desc: "Claude, ChatGPT, Gemini 관련 도서가 베스트셀러 상위 30위권 내 과반 이상 차지", accent: C.accent },
    { icon: icons.cogs, title: "바이브 코딩 열풍", desc: "코딩 없이 AI로 앱을 만드는 '바이브 코딩' 관련 도서가 급증, 실습형 가이드 수요 폭발", accent: C.warm },
    { icon: icons.search, title: "에듀테크 시장 확대", desc: "교사를 위한 AI 활용 도서가 지속적으로 베스트셀러 진입, 교육 시장 수요 안정적", accent: C.green },
    { icon: icons.chart, title: "실무 활용 중심", desc: "이론보다 실전 활용법, 프롬프트 엔지니어링, 에이전틱 코딩 등 실무서 수요 증가", accent: C.coral },
  ];

  trends.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.7 + col * 4.5;
    const y = 1.4 + row * 1.95;

    s4.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.2, h: 1.7, fill: { color: C.white }, shadow: makeShadow() });
    s4.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.7, fill: { color: t.accent } });
    s4.addImage({ data: t.icon, x: x + 0.25, y: y + 0.25, w: 0.4, h: 0.4 });
    s4.addText(t.title, { x: x + 0.8, y: y + 0.2, w: 3.1, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });
    s4.addText(t.desc, { x: x + 0.25, y: y + 0.8, w: 3.7, h: 0.7, fontSize: 11, fontFace: "Calibri", color: C.textLight, lineSpacingMultiple: 1.4 });
  });
  s4.addNotes("시장 데이터를 분석한 결과 4가지 핵심 트렌드가 확인되었습니다. 첫째, AI와 LLM 관련 도서가 베스트셀러 상위 30위권 내 과반 이상을 차지하고 있습니다. 둘째, 바이브 코딩 열풍으로 코딩 없이 AI를 활용한 앱 개발 관련 도서의 수요가 폭발적으로 증가하고 있습니다. 셋째, 에듀테크 시장이 확대되면서 교사 대상 AI 활용 도서가 안정적인 수요를 보이고 있습니다. 넷째, 이론보다는 실무 활용 중심의 도서 수요가 증가하는 추세입니다.");

  // ═══════════════════════════════════════════
  // SLIDE 5: Price Analysis
  // ═══════════════════════════════════════════
  let s5 = pres.addSlide();
  s5.background = { color: C.white };
  s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.accent } });
  s5.addText("시장 분석: 가격 분석", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Price stats row
  const priceStats = [
    { label: "평균 가격", value: "약 22,000원" },
    { label: "최다 가격대", value: "18,000~27,000원" },
    { label: "평균 평점", value: "9.7 / 10" },
    { label: "평균 리뷰", value: "40건+" },
  ];

  priceStats.forEach((ps, i) => {
    const x = 0.7 + i * 2.25;
    s5.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 2.05, h: 1.1, fill: { color: C.cardBg } });
    s5.addText(ps.value, { x, y: 1.5, w: 2.05, h: 0.55, fontSize: 18, fontFace: "Georgia", color: C.darkBg, bold: true, align: "center", margin: 0 });
    s5.addText(ps.label, { x, y: 2.05, w: 2.05, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.textLight, align: "center", margin: 0 });
  });

  // Price distribution bars (simplified)
  s5.addText("가격대별 도서 분포", { x: 0.7, y: 2.8, w: 4, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });

  const priceRanges = [
    { label: "~1.5만", pct: 12, color: C.accent },
    { label: "1.5~2만", pct: 35, color: C.accentDark },
    { label: "2~2.5만", pct: 30, color: C.accent },
    { label: "2.5~3만", pct: 15, color: C.warm },
    { label: "3만+", pct: 8, color: C.coral },
  ];

  priceRanges.forEach((pr, i) => {
    const y = 3.35 + i * 0.4;
    s5.addText(pr.label, { x: 0.7, y, w: 1.2, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.textLight, align: "right", margin: 0 });
    s5.addShape(pres.shapes.RECTANGLE, { x: 2.0, y, w: pr.pct * 0.15, h: 0.28, fill: { color: pr.color } });
    s5.addText(`${pr.pct}%`, { x: 2.0 + pr.pct * 0.15 + 0.1, y, w: 0.5, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.text, bold: true, margin: 0 });
  });

  // Insight box
  s5.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 2.8, w: 4.2, h: 2.3, fill: { color: C.cardBg } });
  s5.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 2.8, w: 4.2, h: 0.06, fill: { color: C.warm } });
  s5.addImage({ data: icons.lightbulb, x: 5.7, y: 3.0, w: 0.35, h: 0.35 });
  s5.addText("핵심 인사이트", { x: 6.15, y: 3.0, w: 3, h: 0.35, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });
  s5.addText([
    { text: "1.5만~2.5만원대가 전체의 65%를 차지", options: { bullet: true, breakLine: true } },
    { text: "가격대비 리뷰 수가 높은 가격대는 2만원대", options: { bullet: true, breakLine: true } },
    { text: "AI 실습서는 평균 가격이 약간 높음 (2.5만원대)", options: { bullet: true, breakLine: true } },
    { text: "평점 9.5 이상이 전체의 70% 이상", options: { bullet: true } },
  ], { x: 5.7, y: 3.55, w: 3.8, h: 1.4, fontSize: 11, fontFace: "Calibri", color: C.text, lineSpacingMultiple: 1.5 });
  s5.addNotes("가격 분석 결과를 보면, 평균 가격은 약 22,000원이며, 가장 많은 도서가 18,000원에서 27,000원 사이에 분포하고 있습니다. 가격대별로 보면 1.5만원에서 2.5만원대가 전체의 65%를 차지하고 있으며, 이 가격대가 독자들이 가장 많이 구매하는 가격대로 확인되었습니다. 특히 AI 실습서는 평균 가격이 약간 높은 2.5만원대에 형성되어 있어, 실습 중심 도서는 프리미엄 가격 책정이 가능하다는 인사이트를 얻었습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 6: Target Audience
  // ═══════════════════════════════════════════
  let s6 = pres.addSlide();
  s6.background = { color: C.darkBg };
  s6.addImage({ data: icons.usersWhite, x: 0.7, y: 0.5, w: 0.5, h: 0.5 });
  s6.addText("타겟 독자 페르소나", {
    x: 1.3, y: 0.45, w: 7, h: 0.6, fontSize: 30, fontFace: "Georgia",
    color: C.white, bold: true, margin: 0
  });
  s6.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 1.2, h: 0.03, fill: { color: C.warm } });

  const personas = [
    { name: "AI 입문 개발자", age: "25~35세", desc: "LLM API 활용, 프롬프트 엔지니어링,\n에이전틱 코딩에 관심이 많은 초중급 개발자", pct: "35%", color: C.accent },
    { name: "직장인 / 창업자", age: "30~45세", desc: "업무 자동화, 비즈니스 활용을 위한\nAI 도구 활용법을 찾는 실무자", pct: "30%", color: C.warm },
    { name: "교육 관계자", age: "25~50세", desc: "수업에 AI를 도입하고 싶은 교사,\n에듀테크에 관심 있는 교육 전문가", pct: "20%", color: C.green },
    { name: "일반 독자", age: "20~40세", desc: "AI 시대 흐름을 파악하고 싶은\n지식에 목마른 일반 독자", pct: "15%", color: C.coral },
  ];

  personas.forEach((p, i) => {
    const x = 0.7 + i * 2.3;
    s6.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.1, h: 3.6, fill: { color: C.medBg } });
    s6.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.1, h: 0.06, fill: { color: p.color } });
    s6.addText(p.name, { x, y: 1.75, w: 2.1, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.white, bold: true, align: "center", margin: 0 });
    s6.addText(p.age, { x, y: 2.15, w: 2.1, h: 0.3, fontSize: 11, fontFace: "Calibri", color: p.color, align: "center", margin: 0 });
    s6.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 2.55, w: 1.5, h: 0.02, fill: { color: C.textLight } });
    s6.addText(p.desc, { x: x + 0.15, y: 2.75, w: 1.8, h: 1.2, fontSize: 10.5, fontFace: "Calibri", color: C.textLight, align: "center", lineSpacingMultiple: 1.4 });
    s6.addText(p.pct, { x, y: 4.15, w: 2.1, h: 0.5, fontSize: 26, fontFace: "Georgia", color: p.color, bold: true, align: "center", margin: 0 });
    s6.addText("예상 비중", { x, y: 4.6, w: 2.1, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.textLight, align: "center", margin: 0 });
  });
  s6.addNotes("타겟 독자를 4개 페르소나로 분류했습니다. 가장 큰 비중을 차지하는 AI 입문 개발자(35%)는 LLM API 활용과 프롬프트 엔지니어링에 관심이 많은 초중급 개발자들입니다. 두 번째로 직장인과 창업자(30%)는 업무 자동화와 비즈니스 활용을 위한 AI 도구 활용법을 찾는 실무자들입니다. 교육 관계자(20%)는 수업에 AI를 도입하고 싶은 교사들과 에듀테크에 관심 있는 전문가들입니다. 마지막으로 일반 독자(15%)는 AI 시대의 흐름을 파악하고 싶은 지식에 목마른 독자들입니다.");

  // ═══════════════════════════════════════════
  // SLIDE 7: Competitive Analysis
  // ═══════════════════════════════════════════
  let s7 = pres.addSlide();
  s7.background = { color: C.white };
  s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.accent } });
  s7.addText("경쟁 도서 분석", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Top 5 books table
  const topBooks = [
    { rank: 1, title: "바로바로 클로드", publisher: "골든래빗", price: "25,200원", rating: "9.6", reviews: "11" },
    { rank: 2, title: "혼자 공부하는 바이브 코딩", publisher: "한빛미디어", price: "27,000원", rating: "9.9", reviews: "170" },
    { rank: 3, title: "뚝딱 바로 써먹는 AI 3대장", publisher: "안경다리BOOKS", price: "19,800원", rating: "10.0", reviews: "29" },
    { rank: 4, title: "제미나이 완전 미친 활용법", publisher: "골든래빗", price: "21,600원", rating: "9.8", reviews: "161" },
    { rank: 5, title: "요즘 교사를 위한 에듀테크", publisher: "앤써북", price: "17,820원", rating: "10.0", reviews: "93" },
  ];

  // Table header
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.4, w: 8.6, h: 0.45, fill: { color: C.darkBg } });
  s7.addText("순위", { x: 0.7, y: 1.4, w: 0.7, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s7.addText("제목", { x: 1.4, y: 1.4, w: 3.5, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "left", valign: "middle", margin: 0 });
  s7.addText("출판사", { x: 5.0, y: 1.4, w: 1.5, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s7.addText("가격", { x: 6.5, y: 1.4, w: 1.2, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s7.addText("평점", { x: 7.7, y: 1.4, w: 0.7, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s7.addText("리뷰", { x: 8.4, y: 1.4, w: 0.9, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });

  topBooks.forEach((b, i) => {
    const y = 1.9 + i * 0.48;
    const bgColor = i % 2 === 0 ? C.cardBg : C.white;
    s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.45, fill: { color: bgColor } });
    s7.addText(`#${b.rank}`, { x: 0.7, y, w: 0.7, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.accent, bold: true, align: "center", valign: "middle", margin: 0 });
    s7.addText(b.title, { x: 1.4, y, w: 3.5, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.text, align: "left", valign: "middle", margin: 0 });
    s7.addText(b.publisher, { x: 5.0, y, w: 1.5, h: 0.45, fontSize: 10, fontFace: "Calibri", color: C.textLight, align: "center", valign: "middle", margin: 0 });
    s7.addText(b.price, { x: 6.5, y, w: 1.2, h: 0.45, fontSize: 10, fontFace: "Calibri", color: C.text, align: "center", valign: "middle", margin: 0 });
    s7.addText(b.rating, { x: 7.7, y, w: 0.7, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.warm, bold: true, align: "center", valign: "middle", margin: 0 });
    s7.addText(b.reviews, { x: 8.4, y, w: 0.9, h: 0.45, fontSize: 10, fontFace: "Calibri", color: C.text, align: "center", valign: "middle", margin: 0 });
  });

  // Key takeaways
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.5, w: 8.6, h: 0.02, fill: { color: C.cardBg } });
  s7.addText([
    { text: "핵심 발견: ", options: { bold: true, color: C.darkBg } },
    { text: "AI 실습서(클로드, 바이브 코딩)가 상위권 독식  |  ", options: { color: C.textLight } },
    { text: "평균 가격 2.3만원  |  ", options: { color: C.textLight } },
    { text: "골든래빗, 한빛미디어가 주요 출판사", options: { color: C.textLight } },
  ], { x: 0.7, y: 4.65, w: 8.6, h: 0.4, fontSize: 11, fontFace: "Calibri" });
  s7.addNotes("경쟁 도서 분석 결과, 상위 5개 도서를 보면 AI 관련 실습서가 베스트셀러 상위권을 독식하고 있습니다. 특히 Claude 관련 도서와 바이브 코딩 도서가 높은 순위를 기록하고 있으며, 평균 가격은 약 23,000원입니다. 출판사별로는 골든래빗과 한빛미디어가 주요 경쟁사로 확인되었습니다. 이 데이터를 통해 AI 실습서 시장이 여전히 성장 중이며, 차별화된 콘텐츠로 진입이 가능하다는 것을 확인했습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 8: Book Proposal - Core Concept
  // ═══════════════════════════════════════════
  let s8 = pres.addSlide();
  s8.background = { color: C.darkBg };
  s8.addImage({ data: icons.rocketWhite, x: 0.7, y: 0.5, w: 0.5, h: 0.5 });
  s8.addText("신규 도서 기획안", {
    x: 1.3, y: 0.45, w: 7, h: 0.6, fontSize: 30, fontFace: "Georgia",
    color: C.white, bold: true, margin: 0
  });
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Book title card
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 1.6, fill: { color: C.medBg } });
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 0.06, fill: { color: C.accent } });
  s8.addText("데이터로 읽는 AI 도서 시장", {
    x: 1.0, y: 1.75, w: 5, h: 0.5, fontSize: 24, fontFace: "Georgia",
    color: C.white, bold: true, margin: 0
  });
  s8.addText("RAG로 분석한 1,000권의 인사이트", {
    x: 1.0, y: 2.3, w: 5, h: 0.35, fontSize: 14, fontFace: "Calibri",
    color: C.accent, margin: 0
  });
  s8.addText("2026年下半年 刊", { x: 7.0, y: 2.4, w: 2, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.textLight, align: "right", margin: 0 });

  // Three pillars
  const pillars = [
    { icon: icons.chartWhite, title: "데이터 기반", desc: "실제 베스트셀러\n데이터로 시장 분석" },
    { icon: icons.brainWhite, title: "RAG 기술", desc: "AI가 도서를 검색하고\n분석하는 최신 기술" },
    { icon: icons.lightbulbWhite, title: "실무 활용", desc: "바이브 코딩에서\n프롬프트까지 실전 가이드" },
  ];

  pillars.forEach((p, i) => {
    const x = 0.7 + i * 3.05;
    s8.addShape(pres.shapes.RECTANGLE, { x, y: 3.4, w: 2.85, h: 1.8, fill: { color: C.medBg } });
    s8.addShape(pres.shapes.RECTANGLE, { x, y: 3.4, w: 2.85, h: 0.05, fill: { color: C.warm } });
    s8.addImage({ data: p.icon, x: x + 1.1, y: 3.6, w: 0.5, h: 0.5 });
    s8.addText(p.title, { x, y: 4.2, w: 2.85, h: 0.35, fontSize: 14, fontFace: "Calibri", color: C.white, bold: true, align: "center", margin: 0 });
    s8.addText(p.desc, { x: x + 0.2, y: 4.55, w: 2.45, h: 0.55, fontSize: 11, fontFace: "Calibri", color: C.textLight, align: "center", lineSpacingMultiple: 1.4 });
  });
  s8.addNotes("제안하는 신규 도서는 '데이터로 읽는 AI 도서 시장: RAG로 분석한 1,000권의 인사이트'입니다. 이 도서는 데이터 기반 분석, RAG 기술 활용, 실무 활용 가이드라는 세 가지 핵심 가치를 제시합니다. 기존 도서들이 단순한 사용법 안내에 그쳤다면, 이 도서는 실제 베스트셀러 데이터를 기반으로 시장을 분석하고, 최신 RAG 기술을 활용한 도서 추천 시스템 구축 방법까지 다루는 차별화된 콘텐츠를 제공합니다.");

  // ═══════════════════════════════════════════
  // SLIDE 9: Book Structure
  // ═══════════════════════════════════════════
  let s9 = pres.addSlide();
  s9.background = { color: C.lightBg };
  s9.addText("도서 구성안", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  const chapters = [
    { num: "Part 1", title: "AI 도서 시장 이해하기", pages: "50p", items: ["시장 트렌드 분석", "독자 페르소나", "경쟁 도서 분석"] },
    { num: "Part 2", title: "RAG 기술로 시장 분석하기", pages: "80p", items: ["벡터 데이터베이스 구축", "CLUE BERT 임베딩", "ChromaDB 실습"] },
    { num: "Part 3", title: "AI 도서 추천 시스템 만들기", pages: "100p", items: ["Streamlit 대시보드", "Groq API 활용", "Function Calling"] },
    { num: "Part 4", title: "데이터 기반 도서 기획", pages: "70p", items: ["가격 전략 수립", "출판사별 비교", "트렌드 예측"] },
  ];

  chapters.forEach((ch, i) => {
    const x = 0.7 + i * 2.3;
    s9.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 2.1, h: 3.8, fill: { color: C.white }, shadow: makeShadow() });
    s9.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 2.1, h: 0.06, fill: { color: C.accent } });

    // Part number
    s9.addText(ch.num, { x, y: 1.6, w: 2.1, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.accent, bold: true, align: "center", margin: 0 });
    s9.addText(ch.title, { x: x + 0.15, y: 2.05, w: 1.8, h: 0.7, fontSize: 13, fontFace: "Calibri", color: C.darkBg, bold: true, align: "center", margin: 0 });
    s9.addShape(pres.shapes.RECTANGLE, { x: x + 0.5, y: 2.8, w: 1.1, h: 0.02, fill: { color: C.cardBg } });
    s9.addText(ch.pages, { x, y: 2.95, w: 2.1, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.warm, bold: true, align: "center", margin: 0 });

    ch.items.forEach((item, j) => {
      s9.addImage({ data: icons.check, x: x + 0.2, y: 3.45 + j * 0.4, w: 0.2, h: 0.2 });
      s9.addText(item, { x: x + 0.45, y: 3.4 + j * 0.4, w: 1.5, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.text, margin: 0 });
    });
  });

  // Total pages
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.0, w: 8.6, h: 0.4, fill: { color: C.cardBg } });
  s9.addText("총 300페이지  |  A5 판형  |  풀컬러  |  예상 정가: 25,000원", {
    x: 0.7, y: 5.0, w: 8.6, h: 0.4, fontSize: 12, fontFace: "Calibri",
    color: C.darkBg, bold: true, align: "center", valign: "middle", margin: 0
  });
  s9.addNotes("도서는 4개 파트, 총 300페이지로 구성됩니다. Part 1은 AI 도서 시장의 전체적인 이해를 위한 50페이지, Part 2는 RAG 기술을 활용한 시장 분석 방법을 다루는 80페이지, Part 3은 AI 도서 추천 시스템을 직접 구축하는 실습 중심의 100페이지, Part 4는 데이터를 기반으로 한 도서 기획 방법론을 다루는 70페이지로 구성됩니다. A5 판형에 풀컬러로 제작하며, 예상 정가는 25,000원으로 설정했습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 10: RAG Technology
  // ═══════════════════════════════════════════
  let s10 = pres.addSlide();
  s10.background = { color: C.white };
  s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.accent } });
  s10.addText("RAG 기술 활용 프로세스", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s10.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Flow diagram - horizontal
  const flowSteps = [
    { icon: icons.globe, title: "데이터 수집", desc: "YES24 크롤링\n1,000권+" },
    { icon: icons.cogs, title: "임베딩", desc: "KLUE BERT\n벡터 변환" },
    { icon: icons.search, title: "벡터 DB", desc: "ChromaDB\n저장/검색" },
    { icon: icons.brain, title: "RAG 분석", desc: "Groq API\n질의응답" },
    { icon: icons.chart, title: "시각화", desc: "Streamlit\n대시보드" },
  ];

  flowSteps.forEach((step, i) => {
    const x = 0.5 + i * 1.9;
    s10.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 1.7, h: 2.0, fill: { color: C.cardBg } });
    s10.addImage({ data: step.icon, x: x + 0.55, y: 1.65, w: 0.5, h: 0.5 });
    s10.addText(step.title, { x, y: 2.25, w: 1.7, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.darkBg, bold: true, align: "center", margin: 0 });
    s10.addText(step.desc, { x, y: 2.65, w: 1.7, h: 0.6, fontSize: 10, fontFace: "Calibri", color: C.textLight, align: "center", lineSpacingMultiple: 1.4 });

    // Arrow between steps
    if (i < flowSteps.length - 1) {
      s10.addText("→", { x: x + 1.7, y: 1.9, w: 0.2, h: 0.4, fontSize: 20, fontFace: "Calibri", color: C.accent, align: "center", valign: "middle", margin: 0 });
    }
  });

  // Tech stack
  s10.addText("기술 스택", { x: 0.7, y: 3.8, w: 3, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });
  const techStack = [
    { name: "scrapling", desc: "웹 크롤링" },
    { name: "KLUE BERT", desc: "한국어 임베딩" },
    { name: "ChromaDB", desc: "벡터 데이터베이스" },
    { name: "Groq API", desc: "LLM 추론" },
    { name: "Streamlit", desc: "대시보드 UI" },
  ];

  techStack.forEach((t, i) => {
    const x = 0.7 + i * 1.85;
    s10.addShape(pres.shapes.RECTANGLE, { x, y: 4.3, w: 1.65, h: 0.9, fill: { color: C.cardBg } });
    s10.addText(t.name, { x, y: 4.4, w: 1.65, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.accent, bold: true, align: "center", margin: 0 });
    s10.addText(t.desc, { x, y: 4.75, w: 1.65, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.textLight, align: "center", margin: 0 });
  });
  s10.addNotes("RAG 기술 활용 프로세스를 설명드리겠습니다. 먼저 scrapling 라이브러리를 사용하여 YES24에서 IT 모바일 베스트셀러 1,000권 이상의 데이터를 자동 수집합니다. 수집된 데이터는 KLUE BERT 모델을 통해 한국어 임베딩으로 변환됩니다. 변환된 벡터는 ChromaDB에 저장되어 빠른 검색이 가능합니다. 사용자의 질문이 들어오면 Groq API를 통해 RAG 분석이 수행되고, 최종 결과는 Streamlit 대시보드를 통해 시각화됩니다.");

  // ═══════════════════════════════════════════
  // SLIDE 11: Recommendation System
  // ═══════════════════════════════════════════
  let s11 = pres.addSlide();
  s11.background = { color: C.lightBg };
  s11.addText("AI 도서 추천 챗봇", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s11.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Features grid
  const features = [
    { icon: icons.search, title: "가격 범위 검색", desc: "최소~최고 가격을 지정하여\n해당 범위의 도서를 리뷰 수 순으로 반환" },
    { icon: icons.chart, title: "판매지수 분석", desc: "리뷰수(60%), 평점(25%),\n순위(15%)를 종합한 판매지수 계산" },
    { icon: icons.money, title: "가격 통계", desc: "평균, 중앙값, 최소/최대,\n가격대별 분포를 한눈에 파악" },
    { icon: icons.bullseye, title: "Function Calling", desc: "사용자 질의에 맞춰 자동으로\n최적의 도구를 선택하여 응답" },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.7 + col * 4.5;
    const y = 1.4 + row * 1.75;

    s11.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.2, h: 1.5, fill: { color: C.white }, shadow: makeShadow() });
    s11.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.5, fill: { color: C.accent } });
    s11.addImage({ data: f.icon, x: x + 0.25, y: y + 0.2, w: 0.4, h: 0.4 });
    s11.addText(f.title, { x: x + 0.8, y: y + 0.15, w: 3.1, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });
    s11.addText(f.desc, { x: x + 0.25, y: y + 0.7, w: 3.7, h: 0.65, fontSize: 11, fontFace: "Calibri", color: C.textLight, lineSpacingMultiple: 1.4 });
  });

  // Model info
  s11.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.75, w: 8.6, h: 0.6, fill: { color: C.cardBg } });
  s11.addText("사용 모델: Llama 3.3 70B Versatile (Groq)  |  Temperature: 0.3  |  Function Calling 기반 자동 도구 선택", {
    x: 0.7, y: 4.75, w: 8.6, h: 0.6, fontSize: 11, fontFace: "Calibri",
    color: C.textLight, align: "center", valign: "middle", margin: 0
  });
  s11.addNotes("AI 도서 추천 챗봇은 4가지 핵심 기능을 제공합니다. 첫째, 가격 범위 검색 기능으로 사용자가 원하는 가격대의 도서를 리뷰 수 순으로 정렬하여 보여줍니다. 둘째, 판매지수 분석 기능으로 리뷰수 60%, 평점 25%, 순위 15%를 종합한 판매지수를 계산하여 도서의 인기를 객관적으로 평가합니다. 셋째, 가격 통계 기능으로 평균, 중앙값, 최소/최대 가격, 가격대별 분포를 제공합니다. 넷째, Function Calling을 활용하여 사용자 질의에 맞춰 자동으로 최적의 도구를 선택하여 응답합니다.");

  // ═══════════════════════════════════════════
  // SLIDE 12: Pricing Strategy
  // ═══════════════════════════════════════════
  let s12 = pres.addSlide();
  s12.background = { color: C.white };
  s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.warm } });
  s12.addText("가격 전략", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s12.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Price comparison
  s12.addText("경쟁 도서 가격 비교", { x: 0.7, y: 1.3, w: 4, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });

  // Price bars
  const priceCompare = [
    { name: "바로바로 클로드", price: 25200, max: 35000 },
    { name: "바이브 코딩", price: 27000, max: 35000 },
    { name: "AI 3대장", price: 19800, max: 35000 },
    { name: "에듀테크 5대장", price: 17820, max: 35000 },
    { name: "제미나이 활용법", price: 21600, max: 35000 },
    { name: "우리 도서 (예정)", price: 25000, max: 35000, highlight: true },
  ];

  priceCompare.forEach((p, i) => {
    const y = 1.85 + i * 0.5;
    const barW = (p.price / p.max) * 4.5;
    const barColor = p.highlight ? C.warm : C.accent;

    s12.addText(p.name, { x: 0.7, y, w: 2.0, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.text, align: "right", margin: 0 });
    s12.addShape(pres.shapes.RECTANGLE, { x: 2.8, y: y + 0.05, w: barW, h: 0.25, fill: { color: barColor } });
    s12.addText(`${p.price.toLocaleString()}원`, { x: 2.8 + barW + 0.1, y, w: 1.0, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.text, bold: true, margin: 0 });
  });

  // Strategy card
  s12.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.3, w: 4.2, h: 3.8, fill: { color: C.cardBg } });
  s12.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.3, w: 4.2, h: 0.06, fill: { color: C.accent } });
  s12.addText("가격 설정 근거", { x: 5.7, y: 1.5, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });

  s12.addText([
    { text: "시장 평균가 22,000원 대비 13.6% 높은 25,000원", options: { bullet: true, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "300페이지 풀컬러 + 실습 코드 제공으로 프리미엄 정당화", options: { bullet: true, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "1.5만~2.5만원대가 65%이므로 이 범위 내에서 경쟁력 확보", options: { bullet: true, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "eBook 가격: 18,000원 (종이책 대비 72%)", options: { bullet: true, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "초판 한정 얼리버드: 20,000원 (20% 할인)", options: { bullet: true } },
  ], { x: 5.7, y: 2.0, w: 3.8, h: 2.8, fontSize: 11, fontFace: "Calibri", color: C.text, lineSpacingMultiple: 1.3 });
  s12.addNotes("가격 전략을 설명드리겠습니다. 시장 평균가인 22,000원 대비 약 13.6% 높은 25,000원으로 설정했습니다. 300페이지 풀컬러에 실습 코드까지 제공하는 프리미엄 구성으로 이 가격을 정당화할 수 있습니다. 1.5만에서 2.5만원대가 전체의 65%를 차지하므로, 이 범위 내에서 경쟁력을 확보할 수 있습니다. eBook 가격은 종이책 대비 72% 수준인 18,000원으로 설정하고, 초판 한정 얼리버드 할인가 20,000원을 제안합니다.");

  // ═══════════════════════════════════════════
  // SLIDE 13: Marketing Strategy
  // ═══════════════════════════════════════════
  let s13 = pres.addSlide();
  s13.background = { color: C.darkBg };
  s13.addImage({ data: icons.bullhornWhite, x: 0.7, y: 0.5, w: 0.5, h: 0.5 });
  s13.addText("마케팅 전략", {
    x: 1.3, y: 0.45, w: 7, h: 0.6, fontSize: 30, fontFace: "Georgia",
    color: C.white, bold: true, margin: 0
  });
  s13.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 1.2, h: 0.03, fill: { color: C.warm } });

  const marketing = [
    { phase: "사전 마케팅", period: "출판 3개월 전", items: ["SNS 사전 예약 캠페인", "IT 커뮤니티 리뷰단 모집", "저자 인터뷰 콘텐츠 배포"] },
    { phase: "출판 마케팅", period: "출판 시점", items: ["YES24/교보문고 기획전 참여", "유튜브/팟캐스트 홍보", "서평 이벤트 진행"] },
    { phase: "사후 마케팅", period: "출판 이후", items: ["독자 리뷰 관리", "온라인 세미나/webinar", "후속 도서 수요 조사"] },
  ];

  marketing.forEach((m, i) => {
    const x = 0.7 + i * 3.1;
    s13.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.9, h: 3.5, fill: { color: C.medBg } });
    s13.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.9, h: 0.06, fill: { color: C.warm } });
    s13.addText(m.phase, { x, y: 1.75, w: 2.9, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.white, bold: true, align: "center", margin: 0 });
    s13.addText(m.period, { x, y: 2.2, w: 2.9, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.warm, align: "center", margin: 0 });
    s13.addShape(pres.shapes.RECTANGLE, { x: x + 0.5, y: 2.6, w: 1.9, h: 0.02, fill: { color: C.textLight } });

    m.items.forEach((item, j) => {
      s13.addImage({ data: icons.checkWhite, x: x + 0.3, y: 2.85 + j * 0.55, w: 0.2, h: 0.2 });
      s13.addText(item, { x: x + 0.6, y: 2.8 + j * 0.55, w: 2.0, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.textLight, margin: 0 });
    });
  });

  // Budget note
  s13.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 5.15, w: 8.6, h: 0.35, fill: { color: C.medBg } });
  s13.addText("예상 마케팅 예산: 500만원  |  목표: 출판 첫 달 1,000권 판매", {
    x: 0.7, y: 5.15, w: 8.6, h: 0.35, fontSize: 11, fontFace: "Calibri",
    color: C.warm, bold: true, align: "center", valign: "middle", margin: 0
  });
  s13.addNotes("마케팅 전략은 3단계로 나뉩니다. 사전 마케팅(출판 3개월 전)에서는 SNS 사전 예약 캠페인, IT 커뮤니티 리뷰단 모집, 저자 인터뷰 콘텐츠 배포를 진행합니다. 출판 마케팅(출판 시점)에서는 YES24/교보문고 기획전 참여, 유튜브/팟캐스트 홍보, 서평 이벤트를 진행합니다. 사후 마케팅(출판 이후)에서는 독자 리뷰 관리, 온라인 세미나, 후속 도서 수요 조사를 진행합니다. 예상 마케팅 예산은 500만원이며, 출판 첫 달 1,000권 판매를 목표로 합니다.");

  // ═══════════════════════════════════════════
  // SLIDE 14: Roadmap & Budget
  // ═══════════════════════════════════════════
  let s14 = pres.addSlide();
  s14.background = { color: C.white };
  s14.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.accent } });
  s14.addText("로드맵 & 예산", {
    x: 0.7, y: 0.4, w: 8, h: 0.7, fontSize: 30, fontFace: "Georgia",
    color: C.darkBg, bold: true, margin: 0
  });
  s14.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.05, w: 1.2, h: 0.03, fill: { color: C.warm } });

  // Timeline
  const timeline = [
    { phase: "1단계", period: "2026.08~09", title: "기획 및 집필", status: "active" },
    { phase: "2단계", period: "2026.10", title: "편집 및 교정", status: "upcoming" },
    { phase: "3단계", period: "2026.11", title: "디자인 및 인쇄", status: "upcoming" },
    { phase: "4단계", period: "2026.12", title: "출판 및 마케팅", status: "upcoming" },
  ];

  timeline.forEach((t, i) => {
    const x = 0.7 + i * 2.3;
    const isActive = t.status === "active";
    s14.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 2.1, h: 1.3, fill: { color: isActive ? C.accent : C.cardBg } });
    s14.addText(t.phase, { x, y: 1.5, w: 2.1, h: 0.3, fontSize: 11, fontFace: "Calibri", color: isActive ? C.white : C.accent, bold: true, align: "center", margin: 0 });
    s14.addText(t.period, { x, y: 1.8, w: 2.1, h: 0.3, fontSize: 10, fontFace: "Calibri", color: isActive ? C.white : C.textLight, align: "center", margin: 0 });
    s14.addText(t.title, { x, y: 2.15, w: 2.1, h: 0.35, fontSize: 13, fontFace: "Calibri", color: isActive ? C.white : C.darkBg, bold: true, align: "center", margin: 0 });

    // Connector line
    if (i < timeline.length - 1) {
      s14.addShape(pres.shapes.RECTANGLE, { x: x + 2.1, y: 1.95, w: 0.2, h: 0.03, fill: { color: C.accent } });
    }
  });

  // Budget table
  s14.addText("예산 계획", { x: 0.7, y: 3.0, w: 4, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });

  s14.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.5, w: 4.0, h: 0.4, fill: { color: C.darkBg } });
  s14.addText("항목", { x: 0.7, y: 3.5, w: 2.2, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
  s14.addText("예산", { x: 2.9, y: 3.5, w: 1.8, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });

  const budgetItems = [
    { item: "원고료 (저자)", cost: "1,500만원" },
    { item: "편집/교정", cost: "300만원" },
    { item: "디자인/레이아웃", cost: "400만원" },
    { item: "인쇄 (1,500권)", cost: "600만원" },
    { item: "마케팅", cost: "500만원" },
    { item: "합계", cost: "3,300만원", bold: true },
  ];

  budgetItems.forEach((b, i) => {
    const y = 3.95 + i * 0.35;
    const bgColor = i % 2 === 0 ? C.cardBg : C.white;
    s14.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 4.0, h: 0.35, fill: { color: bgColor } });
    s14.addText(b.item, { x: 0.7, y, w: 2.2, h: 0.35, fontSize: 10, fontFace: "Calibri", color: b.bold ? C.darkBg : C.text, bold: b.bold, align: "center", valign: "middle", margin: 0 });
    s14.addText(b.cost, { x: 2.9, y, w: 1.8, h: 0.35, fontSize: 10, fontFace: "Calibri", color: b.bold ? C.accent : C.text, bold: b.bold, align: "center", valign: "middle", margin: 0 });
  });

  // Revenue projection
  s14.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.0, w: 4.2, h: 2.6, fill: { color: C.cardBg } });
  s14.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 3.0, w: 4.2, h: 0.06, fill: { color: C.green } });
  s14.addText("매출 전망", { x: 5.7, y: 3.2, w: 3.8, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.darkBg, bold: true, margin: 0 });

  s14.addText([
    { text: "첫 달 판매: 1,000권", options: { bullet: true, breakLine: true } },
    { text: "첫 해 판매: 5,000권", options: { bullet: true, breakLine: true } },
    { text: "예상 매출: 1억 2,500만원", options: { bullet: true, breakLine: true } },
    { text: "순이익: 약 9,200만원", options: { bullet: true, breakLine: true } },
    { text: "투자 대비 수익률: 약 280%", options: { bullet: true, bold: true } },
  ], { x: 5.7, y: 3.7, w: 3.8, h: 1.7, fontSize: 12, fontFace: "Calibri", color: C.text, lineSpacingMultiple: 1.5 });
  s14.addNotes("로드맵은 4단계로 구성됩니다. 1단계(2026년 8-9월)는 기획 및 집필, 2단계(10월)는 편집 및 교정, 3단계(11월)는 디자인 및 인쇄, 4단계(12월)는 출판 및 마케팅으로 진행됩니다. 예산은 원고료 1,500만원, 편집교정 300만원, 디자인 400만원, 인쇄 600만원, 마케팅 500만원으로 총 3,300만원이 소요됩니다. 매출 전망으로는 첫 달 1,000권, 첫 해 5,000권 판매를 예상하며, 예상 매출은 1억 2,500만원, 순이익은 약 9,200만원으로 투자 대비 수익률 약 280%를 기대할 수 있습니다.");

  // ═══════════════════════════════════════════
  // SLIDE 15: Expected Impact & Closing
  // ═══════════════════════════════════════════
  let s15 = pres.addSlide();
  s15.background = { color: C.darkBg };
  s15.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });
  s15.addImage({ data: icons.checkWhite, x: 4.5, y: 0.5, w: 0.8, h: 0.8 });
  s15.addText("기대 효과 & 마무리", {
    x: 0.5, y: 1.4, w: 9, h: 0.7, fontSize: 32, fontFace: "Georgia",
    color: C.white, bold: true, align: "center", margin: 0
  });
  s15.addShape(pres.shapes.RECTANGLE, { x: 4, y: 2.15, w: 2, h: 0.03, fill: { color: C.warm } });

  // KPI cards
  const kpis = [
    { value: "5,000권", label: "첫 해 판매 목표", icon: icons.bookWhite },
    { value: "280%", label: "투자 대비 수익률", icon: icons.chartWhite },
    { value: "1위", label: "AI 도서 시장 선도", icon: icons.globeWhite },
    { value: "9.5+", label: "독자 평점 목표", icon: icons.usersWhite },
  ];

  kpis.forEach((k, i) => {
    const x = 0.8 + i * 2.3;
    s15.addShape(pres.shapes.RECTANGLE, { x, y: 2.6, w: 2.1, h: 1.6, fill: { color: C.medBg } });
    s15.addImage({ data: k.icon, x: x + 0.75, y: 2.75, w: 0.4, h: 0.4 });
    s15.addText(k.value, { x, y: 3.25, w: 2.1, h: 0.45, fontSize: 22, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0 });
    s15.addText(k.label, { x, y: 3.75, w: 2.1, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.textLight, align: "center", margin: 0 });
  });

  // Call to action
  s15.addShape(pres.shapes.RECTANGLE, { x: 2, y: 4.5, w: 6, h: 0.7, fill: { color: C.accent } });
  s15.addText("데이터로 증명하는 도서 기획, 함께 만들어 갑시다", {
    x: 2, y: 4.5, w: 6, h: 0.7, fontSize: 16, fontFace: "Calibri",
    color: C.white, bold: true, align: "center", valign: "middle", margin: 0
  });
  s15.addNotes("기대 효과를 정리하겠습니다. 첫 해 판매 목표 5,000권, 투자 대비 수익률 280%, AI 도서 시장 선도, 독자 평점 9.5 이상을 목표로 하고 있습니다. 이 프로젝트는 데이터 기반 도서 기획의 새로운 패러다임을 제시하며, RAG 기술을 활용한 도서 추천 시스템은 출판 업계에 새로운 가치를 제공할 것입니다. 함께 데이터로 증명하는 도서 기획을 만들어 갑시다. 감사합니다.");

  // ── Save ──
  const outputPath = "C:\\Users\\jonghyun\\github\\ABC-RAG\\new_book_planning.pptx";
  await pres.writeFile({ fileName: outputPath });
  console.log(`Presentation saved to: ${outputPath}`);
}

main().catch(console.error);

import { writeFileSync } from "node:fs";
import {
  AlignmentType, BorderStyle, Document, Footer, Packer, PageBreak, PageNumber, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType, VerticalAlign,
} from "docx";
import * as W from "../src/lib/worksheet.ts";

const FONT = "Times New Roman";
const GREEN = "2F6B52";
const RED = "B23A2E";
const GREY = "6B6B6B";
const LIGHT = "F1EEE6";

const t = (text: string, o: Record<string, unknown> = {}) => new TextRun({ text, font: FONT, size: 24, ...o });
const p = (children: TextRun[] | string, o: Record<string, unknown> = {}) =>
  new Paragraph({ children: typeof children === "string" ? [t(children)] : children, spacing: { after: 80, line: 300 }, ...o });
const line = (len = 60) => "_".repeat(len);
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thin = { style: BorderStyle.SINGLE, size: 4, color: "BFB8A8" };
const allThin = { top: thin, bottom: thin, left: thin, right: thin };

function taskHeading(num: string, title: string, instruction: string, points?: number) {
  return [
    new Paragraph({
      spacing: { before: 280, after: 60 },
      keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 2 } },
      children: [
        t(`Задание ${num}. `, { bold: true, color: GREEN, size: 26 }),
        t(title, { bold: true, size: 26 }),
        ...(points !== undefined ? [t(`   (${points} б.)`, { color: GREY, size: 22 })] : []),
      ],
    }),
    p([t(instruction, { italics: true, color: GREY, size: 22 })], { keepNext: true }),
  ];
}

function cell(children: Paragraph[], o: Record<string, unknown> = {}) {
  return new TableCell({ children, borders: allThin, margins: { top: 60, bottom: 60, left: 100, right: 100 }, verticalAlign: VerticalAlign.CENTER, ...o });
}

function header() {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [t("Учреждение образования " + line(40), { size: 22, color: GREY })], spacing: { after: 120 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [t(`${W.meta.level} · Специальность «${W.meta.specialty}» · ${W.meta.course}`, { size: 20, color: GREY, allCaps: true })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [t("РАБОЧИЙ ЛИСТ", { bold: true, color: RED, size: 24, characterSpacing: 40 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [t(`«${W.meta.title}»`, { bold: true, size: 34 })] }),
    p([t("Фамилия, имя: ", { bold: true }), t(line(38)), t("  Группа: ", { bold: true }), t(line(10))]),
    p([t("Дата: ", { bold: true }), t(line(14)), t("   Время работы: ", { bold: true }), t(W.meta.duration)]),
    new Paragraph({ spacing: { before: 160, after: 60 }, children: [t("Цели работы — после занятия вы будете:", { bold: true })] }),
    ...W.meta.goals.map((g) => new Paragraph({ bullet: { level: 0 }, children: [t(g, { size: 22 })], spacing: { after: 40 } })),
  ];
}

function studentPart() {
  const out: (Paragraph | Table)[] = [...header()];

  // 0. Notes
  out.push(...taskHeading("0", "Опорный конспект", "Прочитайте текст и заполните пропуски. Используйте Банковский кодекс Республики Беларусь.", W.taskPoints.notes));
  W.notes.forEach((ln, i) => {
    out.push(p([t(`${i + 1}. `, { color: GREY }), ...ln.map((s) => (typeof s === "string" ? t(s) : t(line(Math.max(10, s.width + 6)))))], { spacing: { after: 120, line: 360 } }));
  });

  // 1. Scheme
  out.push(...taskHeading("1", "Структура банковской системы", "Впишите в схему названия звеньев банковской системы Республики Беларусь.", W.taskPoints.scheme));
  const box = (label: string, hint: string, span: number) =>
    cell([
      new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [t(label, { size: 18, color: GREY, allCaps: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 160, after: 120 }, children: [t(line(26))] }),
      new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [t(hint, { size: 18, italics: true, color: GREY })] }),
    ], { columnSpan: span, shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } });
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 80 }, children: [t("БАНКОВСКАЯ СИСТЕМА РЕСПУБЛИКИ БЕЛАРУСЬ", { bold: true, size: 20 })] }));
  const noB = { top: none, bottom: none, left: none, right: none };
  const blank = (span = 1) => cell([new Paragraph({ keepNext: true, children: [] })], { borders: noB, columnSpan: span });
  const arrow = (span: number) => cell([new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, children: [t("↓", { size: 32, bold: true, color: GREEN })] })], { borders: noB, columnSpan: span });
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2300, 2300, 400, 2300, 2300],
    rows: [
      new TableRow({ cantSplit: true, children: [blank(), box(W.scheme.top.label, W.scheme.top.hint, 3), blank()] }),
      new TableRow({ cantSplit: true, children: [arrow(2), blank(), arrow(2)] }),
      new TableRow({ cantSplit: true, children: [box(W.scheme.left.label, W.scheme.left.hint, 2), blank(), box(W.scheme.right.label, W.scheme.right.hint, 2)] }),
    ],
  }));
  out.push(p([t(W.scheme.special.before), t(line(16)), t(W.scheme.special.after)], { alignment: AlignmentType.CENTER, spacing: { before: 160, after: 80 } }));

  // 2. Terms
  out.push(...taskHeading("2", "Терминологический словарь", "Соотнесите термин с определением. Впишите букву определения в правый столбец.", W.taskPoints.terms));
  const maxRows = Math.max(W.terms.length, W.definitions.length);
  const termRows: TableRow[] = [
    new TableRow({ tableHeader: true, children: [
      cell([p([t("Термин", { bold: true, size: 22 })])], { shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } }),
      cell([p([t("Буква", { bold: true, size: 22 })], { alignment: AlignmentType.CENTER })], { shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } }),
      cell([p([t("Определение", { bold: true, size: 22 })])], { shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } }),
    ] }),
  ];
  for (let i = 0; i < maxRows; i++) {
    const term = W.terms[i];
    const def = W.definitions[i];
    termRows.push(new TableRow({ children: [
      cell([p(term ? [t(`${i + 1}. ${term.term}`, { size: 22 })] : "")]),
      cell([p("")]),
      cell([p(def ? [t(`${def.letter}. `, { bold: true, color: RED, size: 22 }), t(def.text, { size: 22 })] : "")]),
    ] }));
  }
  out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [2900, 900, 5800], rows: termRows }));

  // 3. Functions
  out.push(...taskHeading("3", "Кто это делает?", "Отметьте знаком «+», кто выполняет функцию или операцию.", W.taskPoints.functions));
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [6200, 1700, 1700],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell([p([t("Функция / операция", { bold: true, size: 22 })])], { shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } }),
        cell([p([t("Национальный банк", { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })], { shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } }),
        cell([p([t("Банк II уровня", { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })], { shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" } }),
      ] }),
      ...W.functionsTable.map((f, i) => new TableRow({ children: [
        cell([p([t(`${i + 1}. ${f.text}`, { size: 22 })])]), cell([p("")]), cell([p("")]),
      ] })),
    ],
  }));

  // 4. Quiz
  out.push(...taskHeading("4", "Тест", "Обведите букву одного правильного ответа.", W.taskPoints.quiz));
  W.quiz.forEach((q, i) => {
    out.push(p([t(`${i + 1}. ${q.q}`, { bold: true, size: 22 })], { keepNext: true, spacing: { before: 100, after: 40 } }));
    q.options.forEach((o, oi) => out.push(p([t(`${String.fromCharCode(1072 + oi)}) ${o}`, { size: 22 })], { indent: { left: 400 }, spacing: { after: 20 }, keepNext: oi < q.options.length - 1 })));
  });

  // 5. True / false
  out.push(...taskHeading("5", "Верно или неверно?", "Поставьте «В» (верно) или «Н» (неверно). Неверные утверждения исправьте устно.", W.taskPoints.trueFalse));
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [8400, 1200],
    rows: W.trueFalse.map((v, i) => new TableRow({ children: [cell([p([t(`${i + 1}. ${v.text}`, { size: 22 })])]), cell([p("")])] })),
  }));

  // 6. Timeline
  out.push(...taskHeading("6", "Лента времени", "Расставьте события в хронологическом порядке: номер от 1 (самое раннее) до 5.", W.taskPoints.timeline));
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1000, 8600],
    rows: W.timeline.map((h) => new TableRow({ children: [cell([p("")]), cell([p([t(h.text, { size: 22 })])])] })),
  }));

  // 7. Case
  out.push(...taskHeading("7", "Ситуационная задача", "Прочитайте ситуацию и письменно ответьте на вопросы."));
  out.push(new Paragraph({
    children: [t(W.caseStudy.text, { italics: true, size: 22 })],
    shading: { type: ShadingType.CLEAR, fill: LIGHT, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: RED, space: 8 } },
    spacing: { after: 120, line: 300 },
  }));
  W.caseStudy.questions.forEach((q, i) => {
    out.push(p([t(`${i + 1}. ${q}`, { bold: true, size: 22 })], { keepNext: true }));
    for (let k = 0; k < 2; k++) out.push(p([t(line(78), { color: "999999" })], { spacing: { after: 60 } }));
  });

  // 8. Research
  out.push(...taskHeading("8", "Работа с официальным источником", "Используя официальный сайт Национального банка (nbrb.by), найдите актуальные данные."));
  W.research.forEach((r) => out.push(p([t(`${r.label}: `, { size: 22 }), t(line(r.id === "r5" ? 70 : 30), { color: "999999" })], { spacing: { after: 120 } })));

  // Reflection
  out.push(...taskHeading("★", "Рефлексия", "Продолжите фразы."));
  W.reflection.forEach((r) => {
    out.push(p([t(r, { italics: true, size: 22 })], { keepNext: true }));
    out.push(p([t(line(78), { color: "999999" })], { spacing: { after: 120 } }));
  });

  out.push(new Paragraph({ spacing: { before: 240 }, children: [t(`Итого за задания 0–6: ______ из ${W.autoTotal} баллов.     Отметка: ______`, { bold: true })] }));
  out.push(new Paragraph({ spacing: { before: 200 }, children: [t("Источники:", { bold: true, size: 20 })] }));
  W.meta.sources.forEach((s) => out.push(new Paragraph({ bullet: { level: 0 }, children: [t(s, { size: 20, color: GREY })] })));
  return out;
}

function keyPart() {
  const out: (Paragraph | Table)[] = [new Paragraph({ children: [new PageBreak()] })];
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [t("КЛЮЧ ОТВЕТОВ ДЛЯ ПРЕПОДАВАТЕЛЯ", { bold: true, color: RED, size: 28 })], spacing: { after: 200 } }));
  const kh = (s: string) => new Paragraph({ spacing: { before: 200, after: 60 }, keepNext: true, children: [t(s, { bold: true, color: GREEN })] });
  const kp = (s: string) => p([t(s, { size: 22 })]);

  out.push(kh(`Задание 0. Опорный конспект (${W.taskPoints.notes} б.)`));
  out.push(kp(W.noteBlanks.map((b, i) => `${i + 1}) ${b.accepted[0]}`).join("; ") + "."));

  out.push(kh(`Задание 1. Схема (${W.taskPoints.scheme} б.)`));
  out.push(kp(`I уровень — Национальный банк Республики Беларусь; II уровень — банки и небанковские кредитно-финансовые организации (НКФО); банк со специальным статусом — ОАО «Банк развития Республики Беларусь».`));

  out.push(kh(`Задание 2. Термины (${W.taskPoints.terms} б.)`));
  out.push(kp(W.terms.map((x, i) => `${i + 1} — ${x.answer}`).join("; ") + "."));

  out.push(kh(`Задание 3. Кто это делает? (${W.taskPoints.functions} б.)`));
  out.push(kp(`Национальный банк: ${W.functionsTable.map((f, i) => (f.answer === "nb" ? i + 1 : null)).filter(Boolean).join(", ")}. Банк II уровня: ${W.functionsTable.map((f, i) => (f.answer === "bank" ? i + 1 : null)).filter(Boolean).join(", ")}.`));

  out.push(kh(`Задание 4. Тест (${W.taskPoints.quiz} б.)`));
  out.push(kp(W.quiz.map((q, i) => `${i + 1} — ${String.fromCharCode(1072 + q.answer)}`).join("; ") + "."));

  out.push(kh(`Задание 5. Верно / неверно (${W.taskPoints.trueFalse} б.)`));
  out.push(kp(W.trueFalse.map((v, i) => `${i + 1} — ${v.answer ? "В" : "Н"}`).join("; ") + "."));

  out.push(kh(`Задание 6. Лента времени (${W.taskPoints.timeline} б.)`));
  [...W.timeline].sort((a, b) => a.order - b.order).forEach((h) => out.push(kp(`${h.order}. ${h.year} г. — ${h.text}`)));

  out.push(kh("Задание 7. Ситуационная задача (оценивает преподаватель)"));
  W.caseStudy.key.forEach((k, i) => out.push(kp(`${i + 1}) ${k}`)));

  out.push(kh("Задание 8. Работа с официальным источником"));
  out.push(kp(W.researchKey));

  out.push(kh(`Рекомендуемая шкала оценки (задания 0–6, максимум ${W.autoTotal} б.)`));
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1900, ...W.gradeScale.map(() => 770)],
    rows: [
      new TableRow({ children: [cell([p([t("% выполнения", { bold: true, size: 20 })])]), ...W.gradeScale.map((g) => cell([p([t(`${g.min}+`, { size: 20 })], { alignment: AlignmentType.CENTER })]))] }),
      new TableRow({ children: [cell([p([t("Отметка", { bold: true, size: 20 })])]), ...W.gradeScale.map((g) => cell([p([t(String(g.grade), { size: 20, bold: true })], { alignment: AlignmentType.CENTER })]))] }),
      new TableRow({ children: [cell([p([t("Баллы", { bold: true, size: 20 })])]), ...W.gradeScale.map((g) => cell([p([t(`${Math.ceil((g.min / 100) * W.autoTotal)}+`, { size: 20 })], { alignment: AlignmentType.CENTER })]))] }),
    ],
  }));
  return out;
}

const doc = new Document({
  creator: "Преподаватель",
  title: `Рабочий лист: ${W.meta.title}`,
  styles: { default: { document: { run: { font: FONT, size: 24 } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 900 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [t(`${W.meta.title} · стр. `, { size: 18, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: GREY })] })] }) },
    children: [...studentPart(), ...keyPart()],
  }],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("public/rabochiy-list-bankovskaya-sistema-rb.docx", buf);
console.log("ok", buf.length);

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Eraser, ListChecks, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TaskCard } from "@/components/worksheet/TaskCard";
import {
  actorLabels,
  autoTotal,
  caseStudy,
  definitions,
  functionsTable,
  gradeFromPercent,
  gradeScale,
  isAccepted,
  meta,
  notes,
  quiz,
  reflection,
  research,
  researchKey,
  scheme,
  taskPoints,
  terms,
  timeline,
  trueFalse,
  type Actor,
  type Blank,
} from "@/lib/worksheet";
import {
  allTasks,
  emptyState,
  schemeCorrect,
  scoreTask,
  totalScore,
  type TaskKey,
  type WorksheetState,
} from "@/lib/worksheet-score";

const TITLE = "Рабочий лист: Банковская система Республики Беларусь";
const DESCRIPTION =
  "Интерактивный рабочий лист для учащихся 1 курса специальности «Банковское дело»: схема, термины, тест, хронология, ситуационная задача и ключ ответов.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Worksheet,
});

const STORAGE_KEY = "worksheet-bank-system-rb-v1";
const DOCX_URL = "/rabochiy-list-bankovskaya-sistema-rb.docx";

type FieldState = "ok" | "bad" | undefined;

function Worksheet() {
  const [state, setState] = useState<WorksheetState>(emptyState);
  const [showKey, setShowKey] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...emptyState, ...(JSON.parse(raw) as WorksheetState) });
    } catch {
      /* ignore corrupted storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const setText = (id: string, value: string) =>
    setState((s) => ({ ...s, text: { ...s.text, [id]: value } }));
  const check = (task: TaskKey) => setState((s) => ({ ...s, checked: { ...s.checked, [task]: true } }));
  const checkAll = () =>
    setState((s) => ({ ...s, checked: Object.fromEntries(allTasks.map((t) => [t, true])) }));
  const reset = () => {
    if (window.confirm("Очистить все ответы на этом листе?")) setState(emptyState);
  };

  const scoreOf = (task: TaskKey) => (state.checked[task] ? scoreTask(task, state) : null);
  const allChecked = allTasks.every((t) => state.checked[t]);
  const total = useMemo(() => totalScore(state), [state]);
  const percent = Math.round((total / autoTotal) * 100);
  const schemeOk = schemeCorrect(state);

  const blankState = (task: TaskKey, ok: boolean): FieldState =>
    state.checked[task] ? (ok ? "ok" : "bad") : undefined;

  return (
    <div className="min-h-screen pb-20">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-20 border-b border-border bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[900px] flex-wrap items-center gap-2 px-4 py-2.5">
          <span className="eyebrow mr-auto hidden sm:inline">Рабочий лист · {meta.specialty}</span>
          <label className="flex items-center gap-2 rounded-md px-2 text-sm text-foreground">
            <Switch checked={showKey} onCheckedChange={setShowKey} aria-label="Показать ответы" />
            Ответы
          </label>
          <Button size="sm" variant="ghost" onClick={reset}>
            <Eraser /> Очистить
          </Button>
          <Button size="sm" variant="outline" onClick={checkAll}>
            <ListChecks /> Проверить всё
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={DOCX_URL} download>
              <Download /> Word
            </a>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer /> Печать
          </Button>
        </div>
      </div>

      <main className="sheet animate-rise mx-auto mt-8 max-w-[900px] overflow-hidden rounded-sm sm:mt-10">
        <div className="ornament-band" />
        <div className="px-6 py-10 sm:px-14">
          {/* Title block */}
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow">
              {meta.level} · {meta.specialty} · {meta.course}
            </p>
            <p className="eyebrow">Время: {meta.duration}</p>
          </div>
          <p className="mt-6 font-display text-sm italic text-ornament">Рабочий лист</p>
          <h1 className="mt-1 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {meta.title}
          </h1>
          <div className="ornament-rule mt-6 w-24" />

          <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-[2fr_1fr_1fr]">
            {[
              { id: "student", label: "Фамилия, имя" },
              { id: "group", label: "Группа" },
              { id: "date", label: "Дата" },
            ].map((f) => (
              <label key={f.id} className="block">
                <span className="eyebrow">{f.label}</span>
                <input
                  className="fill-line mt-1 w-full py-1"
                  value={state.text[f.id] ?? ""}
                  onChange={(e) => setText(f.id, e.target.value)}
                />
              </label>
            ))}
          </div>

          <div className="mt-8 rounded-md bg-muted p-5">
            <p className="eyebrow mb-2">Цели работы — после занятия вы будете</p>
            <ul className="space-y-1 text-sm leading-relaxed text-foreground">
              {meta.goals.map((g) => (
                <li key={g} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rotate-45 bg-ornament" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 space-y-10">
            {/* Опорный конспект */}
            <TaskCard
              number="0"
              title="Опорный конспект"
              instruction="Прочитайте текст и заполните пропуски. Используйте Банковский кодекс Республики Беларусь."
              points={taskPoints.notes}
              score={scoreOf("notes")}
              onCheck={() => check("notes")}
            >
              <ol className="space-y-3 text-[15px] leading-[2.1] text-foreground">
                {notes.map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs leading-[2.6] text-muted-foreground">{i + 1}.</span>
                    <span>
                      {line.map((seg, j) =>
                        typeof seg === "string" ? (
                          <span key={j}>{seg}</span>
                        ) : (
                          <BlankInput
                            key={seg.id}
                            blank={seg}
                            value={state.text[seg.id] ?? ""}
                            onChange={(v) => setText(seg.id, v)}
                            state={blankState("notes", isAccepted(state.text[seg.id] ?? "", seg.accepted))}
                            showKey={showKey}
                          />
                        ),
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </TaskCard>

            {/* 1. Схема */}
            <TaskCard
              number={1}
              title="Структура банковской системы"
              instruction="Впишите в схему названия звеньев банковской системы Республики Беларусь. Подсказки — под каждым блоком."
              points={taskPoints.scheme}
              score={scoreOf("scheme")}
              onCheck={() => check("scheme")}
            >
              <div className="rounded-md border border-border p-5 sm:p-7">
                <p className="eyebrow mb-4 text-center">Банковская система Республики Беларусь</p>
                <div className="mx-auto max-w-sm">
                  <SchemeBox
                    label={scheme.top.label}
                    hint={scheme.top.hint}
                    value={state.text[scheme.top.id] ?? ""}
                    onChange={(v) => setText(scheme.top.id, v)}
                    state={blankState("scheme", schemeOk[scheme.top.id] ?? false)}
                    keyText={showKey ? scheme.top.accepted[0] : undefined}
                    emphasis
                  />
                </div>
                <div className="relative mx-auto h-8 max-w-md">
                  <div className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-primary" />
                  <div className="absolute left-[25%] right-[25%] top-4 h-0.5 bg-primary" />
                  <div className="absolute left-[25%] top-4 h-4 w-0.5 bg-primary" />
                  <div className="absolute right-[25%] top-4 h-4 w-0.5 bg-primary" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[scheme.left, scheme.right].map((box) => (
                    <SchemeBox
                      key={box.id}
                      label={box.label}
                      hint={box.hint}
                      value={state.text[box.id] ?? ""}
                      onChange={(v) => setText(box.id, v)}
                      state={blankState("scheme", schemeOk[box.id] ?? false)}
                      keyText={showKey ? box.accepted[0] : undefined}
                    />
                  ))}
                </div>
                <p className="mt-6 text-center text-sm leading-loose text-foreground">
                  {scheme.special.before}
                  <BlankInput
                    blank={{ id: scheme.special.id, accepted: scheme.special.accepted, width: 9 }}
                    value={state.text[scheme.special.id] ?? ""}
                    onChange={(v) => setText(scheme.special.id, v)}
                    state={blankState("scheme", schemeOk[scheme.special.id] ?? false)}
                    showKey={showKey}
                  />
                  {scheme.special.after}
                </p>
              </div>
            </TaskCard>

            {/* 2. Термины */}
            <TaskCard
              number={2}
              title="Терминологический словарь"
              instruction="Соотнесите термин с его определением: выберите букву определения для каждого термина."
              points={taskPoints.terms}
              score={scoreOf("terms")}
              onCheck={() => check("terms")}
            >
              <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
                <ol className="space-y-2">
                  {terms.map((t, i) => {
                    const st = blankState("terms", state.terms[t.id] === t.answer);
                    return (
                      <li key={t.id} className="flex items-center gap-3 text-sm">
                        <span className="w-5 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                        <span className="flex-1 font-medium text-foreground">{t.term}</span>
                        <select
                          aria-label={`Определение для: ${t.term}`}
                          className="field-box w-16 py-1 text-center"
                          data-state={st}
                          value={state.terms[t.id] ?? ""}
                          onChange={(e) =>
                            setState((s) => ({ ...s, terms: { ...s.terms, [t.id]: e.target.value } }))
                          }
                        >
                          <option value="">—</option>
                          {definitions.map((d) => (
                            <option key={d.letter} value={d.letter}>
                              {d.letter}
                            </option>
                          ))}
                        </select>
                        {showKey && <span className="key-note w-4">{t.answer}</span>}
                      </li>
                    );
                  })}
                </ol>
                <ul className="space-y-2.5 border-border text-sm leading-relaxed md:border-l md:pl-6">
                  {definitions.map((d) => (
                    <li key={d.letter} className="flex gap-3">
                      <span className="font-display font-semibold text-ornament">{d.letter}</span>
                      <span className="text-foreground">{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TaskCard>

            {/* 3. Функции */}
            <TaskCard
              number={3}
              title="Кто это делает?"
              instruction="Определите, кто выполняет функцию или операцию: Национальный банк или банк второго уровня."
              points={taskPoints.functions}
              score={scoreOf("functions")}
              onCheck={() => check("functions")}
            >
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Функция / операция</th>
                      {(Object.keys(actorLabels) as Actor[]).map((a) => (
                        <th key={a} className="w-32 px-2 py-2.5 text-center font-medium text-muted-foreground">
                          {actorLabels[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {functionsTable.map((f, i) => {
                      const picked = state.functions[f.id];
                      return (
                        <tr key={f.id} className="border-t border-border">
                          <td className="px-4 py-2 text-foreground">
                            <span className="mr-2 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                            {f.text}
                          </td>
                          {(Object.keys(actorLabels) as Actor[]).map((a) => {
                            const selected = picked === a;
                            const st: FieldState =
                              state.checked.functions && selected ? (a === f.answer ? "ok" : "bad") : undefined;
                            return (
                              <td key={a} className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  aria-label={`${f.text} — ${actorLabels[a]}`}
                                  className="choice-pill inline-flex size-7 items-center justify-center p-0"
                                  data-selected={selected}
                                  data-state={st}
                                  onClick={() =>
                                    setState((s) => ({ ...s, functions: { ...s.functions, [f.id]: a } }))
                                  }
                                >
                                  {selected ? "✓" : ""}
                                </button>
                                {showKey && a === f.answer && <div className="key-note">ответ</div>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TaskCard>

            {/* 4. Тест */}
            <TaskCard
              number={4}
              title="Тест"
              instruction="Выберите один правильный ответ."
              points={taskPoints.quiz}
              score={scoreOf("quiz")}
              onCheck={() => check("quiz")}
            >
              <ol className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                {quiz.map((q, i) => (
                  <li key={q.id} className="print-avoid-break">
                    <p className="text-sm font-medium text-foreground">
                      <span className="mr-1 font-mono text-xs text-muted-foreground">{i + 1}.</span> {q.q}
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const selected = state.quiz[q.id] === oi;
                        const isRight = oi === q.answer;
                        const st: FieldState = state.checked.quiz && selected ? (isRight ? "ok" : "bad") : undefined;
                        return (
                          <label
                            key={opt}
                            className="flex cursor-pointer items-start gap-2 rounded px-1.5 py-0.5 text-sm text-foreground hover:bg-muted"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              className="mt-1 accent-primary"
                              checked={selected}
                              onChange={() => setState((s) => ({ ...s, quiz: { ...s.quiz, [q.id]: oi } }))}
                            />
                            <span
                              className={
                                st === "ok"
                                  ? "font-medium text-success"
                                  : st === "bad"
                                    ? "text-destructive line-through"
                                    : showKey && isRight
                                      ? "font-medium text-success"
                                      : ""
                              }
                            >
                              {String.fromCharCode(1072 + oi)}) {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ol>
            </TaskCard>

            {/* 5. Верно / неверно */}
            <TaskCard
              number={5}
              title="Верно или неверно?"
              instruction="Оцените каждое утверждение. Неверные утверждения устно исправьте."
              points={taskPoints.trueFalse}
              score={scoreOf("trueFalse")}
              onCheck={() => check("trueFalse")}
            >
              <ol className="divide-y divide-border">
                {trueFalse.map((t, i) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className="w-5 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                    <span className="min-w-0 flex-1 text-sm text-foreground">{t.text}</span>
                    <div className="flex gap-1.5">
                      {[true, false].map((val) => {
                        const selected = state.tf[t.id] === val;
                        const st: FieldState =
                          state.checked.trueFalse && selected ? (val === t.answer ? "ok" : "bad") : undefined;
                        return (
                          <button
                            key={String(val)}
                            type="button"
                            className="choice-pill"
                            data-selected={selected}
                            data-state={st}
                            onClick={() => setState((s) => ({ ...s, tf: { ...s.tf, [t.id]: val } }))}
                          >
                            {val ? "Верно" : "Неверно"}
                          </button>
                        );
                      })}
                    </div>
                    {showKey && <span className="key-note w-16">{t.answer ? "верно" : "неверно"}</span>}
                  </li>
                ))}
              </ol>
            </TaskCard>

            {/* 6. Хронология */}
            <TaskCard
              number={6}
              title="Лента времени"
              instruction="Расставьте события в хронологическом порядке: поставьте номер от 1 (самое раннее) до 5."
              points={taskPoints.timeline}
              score={scoreOf("timeline")}
              onCheck={() => check("timeline")}
            >
              <ul className="space-y-2">
                {timeline.map((h) => {
                  const st = blankState("timeline", Number(state.timeline[h.id]) === h.order);
                  return (
                    <li key={h.id} className="flex items-center gap-4 rounded-md border border-border px-4 py-2.5">
                      <input
                        inputMode="numeric"
                        maxLength={1}
                        aria-label={`Порядковый номер: ${h.text}`}
                        className="field-box w-11 text-center font-display text-lg font-semibold"
                        data-state={st}
                        value={state.timeline[h.id] ?? ""}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            timeline: { ...s.timeline, [h.id]: e.target.value.replace(/[^1-5]/g, "") },
                          }))
                        }
                      />
                      <span className="flex-1 text-sm text-foreground">{h.text}</span>
                      {showKey && (
                        <span className="key-note">
                          {h.order} · {h.year} г.
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </TaskCard>

            {/* 7. Кейс */}
            <TaskCard
              number={7}
              title="Ситуационная задача"
              instruction="Прочитайте ситуацию и письменно ответьте на вопросы. Оценивает преподаватель."
            >
              <blockquote className="rounded-md border-l-4 border-ornament bg-muted px-5 py-4 font-display text-[15px] italic leading-relaxed text-foreground">
                {caseStudy.text}
              </blockquote>
              <ol className="mt-5 space-y-5">
                {caseStudy.questions.map((q, i) => (
                  <li key={q}>
                    <p className="text-sm font-medium text-foreground">
                      {i + 1}. {q}
                    </p>
                    <textarea
                      rows={3}
                      aria-label={q}
                      className="writing-lines mt-1 w-full resize-y border-0 bg-transparent px-1 text-sm text-primary outline-none"
                      value={state.text[`c${i}`] ?? ""}
                      onChange={(e) => setText(`c${i}`, e.target.value)}
                    />
                    {showKey && <KeyBlock>{caseStudy.key[i]}</KeyBlock>}
                  </li>
                ))}
              </ol>
            </TaskCard>

            {/* 8. Исследование */}
            <TaskCard
              number={8}
              title="Работа с официальным источником"
              instruction="Используя официальный сайт Национального банка (nbrb.by), найдите актуальные данные. Оценивает преподаватель."
            >
              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {research.map((r) => (
                  <label key={r.id} className={r.id === "r5" ? "block sm:col-span-2" : "block"}>
                    <span className="text-sm text-foreground">{r.label}</span>
                    <input
                      className="fill-line mt-1 w-full py-1"
                      value={state.text[r.id] ?? ""}
                      onChange={(e) => setText(r.id, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              {showKey && <KeyBlock>{researchKey}</KeyBlock>}
            </TaskCard>

            {/* Рефлексия */}
            <TaskCard number="★" title="Рефлексия" instruction="Продолжите фразы.">
              <ul className="space-y-4">
                {reflection.map((r, i) => (
                  <li key={r}>
                    <p className="font-display text-sm italic text-foreground">{r}</p>
                    <input
                      className="fill-line mt-1 w-full py-1"
                      aria-label={r}
                      value={state.text[`ref${i}`] ?? ""}
                      onChange={(e) => setText(`ref${i}`, e.target.value)}
                    />
                  </li>
                ))}
              </ul>
            </TaskCard>

            {/* Итог */}
            <section className="print-avoid-break rounded-md border-2 border-primary p-6">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">Итог по заданиям 0–6</p>
                  {allChecked ? (
                    <p className="mt-2 font-display text-4xl font-semibold text-foreground">
                      {total} <span className="text-xl text-muted-foreground">/ {autoTotal} баллов</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Нажмите «Проверить всё», чтобы увидеть результат. Максимум — {autoTotal} баллов.
                    </p>
                  )}
                </div>
                {allChecked && (
                  <div className="text-right">
                    <p className="eyebrow">Выполнено {percent}% · рекомендуемая отметка</p>
                    <p className="font-display text-5xl font-semibold text-primary">{gradeFromPercent(percent)}</p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Задания 7–8 и рефлексию оценивает преподаватель. Шкала (% → отметка):{" "}
                {gradeScale.map((g) => `${g.min}%+ → ${g.grade}`).join(" · ")}.
              </p>
            </section>

            <footer className="text-xs leading-relaxed text-muted-foreground">
              <p className="eyebrow mb-1">Источники</p>
              <ul className="list-inside list-disc">
                {meta.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </footer>
          </div>
        </div>
        <div className="ornament-band" />
      </main>
    </div>
  );
}

function BlankInput({
  blank,
  value,
  onChange,
  state,
  showKey,
}: {
  blank: Blank;
  value: string;
  onChange: (v: string) => void;
  state: FieldState;
  showKey: boolean;
}) {
  return (
    <span className="inline-flex flex-col align-baseline">
      <input
        aria-label="Пропуск"
        className="fill-line mx-1 leading-tight"
        style={{ width: `${Math.min(30, Math.max(blank.width, blank.accepted[0]?.length ?? 0)) + 2}ch` }}
        data-state={state}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showKey && <span className="key-note -mt-1 px-1 leading-tight">{blank.accepted[0]}</span>}
    </span>
  );
}

function SchemeBox({
  label,
  hint,
  value,
  onChange,
  state,
  keyText,
  emphasis,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  state: FieldState;
  keyText?: string | undefined;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "rounded-md bg-secondary p-3" : "rounded-md bg-muted p-3"}>
      <p className="eyebrow mb-1.5 text-center">{label}</p>
      <input
        aria-label={`${label}: ${hint}`}
        className="field-box text-center font-medium"
        data-state={state}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-1.5 text-center text-xs italic text-muted-foreground">{hint}</p>
      {keyText && <p className="key-note mt-1 text-center">{keyText}</p>}
    </div>
  );
}

function KeyBlock({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 rounded-md bg-success-soft px-4 py-2.5 text-sm leading-relaxed text-foreground">
      <span className="key-note mr-2 font-semibold">Ключ:</span>
      {children}
    </div>
  );
}

const app = document.getElementById("app");
const tabs = [
  { id: "overview", label: "Сводка" },
  { id: "projects", label: "Проекты" },
  { id: "managers", label: "Руководители" },
  { id: "methodology", label: "Методология" },
  { id: "archive", label: "Архив" }
];

const state = {
  activeTab: "overview",
  fileChecks: [],
  archiveDocs: [],
  archiveLoading: true,
  archiveMessage: ""
};

const ARCHIVE_DB = "project-svetofor-archive";
const ARCHIVE_STORE = "documents";
const ARCHIVE_SEED_KEY = "project-svetofor-archive-seed-20260504-q2-v2";
const ARCHIVE_SEED = Array.isArray(window.archiveSeed) ? window.archiveSeed : [];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatBytes(bytes = 0) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Б";
  const units = ["Б", "КБ", "МБ", "ГБ"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** power;
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
}

function tag(status, label) {
  return `<span class="tag ${status}">${escapeHtml(label)}</span>`;
}

function openArchiveDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ARCHIVE_DB, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ARCHIVE_STORE)) {
        const store = db.createObjectStore(ARCHIVE_STORE, { keyPath: "id" });
        store.createIndex("by_savedAt", "savedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function archiveGetAll() {
  const db = await openArchiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ARCHIVE_STORE, "readonly");
    const store = tx.objectStore(ARCHIVE_STORE);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const rows = [...request.result].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      resolve(rows);
    };
  });
}

async function archivePut(record) {
  const db = await openArchiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ARCHIVE_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(ARCHIVE_STORE).put(record);
  });
}

async function archiveDelete(id) {
  const db = await openArchiveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ARCHIVE_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(ARCHIVE_STORE).delete(id);
  });
}

async function ensureArchiveSeed(existingDocs = []) {
  if (!ARCHIVE_SEED.length || localStorage.getItem(ARCHIVE_SEED_KEY) === "done") {
    return {
      docs: existingDocs,
      imported: 0
    };
  }

  for (const item of ARCHIVE_SEED) {
    await archivePut({
      ...item,
      blob: new Blob([item.content], { type: item.mime || "text/markdown;charset=utf-8" })
    });
  }

  localStorage.setItem(ARCHIVE_SEED_KEY, "done");
  return {
    docs: await archiveGetAll(),
    imported: ARCHIVE_SEED.length
  };
}

function parseFileName(name) {
  const match = name.match(/^(rating|project_protocol|checklist)_(\d{2}\.\d{2}\.\d{4})_([A-Za-zА-Яа-я0-9-]+)_(.+)\.(md|xlsx)$/u);
  if (!match) return null;
  return {
    type: match[1],
    date: match[2],
    projectCode: match[3],
    projectName: match[4],
    ext: match[5]
  };
}

function documentTypeLabel(type) {
  switch (type) {
    case "rating":
      return "Weekly rating";
    case "project_protocol":
      return "Протокол проекта";
    case "checklist":
      return "Чек-лист";
    default:
      return type;
  }
}

function missingList() {
  return dashboard.summary.missingProjectNames.length
    ? dashboard.summary.missingProjectNames.map((name) => `<li>${escapeHtml(name)}</li>`).join("")
    : "<li>Все проекты сдали отчёты</li>";
}

function historyMarkup() {
  return dashboard.history.map((week) => {
    const total = week.green + week.yellow + week.red || 1;
    return `
      <article class="historyWeek">
        <div class="historyDate">${escapeHtml(week.date)}</div>
        <div class="stack">
          <div class="stackBar"><div class="stackFill" style="width:${(week.green / total) * 100}%;background:var(--green)"></div></div>
        </div>
        <div class="stack">
          <div class="stackBar"><div class="stackFill" style="width:${(week.yellow / total) * 100}%;background:var(--yellow)"></div></div>
        </div>
        <div class="stack">
          <div class="stackBar"><div class="stackFill" style="width:${(week.red / total) * 100}%;background:var(--red)"></div></div>
        </div>
        <div class="historyStats">
          <span>Зелёных: ${week.green}</span>
          <span>Жёлтых: ${week.yellow}</span>
          <span>Красных: ${week.red}</span>
          <strong>Среднее качество: ${week.avgQuality}%</strong>
        </div>
      </article>
    `;
  }).join("");
}

function nextWeekFocusMarkup() {
  return dashboard.projects
    .filter((project) => project.nextWeekPlan?.length)
    .slice(0, 4)
    .map((project) => {
      const item = project.nextWeekPlan[0];
      return `
        <article class="focusItem">
          <div class="focusTop">
            <div>
              <div class="focusProject">${escapeHtml(project.code)} · ${escapeHtml(project.name)}</div>
              <div class="focusMeta">${escapeHtml(project.manager)}</div>
            </div>
            ${tag(project.status, project.statusLabel)}
          </div>
          <strong>${escapeHtml(item.task)}</strong>
          <div class="focusMeta">Срок: ${escapeHtml(item.due)} · Ответственный: ${escapeHtml(item.owner)}</div>
          <div class="focusMeta">Ожидаемый результат: ${escapeHtml(item.result)}</div>
        </article>
      `;
    })
    .join("");
}

function projectCardsMarkup() {
  return dashboard.projects.map((project) => {
    const plan = project.nextWeekPlan.map((item) => `
      <li class="nextPlanItem">
        <div class="nextPlanRow">
          <span class="nextPlanTask">${escapeHtml(item.task)}</span>
          <span class="nextPlanDue">${escapeHtml(item.due)}</span>
        </div>
        <div class="projectManager">${escapeHtml(item.owner)}</div>
        <div class="projectManager">${escapeHtml(item.result)}</div>
      </li>
    `).join("");

    const flags = [
      project.escalation ? `<span class="chip danger">Эскалация</span>` : "",
      project.protocolStatus !== project.status ? `<span class="chip warn">Rating ≠ Protocol</span>` : "",
      !project.reportSubmitted ? `<span class="chip danger">Не сдал weekly</span>` : ""
    ].filter(Boolean).join("");

    return `
      <article class="card projectCard">
        <div class="projectTop">
          <div>
            <div class="projectCode">${escapeHtml(project.code)}</div>
            <h2 class="projectTitle">${escapeHtml(project.name)}</h2>
            <div class="projectManager">РП: ${escapeHtml(project.manager)} · Заказчик: ${escapeHtml(project.customer)}</div>
          </div>
          ${tag(project.status, project.statusLabel)}
        </div>

        <div class="projectMetrics">
          <div class="projectMetric">
            <div class="projectMetricLabel">Балл недели</div>
            <div class="projectMetricValue">${project.score ?? "—"}</div>
          </div>
          <div class="projectMetric">
            <div class="projectMetricLabel">Прогресс</div>
            <div class="projectMetricValue">${project.progress ?? "—"}${project.progress != null ? "%" : ""}</div>
          </div>
          <div class="projectMetric">
            <div class="projectMetricLabel">Качество weekly</div>
            <div class="projectMetricValue">${project.quality ?? "—"}${project.quality != null ? "%" : ""}</div>
          </div>
          <div class="projectMetric">
            <div class="projectMetricLabel">Чек-лист</div>
            <div class="projectMetricValue">${project.greenChecks ?? "—"}${project.greenChecks != null ? "/18" : ""}</div>
          </div>
        </div>

        <div class="projectSummary">
          ${flags ? `<div class="projectFlags">${flags}</div>` : ""}
          <section class="infoBlock">
            <h3>Итог недели</h3>
            <p>${escapeHtml(project.weekSummary)}</p>
          </section>
          <section class="infoBlock">
            <h3>Ключевой риск</h3>
            <p>${escapeHtml(project.risk)}</p>
          </section>
          <section class="infoBlock">
            <h3>Критический следующий шаг</h3>
            <p>${escapeHtml(project.nextCriticalStep)}</p>
          </section>
          <section class="infoBlock">
            <h3>План следующей недели</h3>
            <ul class="nextPlanList">${plan}</ul>
          </section>
          ${project.deviations.length ? `
            <section class="infoBlock">
              <h3>Отклонения</h3>
              <ul class="methodList">${project.deviations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function managerSort(a, b) {
  const scoreDiff = b.averageScore - a.averageScore;
  if (scoreDiff) return scoreDiff;
  const qualityDiff = b.averageQuality - a.averageQuality;
  if (qualityDiff) return qualityDiff;
  const escalationDiff = a.escalations - b.escalations;
  if (escalationDiff) return escalationDiff;
  const greenShareA = a.reportCount ? a.green / a.reportCount : 0;
  const greenShareB = b.reportCount ? b.green / b.reportCount : 0;
  if (greenShareB !== greenShareA) return greenShareB - greenShareA;
  return a.name.localeCompare(b.name, "ru");
}

function managersMarkup() {
  const sorted = [...dashboard.managers].sort(managerSort);
  const cards = sorted.map((manager, index) => `
    <article class="card managerCard">
      <div class="managerCardTop">
        <h3 class="managerCardTitle">${escapeHtml(manager.name)}</h3>
        <span class="managerCardBadge">#${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="metricValue" style="font-size:42px;margin-top:14px">${manager.averageScore.toFixed(2)}</div>
      <div class="metricSub">Средний балл за период · качество ${manager.averageQuality}% · эскалаций ${manager.escalations}</div>
    </article>
  `).join("");

  const rows = sorted.map((manager, index) => {
    const week = manager.weekProjects.map((item) => `${item.name}: ${item.score}`).join(" · ");
    return `
      <tr>
        <td class="managerRank">${String(index + 1).padStart(2, "0")}</td>
        <td>
          <div class="managerName">${escapeHtml(manager.name)}</div>
          <div class="managerSub">${manager.projects} проект(а) · ${manager.reportCount} weekly в накоплении</div>
        </td>
        <td class="managerScore">${manager.averageScore.toFixed(2)}</td>
        <td class="managerScore">${manager.totalScore}</td>
        <td>${manager.averageQuality}%</td>
        <td>${manager.escalations}</td>
        <td>${week ? escapeHtml(week) : "—"}</td>
      </tr>
    `;
  }).join("");

  return `
    <section class="sectionStack">
      <div class="managerCards">${cards}</div>
      <section class="card panelBody">
        <div class="panelHeader">
          <div>
            <h2>Накопительный рейтинг РП</h2>
            <p>Предлагаемое правило ранжирования встроено в методологию этой версии.</p>
          </div>
        </div>
        <div class="managerFormula">
          <strong>Предлагаемое правило:</strong> накопительный рейтинг РП считается как средний weekly-балл по всем проектам и неделям периода. 
          Если по активному проекту weekly не сдан, балл недели по нему считается как <strong>0</strong>. 
          При равенстве среднего балла места ранжируются по: 1) среднему качеству weekly, 2) меньшему числу эскалаций, 3) большей доле зелёных статусов.
        </div>
        <div class="managerTableShell" style="margin-top:18px">
          <table class="managerTable">
            <thead>
              <tr>
                <th>Место</th>
                <th>Руководитель</th>
                <th>Средний балл</th>
                <th>Итого баллов</th>
                <th>Качество</th>
                <th>Эскалации</th>
                <th>Неделя</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function methodologyMarkup() {
  const validatorRows = state.fileChecks.length
    ? state.fileChecks.map((item) => `
        <div class="validatorRow ${item.valid ? "ok" : "bad"}">
          <div class="validatorName">${escapeHtml(item.name)}</div>
          <div class="validatorHint">${escapeHtml(item.message)}</div>
        </div>
      `).join("")
    : `<div class="validatorRow"><div class="validatorHint">Выберите файлы и сразу увидите, проходят ли они по правилу имени.</div></div>`;

  return `
    <section class="sectionStack">
      <article class="card methodIntro">
        <div class="panelHeader">
          <div>
            <h2>Как устроена методика в этой версии</h2>
            <p>Цвет светофора, weekly-балл и итоговый статус проекта формирует агент на стороне протокола. Интерфейс не пересчитывает логику агента, а прозрачно показывает её результат.</p>
          </div>
        </div>
        <p>
          В интерфейс добавлены те части, которых обычно не хватает на weekly: <strong>план следующей недели</strong>, требования к имени файлов,
          явные правила накопительного рейтинга РП и разделение между проектной методикой и формальной логикой агента.
        </p>
      </article>

      <div class="methodGrid">
        <article class="card methodCard">
          <h3>Обязательная карточка проекта</h3>
          <ul class="methodList">
            <li>Код и название проекта, заказчик и руководитель проекта.</li>
            <li>Итог недели, ключевой риск, критический следующий шаг.</li>
            <li>План следующей недели: действие, ответственный, срок, ожидаемый результат.</li>
            <li>Отклонения и признаки эскалации, если они есть.</li>
          </ul>
        </article>

        <article class="card methodCard">
          <h3>Накопительный рейтинг РП</h3>
          <ul class="methodList">
            <li>Базовая единица расчёта: weekly-балл по проекту за неделю.</li>
            <li>Если weekly по активному проекту не сдан, за эту неделю по проекту ставится 0.</li>
            <li>Накопительный рейтинг РП = средний балл по всем проектам и неделям периода.</li>
            <li>Тай-брейки: качество weekly → меньше эскалаций → выше доля зелёных статусов.</li>
          </ul>
        </article>

        <article class="card methodCard">
          <h3>Что остаётся у агента</h3>
          <ul class="methodList">
            <li>Расчёт зелёного, жёлтого и красного статуса.</li>
            <li>Вес weekly-фактов, рисков, отклонений и эскалаций.</li>
            <li>Расчёт weekly-балла проекта.</li>
            <li>Интерфейс только отображает результат и сохраняет объяснимость.</li>
          </ul>
        </article>

        <article class="card methodCard">
          <h3>Требования к документам</h3>
          <ul class="methodList">
            <li>Все weekly-документы именуются по единому шаблону.</li>
            <li>Обязательные части имени: тип документа, дата сдачи, номер проекта, название проекта.</li>
            <li>Ручные приписки вроде <strong>final</strong>, <strong>новый</strong>, <strong>(1)</strong> не допускаются.</li>
            <li>Система должна валидировать имя файла до обработки содержимого.</li>
          </ul>
          <ul class="namingExamples">
            <li><span class="codeLine">rating_04.05.2026_S-26-02_Партнер 2.0.md</span></li>
            <li><span class="codeLine">project_protocol_04.05.2026_S-26-02_Партнер 2.0.md</span></li>
            <li><span class="codeLine">checklist_04.05.2026_S-26-02_Партнер 2.0.xlsx</span></li>
          </ul>
        </article>
      </div>

      <article class="card methodCard">
        <div class="panelHeader">
          <div>
            <h2>Проверка имени файла</h2>
            <p>Это уже не просто памятка, а живой валидатор под загрузку людьми.</p>
          </div>
        </div>
        <div class="validator">
          <div class="validatorInput">
            <label class="fileLabel">
              Выбрать файлы
              <input id="validatorInput" type="file" multiple />
            </label>
            <div class="validatorHint">Поддерживаемые маски: rating / project_protocol / checklist</div>
          </div>
          <div class="validatorResult">${validatorRows}</div>
        </div>
        <div class="footNote">
          Регулярность статусов, план задач, риски, критерии приёмки и эскалации берутся из проектной методологии, но weekly-цвет и балл проекта рассчитываются агентом.
        </div>
      </article>
    </section>
  `;
}

function archiveMarkup() {
  const protocols = state.archiveDocs.filter((item) => item.type === "project_protocol").length;
  const ratings = state.archiveDocs.filter((item) => item.type === "rating").length;
  const checklists = state.archiveDocs.filter((item) => item.type === "checklist").length;

  const rows = state.archiveDocs.length
    ? state.archiveDocs.map((item) => `
        <article class="archiveRow">
          <div class="archiveMain">
            <div class="archiveTitle">${escapeHtml(item.projectCode)} · ${escapeHtml(item.projectName)}</div>
            <div class="archiveMeta">
              <span>${escapeHtml(documentTypeLabel(item.type))}</span>
              <span>${escapeHtml(item.periodDate)}</span>
              <span>${escapeHtml(formatBytes(item.size))}</span>
              <span>Сохранён: ${escapeHtml(formatDate(item.savedAt))}</span>
            </div>
            <div class="archiveFileName">${escapeHtml(item.name)}</div>
          </div>
          <div class="archiveActions">
            <button class="archiveButton" data-archive-download="${escapeHtml(item.id)}">Скачать</button>
            <button class="archiveButton ghost" data-archive-delete="${escapeHtml(item.id)}">Удалить</button>
          </div>
        </article>
      `).join("")
    : `
      <article class="archiveEmpty">
        <strong>Архив пока пуст.</strong>
        <span>Загрузите протоколы, weekly-rating и чек-листы. Они сохранятся локально в браузере этого ноутбука и будут доступны для скачивания позже.</span>
      </article>
    `;

  return `
    <section class="sectionStack">
      <article class="card methodIntro">
        <div class="panelHeader">
          <div>
            <h2>Архив weekly-документов</h2>
            <p>Локальное хранилище для чек-листов, rating и project protocol. Файлы сохраняются прямо в браузере и не исчезают после перезагрузки страницы.</p>
          </div>
        </div>
        <p>
          Это рабочий контур хранения без отдельного backend: проектники могут загрузить документы, а потом скачать их в любой момент.
          Для совместного командного архива следующим шагом уже нужен сервер или облачное хранилище.
        </p>
      </article>

      <section class="metricsGrid archiveMetrics">
        <article class="card metricCard tone-accent">
          <div class="metricLabel">Всего документов</div>
          <div class="metricValue">${state.archiveDocs.length}</div>
          <div class="metricSub">Все сохранённые weekly-файлы.</div>
        </article>
        <article class="card metricCard tone-green">
          <div class="metricLabel">Протоколы</div>
          <div class="metricValue">${protocols}</div>
          <div class="metricSub">Файлы типа <code>project_protocol</code>.</div>
        </article>
        <article class="card metricCard tone-yellow">
          <div class="metricLabel">Rating</div>
          <div class="metricValue">${ratings}</div>
          <div class="metricSub">Файлы типа <code>rating</code>.</div>
        </article>
        <article class="card metricCard tone-red">
          <div class="metricLabel">Чек-листы</div>
          <div class="metricValue">${checklists}</div>
          <div class="metricSub">Файлы типа <code>checklist</code>.</div>
        </article>
      </section>

      <article class="card methodCard">
        <div class="panelHeader">
          <div>
            <h2>Загрузка и скачивание</h2>
            <p>Сначала проверяем имя, потом сохраняем в локальный архив и даём скачивание по одному или пачкой.</p>
          </div>
        </div>
        <div class="archiveToolbar">
          <label class="fileLabel">
            Добавить документы
            <input id="archiveInput" type="file" multiple accept=".md,.xlsx" />
          </label>
          <button class="archiveButton accent" data-archive-download-all ${state.archiveDocs.length ? "" : "disabled"}>Скачать всё</button>
        </div>
        ${state.archiveMessage ? `<div class="archiveNotice">${escapeHtml(state.archiveMessage)}</div>` : ""}
        <div class="archiveList">
          ${state.archiveLoading ? `<article class="archiveEmpty"><span>Читаю локальный архив…</span></article>` : rows}
        </div>
      </article>
    </section>
  `;
}

function overviewMarkup() {
  return `
    <section class="sectionStack">
      <section class="metricsGrid">
        <article class="card metricCard tone-accent">
          <div class="metricLabel">Отчётов за новую неделю</div>
          <div class="metricValue">${dashboard.summary.reportsForNewWeek}</div>
          <div class="metricSub">Из ${dashboard.summary.projects} проектов получили свежий weekly.</div>
        </article>
        <article class="card metricCard tone-red">
          <div class="metricLabel">Не сдали отчёты</div>
          <div class="metricValue">${dashboard.summary.missingReports}</div>
          <div class="metricSub"><ul class="methodList">${missingList()}</ul></div>
        </article>
        <article class="card metricCard tone-green">
          <div class="metricLabel">Качество weekly</div>
          <div class="metricValue">${dashboard.summary.averageQuality}%</div>
          <div class="metricSub">${dashboard.summary.totalGreenChecks} зелёных пунктов из ${dashboard.summary.totalPossibleChecks} по сданным отчётам недели.</div>
        </article>
        <article class="card metricCard tone-yellow">
          <div class="metricLabel">Светофор недели</div>
          <div class="metricValue">${dashboard.summary.green}/${dashboard.summary.yellow}/${dashboard.summary.red}</div>
          <div class="metricSub">Зелёных: ${dashboard.summary.green}, жёлтых: ${dashboard.summary.yellow}, красных: ${dashboard.summary.red}.</div>
        </article>
        <article class="card metricCard ${dashboard.summary.escalations ? "tone-red" : "tone-accent"}">
          <div class="metricLabel">Эскалации</div>
          <div class="metricValue">${dashboard.summary.escalations}</div>
          <div class="metricSub">Выведены отдельно, чтобы weekly не выглядел зелёным до последнего.</div>
        </article>
      </section>

      <section class="twoCol">
        <article class="card panelBody">
          <div class="panelHeader">
            <div>
              <h2>Фокус следующей недели</h2>
              <p>Самое важное по проектам без открытия исходных markdown-файлов.</p>
            </div>
          </div>
          <div class="focusList">${nextWeekFocusMarkup()}</div>
        </article>

        <article class="card panelBody">
          <div class="panelHeader">
            <div>
              <h2>Алерты weekly</h2>
              <p>Не общий шум, а то, что требует внимания на встрече.</p>
            </div>
          </div>
          <div class="alertsList">
            ${dashboard.alerts.map((alert) => `
              <article class="alertItem ${alert.level}">
                <div class="focusTop">
                  <strong>${escapeHtml(alert.project)}</strong>
                  <span class="alertMeta">${alert.level === "warning" ? "Внимание" : "Контроль"}</span>
                </div>
                <div class="alertMeta">${escapeHtml(alert.text)}</div>
              </article>
            `).join("")}
          </div>
        </article>
      </section>

      <section class="card panelBody">
        <div class="panelHeader">
          <div>
            <h2>История статусов по неделям</h2>
            <p>Динамика по цветам и среднему качеству weekly.</p>
          </div>
        </div>
        <div class="historyGrid">${historyMarkup()}</div>
      </section>
    </section>
  `;
}

function activeTabMarkup() {
  switch (state.activeTab) {
    case "projects":
      return `<section class="sectionStack"><div class="projectsGrid">${projectCardsMarkup()}</div></section>`;
    case "managers":
      return managersMarkup();
    case "methodology":
      return methodologyMarkup();
    case "archive":
      return archiveMarkup();
    case "overview":
    default:
      return overviewMarkup();
  }
}

function render() {
  app.innerHTML = `
    <main class="appShell">
      <section class="hero">
        <article class="heroMain">
          <span class="heroEyebrow">Новая версия проектного светофора</span>
          <h1 class="heroTitle">Контур проектов B2B</h1>
          <p class="heroLead">
            Единая weekly-панель для проектников: здесь видно текущий статус проекта, ключевые риски,
            план на следующую неделю, эскалации и качество weekly-отчёта без необходимости открывать каждый документ отдельно.
          </p>
          <div class="heroMeta">
            <span class="metaBadge">Период weekly: <code>${escapeHtml(dashboard.latestPeriod)}</code></span>
            <span class="metaBadge">Обновлено: <code>${escapeHtml(formatDate(dashboard.generatedAt))}</code></span>
            <span class="metaBadge">Проектов: <code>${dashboard.summary.projects}</code></span>
          </div>
        </article>

        <aside class="heroAside">
          <div>
            <p class="asideCaption">Смысл интерфейса</p>
            <p class="asideValue">Weekly, который не заставляет открывать документы</p>
          </div>
          <div class="trafficMini">
            <article class="trafficMiniCard">
              <div class="trafficMiniLabel">Зелёный</div>
              <div class="trafficMiniValue" style="color:var(--green)">${dashboard.summary.green}</div>
            </article>
            <article class="trafficMiniCard">
              <div class="trafficMiniLabel">Жёлтый</div>
              <div class="trafficMiniValue" style="color:var(--yellow)">${dashboard.summary.yellow}</div>
            </article>
            <article class="trafficMiniCard">
              <div class="trafficMiniLabel">Нет отчёта</div>
              <div class="trafficMiniValue" style="color:var(--red)">${dashboard.summary.missingReports}</div>
            </article>
          </div>
        </aside>
      </section>

      <nav class="tabs">
        ${tabs.map((tab) => `
          <button class="tabButton ${state.activeTab === tab.id ? "active" : ""}" data-tab="${tab.id}">
            ${escapeHtml(tab.label)}
          </button>
        `).join("")}
      </nav>

      ${activeTabMarkup()}
    </main>
  `;

  app.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      render();
    });
  });

  const validatorInput = document.getElementById("validatorInput");
  if (validatorInput) {
    validatorInput.addEventListener("change", (event) => {
      const files = [...event.target.files];
      state.fileChecks = files.map(validateFileName);
      render();
    });
  }

  const archiveInput = document.getElementById("archiveInput");
  if (archiveInput) {
    archiveInput.addEventListener("change", async (event) => {
      const files = [...event.target.files];
      await saveArchiveFiles(files);
      event.target.value = "";
    });
  }

  app.querySelectorAll("[data-archive-download]").forEach((button) => {
    button.addEventListener("click", async () => {
      await downloadArchiveDocument(button.dataset.archiveDownload);
    });
  });

  app.querySelectorAll("[data-archive-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteArchiveDocument(button.dataset.archiveDelete);
    });
  });

  const downloadAllButton = app.querySelector("[data-archive-download-all]");
  if (downloadAllButton) {
    downloadAllButton.addEventListener("click", async () => {
      await downloadAllArchiveDocuments();
    });
  }
}

function validateFileName(file) {
  const name = file.name;
  const parsed = parseFileName(name);

  if (!parsed) {
    return {
      name,
      valid: false,
      message: "Неверное имя файла. Ожидается тип_ДД.ММ.ГГГГ_КодПроекта_НазваниеПроекта.(md|xlsx)"
    };
  }

  const forbidden = /(final|новый|исправлено|версия|копия|\(\d+\))/iu;
  if (forbidden.test(name)) {
    return {
      name,
      valid: false,
      message: "Имя прошло по маске, но содержит личные приписки. Уберите final / версия / (1) и подобные хвосты."
    };
  }

  return {
    name,
    valid: true,
    message: "Имя файла корректно и может быть принято системой.",
    parsed
  };
}

async function refreshArchiveState() {
  state.archiveLoading = true;
  render();
  try {
    const docs = await archiveGetAll();
    const seeded = await ensureArchiveSeed(docs);
    state.archiveDocs = seeded.docs;
    if (seeded.imported) {
      state.archiveMessage = `В архив автоматически загружено ${seeded.imported} документов из папок weekly за 27 апреля и 4 мая.`;
    }
  } catch (error) {
    state.archiveMessage = `Не удалось прочитать локальный архив: ${error.message}`;
  } finally {
    state.archiveLoading = false;
    render();
  }
}

async function saveArchiveFiles(files) {
  if (!files.length) {
    state.archiveMessage = "Файлы не выбраны.";
    render();
    return;
  }

  const checks = files.map(validateFileName);
  state.fileChecks = checks;

  const invalid = checks.filter((item) => !item.valid);
  if (invalid.length) {
    state.archiveMessage = "Часть файлов не сохранена: сначала поправьте имена по валидатору.";
    render();
    return;
  }

  for (const file of files) {
    const { parsed } = validateFileName(file);
    const blob = new Blob([await file.arrayBuffer()], {
      type: file.type || "application/octet-stream"
    });
    await archivePut({
      id: file.name,
      name: file.name,
      type: parsed.type,
      projectCode: parsed.projectCode,
      projectName: parsed.projectName,
      periodDate: parsed.date,
      ext: parsed.ext,
      size: file.size,
      mime: file.type || "application/octet-stream",
      savedAt: new Date().toISOString(),
      blob
    });
  }

  state.archiveMessage = `Сохранено файлов: ${files.length}. Теперь их можно скачать из локального архива в любое время.`;
  state.archiveDocs = await archiveGetAll();
  render();
}

async function downloadArchiveDocument(id) {
  const item = state.archiveDocs.find((doc) => doc.id === id);
  if (!item) return;
  const url = URL.createObjectURL(item.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = item.name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function deleteArchiveDocument(id) {
  await archiveDelete(id);
  state.archiveDocs = await archiveGetAll();
  state.archiveMessage = "Документ удалён из локального архива.";
  render();
}

async function downloadAllArchiveDocuments() {
  for (const item of state.archiveDocs) {
    await downloadArchiveDocument(item.id);
  }
  state.archiveMessage = `Запущено скачивание ${state.archiveDocs.length} файлов из архива.`;
  render();
}

refreshArchiveState();

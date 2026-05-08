const charterSnapshotMetricSeed = [
  {
    name: "Количество продуктовых направлений, упакованных на согласованном уровне, шт",
    comment: "База 0 означает количество направлений, формально принятых по новой модели упаковки проекта на уровне не ниже L3/L4 по состоянию на дату старта.",
    rows: [
      { month: "04", plan: "0", fact: "0", deviation: "0" },
      { month: "05", plan: "0", fact: null, deviation: null },
      { month: "06", plan: "3", fact: null, deviation: null },
      { month: "07", plan: "3", fact: null, deviation: null },
      { month: "08", plan: "6", fact: null, deviation: null },
      { month: "09", plan: "9", fact: null, deviation: null },
      { month: "10", plan: "9", fact: null, deviation: null },
      { month: "11", plan: "13", fact: null, deviation: null },
      { month: "12", plan: "13", fact: null, deviation: null }
    ]
  },
  {
    name: "Количество MVP-карточек, подготовленных и переданных в контур обучения, шт",
    comment: "KPI считается выполненным только после передачи карточек в контур обучения, а не только после подготовки черновиков.",
    rows: [
      { month: "04", plan: "10", fact: "10", deviation: "0" }
    ]
  },
  {
    name: "Количество новых продуктовых направлений, выведенных в продажу, шт",
    comment: "Новым направлением считается продукт, по которому утверждены оффер и коммерческие условия, определены контуры внедрения и сопровождения, подготовлены материалы и возможна первая продажа.",
    rows: [
      { month: "04", plan: "0", fact: "0", deviation: "0" },
      { month: "05", plan: "1", fact: null, deviation: null },
      { month: "06", plan: "1", fact: null, deviation: null },
      { month: "07", plan: "1", fact: null, deviation: null },
      { month: "08", plan: "1", fact: null, deviation: null },
      { month: "09", plan: "1", fact: null, deviation: null },
      { month: "10", plan: "1", fact: null, deviation: null },
      { month: "11", plan: "2", fact: null, deviation: null },
      { month: "12", plan: "2", fact: null, deviation: null }
    ]
  },
  {
    name: "RGU в MASS_B2B, услуг на клиента, ед.",
    comment: "В контрольной точке 08 сохраняется последняя утвержденная квартальная цель до следующей вехи 09.",
    rows: [
      { month: "04", plan: "1.1", fact: "1.09", deviation: "0.01" },
      { month: "05", plan: "1.1", fact: null, deviation: null },
      { month: "06", plan: "1.2", fact: null, deviation: null },
      { month: "07", plan: "1.2", fact: null, deviation: null },
      { month: "08", plan: "1.25", fact: null, deviation: null },
      { month: "09", plan: "1.3", fact: null, deviation: null },
      { month: "10", plan: "1.3", fact: null, deviation: null },
      { month: "11", plan: "1.3", fact: null, deviation: null },
      { month: "12", plan: "1.3", fact: null, deviation: null }
    ]
  },
  {
    name: "RGU в BIG_B2B, услуг на клиента, ед.",
    comment: "В контрольной точке 08 сохраняется последняя утвержденная квартальная цель до следующей вехи 09.",
    rows: [
      { month: "04", plan: "1.1", fact: null, deviation: null },
      { month: "05", plan: "1.1", fact: null, deviation: null },
      { month: "06", plan: "1.2", fact: null, deviation: null },
      { month: "07", plan: "1.2", fact: null, deviation: null },
      { month: "08", plan: "1.3", fact: null, deviation: null },
      { month: "09", plan: "1.3", fact: null, deviation: null },
      { month: "10", plan: "1.4", fact: null, deviation: null },
      { month: "11", plan: "1.4", fact: null, deviation: null },
      { month: "12", plan: "1.5", fact: null, deviation: null }
    ]
  }
];

const dashboard = {
  generatedAt: "2026-05-04T23:05:00+07:00",
  latestPeriod: "27.04 и 04.05.2026",
  summary: {
    projects: 4,
    reportsForNewWeek: 4,
    missingReports: 0,
    missingProjectNames: [],
    newestReportDate: "04.05.2026",
    managers: 3,
    totalScore: 11,
    green: 1,
    yellow: 3,
    red: 0,
    escalations: 2,
    averageQuality: 89,
    totalGreenChecks: 64,
    totalPossibleChecks: 72
  },
  history: [
    {
      date: "27.04.2026",
      green: 3,
      yellow: 1,
      red: 0,
      avgQuality: 94
    },
    {
      date: "04.05.2026",
      green: 1,
      yellow: 3,
      red: 0,
      avgQuality: 89
    }
  ],
  alerts: [
    {
      level: "critical",
      project: "S-26-41 Рост производительности территориальных менеджеров",
      text: "Прогресс 40%. Цифровой контур управления заблокирован: MVP-дашборды просрочены, а синхронизация плана с фактом не завершена."
    },
    {
      level: "warning",
      project: "S-26-27 Новые продукты B2B",
      text: "Прогресс 65%. Вывод в продажу Кибербезопасности и старт второй волны зависят от внешних решений и партнёрской модели."
    },
    {
      level: "warning",
      project: "S-26-42 Создание отдела дистанционных продаж",
      text: "Прогресс 60%. Операционный дашборд и план продаж на май не закрыты, запуск холодного контура смещается."
    }
  ],
  charterSnapshotSeeds: [
    {
      id: "seed-s-26-27-2026-04-v08",
      projectCode: "S-26-27",
      projectName: "Новые продукты B2B",
      snapshotMonth: "2026-04",
      charterVersion: "v08",
      charterDate: "2026-04-04",
      uploadedAt: "2026-04-05T10:15:00+07:00",
      uploadedBy: "Стартовый импорт",
      comment: "Демо-срез из приложенного устава. Показывает стартовую точку по разделу 6.",
      status: "verified",
      verifiedAt: "2026-04-05T10:30:00+07:00",
      sourceFileName: "S-26-27 Новые продукты B2B.md",
      sourceMime: "text/markdown",
      sourceSize: 0,
      sourceText: "",
      warnings: [
        "Это демонстрационный seed без вложенного исходного markdown. Для рабочего архива загрузите реальный устав через форму проекта."
      ],
      metrics: charterSnapshotMetricSeed
    },
    {
      id: "seed-s-26-27-2026-05-v08",
      projectCode: "S-26-27",
      projectName: "Новые продукты B2B",
      snapshotMonth: "2026-05",
      charterVersion: "v08",
      charterDate: "2026-04-04",
      uploadedAt: "2026-05-06T09:40:00+07:00",
      uploadedBy: "Стартовый импорт",
      comment: "Демо-майский срез на том же уставе: видно, как история хранится помесячно и подсвечивает пустой факт.",
      status: "needs-review",
      sourceFileName: "S-26-27 Новые продукты B2B.md",
      sourceMime: "text/markdown",
      sourceSize: 0,
      sourceText: "",
      warnings: [
        "В майском срезе по нескольким KPI факт ещё не заполнен. Модуль должен хранить такой срез, но помечать его как требующий проверки."
      ],
      metrics: charterSnapshotMetricSeed
    }
  ],
  projects: [
    {
      id: "s-26-19",
      code: "S-26-19",
      name: "Новые доходы BIG_B2B",
      manager: "Тирбах А.",
      customer: "Требует уточнения",
      status: "green",
      statusLabel: "Зелёный",
      protocolStatus: "green",
      score: 5,
      progress: 100,
      quality: 100,
      greenChecks: 18,
      reportSubmitted: true,
      escalation: false,
      risk: "Задержка проведения собеседований на позицию МАП (филиал КРС), что может создать каскадный эффект на сроки этапа 9.",
      nextCriticalStep: "Подготовить отчет по итогам 1-го месяца пилота новой схемы мотивации и завершить упаковку продукта «Телефония».",
      weekSummary: "Все обязательства недели выполнены в полном объеме. Закрыты ключевые задачи по Этапу 3 и Этапу 1, проект движется в соответствии с графиком.",
      deviations: [],
      nextWeekPlan: [
        {
          task: "Анализ итогов 1 месяца по новой схеме мотивации",
          owner: "Тирбах А.",
          due: "08.05.2026",
          result: "Подготовлен и представлен отчет"
        },
        {
          task: "Упаковка продукта «Телефония»",
          owner: "Юрченко С., Тирбах А.",
          due: "10.05.2026",
          result: "Продукт утвержден"
        },
        {
          task: "Назначение МАП за филиалами КРС, НКЗ и КЕМ",
          owner: "Тирбах А.",
          due: "20.05.2026",
          result: "Завершены собеседования, кандидаты отобраны"
        }
      ]
    },
    {
      id: "s-26-27",
      code: "S-26-27",
      name: "Новые продукты B2B",
      manager: "Юрченко Сергей",
      customer: "Сазонова Ю.",
      status: "yellow",
      statusLabel: "Жёлтый",
      protocolStatus: "green",
      score: 2,
      progress: 65,
      quality: 89,
      greenChecks: 16,
      reportSubmitted: true,
      escalation: true,
      risk: "Блокировка вывода в продажу Кибербезопасности и старта второй волны из-за отсутствия решений заказчика и партнерских моделей.",
      nextCriticalStep: "Собрать полный комплект Wi-Fi, дожать эскалации по блокерам и завершить детализацию дефицитов по опросу менеджеров.",
      weekSummary: "Неделя результативна по факту выполнения задач, но проект вошёл в жёлтый статус из-за внешних стоп-факторов и эскалаций по продуктам второй волны.",
      deviations: [
        "Опрос менеджеров по дефицитам выполнен частично, есть риск неполного покрытия сценариев в инструкции.",
        "Rating и protocol расходятся: протокол зелёный, а оценка weekly жёлтая из-за внешних блокеров."
      ],
      nextWeekPlan: [
        {
          task: "Собрать почти полный комплект упаковки Wi‑Fi",
          owner: "Симонин Андрей",
          due: "05.05.2026",
          result: "Комплект включает оффер, цены, техчасть и договоры"
        },
        {
          task: "Оформить ключевые материалы Wi‑Fi",
          owner: "Юлия Левченко",
          due: "05.05.2026",
          result: "Готовы презентация и КП"
        },
        {
          task: "Согласовать единый регламент взаимодействия",
          owner: "Юрченко Сергей",
          due: "08.05.2026",
          result: "Регламент согласован TD/CD/HR/Presale"
        },
        {
          task: "Собрать рабочую версию инструкции для менеджеров",
          owner: "Юрченко Сергей",
          due: "08.05.2026",
          result: "Единый файл покрывает ключевые сценарии"
        },
        {
          task: "Описать стартовый контур Коммерческого ТО",
          owner: "Кухаренок Павел",
          due: "08.05.2026",
          result: "Есть черновик структуры и список дефицитов артефактов"
        },
        {
          task: "Стартовать упаковку Видеонаблюдения",
          owner: "Симонин Андрей",
          due: "08.05.2026",
          result: "Подготовлен стартовый план упаковки"
        }
      ]
    },
    {
      id: "s-26-41",
      code: "S-26-41",
      name: "Рост производительности территориальных менеджеров",
      manager: "Седышев Андрей",
      customer: "Сазонова Юлия",
      status: "yellow",
      statusLabel: "Жёлтый",
      protocolStatus: "yellow",
      score: 2,
      progress: 40,
      quality: 83,
      greenChecks: 15,
      reportSubmitted: true,
      escalation: true,
      risk: "Блокировка цифрового контура управления и риск срыва пилота B2B-продаж через ПП из-за дефицита ресурсов.",
      nextCriticalStep: "Завершить синхронизацию плана, обеспечить запуск MVP дашбордов и формализовать процесс продаж для обучения ПП.",
      weekSummary: "Есть продвижение по найму и управленческому контуру, но проект сохраняет жёлтый статус из-за блокировки дашбордов и незавершённой синхронизации плана с фактом.",
      deviations: [
        "Сверка расхождений в плане не завершена, из-за этого страдает прозрачность статусов.",
        "Тест площадок воронки не подтверждён в отчёте и перенесён на следующую неделю.",
        "Операционный дашборд не запущен: источники данных не подтверждены."
      ],
      nextWeekPlan: [
        {
          task: "Запуск процессного дашборда (MVP)",
          owner: "Седышев Андрей",
          due: "08.05.2026",
          result: "Дашборд доступен для weekly-контроля"
        },
        {
          task: "Запуск операционного дашборда",
          owner: "Седышев Андрей",
          due: "08.05.2026",
          result: "Подтверждены источники, данные отображаются"
        },
        {
          task: "Выход 1 нового ТМ",
          owner: "Пономаренко Е.",
          due: "05.05.2026",
          result: "Трудоустройство подтверждено"
        },
        {
          task: "Описание процесса продаж для ПП",
          owner: "Чернига Валерия",
          due: "08.05.2026",
          result: "Регламент готов и согласован"
        },
        {
          task: "Завершение синхронизации плана",
          owner: "Седышев Андрей",
          due: "08.05.2026",
          result: "План соответствует факту и уставу"
        }
      ]
    },
    {
      id: "s-26-42",
      code: "S-26-42",
      name: "Создание отдела дистанционных продаж",
      manager: "Седышев Андрей",
      customer: "Сазонова Юлия",
      status: "yellow",
      statusLabel: "Жёлтый",
      protocolStatus: "yellow",
      score: 2,
      progress: 60,
      quality: 83,
      greenChecks: 15,
      reportSubmitted: true,
      escalation: false,
      risk: "Задержка запуска холодного контура из-за неготовности базы и регламентов, а также отсутствие утверждённого плана продаж на май.",
      nextCriticalStep: "Доработать операционный дашборд, утвердить план продаж на май и загрузить базу в DealRocket с регламентом холодного обзвона.",
      weekSummary: "Проект движется в цифровом и мотивационном контурах, но остался жёлтым из-за незавершённого операционного дашборда и сдвига запуска холодного фронта.",
      deviations: [
        "Операционный дашборд не доведён до рабочего формата, KPI пока не закрыты полностью.",
        "Помесячный план продаж на 2 квартал не утверждён после подведения итогов апреля.",
        "База для холодного контура и правила дежурств остаются в работе."
      ],
      nextWeekPlan: [
        {
          task: "Довести дашборд ГВП до операционного формата",
          owner: "Седышев Андрей",
          due: "08.05.2026",
          result: "KPI доступны, данные обновляются ежедневно"
        },
        {
          task: "Зафиксировать продуктовый план на 2 квартал",
          owner: "Седышев Андрей",
          due: "08.05.2026",
          result: "План утвержден и внесен в систему контроля"
        },
        {
          task: "Сформировать и загрузить базу для холодного прозвона",
          owner: "Седышев Андрей",
          due: "13.05.2026",
          result: "База доступна команде в DealRocket"
        },
        {
          task: "Подготовить правила работы с холодной базой",
          owner: "Седышев Андрей",
          due: "08.05.2026",
          result: "Регламент дежурств и маршрутизации утвержден"
        }
      ]
    }
  ],
  managers: [
    {
      name: "Тирбах А.",
      projects: 1,
      reportCount: 2,
      totalScore: 10,
      averageScore: 5,
      averageQuality: 100,
      escalations: 0,
      green: 2,
      weekProjects: [
        {
          name: "S-26-19",
          score: 5
        }
      ]
    },
    {
      name: "Юрченко Сергей",
      projects: 1,
      reportCount: 2,
      totalScore: 7,
      averageScore: 3.5,
      averageQuality: 92,
      escalations: 1,
      green: 1,
      weekProjects: [
        {
          name: "S-26-27",
          score: 2
        }
      ]
    },
    {
      name: "Седышев Андрей",
      projects: 2,
      reportCount: 4,
      totalScore: 11,
      averageScore: 2.75,
      averageQuality: 87,
      escalations: 3,
      green: 1,
      weekProjects: [
        {
          name: "S-26-41",
          score: 2
        },
        {
          name: "S-26-42",
          score: 2
        }
      ]
    }
  ]
};

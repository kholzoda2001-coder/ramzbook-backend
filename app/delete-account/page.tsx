'use client';

import { useState } from 'react';

/**
 * Public account-deletion page — served at /delete-account
 * (e.g. https://admin.ramz.tj/delete-account).
 *
 * Google Play REQUIRES a publicly reachable URL where a user can request
 * deletion of their account and data WITHOUT having to install the app. The
 * in-app button (Profile → Settings → Delete account) satisfies the in-app
 * half of the requirement; this page satisfies the web half.
 *
 * Deliberately informational + a prefilled mailto rather than a live form:
 * a form would need SMTP to be configured in production, and a form that
 * silently fails is far worse than a mail link the user can see leave their
 * outbox. Same trilingual shell and inline styles as /privacy.
 */

const APP_NAME = 'RAMZ';
const SUPPORT_EMAIL = 'kholzoda2001@gmail.com';
const WEBSITE = 'https://ramz.tj';

type Lang = 'tg' | 'ru' | 'en';

/** Prefilled deletion request so support gets a consistent, actionable mail. */
function mailtoFor(lang: Lang) {
  const subject = {
    tg: 'Дархости нест кардани ҳисоб — RAMZ',
    ru: 'Запрос на удаление аккаунта — RAMZ',
    en: 'Account deletion request — RAMZ',
  }[lang];
  const body = {
    tg: 'Салом,\n\nЛутфан ҳисоб ва тамоми маълумоти маро дар RAMZ нест кунед.\n\nПочтаи электронӣ ё рақами телефони ҳисобам: \n\nТашаккур.',
    ru: 'Здравствуйте,\n\nПрошу удалить мой аккаунт и все мои данные в RAMZ.\n\nEmail или номер телефона моего аккаунта: \n\nСпасибо.',
    en: 'Hello,\n\nPlease delete my RAMZ account and all of my data.\n\nEmail or phone number of my account: \n\nThank you.',
  }[lang];
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function DeleteAccountPage() {
  const [lang, setLang] = useState<Lang>('tg');

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <header style={s.header}>
          <div style={s.logo}>🅡 {APP_NAME}</div>
          <div style={s.tabs}>
            {(['tg', 'ru', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{ ...s.tab, ...(lang === l ? s.tabActive : {}) }}
              >
                {l === 'tg' ? 'Тоҷикӣ' : l === 'ru' ? 'Русский' : 'English'}
              </button>
            ))}
          </div>
        </header>

        <main style={s.card}>
          {lang === 'tg' && <Tg />}
          {lang === 'ru' && <Ru />}
          {lang === 'en' && <En />}
        </main>

        <footer style={s.footer}>
          © {new Date().getFullYear()} {APP_NAME} ·{' '}
          <a href={WEBSITE} style={s.link}>{WEBSITE.replace('https://', '')}</a> ·{' '}
          <a href="/privacy" style={s.link}>Privacy</a>
        </footer>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Tajik ─────────────────────────────── */
function Tg() {
  return (
    <>
      <h1 style={s.h1}>Нест кардани ҳисоб ва маълумот</h1>
      <p style={s.meta}>Барномаи «{APP_NAME}» — омӯзиши забон</p>

      <p style={s.p}>
        Шумо ҳақ доред ҳисоб ва тамоми маълумоти шахсии худро нест кунед. Ду роҳ вуҷуд дорад.
      </p>

      <Sec n="1" t="Дар худи барнома (фаврӣ)">
        <b>Профил → Танзимот → «Нест кардани ҳисоб»</b>
        <p style={s.pIn}>
          Ин роҳи зудтарин аст: ҳисоб <b>дарҳол</b> ва <b>ҳамешагӣ</b> нест мешавад.
        </p>
      </Sec>

      <Sec n="2" t="Тавассути почтаи электронӣ">
        Агар барнома дар дастрасатон набошад, дархост фиристед:
        <p style={s.pIn}>
          <a href={mailtoFor('tg')} style={s.btn}>Дархости нест карданро фиристодан</a>
        </p>
        <p style={s.pIn}>
          Ё худ ба <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> нависед ва{' '}
          <b>почтаи электронӣ ё рақами телефони ҳисобатонро</b> нишон диҳед. Мо дар муддати{' '}
          <b>30 рӯз</b> нест мекунем.
        </p>
      </Sec>

      <Sec n="3" t="Чӣ нест карда мешавад">
        <ul style={s.ul}>
          <li>Ҳисоб: ном, почтаи электронӣ, рақами телефон, расми профил;</li>
          <li>Тамоми пешрафти омӯзишӣ: XP, силсила (streak), дарсҳои хатмшуда, натиҷаи санҷиши сатҳ;</li>
          <li>Гавҳарҳо, ҷонҳо ва таърихи вазифаҳои ҳаррӯза;</li>
          <li>Кортҳои такрори луғат (SRS) ва рӯйдодҳои дохилӣ;</li>
          <li>Сабтҳои пардохт ва обуна дар системаи мо;</li>
          <li>Рамзҳои сессия (refresh tokens).</li>
        </ul>
      </Sec>

      <Sec n="4" t="Чӣ боқӣ мемонад">
        <ul style={s.ul}>
          <li>
            <b>Обунаи Google Play.</b> Онро мо идора намекунем — агар обунаи фаъол дошта
            бошед, онро дар Google Play бекор кунед:{' '}
            <A href="https://play.google.com/store/account/subscriptions">
              play.google.com/store/account/subscriptions
            </A>. Нест кардани ҳисоб обунаро худкор бекор намекунад.
          </li>
          <li>
            <b>Сабтҳои ҳисобдорӣ.</b> Маълумоти умумии амалиёти пардохт метавонад барои
            иҷрои талаботи қонунӣ нигоҳ дошта шавад — вале он ба шахси шумо пайваст намешавад.
          </li>
          <li>
            <b>Мундариҷаи омӯзишӣ</b> (дарсҳо, калимаҳо, аудио) — ин моли барнома аст, на
            маълумоти шахсии шумо, ва нест намешавад.
          </li>
        </ul>
      </Sec>

      <Sec n="5" t="Муҳим">
        Нест кардан <b>бебозгашт</b> аст. Пешрафти омӯзиширо баъд аз он барқарор кардан
        мумкин нест. Агар танҳо мехоҳед муддате истироҳат кунед, ба ҷои нест кардан танҳо
        аз барнома хориҷ шавед (log out).
      </Sec>
    </>
  );
}

/* ────────────────────────────── Russian ────────────────────────────── */
function Ru() {
  return (
    <>
      <h1 style={s.h1}>Удаление аккаунта и данных</h1>
      <p style={s.meta}>Приложение «{APP_NAME}» — изучение языков</p>

      <p style={s.p}>
        Вы имеете право удалить свой аккаунт и все персональные данные. Есть два способа.
      </p>

      <Sec n="1" t="В самом приложении (сразу)">
        <b>Профиль → Настройки → «Удалить аккаунт»</b>
        <p style={s.pIn}>
          Это самый быстрый путь: аккаунт удаляется <b>немедленно</b> и <b>безвозвратно</b>.
        </p>
      </Sec>

      <Sec n="2" t="По электронной почте">
        Если приложение недоступно, отправьте запрос:
        <p style={s.pIn}>
          <a href={mailtoFor('ru')} style={s.btn}>Отправить запрос на удаление</a>
        </p>
        <p style={s.pIn}>
          Или напишите на <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>, указав{' '}
          <b>email или номер телефона вашего аккаунта</b>. Мы удалим данные в течение{' '}
          <b>30 дней</b>.
        </p>
      </Sec>

      <Sec n="3" t="Что удаляется">
        <ul style={s.ul}>
          <li>Аккаунт: имя, email, номер телефона, фото профиля;</li>
          <li>Весь учебный прогресс: XP, серии, пройденные уроки, результаты теста уровня;</li>
          <li>Кристаллы, жизни и история ежедневных заданий;</li>
          <li>Карточки повторения слов (SRS) и внутренние события;</li>
          <li>Записи о платежах и подписках в нашей системе;</li>
          <li>Токены сессий (refresh tokens).</li>
        </ul>
      </Sec>

      <Sec n="4" t="Что остаётся">
        <ul style={s.ul}>
          <li>
            <b>Подписка Google Play.</b> Ею управляем не мы — если подписка активна,
            отмените её в Google Play:{' '}
            <A href="https://play.google.com/store/account/subscriptions">
              play.google.com/store/account/subscriptions
            </A>. Удаление аккаунта не отменяет подписку автоматически.
          </li>
          <li>
            <b>Бухгалтерские записи.</b> Обезличенные данные о транзакциях могут храниться
            для соблюдения требований закона — но они не связаны с вашей личностью.
          </li>
          <li>
            <b>Учебный контент</b> (уроки, слова, аудио) — это материалы приложения, а не
            ваши персональные данные, и они не удаляются.
          </li>
        </ul>
      </Sec>

      <Sec n="5" t="Важно">
        Удаление <b>необратимо</b>. Восстановить учебный прогресс после него невозможно.
        Если вы просто хотите сделать паузу, вместо удаления достаточно выйти из аккаунта.
      </Sec>
    </>
  );
}

/* ────────────────────────────── English ────────────────────────────── */
function En() {
  return (
    <>
      <h1 style={s.h1}>Delete your account and data</h1>
      <p style={s.meta}>«{APP_NAME}» — language learning app</p>

      <p style={s.p}>
        You have the right to delete your account and all personal data. There are two ways.
      </p>

      <Sec n="1" t="In the app (immediate)">
        <b>Profile → Settings → “Delete account”</b>
        <p style={s.pIn}>
          This is the fastest route: the account is deleted <b>immediately</b> and{' '}
          <b>permanently</b>.
        </p>
      </Sec>

      <Sec n="2" t="By email">
        If you no longer have the app installed, send a request:
        <p style={s.pIn}>
          <a href={mailtoFor('en')} style={s.btn}>Send a deletion request</a>
        </p>
        <p style={s.pIn}>
          Or write to <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> stating the{' '}
          <b>email or phone number of your account</b>. We will delete it within{' '}
          <b>30 days</b>.
        </p>
      </Sec>

      <Sec n="3" t="What is deleted">
        <ul style={s.ul}>
          <li>Account: name, email, phone number, profile photo;</li>
          <li>All learning progress: XP, streaks, completed lessons, placement-test results;</li>
          <li>Gems, hearts, and daily-task history;</li>
          <li>Spaced-repetition cards (SRS) and internal events;</li>
          <li>Payment and subscription records in our system;</li>
          <li>Session tokens (refresh tokens).</li>
        </ul>
      </Sec>

      <Sec n="4" t="What remains">
        <ul style={s.ul}>
          <li>
            <b>Your Google Play subscription.</b> We do not control it — if a subscription
            is active, cancel it in Google Play:{' '}
            <A href="https://play.google.com/store/account/subscriptions">
              play.google.com/store/account/subscriptions
            </A>. Deleting your account does not cancel it automatically.
          </li>
          <li>
            <b>Accounting records.</b> Anonymised transaction data may be retained to meet
            legal obligations — it is not linked to your identity.
          </li>
          <li>
            <b>Learning content</b> (lessons, words, audio) is app material, not your
            personal data, and is not deleted.
          </li>
        </ul>
      </Sec>

      <Sec n="5" t="Important">
        Deletion is <b>irreversible</b>. Learning progress cannot be restored afterwards.
        If you only want a break, log out instead of deleting.
      </Sec>
    </>
  );
}

/* ──────────────────────────── shared bits ──────────────────────────── */
function Sec({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section style={s.sec}>
      <h2 style={s.h2}>
        <span style={s.num}>{n}</span>
        {t}
      </h2>
      <div style={s.body}>{children}</div>
    </section>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={s.link} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0b1220', color: '#e2e8f0', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', lineHeight: 1.7 },
  wrap: { maxWidth: 820, margin: '0 auto' },
  header: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  logo: { fontSize: 22, fontWeight: 800, color: '#2dd4bf', letterSpacing: 0.5 },
  tabs: { display: 'flex', gap: 6, background: '#111a2e', padding: 4, borderRadius: 12, border: '1px solid #1f2a44' },
  tab: { border: 'none', background: 'transparent', color: '#94a3b8', padding: '7px 14px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: '#2dd4bf', color: '#04201c' },
  card: { background: '#0f1729', border: '1px solid #1f2a44', borderRadius: 18, padding: '28px 26px' },
  h1: { fontSize: 28, fontWeight: 800, margin: '0 0 6px', color: '#f1f5f9' },
  meta: { color: '#7c8aa5', fontSize: 13, margin: '0 0 20px' },
  p: { margin: '0 0 18px', color: '#cbd5e1' },
  pIn: { margin: '10px 0 0', color: '#cbd5e1' },
  sec: { marginTop: 22 },
  h2: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 },
  num: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, fontSize: 13, borderRadius: 8, background: '#14b8a6', color: '#04201c', fontWeight: 800, flexShrink: 0 },
  body: { color: '#cbd5e1' },
  ul: { margin: '8px 0 0', paddingLeft: 20 },
  link: { color: '#2dd4bf', textDecoration: 'none' },
  btn: { display: 'inline-block', background: '#14b8a6', color: '#04201c', padding: '11px 20px', borderRadius: 11, fontWeight: 800, textDecoration: 'none', fontSize: 15 },
  footer: { textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 22 },
};

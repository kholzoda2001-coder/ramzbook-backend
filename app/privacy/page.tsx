'use client';

import { useState } from 'react';

/**
 * Public privacy policy — served at /privacy (e.g. https://admin.ramz.tj/privacy).
 * Self-contained INLINE styles (no dependency on admin.css CSS variables, which are
 * undefined outside the admin shell and made the previous version unreadable).
 * Trilingual (Tajik / Russian / English) for users + Google Play review.
 */

const EFFECTIVE_DATE = '08.08.2026';
const APP_NAME = 'RAMZ';
// Як почтаи ягона дар ҳама ҷо: ин саҳифа, ramz.tj/privacy ва сиёсати дохили
// барнома (frontend/lib/l10n/strings_*.dart). Онҳо набояд фарқ кунанд —
// ревюери Google мухолифатро ҳамчун сиёсати бе соҳиб мебинад.
const SUPPORT_EMAIL = 'help@ramz.tj';
const WEBSITE = 'https://ramz.tj';

type Lang = 'tg' | 'ru' | 'en';

export default function PrivacyPolicyPage() {
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
          <a href={`mailto:${SUPPORT_EMAIL}`} style={s.link}>{SUPPORT_EMAIL}</a>
        </footer>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Tajik ─────────────────────────────── */
function Tg() {
  return (
    <>
      <h1 style={s.h1}>Сиёсати махфият</h1>
      <p style={s.meta}>Санаи эътибор: {EFFECTIVE_DATE}</p>

      <p style={s.p}>
        Ин Сиёсати махфият тарзи ҷамъоварӣ, истифода ва ҳифзи маълумоти шахсии шуморо
        дар барномаи мобилии «{APP_NAME}» — платформаи омӯзиши забон — тавсиф мекунад.
        Бо истифода аз барнома, шумо бо ин сиёсат розӣ мешавед.
      </p>

      <Sec n="1" t="Мо кистем">
        «{APP_NAME}» барномаи омӯзиши забони англисӣ барои тоҷикзабонон аст. Барои
        саволҳо: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
      </Sec>

      <Sec n="2" t="Кадом маълумотро ҷамъ мекунем">
        <ul style={s.ul}>
          <li><b>Ҳисоб ва профил:</b> ном, почтаи электронӣ, рақами телефон (агар ворид кунед).</li>
          <li><b>Воридшавӣ бо Google:</b> номатон, почтаи электронӣ ва расми профил аз ҳисоби Google.</li>
          <li><b>Фаъолияти омӯзишӣ:</b> пешрафт, XP, силсила (streak), дарсҳои хатмшуда, натиҷаи санҷиши сатҳбандӣ.</li>
          <li><b>Овоз (микрофон):</b> барои машқи талаффуз нутқи шумо ба матн табдил дода мешавад. Сабти овоз <b>нигоҳ дошта намешавад</b> — танҳо барои шинохт коркард мешавад.</li>
          <li><b>Обунаҳо:</b> ҳолати обунаи Premium тавассути Google Play Billing. Мо маълумоти кортатонро <b>намебинем ва нигоҳ намедорем</b>.</li>
          <li><b>Маълумоти дастгоҳ:</b> намуди дастгоҳ, версияи система, амалҳо дар барнома ва маълумоти корношоямӣ (crash) барои беҳсозӣ.</li>
          <li><b>Огоҳиҳо:</b> рамзи огоҳӣ (token) барои фиристодани ёдоварҳои омӯзишӣ.</li>
          <li><b>Рақами рекламавӣ (Advertising ID):</b> барои нишон додани реклама ва ҳисоби оморӣ истифода мешавад. Шумо метавонед онро дар танзимоти Android аз нав созед ё реклами шахсиро хомӯш кунед.</li>
          <li><b>Ҷойгиршавии тахминӣ (аз рӯи IP):</b> танҳо рамзи кишвар (мисли «TJ») барои нишон додани нархи мувофиқи минтақа. Суроғаи дақиқи шумо муайян ва нигоҳ дошта намешавад.</li>
          <li><b>Паёмҳои чати AI:</b> саволҳое ки ба муаллими AI менависед, барои гирифтани ҷавоб коркард мешаванд.</li>
        </ul>
      </Sec>

      <Sec n="3" t="Чӣ гуна истифода мебарем">
        <ul style={s.ul}>
          <li>Барои таъмини омӯзиш ва нигоҳдории пешрафти шумо;</li>
          <li>Барои санҷиши талаффуз (микрофон);</li>
          <li>Барои фиристодани ёдоварҳои омӯзишӣ (огоҳиҳо);</li>
          <li>Барои идоракунии обуна ва Premium;</li>
          <li>Барои беҳтар кардани барнома ва ислоҳи хатоҳо.</li>
        </ul>
      </Sec>

      <Sec n="4" t="Иҷозатҳо ва сабаби онҳо">
        <ul style={s.ul}>
          <li><b>Микрофон</b> — танҳо ҳангоми машқи гуфтор, барои санҷиши талаффуз.</li>
          <li><b>Огоҳиҳо</b> — барои ёдовариҳои омӯзишӣ (метавонед хомӯш кунед).</li>
          <li><b>Интернет</b> — барои бор кардани дарсҳо ва ҳамоҳангсозии пешрафт.</li>
        </ul>
      </Sec>

      <Sec n="5" t="Реклама ва рақами рекламавӣ">
        Дар нусхаи <b>ройгон</b> барнома <b>реклама нишон медиҳад</b> — ду шакл:
        <ul style={s.ul}>
          <li><b>Видеои мукофотӣ</b> — вақте ҷонҳоятон тамом мешавад, шумо метавонед
            бо хоҳиши худ видео тамошо карда, як ҷон гиред.</li>
          <li><b>Рекламаи пурраэкранӣ</b> — баъди анҷоми дарс.</li>
        </ul>
        Дар мобайни машқҳо реклама нест.
        <ul style={s.ul}>
          <li>Рекламаро <b>Google AdMob</b> ва <b>Yandex Mobile Ads (Yandex
            Advertising Network)</b> таъмин мекунанд. Онҳо барои интихоби реклама
            рақами рекламавии дастгоҳ (Google Advertising ID / GAID), суроғаи IP ва
            маълумоти умумии дастгоҳро истифода мебаранд:{' '}
            <A href="https://policies.google.com/technologies/ads">policies.google.com/technologies/ads</A>,{' '}
            <A href="https://yandex.com/legal/confidential/">yandex.com/legal/confidential</A>.</li>
          <li>Мо рекламаро танҳо бо рейтинги <b>«G» (барои ҳама)</b> маҳдуд кардаем.</li>
          <li><b>Обунаи Premium реклама надорад.</b></li>
          <li>Барои хомӯш кардани реклами шахсӣ: Танзимоти Android → Google → Реклама →
            «Delete advertising ID» ё «Opt out of Ads Personalisation».</li>
        </ul>
      </Sec>

      <Sec n="5.1" t="Мубодила бо тарафи сеюм">
        Мо маълумоти шуморо <b>намефурӯшем</b>. Маълумот танҳо бо хидматрасонҳои зарурӣ
        мубодила мешавад:
        <ul style={s.ul}>
          <li><b>Google Play Services / Google Sign-In</b> — воридшавӣ ва пардохт;</li>
          <li><b>Google AdMob</b> — намоиши реклама (рақами рекламавӣ);</li>
          <li><b>Yandex Mobile Ads</b> — намоиши реклама (рақами рекламавӣ);</li>
          <li><b>Meta (Facebook) App Events</b> — омор ва атрибутсияи насби барнома;
            рақами рекламавиро мехонад;</li>
          <li><b>Firebase Analytics / Crashlytics</b> — омори истифода ва ҳисоботи хатоҳо;</li>
          <li><b>Провайдери AI</b> — паёмҳои чати AI барои гирифтани ҷавоб фиристода мешаванд;</li>
          <li><b>Хидмати муайянкунии кишвар аз рӯи IP</b> — танҳо барои нархи минтақавӣ;</li>
          <li><b>Провайдери ҳостинг</b> — нигоҳдории маълумот.</li>
        </ul>
        Ин хидматҳо сиёсати махфияти худро доранд.
      </Sec>

      <Sec n="6" t="Нигоҳдории маълумот">
        Мо маълумотро то замоне, ки ҳисоби шумо фаъол аст, нигоҳ медорем. Баъди нест
        кардани ҳисоб, маълумоти шахсии шумо нест карда мешавад.
      </Sec>

      <Sec n="7" t="Ҳуқуқҳои шумо ва нест кардани ҳисоб">
        Шумо метавонед маълумоти худро бубинед, ислоҳ кунед ё ҳисобатонро нест кунед.
        <ul style={s.ul}>
          <li><b>Дар барнома:</b> Профил → Танзимот → «Нест кардани ҳисоб».</li>
          <li><b>Дар вебсайт:</b> <A href="/delete-account">саҳифаи нест кардани ҳисоб</A> — дастур ва шакли дархост.</li>
          <li><b>Бо почта:</b> дархост ба <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> фиристед — мо дар муддати 30 рӯз ҳисоб ва маълумоти шуморо нест мекунем.</li>
        </ul>
      </Sec>

      <Sec n="8" t="Синну сол">
        Барномаи мо барои корбарони <b>13-сола ва калонтар</b> пешбинӣ шудааст. Мо
        дидаву дониста аз кӯдакони зери 13-сола маълумот ҷамъ намекунем. Агар шумо
        волид бошед ва фикр кунед, ки фарзандатон ба мо маълумот додааст, ба{' '}
        <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> нависед — мо онро нест
        мекунем.
      </Sec>

      <Sec n="9" t="Амният">
        Мо аз чораҳои оқилонаи техникӣ ва ташкилӣ барои ҳифзи маълумоти шумо истифода
        мебарем (рамзгузорӣ, HTTPS, дастрасии маҳдуд).
      </Sec>

      <Sec n="10" t="Тағйирот">
        Мо метавонем ин сиёсатро навсозӣ кунем. Дар сурати тағйироти муҳим, дар барнома
        ё дар ин саҳифа хабар медиҳем.
      </Sec>

      <Sec n="11" t="Тамос">
        Барои ҳама гуна савол дар бораи махфият:{' '}
        <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
      </Sec>
    </>
  );
}

/* ─────────────────────────────── Russian ─────────────────────────────── */
function Ru() {
  return (
    <>
      <h1 style={s.h1}>Политика конфиденциальности</h1>
      <p style={s.meta}>Дата вступления в силу: {EFFECTIVE_DATE}</p>

      <p style={s.p}>
        Настоящая Политика описывает, как мобильное приложение «{APP_NAME}» — платформа
        для изучения языка — собирает, использует и защищает ваши данные. Используя
        приложение, вы соглашаетесь с этой политикой.
      </p>

      <Sec n="1" t="Кто мы">
        «{APP_NAME}» — приложение для изучения английского языка для таджикоязычных
        пользователей. Вопросы: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
      </Sec>

      <Sec n="2" t="Какие данные мы собираем">
        <ul style={s.ul}>
          <li><b>Аккаунт и профиль:</b> имя, email, номер телефона (если указан).</li>
          <li><b>Вход через Google:</b> имя, email и фото профиля из аккаунта Google.</li>
          <li><b>Учебная активность:</b> прогресс, XP, серии (streak), пройденные уроки, результаты теста уровня.</li>
          <li><b>Голос (микрофон):</b> для практики произношения речь преобразуется в текст. Аудиозаписи <b>не сохраняются</b>.</li>
          <li><b>Подписки:</b> статус Premium через Google Play Billing. Данные карты мы <b>не видим и не храним</b>.</li>
          <li><b>Данные устройства:</b> модель, версия ОС, действия в приложении и данные о сбоях.</li>
          <li><b>Уведомления:</b> токен для учебных напоминаний.</li>
          <li><b>Рекламный идентификатор (Advertising ID):</b> используется для показа рекламы и аналитики. Вы можете сбросить его или отключить персонализацию в настройках Android.</li>
          <li><b>Приблизительное местоположение (по IP):</b> только код страны (например «TJ») — для показа цен вашего региона. Точный адрес не определяется и не хранится.</li>
          <li><b>Сообщения AI-чата:</b> вопросы, которые вы пишете AI-репетитору, обрабатываются для получения ответа.</li>
        </ul>
      </Sec>

      <Sec n="3" t="Как мы используем данные">
        <ul style={s.ul}>
          <li>Для предоставления обучения и сохранения прогресса;</li>
          <li>Для проверки произношения (микрофон);</li>
          <li>Для отправки учебных напоминаний;</li>
          <li>Для управления подпиской Premium;</li>
          <li>Для улучшения приложения и исправления ошибок.</li>
        </ul>
      </Sec>

      <Sec n="4" t="Разрешения и их причины">
        <ul style={s.ul}>
          <li><b>Микрофон</b> — только во время речевых упражнений.</li>
          <li><b>Уведомления</b> — учебные напоминания (можно отключить).</li>
          <li><b>Интернет</b> — загрузка уроков и синхронизация прогресса.</li>
        </ul>
      </Sec>

      <Sec n="5" t="Реклама и рекламный идентификатор">
        В <b>бесплатной</b> версии приложение <b>показывает рекламу</b> — два формата:
        <ul style={s.ul}>
          <li><b>Видео с вознаграждением</b> — когда заканчиваются жизни, вы можете по
            своему желанию посмотреть видео и получить одну жизнь.</li>
          <li><b>Полноэкранная реклама</b> — после завершения урока.</li>
        </ul>
        Внутри упражнений рекламы нет.
        <ul style={s.ul}>
          <li>Рекламу предоставляют <b>Google AdMob</b> и <b>Yandex Mobile Ads
            (Рекламная сеть Яндекса)</b>. Они используют рекламный идентификатор
            устройства (Google Advertising ID / GAID), IP-адрес и общие данные
            устройства:{' '}
            <A href="https://policies.google.com/technologies/ads">policies.google.com/technologies/ads</A>,{' '}
            <A href="https://yandex.com/legal/confidential/">yandex.com/legal/confidential</A>.</li>
          <li>Мы ограничили рекламу рейтингом <b>«G» (для всех)</b>.</li>
          <li><b>В подписке Premium рекламы нет.</b></li>
          <li>Отключить персонализацию: Настройки Android → Google → Реклама →
            «Удалить рекламный идентификатор» или «Отключить персонализацию рекламы».</li>
        </ul>
      </Sec>

      <Sec n="5.1" t="Передача третьим лицам">
        Мы <b>не продаём</b> ваши данные. Данные передаются только необходимым сервисам:
        <ul style={s.ul}>
          <li><b>Google Play Services / Google Sign-In</b> — вход и оплата;</li>
          <li><b>Google AdMob</b> — показ рекламы (рекламный идентификатор);</li>
          <li><b>Yandex Mobile Ads</b> — показ рекламы (рекламный идентификатор);</li>
          <li><b>Meta (Facebook) App Events</b> — статистика и атрибуция установок;
            читает рекламный идентификатор;</li>
          <li><b>Firebase Analytics / Crashlytics</b> — статистика использования и отчёты об ошибках;</li>
          <li><b>AI-провайдер</b> — сообщения AI-чата отправляются для получения ответа;</li>
          <li><b>Сервис определения страны по IP</b> — только для региональных цен;</li>
          <li><b>Хостинг-провайдер</b> — хранение данных.</li>
        </ul>
        У этих сервисов свои политики конфиденциальности.
      </Sec>

      <Sec n="6" t="Хранение данных">
        Мы храним данные, пока активен ваш аккаунт. После удаления аккаунта личные данные
        удаляются.
      </Sec>

      <Sec n="7" t="Ваши права и удаление аккаунта">
        <ul style={s.ul}>
          <li><b>В приложении:</b> Профиль → Настройки → «Удалить аккаунт».</li>
          <li><b>На сайте:</b> <A href="/delete-account">страница удаления аккаунта</A> — инструкции и форма запроса.</li>
          <li><b>По email:</b> запрос на <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> — удалим в течение 30 дней.</li>
        </ul>
      </Sec>

      <Sec n="8" t="Возраст">
        Наше приложение предназначено для пользователей <b>13 лет и старше</b>. Мы
        сознательно не собираем данные детей младше 13 лет. Если вы родитель и считаете,
        что ваш ребёнок предоставил нам данные, напишите на{' '}
        <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> — мы их удалим.
      </Sec>

      <Sec n="9" t="Безопасность">
        Мы применяем разумные технические меры защиты (шифрование, HTTPS, ограниченный доступ).
      </Sec>

      <Sec n="10" t="Изменения">
        Мы можем обновлять эту политику и сообщим о значимых изменениях.
      </Sec>

      <Sec n="11" t="Контакты">
        Вопросы о конфиденциальности: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
      </Sec>
    </>
  );
}

/* ─────────────────────────────── English ─────────────────────────────── */
function En() {
  return (
    <>
      <h1 style={s.h1}>Privacy Policy</h1>
      <p style={s.meta}>Effective date: {EFFECTIVE_DATE}</p>

      <p style={s.p}>
        This Privacy Policy explains how the «{APP_NAME}» mobile application — a language
        learning platform — collects, uses, and protects your information. By using the
        app, you agree to this policy.
      </p>

      <Sec n="1" t="Who we are">
        «{APP_NAME}» is an English-learning app for Tajik speakers. Questions:{' '}
        <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
      </Sec>

      <Sec n="2" t="Information we collect">
        <ul style={s.ul}>
          <li><b>Account &amp; profile:</b> name, email, phone number (if provided).</li>
          <li><b>Google Sign-In:</b> your name, email, and profile photo from your Google account.</li>
          <li><b>Learning activity:</b> progress, XP, streaks, completed lessons, placement-test results.</li>
          <li><b>Audio (microphone):</b> for pronunciation practice your speech is converted to text. Audio recordings are <b>not stored</b> — processed only for recognition.</li>
          <li><b>Subscriptions:</b> Premium status via Google Play Billing. We <b>do not see or store</b> your card details.</li>
          <li><b>Device data:</b> device model, OS version, in-app actions, and crash data for improvement.</li>
          <li><b>Notifications:</b> a push token to send learning reminders.</li>
          <li><b>Advertising ID:</b> used to serve ads and for analytics. You can reset it or opt out of personalised ads in your Android settings.</li>
          <li><b>Approximate location (from IP):</b> country code only (e.g. “TJ”) to show prices for your region. We do not determine or store your precise address.</li>
          <li><b>AI chat messages:</b> questions you write to the AI tutor are processed to generate a reply.</li>
        </ul>
      </Sec>

      <Sec n="3" t="How we use information">
        <ul style={s.ul}>
          <li>To provide lessons and save your progress;</li>
          <li>To check pronunciation (microphone);</li>
          <li>To send learning reminders (notifications);</li>
          <li>To manage Premium subscriptions;</li>
          <li>To improve the app and fix bugs.</li>
        </ul>
      </Sec>

      <Sec n="4" t="Permissions and why">
        <ul style={s.ul}>
          <li><b>Microphone</b> — only during speaking exercises, to check pronunciation.</li>
          <li><b>Notifications</b> — learning reminders (you can turn them off).</li>
          <li><b>Internet</b> — to load lessons and sync progress.</li>
        </ul>
      </Sec>

      <Sec n="5" t="Advertising and advertising ID">
        In the <b>free</b> version the app <b>shows ads</b> — two formats:
        <ul style={s.ul}>
          <li><b>Rewarded video</b> — when you run out of hearts you may choose to watch
            a video and earn one heart back.</li>
          <li><b>Full-screen ad</b> — after a lesson is completed.</li>
        </ul>
        There are no ads inside the exercises.
        <ul style={s.ul}>
          <li>Ads are served by <b>Google AdMob</b> and <b>Yandex Mobile Ads (Yandex
            Advertising Network)</b>. They use the device advertising identifier (Google
            Advertising ID / GAID), IP address and general device data to select ads:{' '}
            <A href="https://policies.google.com/technologies/ads">policies.google.com/technologies/ads</A>,{' '}
            <A href="https://yandex.com/legal/confidential/">yandex.com/legal/confidential</A>.</li>
          <li>We restrict ads to a <b>“G” (general audiences)</b> content rating.</li>
          <li><b>Premium subscribers see no ads.</b></li>
          <li>To opt out of personalised ads: Android Settings → Google → Ads →
            “Delete advertising ID” or “Opt out of Ads Personalisation”.</li>
        </ul>
      </Sec>

      <Sec n="5.1" t="Sharing with third parties">
        We <b>do not sell</b> your data. Data is shared only with necessary services:
        <ul style={s.ul}>
          <li><b>Google Play Services / Google Sign-In</b> — login &amp; payments;</li>
          <li><b>Google AdMob</b> — serving ads (advertising ID);</li>
          <li><b>Yandex Mobile Ads</b> — serving ads (advertising ID);</li>
          <li><b>Meta (Facebook) App Events</b> — install analytics and attribution;
            reads the advertising identifier;</li>
          <li><b>Firebase Analytics / Crashlytics</b> — usage statistics and crash reports;</li>
          <li><b>AI provider</b> — AI chat messages are sent to generate a reply;</li>
          <li><b>IP-to-country lookup service</b> — for regional pricing only;</li>
          <li><b>Hosting provider</b> — data storage.</li>
        </ul>
        Each has its own privacy policy.
      </Sec>

      <Sec n="6" t="Data retention">
        We keep your data while your account is active. After you delete your account, your
        personal data is deleted.
      </Sec>

      <Sec n="7" t="Your rights &amp; account deletion">
        You can view, edit, or delete your data:
        <ul style={s.ul}>
          <li><b>In the app:</b> Profile → Settings → “Delete account”.</li>
          <li><b>On the web:</b> <A href="/delete-account">account deletion page</A> — instructions and a request form.</li>
          <li><b>By email:</b> request to <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> — we delete your account and data within 30 days.</li>
        </ul>
      </Sec>

      <Sec n="8" t="Age">
        Our app is intended for users aged <b>13 and over</b>. We do not knowingly collect
        data from children under 13. If you are a parent and believe your child has provided
        us with data, write to <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A> and we
        will delete it.
      </Sec>

      <Sec n="9" t="Security">
        We use reasonable technical and organizational measures (encryption, HTTPS,
        restricted access) to protect your information.
      </Sec>

      <Sec n="10" t="Changes">
        We may update this policy. We will notify you of significant changes in the app or
        on this page.
      </Sec>

      <Sec n="11" t="Contact">
        For any privacy questions: <A href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</A>.
      </Sec>
    </>
  );
}

/* ─────────────────────────────── helpers ─────────────────────────────── */
function Sec({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <section style={s.sec}>
      <h2 style={s.h2}><span style={s.num}>{n}</span> {t}</h2>
      <div style={s.body}>{children}</div>
    </section>
  );
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={s.link}>{children}</a>;
}

/* ─────────────────────────────── styles ─────────────────────────────── */
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
  sec: { marginTop: 22 },
  h2: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 },
  num: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, fontSize: 13, borderRadius: 8, background: '#14b8a6', color: '#04201c', fontWeight: 800, flexShrink: 0 },
  body: { color: '#cbd5e1' },
  ul: { margin: '8px 0 0', paddingLeft: 20 },
  link: { color: '#2dd4bf', textDecoration: 'none' },
  footer: { textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 22 },
};

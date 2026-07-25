import React, { useState, useMemo, useEffect, useRef } from "react";
import { api, getToken, setToken } from "./api.js";
import {
  LayoutGrid, BookOpen, Building2, Target, User, Moon, Sun,
  ChevronRight, ChevronDown, Lock, CheckCircle2, Circle, Flame,
  Coins, Award, FileText, Calculator, Landmark, Banknote,
  ClipboardList, Receipt, Wallet, Building, TrendingUp, X, Check
} from "lucide-react";

/* ============================================================
   DESIGN TOKENS
   Palette: "groene grootboek" (green accounting-ledger pad) paper
   + Dutch state orange + official stamp red, on an inked navy dark mode.
   Display: Space Grotesk. Body: IBM Plex Sans. Data: IBM Plex Mono.
   Signature element: the rubber approval stamp ("stempel") used for
   badges, career levels and completed tasks.
   ============================================================ */

const PALETTE = {
  light: {
    bg: "#EDF1F9",        // branco-azulado de papel
    bgAlt: "#E0E7F4",
    panel: "#FFFFFF",     // branco puro da bandeira
    ledgerLine: "#D3DEF0",
    ink: "#0D1B3E",       // azul-tinta profundo
    inkSoft: "#31446E",
    muted: "#6E7E9F",
    border: "#CFDAEC",
    orange: "#AE1C28",    // vermelho oficial da bandeira — cor primária
    orangeSoft: "#F8DFE1",
    stampRed: "#AE1C28",
    green: "#21468B",     // azul oficial da bandeira — estados concluídos
    gold: "#AE1C28",
  },
  dark: {
    bg: "#060D1B",        // azul-noite
    bgAlt: "#0B1425",
    panel: "#101B32",
    ledgerLine: "#1B2942",
    ink: "#EEF2FA",
    inkSoft: "#B6C3DC",
    muted: "#7C8CAB",
    border: "#233350",
    orange: "#E63946",    // vermelho saturado, forte sobre o azul-noite
    orangeSoft: "#3B1219",
    stampRed: "#E63946",
    green: "#4D8DF0",     // azul elétrico
    gold: "#E63946",
  },
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

/* ============================================================
   I18N
   ============================================================ */
const STR = {
  pt: {
    nav_dashboard: "Painel", nav_courses: "Cursos", nav_company: "Modo Empresa",
    nav_missions: "Missões", nav_profile: "Perfil",
    level: "Nível", xp: "XP", streak: "sequência", coins: "florins",
    dashboard_title: "Bom dia, Estagiário", dashboard_sub: "Aqui está o resumo do seu progresso hoje.",
    continue_learning: "Continuar a aprender", todays_missions: "Missões de hoje",
    career_progress: "Progressão de carreira",
    courses_title: "Currículo", courses_sub: "Domine as normas e impostos neerlandeses módulo a módulo.",
    lessons: "Lições", of_lessons: "lições", start_lesson: "Iniciar lição", continue: "Continuar",
    locked: "Bloqueado", completed: "Concluído", mark_done: "Marcada como concluída",
    flashcards: "Flashcard", flip: "Virar cartão", quiz: "Quiz rápido", check_answer: "Verificar resposta",
    next_exercise: "Próximo exercício →", correct: "Correto! Lição marcada como concluída.", incorrect: "Não é bem isso — tenta novamente.",
    company_title: "Van der Berg & Partners B.V.", company_sub: "O seu escritório fictício de contabilidade em Amesterdão.",
    daily_tasks: "Tarefas de hoje", career_ladder: "Escada de carreira",
    briefing: "Instruções", mark_task_done: "Marcar como concluída",
    demo_note: "Protótipo: nesta versão a tarefa é apenas informativa. O simulador de lançamentos entra com o backend.",
    account: "Conta", login: "Entrar", register: "Criar conta", logout: "Sair",
    username: "Nome de utilizador", password: "Palavra-passe",
    account_note: "Cria uma conta para guardar o progresso no servidor e recuperá-lo em qualquer dispositivo. Sem conta, o progresso fica apenas neste navegador.",
    sync_ok: "Progresso sincronizado", sync_saving: "A guardar…", sync_error: "Falha ao sincronizar — guardado localmente",
    certificates: "Certificados", view_certificate: "Ver certificado", certificate_guest: "Convidado",
    certificate_title: "Certificado de Conclusão", certificate_awarded_to: "Atribuído a", certificate_for: "Referente ao módulo",
    certificate_date: "Data", certificate_print: "Imprimir / Guardar PDF", certificate_final_title: "Certificado Final — Currículo Completo",
    progress_title: "O seu progresso", reset_progress: "Repor progresso",
    progress_note: "O progresso é guardado neste navegador e mantém-se ao fechar a página. É guardado por dispositivo — para o ter no telemóvel e no computador ao mesmo tempo será preciso criar conta, o que chega com o backend.",
    reset_confirm: "Repor todo o progresso? Esta ação não pode ser desfeita.",
    task_start: "Abrir tarefa", missions_title: "Missões", missions_sub: "Cumpra objetivos para ganhar XP e florins extra.",
    daily: "Diárias", weekly: "Semanais", monthly: "Mensais",
    profile_title: "Perfil", profile_sub: "Preferências e conquistas.",
    theme: "Tema", language: "Idioma", badges_earned: "Carimbos conquistados",
    dark_mode: "Modo escuro", light_mode: "Modo claro", select_lesson: "Escolhe uma lição à esquerda para começar.",
  },
  en: {
    nav_dashboard: "Dashboard", nav_courses: "Courses", nav_company: "Company Mode",
    nav_missions: "Missions", nav_profile: "Profile",
    level: "Level", xp: "XP", streak: "streak", coins: "guldens",
    dashboard_title: "Good morning, Intern", dashboard_sub: "Here's your progress summary for today.",
    continue_learning: "Continue learning", todays_missions: "Today's missions",
    career_progress: "Career progress",
    courses_title: "Curriculum", courses_sub: "Master Dutch standards and taxes, module by module.",
    lessons: "Lessons", of_lessons: "lessons", start_lesson: "Start lesson", continue: "Continue",
    locked: "Locked", completed: "Completed", mark_done: "Marked as completed",
    flashcards: "Flashcard", flip: "Flip card", quiz: "Quick quiz", check_answer: "Check answer",
    next_exercise: "Next exercise →", correct: "Correct! Lesson marked as completed.", incorrect: "Not quite — try again.",
    company_title: "Van der Berg & Partners B.V.", company_sub: "Your fictional accounting office in Amsterdam.",
    daily_tasks: "Today's tasks", career_ladder: "Career ladder",
    briefing: "Briefing", mark_task_done: "Mark as completed",
    demo_note: "Prototype: in this version the task is informational only. The posting simulator arrives with the backend.",
    account: "Account", login: "Sign in", register: "Create account", logout: "Sign out",
    username: "Username", password: "Password",
    account_note: "Create an account to store progress on the server and pick it up on any device. Without one, progress stays in this browser only.",
    sync_ok: "Progress synced", sync_saving: "Saving…", sync_error: "Sync failed — saved locally",
    certificates: "Certificates", view_certificate: "View certificate", certificate_guest: "Guest",
    certificate_title: "Certificate of Completion", certificate_awarded_to: "Awarded to", certificate_for: "For completing",
    certificate_date: "Date", certificate_print: "Print / Save as PDF", certificate_final_title: "Final Certificate — Full Curriculum",
    progress_title: "Your progress", reset_progress: "Reset progress",
    progress_note: "Progress is saved in this browser and survives closing the page. It's saved per device — having it on both phone and computer will require an account, which arrives with the backend.",
    reset_confirm: "Reset all progress? This cannot be undone.",
    task_start: "Open task", missions_title: "Missions", missions_sub: "Complete goals to earn extra XP and guldens.",
    daily: "Daily", weekly: "Weekly", monthly: "Monthly",
    profile_title: "Profile", profile_sub: "Preferences and achievements.",
    theme: "Theme", language: "Language", badges_earned: "Stamps earned",
    dark_mode: "Dark mode", light_mode: "Light mode", select_lesson: "Pick a lesson on the left to begin.",
  },
  nl: {
    nav_dashboard: "Dashboard", nav_courses: "Cursussen", nav_company: "Bedrijfsmodus",
    nav_missions: "Missies", nav_profile: "Profiel",
    level: "Niveau", xp: "XP", streak: "reeks", coins: "gulden",
    dashboard_title: "Goedemorgen, Stagiair", dashboard_sub: "Hier is uw voortgang van vandaag.",
    continue_learning: "Verder leren", todays_missions: "Missies van vandaag",
    career_progress: "Carrièreverloop",
    courses_title: "Curriculum", courses_sub: "Beheers Nederlandse normen en belastingen, module voor module.",
    lessons: "Lessen", of_lessons: "lessen", start_lesson: "Les starten", continue: "Doorgaan",
    locked: "Vergrendeld", completed: "Voltooid", mark_done: "Gemarkeerd als voltooid",
    flashcards: "Flashcard", flip: "Kaart omdraaien", quiz: "Korte quiz", check_answer: "Antwoord controleren",
    next_exercise: "Volgende oefening →", correct: "Correct! Les gemarkeerd als voltooid.", incorrect: "Niet helemaal — probeer opnieuw.",
    company_title: "Van der Berg & Partners B.V.", company_sub: "Uw fictieve accountantskantoor in Amsterdam.",
    daily_tasks: "Taken van vandaag", career_ladder: "Carrièreladder",
    briefing: "Opdracht", mark_task_done: "Markeren als voltooid",
    demo_note: "Prototype: in deze versie is de taak alleen informatief. De boekingssimulator komt met de backend.",
    account: "Account", login: "Inloggen", register: "Account aanmaken", logout: "Uitloggen",
    username: "Gebruikersnaam", password: "Wachtwoord",
    account_note: "Maak een account om voortgang op de server te bewaren en op elk apparaat verder te gaan. Zonder account blijft de voortgang alleen in deze browser.",
    sync_ok: "Voortgang gesynchroniseerd", sync_saving: "Opslaan…", sync_error: "Synchronisatie mislukt — lokaal opgeslagen",
    certificates: "Certificaten", view_certificate: "Certificaat bekijken", certificate_guest: "Gast",
    certificate_title: "Certificaat van Voltooiing", certificate_awarded_to: "Toegekend aan", certificate_for: "Voor het voltooien van",
    certificate_date: "Datum", certificate_print: "Afdrukken / Opslaan als PDF", certificate_final_title: "Eindcertificaat — Volledig Curriculum",
    progress_title: "Jouw voortgang", reset_progress: "Voortgang wissen",
    progress_note: "De voortgang wordt in deze browser bewaard en blijft behouden als je de pagina sluit. Het is per apparaat — voor telefoon én computer is een account nodig, dat komt met de backend.",
    reset_confirm: "Alle voortgang wissen? Dit kan niet ongedaan worden gemaakt.",
    task_start: "Taak openen", missions_title: "Missies", missions_sub: "Voltooi doelen voor extra XP en gulden.",
    daily: "Dagelijks", weekly: "Wekelijks", monthly: "Maandelijks",
    profile_title: "Profiel", profile_sub: "Voorkeuren en prestaties.",
    theme: "Thema", language: "Taal", badges_earned: "Verzamelde stempels",
    dark_mode: "Donkere modus", light_mode: "Lichte modus", select_lesson: "Kies links een les om te beginnen.",
  },
};

/* ============================================================
   COURSE CONTENT — cada lição tem teoria própria (PT/EN/NL),
   um flashcard e um mini-quiz. Conteúdo com valores de 2026.
   ============================================================ */
const COURSES = [
  {
    id: "orientacao", icon: User, color: "orange",
    title: { pt: "Chegar e viver nos Países Baixos", en: "Arriving & living in the Netherlands", nl: "Aankomen en wonen in Nederland" },
    lessons: [
      {
        title: { pt: "Inscrição e número BSN", en: "Registration & the BSN number", nl: "Inschrijving en het BSN" },
        theory: {
          pt: "Tudo começa com a inscrição, e a regra decisiva é o tempo de permanência. Quem fica mais de 4 meses inscreve-se como residente na câmara municipal (BRP) onde mora, dentro de 5 dias após a chegada; a inscrição é gratuita e leva-se passaporte ou bilhete de identidade, contrato de arrendamento ou compra, e documentos do país de origem como certidão de nascimento ou casamento. Quem fica menos de 4 meses inscreve-se como não-residente (RNI), num dos balcões disponíveis em cidades como Amesterdão, Roterdão, Haia, Utreque ou Eindhoven. De qualquer das formas recebe-se o BSN, o número fiscal que serve para trabalhar, abrir conta bancária, ir ao médico e inscrever filhos na escola. O BSN é vitalício: quem sai e regressa mantém o mesmo número, mas terá de se inscrever de novo no município.",
          en: "Everything starts with registration, and the deciding rule is length of stay. Anyone staying more than 4 months registers as a resident at the municipality (BRP) where they live, within 5 days of arrival; registration is free and you bring a passport or ID card, a rental or purchase contract, and home-country documents such as a birth or marriage certificate. Anyone staying under 4 months registers as a non-resident (RNI), at one of the counters available in cities like Amsterdam, Rotterdam, The Hague, Utrecht or Eindhoven. Either way you receive the BSN, the tax number used for working, opening a bank account, seeing a doctor and enrolling children in school. The BSN is for life: those who leave and return keep the same number, but must register with the municipality again.",
          nl: "Alles begint met inschrijving, en de verblijfsduur is bepalend. Wie langer dan 4 maanden blijft, schrijft zich in als ingezetene bij de gemeente (BRP) waar hij woont, binnen 5 dagen na aankomst; inschrijving is gratis en je neemt een paspoort of ID-kaart mee, een huur- of koopcontract, en documenten uit het land van herkomst zoals een geboorte- of huwelijksakte. Wie korter dan 4 maanden blijft, schrijft zich in als niet-ingezetene (RNI), bij een van de loketten in steden als Amsterdam, Rotterdam, Den Haag, Utrecht of Eindhoven. In beide gevallen krijg je het BSN, het nummer dat nodig is om te werken, een bankrekening te openen, naar de dokter te gaan en kinderen op school in te schrijven. Het BSN is levenslang: wie vertrekt en terugkeert houdt hetzelfde nummer, maar moet zich opnieuw bij de gemeente inschrijven.",
        },
        flashcard: {
          front: { pt: "Qual o prazo para se inscrever como residente?", en: "What's the deadline to register as a resident?", nl: "Wat is de termijn voor inschrijving als ingezetene?" },
          back: { pt: "5 dias após o primeiro dia nos Países Baixos, na câmara municipal onde mora.", en: "5 days after your first day in the Netherlands, at the municipality where you live.", nl: "5 dagen na de eerste dag in Nederland, bij de gemeente waar je woont." },
        },
        quiz: {
          q: { pt: "Vai ficar 3 meses. Como se inscreve?", en: "You're staying 3 months. How do you register?", nl: "Je blijft 3 maanden. Hoe schrijf je je in?" },
          options: [
            { pt: "Como não-residente (RNI)", en: "As a non-resident (RNI)", nl: "Als niet-ingezetene (RNI)" },
            { pt: "Como residente (BRP) na câmara municipal", en: "As a resident (BRP) at the municipality", nl: "Als ingezetene (BRP) bij de gemeente" },
            { pt: "Não é preciso inscrever-se", en: "No registration needed", nl: "Inschrijving is niet nodig" },
          ], answer: 0,
          explain: {
            pt: "A fronteira são os 4 meses. Se depois decidir ficar mais tempo, deve comunicá-lo de imediato ao município e passar a residente.",
            en: "The dividing line is 4 months. If you later decide to stay longer, you must notify the municipality immediately and switch to resident status.",
            nl: "De grens ligt bij 4 maanden. Besluit je later langer te blijven, meld dit dan direct bij de gemeente en word ingezetene.",
          },
        },
      },
      {
        title: { pt: "Seguro de saúde obrigatório", en: "Mandatory health insurance", nl: "Verplichte zorgverzekering" },
        theory: {
          pt: "O seguro de saúde neerlandês é obrigatório para quem trabalha nos Países Baixos, mesmo que já tenha seguro no país de origem — e não subscrevê-lo gera coima e a obrigação de pagar todos os custos médicos do próprio bolso. Compõe-se de um seguro básico obrigatório, mais seguros complementar e dentário facultativos. O prémio é pago pelo próprio e varia entre seguradoras; quem tem rendimentos baixos pode pedir o subsídio de saúde (zorgtoeslag). Existe uma franquia anual obrigatória ('eigen risico'), fixada pelo governo, que se aplica a medicamentos, hospital e análises, mas não às consultas do médico de família nem aos cuidados a menores de 18 anos. Quem tem empregador estrangeiro pode, em certas condições, manter o seguro do país de origem — deve confirmar junto do SVB.",
          en: "Dutch health insurance is mandatory for anyone working in the Netherlands, even if you already have cover at home — and not taking it out means a fine plus paying all medical costs yourself. It consists of a compulsory basic policy, plus optional supplementary and dental cover. The premium is paid by you and varies between insurers; low earners can claim the healthcare allowance (zorgtoeslag). There's a mandatory annual deductible ('eigen risico'), set by government, applying to medicines, hospital care and tests, but not to GP visits or care for under-18s. Those with a foreign employer may, under certain conditions, keep their home-country cover — confirm this with the SVB.",
          nl: "Een Nederlandse zorgverzekering is verplicht voor iedereen die in Nederland werkt, ook met een verzekering in het land van herkomst — geen verzekering betekent een boete én alle zorgkosten zelf betalen. Zij bestaat uit een verplichte basisverzekering, plus vrijwillige aanvullende en tandartsverzekering. De premie betaal je zelf en verschilt per verzekeraar; bij een laag inkomen kun je zorgtoeslag aanvragen. Er geldt een verplicht eigen risico, jaarlijks door de overheid vastgesteld, voor medicijnen, ziekenhuis en onderzoek, maar niet voor de huisarts of zorg voor kinderen onder de 18. Wie een buitenlandse werkgever heeft, kan onder voorwaarden de verzekering uit het herkomstland behouden — controleer dit bij de SVB.",
        },
        flashcard: {
          front: { pt: "A franquia ('eigen risico') aplica-se à consulta do médico de família?", en: "Does the deductible ('eigen risico') apply to GP visits?", nl: "Geldt het eigen risico voor de huisarts?" },
          back: { pt: "Não. O médico de família está isento de franquia, tal como os cuidados a menores de 18 anos.", en: "No. GP care is exempt from the deductible, as is care for under-18s.", nl: "Nee. De huisarts valt buiten het eigen risico, net als zorg voor kinderen onder de 18." },
        },
        quiz: {
          q: { pt: "Já tem seguro de saúde no seu país. Precisa de seguro neerlandês?", en: "You already have health cover at home. Do you need Dutch insurance?", nl: "Je hebt al een zorgverzekering in je land. Heb je een Nederlandse nodig?" },
          options: [
            { pt: "Sim, é obrigatório se trabalhar nos Países Baixos", en: "Yes, it's mandatory if you work in the Netherlands", nl: "Ja, verplicht als je in Nederland werkt" },
            { pt: "Não, o seguro estrangeiro basta sempre", en: "No, foreign cover is always enough", nl: "Nee, buitenlandse dekking is altijd voldoende" },
            { pt: "Só se tiver filhos", en: "Only if you have children", nl: "Alleen als je kinderen hebt" },
          ], answer: 0,
          explain: {
            pt: "A única exceção relevante é quem trabalha para um empregador estrangeiro, e mesmo aí há condições — confirma-se junto do SVB.",
            en: "The one relevant exception is working for a foreign employer, and even then conditions apply — check with the SVB.",
            nl: "De enige relevante uitzondering is werken voor een buitenlandse werkgever, en ook dan gelden voorwaarden — check bij de SVB.",
          },
        },
      },
      {
        title: { pt: "Direitos laborais e o cao", en: "Employment rights & the cao", nl: "Arbeidsrechten en de cao" },
        theory: {
          pt: "Todos os que trabalham nos Países Baixos têm as mesmas condições básicas, independentemente da nacionalidade: salário mínimo legal, dias de férias, subsídio de férias, 70% do salário em caso de doença e licença de maternidade. Acima disso, a maioria dos empregadores está abrangida por um cao — a convenção coletiva do setor — que só pode desviar-se da lei se for a favor do trabalhador; quem tem cao recebe o salário do cao, que é frequentemente superior ao mínimo legal. Os limites de horário são estritos: no máximo 12 horas por dia e, em regra, 48 horas por semana (60 em situações excecionais), e no trabalho noturno até 40 horas semanais. Não é obrigatório contrato escrito — os acordos verbais valem — mas sem confirmação escrita, nem que seja por email, não há prova do que foi combinado.",
          en: "Everyone working in the Netherlands has the same basic conditions, regardless of nationality: statutory minimum wage, holiday days, holiday allowance, 70% of pay when sick, and maternity leave. On top of that, most employers are covered by a cao — the sector collective agreement — which may only deviate from the law in the employee's favour; where a cao applies, you receive the cao wage, often above the statutory minimum. Working-time limits are strict: at most 12 hours a day and, as a rule, 48 hours a week (60 in exceptional cases), and up to 40 hours a week for night work. A written contract isn't mandatory — verbal agreements count — but without written confirmation, even by email, there's no proof of what was agreed.",
          nl: "Iedereen die in Nederland werkt heeft dezelfde basisarbeidsvoorwaarden, ongeacht nationaliteit: wettelijk minimumloon, vakantiedagen, vakantiegeld, 70% loon bij ziekte en zwangerschapsverlof. Daarbovenop valt de meeste werkgevers onder een cao, die alleen in het voordeel van de werknemer van de wet mag afwijken; geldt er een cao, dan krijg je het cao-loon, vaak hoger dan het minimum. De arbeidstijden zijn strikt: maximaal 12 uur per dag en in de regel 48 uur per week (60 in uitzonderingsgevallen), en bij nachtwerk tot 40 uur per week. Een schriftelijk contract is niet verplicht — mondelinge afspraken gelden — maar zonder schriftelijke bevestiging, al is het per e-mail, is er geen bewijs.",
        },
        flashcard: {
          front: { pt: "Um cao pode prever condições piores do que a lei?", en: "Can a cao provide worse terms than the law?", nl: "Mag een cao slechtere voorwaarden bieden dan de wet?" },
          back: { pt: "Não — só pode desviar-se da lei quando isso é favorável ao trabalhador.", en: "No — it may only deviate from the law where this favours the employee.", nl: "Nee — afwijken mag alleen in het voordeel van de werknemer." },
        },
        quiz: {
          q: { pt: "Qual o número máximo de horas de trabalho por dia?", en: "What's the maximum number of working hours per day?", nl: "Wat is het maximum aantal werkuren per dag?" },
          options: ["12 horas", "8 horas", "16 horas"], answer: 0,
          explain: {
            pt: "12 horas é o teto diário absoluto da Arbeidstijdenwet; o limite semanal normal é de 48 horas, com direito a intervalos.",
            en: "12 hours is the absolute daily ceiling under the Arbeidstijdenwet; the normal weekly limit is 48 hours, with breaks guaranteed.",
            nl: "12 uur is het absolute dagmaximum in de Arbeidstijdenwet; de gebruikelijke weekgrens is 48 uur, met recht op pauzes.",
          },
        },
      },
      {
        title: { pt: "Começar por conta própria (ZZP)", en: "Starting out self-employed (ZZP)", nl: "Starten als zzp'er" },
        theory: {
          pt: "Trabalhar por conta própria implica inscrever-se na Kamer van Koophandel, com marcação, entre uma semana antes e uma semana depois do início da atividade. A inscrição já atribui o número de BTW, pelo que não é preciso ir separadamente ao Belastingdienst. A partir daí muda tudo em matéria fiscal: o empresário liquida BTW nas suas faturas (o que um trabalhador por conta de outrem nunca faz), e é ele — não um empregador — que tem de reservar dinheiro para os impostos. A declaração anual de rendimentos entrega-se antes de 1 de maio, e é possível pedir uma liquidação provisória para pagar mensalmente em vez de tudo de uma vez. O reverso da autonomia: não há salário durante a doença nem subsídio de desemprego se ficar sem trabalho.",
          en: "Working for yourself means registering with the Kamer van Koophandel, by appointment, between one week before and one week after starting the business. Registration already issues the VAT number, so there's no separate trip to the Belastingdienst. From then on the tax picture changes completely: you charge VAT on your invoices (which an employee never does), and it's you — not an employer — who must set money aside for taxes. The annual income tax return is filed before 1 May, and you can request a provisional assessment to pay monthly rather than all at once. The flip side of independence: no pay while sick and no unemployment benefit if work dries up.",
          nl: "Voor jezelf werken betekent inschrijven bij de Kamer van Koophandel, op afspraak, tussen een week vóór en een week ná de start van de onderneming. Bij inschrijving krijg je meteen een btw-nummer, dus een aparte gang naar de Belastingdienst is niet nodig. Fiscaal verandert daarna alles: je brengt btw in rekening op je facturen (wat een werknemer nooit doet), en jij — geen werkgever — moet geld reserveren voor de belasting. De jaarlijkse aangifte inkomstenbelasting moet vóór 1 mei binnen zijn, en met een voorlopige aanslag kun je maandelijks betalen in plaats van ineens. De keerzijde: geen loon bij ziekte en geen WW als het werk opdroogt.",
        },
        flashcard: {
          front: { pt: "Quando se marca a inscrição na KvK?", en: "When do you schedule KvK registration?", nl: "Wanneer plan je de inschrijving bij de KvK?" },
          back: { pt: "Entre uma semana antes e uma semana depois do início da atividade.", en: "Between one week before and one week after starting the business.", nl: "Tussen een week vóór en een week ná de start van de onderneming." },
        },
        quiz: {
          q: { pt: "Onde se obtém o número de BTW ao começar por conta própria?", en: "Where do you get the VAT number when starting out self-employed?", nl: "Waar krijg je het btw-nummer bij de start als zzp'er?" },
          options: [
            { pt: "Automaticamente, ao inscrever-se na KvK", en: "Automatically, on registering with the KvK", nl: "Automatisch, bij inschrijving bij de KvK" },
            { pt: "Numa ida separada ao Belastingdienst", en: "On a separate trip to the Belastingdienst", nl: "Via een aparte gang naar de Belastingdienst" },
            { pt: "Na câmara municipal", en: "At the municipality", nl: "Bij de gemeente" },
          ], answer: 0,
          explain: {
            pt: "A KvK comunica automaticamente ao Belastingdienst, que emite o número de BTW — poupa uma diligência que muita gente ainda pensa ser necessária.",
            en: "The KvK notifies the Belastingdienst automatically, which issues the VAT number — saving a step many people still assume is required.",
            nl: "De KvK geeft dit automatisch door aan de Belastingdienst, die het btw-nummer verstrekt — een stap die velen ten onrechte nog denken te moeten zetten.",
          },
        },
      },
      {
        title: { pt: "DigiD, habitação e subsídios", en: "DigiD, housing & allowances", nl: "DigiD, wonen en toeslagen" },
        theory: {
          pt: "O DigiD é a identidade digital que dá acesso a praticamente toda a administração pública: declarações de rendimentos, pedidos de subsídio, consultas hospitalares. Só pode ser pedido por residentes e exige o BSN. Na habitação, há três vias — cooperativa de habitação (com listas de espera e um sistema legal de pontos que permite verificar se a renda cobrada é legítima), arrendamento privado (mais caro e mais rápido) ou alojamento via empregador, onde convém ler as letras pequenas: o empregador só pode reter custos de alojamento do salário mínimo mediante procuração escrita, e até um limite máximo. Por fim, os subsídios ('toeslagen'), pedidos ao Belastingdienst: renda, saúde, filhos e acolhimento infantil. Duas regras de ouro: devem ser pagos na conta bancária do próprio, nunca na do empregador ou senhorio; e devem ser cancelados ao sair do país, sob pena de coima.",
          en: "DigiD is the digital identity that unlocks nearly all public administration: tax returns, allowance claims, hospital appointments. Only residents can obtain it, and it requires the BSN. On housing, there are three routes — a housing association (with waiting lists and a statutory points system that lets you check whether the rent charged is legitimate), private rental (pricier and faster), or employer-provided accommodation, where the small print matters: an employer may only deduct housing costs from the minimum wage with written authorisation, and up to a capped limit. Finally, the allowances ('toeslagen'), claimed from the Belastingdienst: rent, healthcare, children and childcare. Two golden rules: they must be paid into your own bank account, never the employer's or landlord's; and they must be stopped when you leave the country, or you risk a fine.",
          nl: "DigiD is de digitale identiteit die toegang geeft tot vrijwel de hele overheid: belastingaangifte, toeslagen aanvragen, ziekenhuisafspraken. Alleen ingezetenen kunnen het aanvragen, en het BSN is nodig. Bij wonen zijn er drie routes — een woningcorporatie (met wachtlijsten en een wettelijk puntensysteem waarmee je kunt controleren of de huur klopt), particuliere huur (duurder en sneller), of huisvesting via de werkgever, waar de kleine lettertjes tellen: de werkgever mag alleen met schriftelijke machtiging huisvestingskosten inhouden op het minimumloon, tot een maximum. Ten slotte de toeslagen via de Belastingdienst: huur, zorg, kinderen en kinderopvang. Twee gouden regels: ze moeten op je eigen rekening binnenkomen, nooit op die van werkgever of verhuurder; en stopzetten bij vertrek uit Nederland, anders volgt een boete.",
        },
        flashcard: {
          front: { pt: "Em que conta bancária devem ser recebidos os subsídios?", en: "Into which bank account must allowances be paid?", nl: "Op welke rekening moeten toeslagen binnenkomen?" },
          back: { pt: "Sempre na conta do próprio — nunca na do empregador, agência ou senhorio.", en: "Always your own — never the employer's, agency's or landlord's.", nl: "Altijd je eigen rekening — nooit die van werkgever, uitzendbureau of verhuurder." },
        },
        quiz: {
          q: { pt: "Quem pode pedir um DigiD?", en: "Who can apply for a DigiD?", nl: "Wie kan een DigiD aanvragen?" },
          options: [
            { pt: "Apenas residentes inscritos no município", en: "Only residents registered with a municipality", nl: "Alleen ingezetenen ingeschreven bij een gemeente" },
            { pt: "Qualquer pessoa que visite os Países Baixos", en: "Anyone visiting the Netherlands", nl: "Iedereen die Nederland bezoekt" },
            { pt: "Só empresários com número KvK", en: "Only entrepreneurs with a KvK number", nl: "Alleen ondernemers met een KvK-nummer" },
          ], answer: 0,
          explain: {
            pt: "É esta a consequência prática de estar registado como não-residente (RNI): tem BSN, mas não tem DigiD — e sem DigiD muita coisa fica offline.",
            en: "This is the practical consequence of non-resident (RNI) registration: you have a BSN but no DigiD — and without DigiD a lot stays offline.",
            nl: "Dit is het praktische gevolg van een RNI-inschrijving: wel een BSN, geen DigiD — en zonder DigiD gaat veel niet digitaal.",
          },
        },
      },
    ],
  },
  {
    id: "basis", icon: ClipboardList, color: "green",
    title: { pt: "Fundamentos — Boekhouden", en: "Foundations — Dutch Bookkeeping", nl: "Basis — Boekhouden" },
    lessons: [
      {
        title: { pt: "Débito e crédito (debet / credit)", en: "Debit and credit (debet / credit)", nl: "Debet en credit" },
        theory: {
          pt: "A lógica das partidas dobradas é universal, mas o vocabulário muda: nos Países Baixos diz-se 'debet' (débito) e 'credit' (crédito), e um lançamento chama-se 'journaalpost'. A equação base é Activa = Passiva + Eigen vermogen (Ativo = Passivo + Capital próprio). Regra prática: aumentos de ativos e de custos vão a debet; aumentos de passivos, capital próprio e proveitos vão a credit. Uma diferença cultural importante: no razão neerlandês, as contas de balanço aparecem como 'balansrekeningen' e as de resultado como 'resultatenrekeningen' — e a distinção é rigorosa, porque o software (Exact, AFAS) valida automaticamente que cada journaalpost fecha a zero.",
          en: "Double-entry logic is universal, but the vocabulary changes: in the Netherlands you say 'debet' (debit) and 'credit', and a journal entry is a 'journaalpost'. The base equation is Activa = Passiva + Eigen vermogen (Assets = Liabilities + Equity). Rule of thumb: increases in assets and expenses go to debet; increases in liabilities, equity and income go to credit. One important local nuance: in the Dutch ledger, balance-sheet accounts are 'balansrekeningen' and P&L accounts are 'resultatenrekeningen' — and the distinction is strict, because the software (Exact, AFAS) automatically validates that every journaalpost nets to zero.",
          nl: "De logica van dubbel boekhouden is universeel, maar de terminologie is Nederlands: 'debet' en 'credit', en een boeking heet een journaalpost. De basisvergelijking is Activa = Passiva + Eigen vermogen. Vuistregel: toenames van activa en kosten komen debet; toenames van schulden, eigen vermogen en opbrengsten komen credit. Een belangrijk onderscheid: balansrekeningen tegenover resultatenrekeningen — dit onderscheid is strikt, omdat software (Exact, AFAS) automatisch controleert dat elke journaalpost op nul sluit.",
        },
        flashcard: {
          front: { pt: "Como se diz 'lançamento contabilístico' em neerlandês?", en: "What is a journal entry called in Dutch?", nl: "Hoe heet een boeking in het Nederlands?" },
          back: { pt: "Journaalpost — sempre com o total a debet igual ao total a credit.", en: "Journaalpost — always with total debet equal to total credit.", nl: "Journaalpost — altijd met totaal debet gelijk aan totaal credit." },
        },
        quiz: {
          q: { pt: "Um aumento de um custo é lançado a...", en: "An increase in an expense is booked to...", nl: "Een toename van kosten wordt geboekt..." },
          options: [
            { pt: "Debet", en: "Debet", nl: "Debet" },
            { pt: "Credit", en: "Credit", nl: "Credit" },
            { pt: "Depende do mês", en: "It depends on the month", nl: "Dat hangt van de maand af" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "O plano de contas RGS (vs. SNC)", en: "The RGS chart of accounts (vs. Portuguese SNC)", nl: "Het Referentie GrootboekSchema (RGS)" },
        theory: {
          pt: "Em Portugal usa-se um plano de contas único e obrigatório por lei — o SNC — com códigos numéricos organizados em 8 classes fixas (1 Meios Financeiros Líquidos, 2 Contas a Receber/Pagar, 3 Inventários, 4 Investimentos, 5 Capital Próprio, 6 Gastos, 7 Rendimentos, 8 Resultados). A conta 'Clientes' é sempre 21; 'Fornecedores' é sempre 22, em qualquer empresa do país.\n\nOs Países Baixos não têm esse plano único obrigatório — historicamente, cada software (e cada contabilista) organizava as contas à sua maneira. Para resolver isso, criou-se o RGS (Referentie GrootboekSchema): um esquema de referência de largo uso, com códigos alfabéticos hierárquicos em vez de números. Um código RGS típico tem a forma 'BLimVvp' — cada bloco de letras representa um nível: balanço vs. resultados, depois a rubrica principal, depois a subrubrica. Isto tem uma vantagem concreta: o código já 'diz' a que se refere, sem teres de decorar uma tabela numérica.\n\nA equivalência prática: onde em Portugal escreves '21 Clientes', na Holanda o RGS tem uma conta equivalente na família de 'Debiteuren' (devedores); onde escreves '22 Fornecedores', o RGS usa a família 'Crediteuren'. A lógica contabilística é a mesma — só muda a etiqueta e a forma do código.",
          en: "In Portugal, a single, legally mandatory chart of accounts is used — the SNC — with numeric codes organised into 8 fixed classes (1 Cash & Equivalents, 2 Receivables/Payables, 3 Inventories, 4 Investments, 5 Equity, 6 Expenses, 7 Income, 8 Results). The 'Clientes' (Debtors) account is always 21; 'Fornecedores' (Creditors) is always 22, in any company in the country.\n\nThe Netherlands has no such single mandatory chart — historically, each software package (and each accountant) organised accounts their own way. To fix this, the RGS (Referentie GrootboekSchema) was created: a widely used reference scheme, with hierarchical alphabetic codes instead of numbers. A typical RGS code looks like 'BLimVvp' — each letter block represents a level: balance sheet vs. P&L, then the main category, then the sub-category. This has a concrete advantage: the code already 'tells you' what it refers to, without memorising a numeric table.\n\nThe practical equivalence: where in Portugal you'd write '21 Clientes', in the Netherlands the RGS has an equivalent account in the 'Debiteuren' family; where you'd write '22 Fornecedores', RGS uses the 'Crediteuren' family. The accounting logic is the same — only the label and code format change.",
          nl: "In Portugal wordt een uniform, wettelijk verplicht rekeningschema gebruikt — het SNC — met numerieke codes in 8 vaste klassen (1 Liquide middelen, 2 Vorderingen/schulden, 3 Voorraden, 4 Beleggingen, 5 Eigen vermogen, 6 Kosten, 7 Opbrengsten, 8 Resultaat). De rekening 'Clientes' (debiteuren) is altijd 21; 'Fornecedores' (crediteuren) is altijd 22, bij elk bedrijf in het land.\n\nNederland kent geen uniform verplicht schema — van oudsher had elk softwarepakket (en elke boekhouder) een eigen indeling. Daarom is het RGS ontwikkeld: een breed gebruikt referentieschema, met hiërarchische alfabetische codes in plaats van cijfers. Een typische RGS-code ziet er zo uit: 'BLimVvp' — elk lettergroepje staat voor een niveau: balans versus resultaat, dan de hoofdrubriek, dan de subrubriek. Dit heeft een concreet voordeel: de code 'vertelt' al waar hij naar verwijst, zonder een cijfertabel uit het hoofd te leren.\n\nDe praktische gelijkenis: waar je in Portugal '21 Clientes' zou schrijven, heeft RGS in Nederland een equivalente rekening in de familie 'Debiteuren'; waar je '22 Fornecedores' zou schrijven, gebruikt RGS de familie 'Crediteuren'. De boekhoudkundige logica is hetzelfde — alleen het label en het codeformaat veranderen.",
        },
        flashcard: {
          front: { pt: "Em Portugal, que código SNC tem sempre a conta 'Clientes'?", en: "In Portugal, what SNC code does the 'Clientes' (Debtors) account always have?", nl: "Welke SNC-code heeft de rekening 'Clientes' (debiteuren) in Portugal altijd?" },
          back: { pt: "21 — é fixo por lei em qualquer empresa portuguesa; na Holanda não há um número fixo equivalente, apenas a família RGS 'Debiteuren'.", en: "21 — fixed by law for any Portuguese company; in the Netherlands there's no fixed equivalent number, just the RGS 'Debiteuren' family.", nl: "21 — wettelijk vast voor elk Portugees bedrijf; in Nederland is er geen vast equivalent nummer, alleen de RGS-familie 'Debiteuren'." },
        },
        quizzes: [
          {
            q: { pt: "Qual a principal diferença estrutural entre o SNC e o RGS?", en: "What is the main structural difference between SNC and RGS?", nl: "Wat is het belangrijkste structurele verschil tussen SNC en RGS?" },
            options: [
              { pt: "O SNC usa códigos numéricos obrigatórios; o RGS usa códigos alfabéticos de uso generalizado, não obrigatórios por lei", en: "SNC uses mandatory numeric codes; RGS uses widely-used alphabetic codes, not legally mandatory", nl: "SNC gebruikt verplichte numerieke codes; RGS gebruikt breed gebruikte alfabetische codes, niet wettelijk verplicht" },
              { pt: "Não há nenhuma diferença, são o mesmo sistema", en: "There is no difference, they're the same system", nl: "Er is geen verschil, het is hetzelfde systeem" },
              { pt: "O RGS só serve para empresas grandes", en: "RGS is only for large companies", nl: "RGS is alleen voor grote ondernemingen" },
            ], answer: 0,
            explain: {
              pt: "O SNC é imposto por lei a todas as empresas portuguesas com a mesma numeração; o RGS existe para uniformizar de forma voluntária (mas muito generalizada) um mercado que antes não tinha nenhum padrão comum.",
              en: "SNC is legally imposed on all Portuguese companies with the same numbering; RGS exists to voluntarily (but very widely) standardise a market that previously had no common standard.",
              nl: "SNC is wettelijk verplicht voor alle Portugese bedrijven met dezelfde nummering; RGS bestaat om vrijwillig (maar zeer breed) een markt te standaardiseren die voorheen geen gemeenschappelijke norm had.",
            },
          },
          {
            q: { pt: "A que família RGS corresponde, em lógica, a conta portuguesa '21 Clientes'?", en: "Which RGS family corresponds, in logic, to the Portuguese '21 Clientes' account?", nl: "Bij welke RGS-familie hoort, logisch gezien, de Portugese rekening '21 Clientes'?" },
            options: [
              { pt: "Debiteuren", en: "Debiteuren", nl: "Debiteuren" },
              { pt: "Crediteuren", en: "Crediteuren", nl: "Crediteuren" },
              { pt: "Omzet", en: "Omzet", nl: "Omzet" },
            ], answer: 0,
            explain: {
              pt: "Clientes = quem te deve dinheiro = devedores = Debiteuren. Fornecedores = a quem deves = credores = Crediteuren.",
              en: "Clientes = those who owe you money = debtors = Debiteuren. Fornecedores = those you owe = creditors = Crediteuren.",
              nl: "Clientes = wie jou geld schuldig is = debiteuren. Fornecedores = aan wie jij schuldig bent = crediteuren.",
            },
          },
          {
            q: { pt: "Uma empresa holandesa vende bens a um cliente, a crédito. Em lógica SNC, isto lançar-se-ia a débito de que classe (1-8)?", en: "A Dutch company sells goods to a customer on credit. In SNC logic, this would debit which class (1-8)?", nl: "Een Nederlands bedrijf verkoopt goederen op krediet. Volgens SNC-logica zou dit welke klasse (1-8) debiteren?" },
            options: [
              { pt: "Classe 2 — Contas a Receber e a Pagar", en: "Class 2 — Receivables and Payables", nl: "Klasse 2 — Vorderingen en schulden" },
              { pt: "Classe 6 — Gastos", en: "Class 6 — Expenses", nl: "Klasse 6 — Kosten" },
              { pt: "Classe 1 — Meios Financeiros Líquidos", en: "Class 1 — Cash & Equivalents", nl: "Klasse 1 — Liquide middelen" },
            ], answer: 0,
            explain: {
              pt: "Uma venda a crédito aumenta o valor a receber do cliente — isso é sempre Classe 2 (Clientes/Debiteuren), não Classe 1 (só dinheiro/banco já recebido) nem Classe 6 (isso seria um custo, não uma venda).",
              en: "A credit sale increases the amount owed by the customer — that's always Class 2 (Clientes/Debiteuren), not Class 1 (only cash/bank already received) nor Class 6 (that would be a cost, not a sale).",
              nl: "Een verkoop op krediet verhoogt de vordering op de klant — dat is altijd Klasse 2 (Clientes/Debiteuren), niet Klasse 1 (alleen al ontvangen kas/bank) en niet Klasse 6 (dat zou een kostenpost zijn, geen verkoop).",
            },
          },
          {
            q: { pt: "Porque é que o RGS foi criado, apesar de os Países Baixos já terem contabilistas e software a funcionar há décadas?", en: "Why was RGS created, despite the Netherlands already having accountants and software working for decades?", nl: "Waarom is RGS ontwikkeld, terwijl Nederland al decennialang boekhouders en software had?" },
            options: [
              { pt: "Para permitir que dados contabilísticos de diferentes sistemas se comparem e transmitam de forma automática (SBR/XBRL)", en: "To allow accounting data from different systems to be compared and transmitted automatically (SBR/XBRL)", nl: "Om boekhoudgegevens uit verschillende systemen automatisch te kunnen vergelijken en versturen (SBR/XBRL)" },
              { pt: "Para substituir todos os contabilistas por software automático", en: "To replace all accountants with automatic software", nl: "Om alle boekhouders te vervangen door automatische software" },
              { pt: "Porque a UE obrigou a Holanda a copiar o sistema português", en: "Because the EU forced the Netherlands to copy the Portuguese system", nl: "Omdat de EU Nederland verplichtte het Portugese systeem te kopiëren" },
            ], answer: 0,
            explain: {
              pt: "Sem um esquema comum, cada empresa tinha o seu próprio plano de contas e era impossível cruzar ou automatizar dados entre sistemas diferentes para efeitos de relato eletrónico (SBR). O RGS resolve esse problema de tradução.",
              en: "Without a common scheme, each company had its own chart of accounts, making it impossible to cross-reference or automate data between different systems for electronic reporting (SBR). RGS solves that translation problem.",
              nl: "Zonder een gemeenschappelijk schema had elk bedrijf zijn eigen rekeningschema, waardoor het onmogelijk was gegevens tussen verschillende systemen te vergelijken of te automatiseren voor elektronische rapportage (SBR). RGS lost dat vertaalprobleem op.",
            },
          },
          {
            q: { pt: "Uma PME holandesa muito pequena precisa mesmo de usar as ~2.000 contas do RGS completo?", en: "Does a very small Dutch SME really need to use all ~2,000 accounts of the full RGS?", nl: "Moet een heel klein Nederlands MKB-bedrijf echt alle ~2.000 rekeningen van de volledige RGS gebruiken?" },
            options: [
              { pt: "Não — existe o RGS MKB, uma seleção reduzida para empresas pequenas", en: "No — there's RGS MKB, a reduced selection for small companies", nl: "Nee — er is RGS MKB, een beperkte selectie voor kleine bedrijven" },
              { pt: "Sim, é sempre obrigatório usar as 2.000 contas inteiras", en: "Yes, it's always mandatory to use the full 2,000 accounts", nl: "Ja, het is altijd verplicht alle 2.000 rekeningen te gebruiken" },
              { pt: "Não, pequenas empresas estão isentas de qualquer plano de contas", en: "No, small companies are exempt from any chart of accounts", nl: "Nee, kleine bedrijven zijn vrijgesteld van elk rekeningschema" },
            ], answer: 0,
            explain: {
              pt: "Tal como o SNC tem regimes simplificados para microentidades, o RGS tem o RGS MKB — uma versão reduzida, mais prática para o dia a dia de uma pequena empresa.",
              en: "Just as SNC has simplified regimes for micro-entities, RGS has RGS MKB — a reduced version, more practical for a small company's daily use.",
              nl: "Net zoals SNC vereenvoudigde regimes kent voor micro-entiteiten, heeft RGS het RGS MKB — een beperktere versie, praktischer voor het dagelijks gebruik van een klein bedrijf.",
            },
          },
        ],
      },
      {
        title: { pt: "Diários (dagboeken) e o journaalpost", en: "Day books (dagboeken) & the journal entry", nl: "Dagboeken en de journaalpost" },
        theory: {
          pt: "A contabilidade neerlandesa organiza os lançamentos em 'dagboeken' (diários), cada um com a sua função: inkoopboek (compras), verkoopboek (vendas), bank/kas (tesouraria) e memoriaal (o diário de operações diversas, usado para acréscimos, depreciações e correções). Exemplo de journaalpost de uma fatura de venda de €1.000 + 21% BTW: debet 'Debiteuren' €1.210; credit 'Omzet' €1.000; credit 'Te betalen omzetbelasting' €210. Repara que a BTW nunca é proveito — é uma dívida ao Estado desde o momento da emissão da fatura.",
          en: "Dutch bookkeeping organises entries into 'dagboeken' (day books), each with its own role: inkoopboek (purchases), verkoopboek (sales), bank/kas (cash and bank) and memoriaal (the general journal, used for accruals, depreciation and corrections). Example journal entry for a €1,000 sales invoice + 21% VAT: debet 'Debiteuren' €1,210; credit 'Omzet' €1,000; credit 'Te betalen omzetbelasting' €210. Note that VAT is never income — it's a liability to the state from the moment the invoice is issued.",
          nl: "De Nederlandse boekhouding ordent boekingen in dagboeken, elk met een eigen functie: inkoopboek, verkoopboek, bank/kas en memoriaal (voor overlopende posten, afschrijvingen en correcties). Voorbeeld van een journaalpost bij een verkoopfactuur van €1.000 + 21% BTW: debet 'Debiteuren' €1.210; credit 'Omzet' €1.000; credit 'Te betalen omzetbelasting' €210. Let op: BTW is nooit opbrengst — het is vanaf het moment van factureren een schuld aan de Belastingdienst.",
        },
        flashcard: {
          front: { pt: "Para que serve o 'memoriaal'?", en: "What is the 'memoriaal' used for?", nl: "Waarvoor dient het memoriaal?" },
          back: { pt: "É o diário de operações diversas: acréscimos, diferimentos, depreciações e correções.", en: "It's the general journal: accruals, deferrals, depreciation and corrections.", nl: "Het is het dagboek voor overlopende posten, afschrijvingen en correcties." },
        },
        quiz: {
          q: { pt: "Numa fatura de venda, a BTW liquidada é registada como...", en: "On a sales invoice, the VAT charged is recorded as...", nl: "Bij een verkoopfactuur wordt de in rekening gebrachte BTW geboekt als..." },
          options: [
            { pt: "Proveito (omzet)", en: "Income (omzet)", nl: "Opbrengst (omzet)" },
            { pt: "Dívida ao Estado (te betalen omzetbelasting)", en: "A liability to the state (te betalen omzetbelasting)", nl: "Schuld aan de Belastingdienst (te betalen omzetbelasting)" },
            { pt: "Custo do período", en: "An expense of the period", nl: "Kosten van de periode" },
          ], answer: 1,
        },
      },
      {
        title: { pt: "Razão e balancete (grootboek e proefbalans)", en: "Ledger & trial balance (grootboek, proefbalans)", nl: "Grootboek en proefbalans" },
        theory: {
          pt: "Depois de lançados nos dagboeken, os movimentos acumulam-se no 'grootboek' (razão geral), conta a conta. O balancete chama-se 'proefbalans' ou, na versão alargada, 'kolommenbalans' — um mapa de colunas que mostra, para cada conta, os movimentos a debet e credit, o saldo, e a separação entre balanço e resultados. A kolommenbalans é a ferramenta de trabalho central do fecho: é nela que se detetam contas com saldo anómalo (por exemplo, um fornecedor com saldo devedor) antes de se produzir a jaarrekening.",
          en: "Once posted in the dagboeken, movements accumulate in the 'grootboek' (general ledger), account by account. The trial balance is called a 'proefbalans' or, in its extended form, a 'kolommenbalans' — a multi-column worksheet showing, per account, debit and credit movements, the balance, and the split between balance sheet and P&L. The kolommenbalans is the core working tool at closing: it's where you spot accounts with odd balances (a supplier with a debit balance, say) before producing the jaarrekening.",
          nl: "Na verwerking in de dagboeken komen de mutaties per rekening samen in het grootboek. De proefbalans — in de uitgebreide vorm de kolommenbalans — toont per rekening de debet- en creditmutaties, het saldo en de splitsing tussen balans en resultatenrekening. De kolommenbalans is het centrale werkinstrument bij de afsluiting: daar signaleer je rekeningen met een afwijkend saldo (bijvoorbeeld een crediteur met een debetsaldo) vóórdat de jaarrekening wordt opgesteld.",
        },
        flashcard: {
          front: { pt: "O que é uma 'kolommenbalans'?", en: "What is a 'kolommenbalans'?", nl: "Wat is een kolommenbalans?" },
          back: { pt: "Um balancete alargado por colunas, que separa movimentos, saldos, balanço e resultados.", en: "An extended multi-column trial balance separating movements, balances, balance sheet and P&L.", nl: "Een uitgebreide proefbalans in kolommen, met mutaties, saldi, balans en resultatenrekening." },
        },
        quiz: {
          q: { pt: "Qual o nome neerlandês do razão geral?", en: "What's the Dutch name for the general ledger?", nl: "Wat is de Nederlandse term voor het hoofdboek?" },
          options: [
            { pt: "Grootboek", en: "Grootboek", nl: "Grootboek" },
            { pt: "Dagboek", en: "Dagboek", nl: "Dagboek" },
            { pt: "Jaarrekening", en: "Jaarrekening", nl: "Jaarrekening" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Obrigação de arquivo (administratieplicht)", en: "Record-keeping duty (administratieplicht)", nl: "Administratieplicht" },
        theory: {
          pt: "Todo o empresário nos Países Baixos tem 'administratieplicht': a obrigação legal de manter uma contabilidade que permita, a qualquer momento, determinar os direitos e obrigações da empresa. O prazo geral de conservação é de 7 anos para toda a documentação de suporte (faturas, extratos, contratos, razão); para dados relativos a imóveis, o prazo sobe para 10 anos, por causa do período de regularização da BTW. Documentos digitais são aceites, desde que integralmente legíveis e acessíveis durante todo o período — e a Belastingdienst pode exigir a sua apresentação numa inspeção ('boekenonderzoek').",
          en: "Every entrepreneur in the Netherlands has an 'administratieplicht': a legal duty to keep records that allow the company's rights and obligations to be determined at any time. The general retention period is 7 years for all supporting documentation (invoices, statements, contracts, ledger); for records relating to immovable property it rises to 10 years, because of the VAT adjustment period. Digital documents are accepted, provided they remain fully legible and accessible throughout — and the Belastingdienst can require them during an audit ('boekenonderzoek').",
          nl: "Elke ondernemer in Nederland heeft administratieplicht: de wettelijke verplichting een administratie te voeren waaruit te allen tijde de rechten en verplichtingen van de onderneming blijken. De algemene bewaartermijn is 7 jaar voor alle onderliggende stukken (facturen, afschriften, contracten, grootboek); voor gegevens over onroerende zaken geldt 10 jaar, vanwege de herzieningstermijn voor de BTW. Digitale documenten zijn toegestaan, mits volledig leesbaar en toegankelijk gedurende de hele termijn — en de Belastingdienst kan ze opvragen bij een boekenonderzoek.",
        },
        flashcard: {
          front: { pt: "Qual o prazo de conservação para documentos sobre imóveis?", en: "What's the retention period for records on immovable property?", nl: "Wat is de bewaartermijn voor gegevens over onroerende zaken?" },
          back: { pt: "10 anos (em vez dos 7 anos gerais), devido ao período de regularização da BTW.", en: "10 years (instead of the general 7), due to the VAT adjustment period.", nl: "10 jaar (in plaats van de algemene 7), vanwege de herzieningstermijn voor de BTW." },
        },
        quiz: {
          q: { pt: "Qual o prazo geral de conservação da documentação contabilística?", en: "What is the general retention period for accounting records?", nl: "Wat is de algemene bewaartermijn voor de administratie?" },
          options: [
            { pt: "3 anos", en: "3 years", nl: "3 jaar" },
            { pt: "7 anos", en: "7 years", nl: "7 jaar" },
            { pt: "15 anos", en: "15 years", nl: "15 jaar" },
          ], answer: 1,
        },
      },
    ],
  },
  {
    id: "btw", icon: Receipt, color: "orange",
    title: { pt: "BTW — IVA Neerlandês", en: "BTW — Dutch VAT", nl: "BTW — Omzetbelasting" },
    lessons: [
      {
        title: { pt: "Taxas de BTW e âmbito", en: "VAT rates & scope", nl: "BTW-tarieven & reikwijdte" },
        theory: {
          pt: "Os Países Baixos aplicam três taxas de BTW: 21% (taxa padrão, a maioria dos bens e serviços), 9% (taxa reduzida — alimentação, livros, medicamentos, alguns serviços culturais) e 0% (exportações e certos serviços intracomunitários). O empresário liquida BTW sobre as vendas (BTW a pagar) e deduz a BTW suportada nas compras (BTW a recuperar); a diferença é entregue à Belastingdienst. Desde 2026, o alojamento de curta duração (hotéis, B&B) passou da taxa de 9% para a taxa padrão de 21%.\n\nA taxa de 0% não é o mesmo que 'isento de BTW' — parece igual na fatura (sem imposto a pagar), mas a diferença é crucial: quem vende à taxa de 0% mantém o direito a deduzir toda a BTW que suportou nas suas próprias compras (é o caso das exportações); quem vende algo isento (por exemplo, certos serviços médicos ou financeiros) NÃO pode deduzir a BTW das suas compras relacionadas com essa atividade isenta. Esta distinção entre 'taxa zero' e 'isenção' é um dos erros mais comuns de quem vem de outros sistemas de IVA, e tem impacto direto no valor final a entregar à Belastingdienst.",
          en: "The Netherlands applies three VAT rates: 21% (standard rate, most goods and services), 9% (reduced rate — food, books, medicines, some cultural services) and 0% (exports and certain intra-EU services). A business charges VAT on sales (output tax) and deducts VAT on purchases (input tax); the difference is remitted to the Belastingdienst. As of 2026, short-term accommodation (hotels, B&Bs) moved from the 9% rate to the standard 21% rate.\n\nThe 0% rate is not the same as 'VAT-exempt' — it looks identical on the invoice (no tax charged), but the difference is crucial: a business selling at 0% keeps the right to deduct all VAT incurred on its own purchases (this is the case for exports); a business selling something exempt (for example, certain medical or financial services) CANNOT deduct VAT on purchases related to that exempt activity. This distinction between 'zero rate' and 'exemption' is one of the most common mistakes for people coming from other VAT systems, and directly affects the final amount owed to the Belastingdienst.",
          nl: "Nederland kent drie BTW-tarieven: 21% (het algemene tarief, de meeste goederen en diensten), 9% (verlaagd tarief — voeding, boeken, medicijnen, sommige culturele diensten) en 0% (export en bepaalde intracommunautaire diensten). Een ondernemer brengt BTW in rekening over verkopen (af te dragen BTW) en trekt de BTW op inkopen af (voorbelasting). Vanaf 2026 valt kortdurend verblijf (hotels, B&B's) niet langer onder het verlaagde tarief van 9%, maar onder het algemene tarief van 21%.\n\nHet 0%-tarief is niet hetzelfde als 'vrijgesteld van BTW' — op de factuur lijkt het identiek (geen belasting in rekening gebracht), maar het verschil is cruciaal: wie tegen 0% verkoopt, behoudt het recht om alle BTW op eigen inkopen af te trekken (zoals bij export); wie iets vrijgestelds verkoopt (bijvoorbeeld bepaalde medische of financiële diensten) mag de BTW op inkopen die met die vrijgestelde activiteit samenhangen NIET aftrekken. Dit onderscheid tussen 'nultarief' en 'vrijstelling' is een van de meest gemaakte fouten door mensen die uit andere BTW-stelsels komen, en heeft direct invloed op het uiteindelijk verschuldigde bedrag aan de Belastingdienst.",
        },
        flashcard: {
          front: { pt: "O que é 'naheffing'?", en: "What is a 'naheffing'?", nl: "Wat is een naheffing?" },
          back: { pt: "Uma liquidação adicional emitida pela Belastingdienst quando é apurada BTW paga a menos.", en: "An additional tax assessment issued by the Belastingdienst when VAT has been underpaid.", nl: "Een extra belastingaanslag van de Belastingdienst wanneer er te weinig BTW is betaald." },
        },
        quizzes: [
          {
            q: { pt: "Qual a taxa de BTW aplicada à venda de livros nos Países Baixos?", en: "Which VAT rate applies to book sales in the Netherlands?", nl: "Welk BTW-tarief geldt voor de verkoop van boeken in Nederland?" },
            options: ["0%", "9%", "21%"], answer: 1,
          },
          {
            q: { pt: "Uma empresa vende só serviços isentos de BTW (não à taxa 0%, mas isentos). Pode deduzir a BTW das suas compras relacionadas?", en: "A company sells only VAT-exempt services (not 0%-rated, but exempt). Can it deduct VAT on related purchases?", nl: "Een bedrijf verkoopt alleen van BTW vrijgestelde diensten (niet 0%, maar vrijgesteld). Mag het de BTW op gerelateerde inkopen aftrekken?" },
            options: [
              { pt: "Não — a isenção bloqueia o direito à dedução", en: "No — exemption blocks the deduction right", nl: "Nee — vrijstelling blokkeert het aftrekrecht" },
              { pt: "Sim, exatamente como na taxa de 0%", en: "Yes, exactly as with the 0% rate", nl: "Ja, precies zoals bij het 0%-tarief" },
              { pt: "Sim, mas só até 21% do valor", en: "Yes, but only up to 21% of the value", nl: "Ja, maar slechts tot 21% van de waarde" },
            ], answer: 0,
            explain: {
              pt: "É exatamente a diferença que separa 'taxa 0%' de 'isento': a taxa 0% preserva o direito à dedução, a isenção não.",
              en: "This is exactly the difference between '0% rate' and 'exempt': the 0% rate preserves the deduction right, exemption does not.",
              nl: "Dit is precies het verschil tussen '0%-tarief' en 'vrijgesteld': het 0%-tarief behoudt het aftrekrecht, vrijstelling niet.",
            },
          },
        ],
      },
      {
        title: { pt: "Reverse-charge e declaração ICP", en: "Reverse-charge & ICP listing", nl: "Verleggingsregeling & opgaaf ICP" },
        theory: {
          pt: "No mecanismo de 'reverse-charge' (verleggingsregeling), a obrigação de liquidar a BTW é transferida do fornecedor para o cliente — usado, por exemplo, em prestações de serviços B2B intracomunitárias. O fornecedor emite a fatura sem BTW, com a menção 'BTW verlegd', e deve reportar essas operações na declaração ICP (Opgaaf Intracommunautaire Prestaties), que cruza informação com as autoridades fiscais de outros Estados-membros.",
          en: "Under the reverse-charge mechanism (verleggingsregeling), the obligation to account for VAT shifts from the supplier to the customer — used, for example, for intra-EU B2B services. The supplier issues an invoice without VAT, marked 'BTW verlegd', and must report these transactions in the ICP listing (Opgaaf Intracommunautaire Prestaties), which cross-checks data with other member states' tax authorities.",
          nl: "Bij de verleggingsregeling verschuift de verplichting om BTW aan te geven van de leverancier naar de afnemer — bijvoorbeeld bij intracommunautaire B2B-diensten. De leverancier stuurt een factuur zonder BTW met de vermelding 'BTW verlegd' en moet deze transacties opnemen in de Opgaaf Intracommunautaire Prestaties (ICP), die gegevens kruist met de belastingdiensten van andere lidstaten.",
        },
        flashcard: {
          front: { pt: "O que significa 'BTW verlegd' numa fatura?", en: "What does 'BTW verlegd' mean on an invoice?", nl: "Wat betekent 'BTW verlegd' op een factuur?" },
          back: { pt: "Que a BTW foi 'deslocada' — é o cliente, e não o fornecedor, quem tem de a declarar.", en: "That VAT has been 'shifted' — the customer, not the supplier, must account for it.", nl: "Dat de BTW is 'verlegd' — de afnemer, niet de leverancier, moet deze aangeven." },
        },
        quiz: {
          q: { pt: "Para que serve a declaração ICP?", en: "What is the ICP listing used for?", nl: "Waarvoor dient de opgaaf ICP?" },
          options: [
            { pt: "Reportar vendas nacionais em dinheiro", en: "Reporting domestic cash sales", nl: "Binnenlandse contante verkopen melden" },
            { pt: "Reportar prestações intracomunitárias sujeitas a reverse-charge", en: "Reporting intra-EU supplies subject to reverse-charge", nl: "Intracommunautaire prestaties onder de verleggingsregeling melden" },
            { pt: "Pedir isenção de BTW para startups", en: "Requesting a VAT exemption for startups", nl: "BTW-vrijstelling aanvragen voor startups" },
          ], answer: 1,
        },
      },
      {
        title: { pt: "One-Stop-Shop (OSS)", en: "One-Stop-Shop (OSS)", nl: "One-Stop-Shop (OSS)" },
        theory: {
          pt: "O regime OSS (One-Stop-Shop) permite que empresas que vendem à distância a consumidores noutros países da UE (e-commerce, serviços digitais B2C) declarem e paguem a BTW devida em todos esses países através de uma única declaração trimestral, submetida no seu próprio Estado-membro — evitando registos de BTW separados em cada país de destino.",
          en: "The OSS (One-Stop-Shop) scheme lets businesses selling at a distance to consumers in other EU countries (e-commerce, B2C digital services) declare and pay VAT due in all those countries through a single quarterly return filed in their own member state — avoiding separate VAT registrations in each destination country.",
          nl: "De OSS-regeling (One-Stop-Shop) stelt bedrijven die op afstand verkopen aan consumenten in andere EU-landen (e-commerce, B2C-digitale diensten) in staat om de verschuldigde BTW in al die landen via één kwartaalaangifte in hun eigen lidstaat te melden en te betalen — zonder aparte BTW-registraties per bestemmingsland.",
        },
        flashcard: {
          front: { pt: "Que problema resolve o regime OSS?", en: "What problem does the OSS scheme solve?", nl: "Welk probleem lost de OSS-regeling op?" },
          back: { pt: "Evita ter de registar a empresa para BTW em cada país da UE onde vende a consumidores.", en: "It avoids having to register for VAT in every EU country where the business sells to consumers.", nl: "Het voorkomt aparte BTW-registratie in elk EU-land waar aan consumenten wordt verkocht." },
        },
        quiz: {
          q: { pt: "Com que frequência se submete a declaração OSS?", en: "How often is the OSS return filed?", nl: "Hoe vaak wordt de OSS-aangifte ingediend?" },
          options: [
            { pt: "Trimestralmente", en: "Quarterly", nl: "Per kwartaal" },
            { pt: "Anualmente", en: "Annually", nl: "Jaarlijks" },
            { pt: "Por cada venda", en: "Per individual sale", nl: "Per verkoop" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Declaração periódica e prazos", en: "Periodic return & deadlines", nl: "Periodieke aangifte & termijnen" },
        theory: {
          pt: "A maioria das empresas entrega a declaração de BTW mensalmente ou trimestralmente, consoante o volume de negócios e histórico de cumprimento; empresas muito pequenas podem qualificar-se para declaração anual. O prazo de entrega e pagamento é, em regra, o último dia do mês seguinte ao período. O atraso na entrega ou no pagamento pode gerar uma coima administrativa ('verzuimboete') e juros de mora.",
          en: "Most businesses file VAT returns monthly or quarterly, depending on turnover and compliance history; very small businesses may qualify for annual filing. The filing and payment deadline is, as a rule, the last day of the month following the period. Late filing or payment can trigger an administrative penalty ('verzuimboete') and interest.",
          nl: "De meeste ondernemers doen maandelijks of per kwartaal BTW-aangifte, afhankelijk van omzet en nalevingsgeschiedenis; zeer kleine ondernemers kunnen in aanmerking komen voor jaaraangifte. De uiterste indien- en betaaldatum is doorgaans de laatste dag van de maand volgend op het tijdvak. Te laat aangeven of betalen kan een verzuimboete en belastingrente opleveren.",
        },
        flashcard: {
          front: { pt: "O que é uma 'verzuimboete'?", en: "What is a 'verzuimboete'?", nl: "Wat is een verzuimboete?" },
          back: { pt: "Uma coima administrativa por entrega ou pagamento tardio da declaração de BTW.", en: "An administrative fine for late filing or late payment of the VAT return.", nl: "Een bestuurlijke boete voor het te laat indienen of betalen van de BTW-aangifte." },
        },
        quiz: {
          q: { pt: "O que pode acontecer se a declaração de BTW for entregue fora do prazo?", en: "What can happen if the VAT return is filed late?", nl: "Wat kan er gebeuren als de BTW-aangifte te laat wordt ingediend?" },
          options: [
            { pt: "Nada, não há consequências", en: "Nothing, there are no consequences", nl: "Niets, er zijn geen gevolgen" },
            { pt: "Coima administrativa e juros de mora", en: "An administrative fine and interest", nl: "Een verzuimboete en belastingrente" },
            { pt: "Perda automática do NIF", en: "Automatic loss of the tax number", nl: "Automatisch verlies van het btw-nummer" },
          ], answer: 1,
        },
      },
      {
        title: { pt: "Faturação — requisitos legais", en: "Invoicing — legal requirements", nl: "Facturering — wettelijke vereisten" },
        theory: {
          pt: "Uma fatura válida para efeitos de BTW não pode ter qualquer formato — a lei exige elementos obrigatórios: número sequencial único, data de emissão, nome e morada completos do fornecedor e do cliente, o número de BTW do fornecedor (e do cliente, se for B2B com reverse-charge), descrição clara dos bens ou serviços, quantidade e preço unitário sem BTW, a(s) taxa(s) de BTW aplicada(s), o montante de BTW por taxa, e o total a pagar. Para faturas de valor reduzido (até cerca de €100, incluindo BTW), a lei neerlandesa permite uma 'factuur vereenvoudigd' (fatura simplificada), com menos elementos obrigatórios — útil em talões de venda a dinheiro, por exemplo. Faturas inválidas ou incompletas podem levar a Belastingdienst a recusar a dedução da BTW ao cliente, mesmo que o imposto tenha sido efetivamente pago.",
          en: "A valid invoice for VAT purposes can't take any format — the law requires mandatory elements: a unique sequential number, date of issue, full name and address of both supplier and customer, the supplier's VAT number (and the customer's, for B2B reverse-charge), a clear description of goods or services, quantity and unit price excluding VAT, the VAT rate(s) applied, the VAT amount per rate, and the total payable. For low-value invoices (up to around €100 including VAT), Dutch law allows a simplified invoice ('factuur vereenvoudigd') with fewer mandatory elements — useful for cash receipts, for example. Invalid or incomplete invoices can lead the Belastingdienst to refuse the customer's VAT deduction, even if the tax was actually paid.",
          nl: "Een geldige factuur voor de BTW kan niet zomaar elke vorm hebben — de wet vereist verplichte elementen: een uniek doorlopend nummer, factuurdatum, volledige naam en adres van leverancier en afnemer, het btw-nummer van de leverancier (en van de afnemer bij B2B-verlegging), een duidelijke omschrijving van goederen of diensten, aantal en stukprijs exclusief BTW, het toegepaste BTW-tarief (of tarieven), het BTW-bedrag per tarief, en het totaal te betalen bedrag. Voor facturen van beperkte waarde (tot circa €100 inclusief BTW) staat de wet een vereenvoudigde factuur toe, met minder verplichte elementen — handig bij bijvoorbeeld kassabonnen. Ongeldige of onvolledige facturen kunnen ertoe leiden dat de Belastingdienst de btw-aftrek bij de afnemer weigert, ook al is de belasting daadwerkelijk betaald.",
        },
        flashcard: {
          front: { pt: "Até que valor aproximado é permitida uma fatura simplificada?", en: "Up to roughly what value is a simplified invoice allowed?", nl: "Tot welk bedrag mag een vereenvoudigde factuur worden gebruikt?" },
          back: { pt: "Cerca de €100, incluindo BTW.", en: "Around €100, including VAT.", nl: "Circa €100, inclusief BTW." },
        },
        quizzes: [
          {
            q: { pt: "O que pode acontecer se uma fatura B2B não incluir o número de BTW do fornecedor?", en: "What can happen if a B2B invoice omits the supplier's VAT number?", nl: "Wat kan er gebeuren als een B2B-factuur het btw-nummer van de leverancier mist?" },
            options: [
              { pt: "A Belastingdienst pode recusar a dedução de BTW ao cliente", en: "The Belastingdienst may refuse the customer's VAT deduction", nl: "De Belastingdienst kan de btw-aftrek bij de afnemer weigeren" },
              { pt: "Nada, é apenas uma formalidade sem consequências", en: "Nothing, it's just a formality with no consequences", nl: "Niets, het is slechts een formaliteit zonder gevolgen" },
              { pt: "A fatura passa automaticamente a isenta de BTW", en: "The invoice automatically becomes VAT-exempt", nl: "De factuur wordt automatisch vrijgesteld van BTW" },
            ], answer: 0,
            explain: {
              pt: "Os elementos obrigatórios existem para a Belastingdienst poder confirmar que a operação é real e a BTW foi corretamente liquidada — sem eles, o direito à dedução do cliente fica em risco.",
              en: "The mandatory elements exist so the Belastingdienst can confirm the transaction is genuine and VAT was correctly charged — without them, the customer's deduction right is at risk.",
              nl: "De verplichte elementen bestaan zodat de Belastingdienst kan vaststellen dat de transactie echt is en de BTW correct is berekend — zonder deze loopt het aftrekrecht van de afnemer gevaar.",
            },
          },
          {
            q: { pt: "Uma fatura simplificada omite tipicamente qual elemento, face a uma fatura completa?", en: "A simplified invoice typically omits which element, compared to a full invoice?", nl: "Welk element mist een vereenvoudigde factuur doorgaans, vergeleken met een volledige factuur?" },
            options: [
              { pt: "Discriminação detalhada de alguns elementos (ex.: dados completos do cliente)", en: "Detailed breakdown of some elements (e.g. full customer details)", nl: "Gedetailleerde uitsplitsing van sommige elementen (bijv. volledige klantgegevens)" },
              { pt: "A taxa de BTW aplicada", en: "The VAT rate applied", nl: "Het toegepaste BTW-tarief" },
              { pt: "O valor total a pagar", en: "The total amount payable", nl: "Het totaal te betalen bedrag" },
            ], answer: 0,
            explain: {
              pt: "A simplificação afeta sobretudo a identificação detalhada do cliente — a taxa e o total continuam sempre obrigatórios, mesmo numa fatura simplificada.",
              en: "The simplification mainly affects detailed customer identification — the rate and the total remain mandatory even on a simplified invoice.",
              nl: "De vereenvoudiging betreft vooral de gedetailleerde identificatie van de klant — het tarief en het totaal blijven ook op een vereenvoudigde factuur verplicht.",
            },
          },
        ],
      },
      {
        title: { pt: "Correções e regularizações (suppletie)", en: "Corrections & adjustments (suppletie)", nl: "Correcties en suppletie" },
        theory: {
          pt: "Encontraste um erro numa declaração de BTW já entregue — o que fazer? Se a diferença de imposto for pequena (até cerca de €1.000, para mais ou para menos), a correção pode simplesmente ser incluída na declaração seguinte, sem formalidades extra. Acima desse valor, é obrigatório entregar uma 'suppletie aangifte' (declaração de regularização) específica, assim que o erro for detetado — quanto mais se demorar a corrigir voluntariamente, maior o risco de a Belastingdienst tratar o erro como negligência ou dolo, com coimas bastante mais pesadas do que as de um simples atraso. Corrigir por iniciativa própria e depressa é sempre mais barato do que esperar por uma inspeção.",
          en: "Found an error in a VAT return already filed — what now? If the tax difference is small (up to around €1,000, either way), the correction can simply be included in the next regular return, without extra formalities. Above that amount, a specific 'suppletie aangifte' (supplementary return) must be filed as soon as the error is discovered — the longer voluntary correction is delayed, the greater the risk the Belastingdienst treats the error as negligence or intent, with penalties considerably heavier than for a simple late filing. Correcting quickly on your own initiative is always cheaper than waiting for an audit.",
          nl: "Een fout gevonden in een al ingediende BTW-aangifte — wat nu? Is het verschil klein (tot circa €1.000, in beide richtingen), dan mag de correctie gewoon worden meegenomen in de eerstvolgende aangifte, zonder extra formaliteiten. Daarboven moet een aparte suppletie-aangifte worden ingediend zodra de fout wordt ontdekt — hoe langer vrijwillig corrigeren wordt uitgesteld, hoe groter het risico dat de Belastingdienst de fout als nalatigheid of opzet behandelt, met veel hogere boetes dan bij een eenvoudige te late aangifte. Snel en op eigen initiatief corrigeren is altijd goedkoper dan wachten op een boekenonderzoek.",
        },
        flashcard: {
          front: { pt: "O que é uma 'suppletie aangifte'?", en: "What is a 'suppletie aangifte'?", nl: "Wat is een suppletie-aangifte?" },
          back: { pt: "Uma declaração de regularização de BTW, obrigatória quando o erro encontrado excede cerca de €1.000.", en: "A VAT correction return, mandatory when the error found exceeds around €1,000.", nl: "Een correctieaangifte voor de BTW, verplicht als de gevonden fout circa €1.000 overschrijdt." },
        },
        quizzes: [
          {
            q: { pt: "Encontras um erro de €200 numa declaração antiga. O que deves fazer?", en: "You find a €200 error in an old return. What should you do?", nl: "Je vindt een fout van €200 in een oude aangifte. Wat moet je doen?" },
            options: [
              { pt: "Incluir a correção na próxima declaração normal", en: "Include the correction in the next regular return", nl: "De correctie meenemen in de eerstvolgende aangifte" },
              { pt: "Nada, erros pequenos não precisam de correção", en: "Nothing, small errors don't need correcting", nl: "Niets, kleine fouten hoeven niet gecorrigeerd te worden" },
              { pt: "Entregar sempre uma suppletie, seja qual for o valor", en: "Always file a suppletie, regardless of the amount", nl: "Altijd een suppletie indienen, ongeacht het bedrag" },
            ], answer: 0,
            explain: {
              pt: "Abaixo do limiar de regularização (cerca de €1.000), a correção simples na declaração seguinte é suficiente e evita burocracia desnecessária.",
              en: "Below the adjustment threshold (around €1,000), a simple correction in the next return is enough and avoids unnecessary bureaucracy.",
              nl: "Onder de suppletiedrempel (circa €1.000) volstaat een eenvoudige correctie in de volgende aangifte, zonder onnodige rompslomp.",
            },
          },
          {
            q: { pt: "Qual o principal risco de adiar a correção voluntária de um erro grande?", en: "What's the main risk of delaying voluntary correction of a large error?", nl: "Wat is het grootste risico van het uitstellen van vrijwillige correctie bij een grote fout?" },
            options: [
              { pt: "A Belastingdienst pode tratar o atraso como negligência ou dolo, com coimas mais pesadas", en: "The Belastingdienst may treat the delay as negligence or intent, with heavier penalties", nl: "De Belastingdienst kan het uitstel als nalatigheid of opzet behandelen, met zwaardere boetes" },
              { pt: "Nenhum — corrigir mais tarde tem sempre o mesmo custo", en: "None — correcting later always costs the same", nl: "Geen — later corrigeren kost altijd hetzelfde" },
              { pt: "A empresa perde automaticamente o número de BTW", en: "The company automatically loses its VAT number", nl: "Het bedrijf verliest automatisch het btw-nummer" },
            ], answer: 0,
            explain: {
              pt: "A correção voluntária e rápida é vista como boa-fé; esperar por uma inspeção para 'ser apanhado' costuma sair muito mais caro.",
              en: "Fast, voluntary correction is seen as good faith; waiting to be caught in an audit is usually far more expensive.",
              nl: "Snel en vrijwillig corrigeren wordt gezien als goede trouw; wachten tot je bij een controle wordt betrapt, is doorgaans veel duurder.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "vpb", icon: Landmark, color: "green",
    title: { pt: "Corporate Tax (Vpb)", en: "Corporate Tax (Vpb)", nl: "Vennootschapsbelasting" },
    lessons: [
      {
        title: { pt: "Escalões de tributação", en: "Tax brackets", nl: "Belastingschijven" },
        theory: {
          pt: "O Vpb (vennootschapsbelasting) tributa o lucro de sociedades residentes em dois escalões: 19% sobre os primeiros €200.000 de lucro tributável e 25,8% sobre o excedente — valores em vigor tanto em 2025 como em 2026. Sociedades não residentes com estabelecimento estável nos Países Baixos estão sujeitas às mesmas taxas sobre o rendimento de fonte neerlandesa.\n\nExemplo de cálculo: uma empresa com €350.000 de lucro tributável paga 19% sobre os primeiros €200.000 (= €38.000) mais 25,8% sobre os restantes €150.000 (= €38.700) — um total de €76.700, e não simplesmente 25,8% sobre os €350.000 inteiros (o que daria, incorretamente, €90.300). É um erro comum aplicar a taxa mais alta a todo o lucro, em vez de só ao excedente — o sistema é progressivo por escalões, tal como o IRS em Portugal, e não uma taxa única sobre o total.",
          en: "Vpb (corporate income tax) taxes resident companies' profit in two brackets: 19% on the first €200,000 of taxable profit and 25.8% on the excess — rates unchanged between 2025 and 2026. Non-resident companies with a Dutch permanent establishment are subject to the same rates on Dutch-source income.\n\nWorked example: a company with €350,000 of taxable profit pays 19% on the first €200,000 (= €38,000) plus 25.8% on the remaining €150,000 (= €38,700) — a total of €76,700, not simply 25.8% on the full €350,000 (which would incorrectly give €90,300). A common mistake is applying the higher rate to the entire profit instead of only to the excess — the system is progressive by bracket, much like personal income tax, not a flat rate on the total.",
          nl: "De vennootschapsbelasting (Vpb) kent twee schijven: 19% over de eerste €200.000 belastbare winst en 25,8% over het meerdere — ongewijzigd tussen 2025 en 2026. Niet-ingezeten lichamen met een vaste inrichting in Nederland zijn onderworpen aan dezelfde tarieven over inkomen uit Nederlandse bron.\n\nUitgewerkt voorbeeld: een bedrijf met €350.000 belastbare winst betaalt 19% over de eerste €200.000 (= €38.000) plus 25,8% over de resterende €150.000 (= €38.700) — samen €76.700, niet simpelweg 25,8% over de volle €350.000 (wat ten onrechte €90.300 zou opleveren). Een veelgemaakte fout is het hoogste tarief over de hele winst toe te passen in plaats van alleen over het meerdere — het systeem is progressief per schijf, net als de inkomstenbelasting, geen vast tarief over het totaal.",
        },
        flashcard: {
          front: { pt: "Até que valor se aplica a taxa reduzida de 19%?", en: "Up to what amount does the 19% reduced rate apply?", nl: "Tot welk bedrag geldt het verlaagde tarief van 19%?" },
          back: { pt: "Até €200.000 de lucro tributável (2026); acima disso aplica-se 25,8%.", en: "Up to €200,000 of taxable profit (2026); above that, 25.8% applies.", nl: "Tot €200.000 belastbare winst (2026); daarboven geldt 25,8%." },
        },
        quizzes: [
          {
            q: { pt: "Qual a taxa de Vpb acima de €200.000 de lucro tributável?", en: "What Vpb rate applies above €200,000 of taxable profit?", nl: "Welk Vpb-tarief geldt boven €200.000 belastbare winst?" },
            options: ["19%", "21%", "25,8%"], answer: 2,
          },
          {
            q: { pt: "Uma empresa tem €250.000 de lucro tributável. Qual o Vpb total devido?", en: "A company has €250,000 of taxable profit. What is the total Vpb due?", nl: "Een bedrijf heeft €250.000 belastbare winst. Wat is de totaal verschuldigde Vpb?" },
            options: [
              { pt: "€38.000 + 25,8% de €50.000 = €50.900", en: "€38,000 + 25.8% of €50,000 = €50,900", nl: "€38.000 + 25,8% van €50.000 = €50.900" },
              { pt: "25,8% de €250.000 = €64.500", en: "25.8% of €250,000 = €64,500", nl: "25,8% van €250.000 = €64.500" },
              { pt: "19% de €250.000 = €47.500", en: "19% of €250,000 = €47,500", nl: "19% van €250.000 = €47.500" },
            ], answer: 0,
            explain: {
              pt: "Só os primeiros €200.000 pagam 19% (= €38.000); os restantes €50.000 pagam 25,8% (= €12.900). Total: €50.900 — nunca se aplica uma única taxa a todo o lucro.",
              en: "Only the first €200,000 pays 19% (= €38,000); the remaining €50,000 pays 25.8% (= €12,900). Total: €50,900 — a single rate is never applied to the entire profit.",
              nl: "Alleen de eerste €200.000 betaalt 19% (= €38.000); de resterende €50.000 betaalt 25,8% (= €12.900). Totaal: €50.900 — nooit één tarief over de hele winst.",
            },
          },
        ],
      },
      {
        title: { pt: "Participation exemption", en: "Participation exemption", nl: "Deelnemingsvrijstelling" },
        theory: {
          pt: "A 'deelnemingsvrijstelling' isenta de Vpb os dividendos e mais-valias recebidos de participações qualificadas (em regra, ≥5% do capital), evitando dupla tributação económica dentro de um grupo empresarial. É uma das razões pelas quais os Países Baixos funcionam como jurisdição preferencial para estruturas de holding de grupos multinacionais.",
          en: "The 'deelnemingsvrijstelling' (participation exemption) exempts dividends and capital gains from qualifying holdings (generally ≥5% of the shares) from Vpb, preventing economic double taxation within a corporate group. It is one of the reasons the Netherlands functions as a preferred holding jurisdiction for multinational groups.",
          nl: "De deelnemingsvrijstelling stelt dividenden en vermogenswinsten uit kwalificerende deelnemingen (doorgaans ≥5% van het kapitaal) vrij van vennootschapsbelasting, om economische dubbele heffing binnen een concern te voorkomen. Dit is een van de redenen waarom Nederland een geliefde houdstermaatschappij-jurisdictie is voor multinationale groepen.",
        },
        flashcard: {
          front: { pt: "Que percentagem mínima de participação é geralmente exigida?", en: "What minimum shareholding is generally required?", nl: "Welk minimumbelang is doorgaans vereist?" },
          back: { pt: "Pelo menos 5% do capital da participada.", en: "At least 5% of the shares in the subsidiary.", nl: "Ten minste 5% van het kapitaal van de deelneming." },
        },
        quiz: {
          q: { pt: "O que a 'deelnemingsvrijstelling' evita?", en: "What does the participation exemption prevent?", nl: "Wat voorkomt de deelnemingsvrijstelling?" },
          options: [
            { pt: "Dupla tributação de dividendos dentro de um grupo", en: "Double taxation of dividends within a group", nl: "Dubbele belasting van dividend binnen een concern" },
            { pt: "Pagamento de BTW sobre exportações", en: "Payment of VAT on exports", nl: "Betaling van BTW over export" },
            { pt: "Retenção na fonte sobre salários", en: "Withholding tax on salaries", nl: "Inhouding van loonbelasting" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Innovatiebox", en: "Innovation box", nl: "Innovatiebox" },
        theory: {
          pt: "A 'innovatiebox' permite tributar o lucro qualificado proveniente de ativos intangíveis desenvolvidos internamente (protegidos por patente ou com declaração WBSO/S&O) a uma taxa efetiva de cerca de 9%, em vez da taxa normal de 19%/25,8%. É particularmente relevante para empresas de tecnologia e I&D, e exige documentação adequada que ligue o lucro ao ativo qualificado.",
          en: "The 'innovation box' taxes qualifying profit from self-developed intangible assets (patented, or covered by a WBSO/S&O declaration) at an effective rate of around 9%, instead of the normal 19%/25.8% rate. It's particularly relevant for tech and R&D companies, and requires proper documentation linking the profit to the qualifying asset.",
          nl: "De innovatiebox belast kwalificerende winst uit zelf ontwikkelde immateriële activa (met octrooi, of met een WBSO/S&O-verklaring) tegen een effectief tarief van circa 9%, in plaats van het reguliere tarief van 19%/25,8%. Dit is vooral relevant voor tech- en R&D-bedrijven en vereist goede documentatie die de winst koppelt aan het kwalificerende activum.",
        },
        flashcard: {
          front: { pt: "Que declaração é normalmente necessária para aceder à innovatiebox?", en: "Which declaration is typically needed to access the innovation box?", nl: "Welke verklaring is doorgaans nodig voor de innovatiebox?" },
          back: { pt: "A declaração WBSO/S&O (Speur- en Ontwikkelingswerk), obtida junto da RVO.", en: "The WBSO/S&O declaration (R&D declaration), obtained from the RVO.", nl: "De WBSO/S&O-verklaring, verkregen via de RVO." },
        },
        quiz: {
          q: { pt: "Qual a taxa efetiva aplicada ao lucro qualificado na innovatiebox?", en: "What effective rate applies to qualifying profit under the innovation box?", nl: "Welk effectief tarief geldt voor kwalificerende winst in de innovatiebox?" },
          options: ["0%", "9%", "19%"], answer: 1,
        },
      },
      {
        title: { pt: "Reporte de prejuízos fiscais", en: "Tax loss relief", nl: "Verliesverrekening" },
        theory: {
          pt: "Desde 1 de janeiro de 2022, os prejuízos fiscais podem ser reportados para trás um ano ('carryback') e para a frente por tempo indeterminado ('carryforward'). No entanto, existe uma limitação quantitativa: o primeiro milhão de euros de lucro tributável pode ser integralmente compensado com prejuízos, mas acima desse valor só é possível compensar 50% do lucro excedente — o que evita que empresas muito lucrativas paguem zero Vpb indefinidamente por causa de perdas antigas.",
          en: "Since 1 January 2022, tax losses can be carried back one year and carried forward indefinitely. However, a quantitative restriction applies: the first €1 million of taxable profit can be fully offset by losses, but above that only 50% of the excess profit can be offset — preventing highly profitable companies from paying zero Vpb indefinitely because of old losses.",
          nl: "Sinds 1 januari 2022 kunnen verliezen één jaar worden teruggewenteld (carry back) en onbeperkt vooruitgewenteld (carry forward). Wel geldt een kwantitatieve beperking: de eerste €1 miljoen belastbare winst mag volledig met verliezen worden verrekend, maar daarboven mag slechts 50% van de resterende winst worden verrekend — zodat zeer winstgevende bedrijven niet blijvend nul vennootschapsbelasting betalen door oude verliezen.",
        },
        flashcard: {
          front: { pt: "Até que valor de lucro pode um prejuízo ser 100% compensado?", en: "Up to what profit amount can a loss be fully offset?", nl: "Tot welk winstbedrag mag een verlies volledig worden verrekend?" },
          back: { pt: "Até €1 milhão; acima disso, apenas 50% do excedente.", en: "Up to €1 million; above that, only 50% of the excess.", nl: "Tot €1 miljoen; daarboven slechts 50% van het meerdere." },
        },
        quiz: {
          q: { pt: "Durante quanto tempo pode um prejuízo fiscal ser reportado para a frente?", en: "For how long can a tax loss be carried forward?", nl: "Hoe lang kan een fiscaal verlies worden vooruitgewenteld?" },
          options: [
            { pt: "6 anos", en: "6 years", nl: "6 jaar" },
            { pt: "Indefinidamente (com limite de 50% acima de €1M)", en: "Indefinitely (capped at 50% above €1M)", nl: "Onbeperkt (met een grens van 50% boven €1 mln)" },
            { pt: "1 ano", en: "1 year", nl: "1 jaar" },
          ], answer: 1,
        },
      },
      {
        title: { pt: "Fiscale eenheid (grupo fiscal)", en: "Fiscale eenheid (tax group)", nl: "Fiscale eenheid" },
        theory: {
          pt: "Quando uma sociedade-mãe detém pelo menos 95% do capital de uma filial, o grupo pode pedir para ser tratado como uma única entidade para efeitos de Vpb — a 'fiscale eenheid'. Isto tem duas vantagens práticas: os lucros e prejuízos de todas as empresas do grupo são consolidados numa única declaração (um prejuízo numa filial reduz imediatamente o lucro tributável do grupo), e as transações internas entre empresas do grupo deixam de ter relevância fiscal direta. O preço a pagar é a responsabilidade solidária — cada empresa do grupo responde pela dívida total de Vpb do grupo, não apenas pela sua parte. É uma opção, não uma obrigação, e pode ser desfeita ou reconstituída consoante a estrutura societária evolui.",
          en: "When a parent company holds at least 95% of a subsidiary's capital, the group can apply to be treated as a single entity for Vpb purposes — the 'fiscale eenheid'. This has two practical advantages: profits and losses of all group companies are consolidated into a single return (a loss in one subsidiary immediately reduces the group's taxable profit), and internal transactions between group companies no longer have direct tax relevance. The price is joint and several liability — each group company is liable for the group's entire Vpb debt, not just its own share. It's an election, not an obligation, and can be dissolved or reconstituted as the corporate structure evolves.",
          nl: "Houdt een moedermaatschappij ten minste 95% van het kapitaal van een dochter, dan kan het concern verzoeken als één belastingplichtige te worden behandeld voor de Vpb — de fiscale eenheid. Dit heeft twee praktische voordelen: winsten en verliezen van alle groepsmaatschappijen worden geconsolideerd in één aangifte (een verlies bij een dochter verlaagt direct de belastbare winst van de groep), en onderlinge transacties tussen groepsmaatschappijen hebben geen directe fiscale relevantie meer. De prijs is hoofdelijke aansprakelijkheid — elke groepsmaatschappij is aansprakelijk voor de volledige Vpb-schuld van de groep, niet alleen het eigen deel. Het is een keuze, geen verplichting, en kan worden verbroken of opnieuw gevormd naarmate de concernstructuur verandert.",
        },
        flashcard: {
          front: { pt: "Que participação mínima é exigida para formar uma fiscale eenheid?", en: "What minimum shareholding is required to form a fiscale eenheid?", nl: "Welk minimumbelang is vereist voor een fiscale eenheid?" },
          back: { pt: "Pelo menos 95% do capital da filial.", en: "At least 95% of the subsidiary's shares.", nl: "Ten minste 95% van het kapitaal van de dochter." },
        },
        quizzes: [
          {
            q: { pt: "Qual a principal desvantagem de formar uma fiscale eenheid?", en: "What is the main downside of forming a fiscale eenheid?", nl: "Wat is het grootste nadeel van een fiscale eenheid?" },
            options: [
              { pt: "Responsabilidade solidária pela dívida total de Vpb do grupo", en: "Joint and several liability for the group's entire Vpb debt", nl: "Hoofdelijke aansprakelijkheid voor de volledige Vpb-schuld van de groep" },
              { pt: "Perda do direito à participation exemption", en: "Loss of the participation exemption", nl: "Verlies van de deelnemingsvrijstelling" },
              { pt: "Aumento automático da taxa de Vpb para 25,8%", en: "Automatic increase of the Vpb rate to 25.8%", nl: "Automatische verhoging van het Vpb-tarief naar 25,8%" },
            ], answer: 0,
            explain: {
              pt: "A consolidação de resultados vem a par de uma contrapartida: cada empresa do grupo pode ser chamada a responder pela totalidade da dívida fiscal do grupo, não só pela sua fatia.",
              en: "Consolidating results comes with a trade-off: each group company can be called on to answer for the group's entire tax debt, not just its own slice.",
              nl: "Het consolideren van resultaten heeft een keerzijde: elke groepsmaatschappij kan worden aangesproken op de volledige belastingschuld van de groep, niet alleen het eigen deel.",
            },
          },
          {
            q: { pt: "O que acontece a um prejuízo numa filial dentro de uma fiscale eenheid?", en: "What happens to a loss in a subsidiary within a fiscale eenheid?", nl: "Wat gebeurt er met een verlies bij een dochter binnen een fiscale eenheid?" },
            options: [
              { pt: "Reduz imediatamente o lucro tributável consolidado do grupo", en: "It immediately reduces the group's consolidated taxable profit", nl: "Het verlaagt direct de geconsolideerde belastbare winst van de groep" },
              { pt: "Fica isolado, sem efeito nas outras empresas do grupo", en: "It stays isolated, with no effect on other group companies", nl: "Het blijft geïsoleerd, zonder effect op andere groepsmaatschappijen" },
              { pt: "Tem de ser reportado individualmente por 10 anos antes de contar", en: "It must be individually carried forward for 10 years before counting", nl: "Het moet individueel 10 jaar worden voortgewenteld voordat het meetelt" },
            ], answer: 0,
            explain: {
              pt: "É precisamente essa consolidação automática de lucros e prejuízos que torna a fiscale eenheid atrativa para grupos com empresas em fases diferentes de rentabilidade.",
              en: "It's precisely this automatic consolidation of profits and losses that makes the fiscale eenheid attractive for groups with companies at different stages of profitability.",
              nl: "Juist deze automatische consolidatie van winsten en verliezen maakt de fiscale eenheid aantrekkelijk voor groepen met maatschappijen in verschillende winstfasen.",
            },
          },
        ],
      },
      {
        title: { pt: "Preços de transferência (transfer pricing)", en: "Transfer pricing", nl: "Verrekenprijzen" },
        theory: {
          pt: "Quando duas empresas do mesmo grupo negoceiam entre si (por exemplo, a filial holandesa compra componentes à casa-mãe estrangeira), a lei fiscal neerlandesa exige que o preço praticado seja o mesmo que seria acordado entre partes independentes — o 'arm's-lengthbeginsel' (princípio de plena concorrência). Se a Belastingdienst entender que o preço foi artificialmente inflacionado ou reduzido para deslocar lucro para fora dos Países Baixos, pode corrigir o lucro tributável em conformidade. Grupos multinacionais de maior dimensão (acima de determinados limiares de faturação consolidada) têm ainda obrigações de documentação específicas — o 'master file' (visão global do grupo) e o 'local file' (detalhe das transações da entidade neerlandesa) — seguindo as diretrizes da OCDE (BEPS Ação 13); grupos muito grandes (faturação consolidada acima de €750 milhões) têm também de reportar país-a-país (country-by-country reporting).",
          en: "When two companies within the same group trade with each other (for example, the Dutch subsidiary buys components from the foreign parent), Dutch tax law requires the price charged to be the same as would be agreed between independent parties — the 'arm's-length principle'. If the Belastingdienst considers the price was artificially inflated or reduced to shift profit out of the Netherlands, it can adjust taxable profit accordingly. Larger multinational groups (above certain consolidated turnover thresholds) also have specific documentation duties — the 'master file' (group-wide overview) and the 'local file' (detail of the Dutch entity's transactions) — following OECD guidelines (BEPS Action 13); very large groups (consolidated turnover above €750 million) must also file country-by-country reports.",
          nl: "Handelen twee maatschappijen binnen hetzelfde concern met elkaar (bijvoorbeeld de Nederlandse dochter koopt onderdelen bij de buitenlandse moeder), dan vereist de Nederlandse belastingwet dat de gehanteerde prijs dezelfde is als tussen onafhankelijke partijen zou worden overeengekomen — het arm's-lengthbeginsel. Vindt de Belastingdienst dat de prijs kunstmatig is opgehoogd of verlaagd om winst uit Nederland weg te sluizen, dan kan de belastbare winst dienovereenkomstig worden gecorrigeerd. Grotere multinationale groepen (boven bepaalde geconsolideerde omzetdrempels) hebben bovendien specifieke documentatieverplichtingen — het master file (concernbreed overzicht) en het local file (detail van de Nederlandse transacties) — volgens de OESO-richtlijnen (BEPS-actie 13); zeer grote groepen (geconsolideerde omzet boven €750 miljoen) moeten ook country-by-country reporten.",
        },
        flashcard: {
          front: { pt: "O que é o 'arm's-lengthbeginsel'?", en: "What is the 'arm's-length principle'?", nl: "Wat is het arm's-lengthbeginsel?" },
          back: { pt: "A exigência de que transações entre empresas do mesmo grupo usem preços de mercado, como entre partes independentes.", en: "The requirement that transactions between group companies use market prices, as if between independent parties.", nl: "De eis dat transacties tussen groepsmaatschappijen marktprijzen hanteren, alsof tussen onafhankelijke partijen." },
        },
        quizzes: [
          {
            q: { pt: "O que pode a Belastingdienst fazer se detetar um preço de transferência artificialmente inflacionado?", en: "What can the Belastingdienst do if it detects an artificially inflated transfer price?", nl: "Wat kan de Belastingdienst doen bij een kunstmatig opgehoogde verrekenprijs?" },
            options: [
              { pt: "Corrigir o lucro tributável da empresa neerlandesa em conformidade", en: "Adjust the Dutch company's taxable profit accordingly", nl: "De belastbare winst van de Nederlandse maatschappij dienovereenkomstig corrigeren" },
              { pt: "Nada — preços entre empresas do mesmo grupo são sempre livres", en: "Nothing — prices between group companies are always free", nl: "Niets — prijzen tussen groepsmaatschappijen zijn altijd vrij" },
              { pt: "Dissolver automaticamente o grupo empresarial", en: "Automatically dissolve the corporate group", nl: "Het concern automatisch ontbinden" },
            ], answer: 0,
            explain: {
              pt: "O objetivo do princípio de plena concorrência é impedir precisamente que grupos desloquem lucro artificialmente entre jurisdições através de preços internos distorcidos.",
              en: "The whole point of the arm's-length principle is to prevent groups from artificially shifting profit between jurisdictions through distorted internal prices.",
              nl: "Het hele doel van het arm's-lengthbeginsel is te voorkomen dat groepen winst kunstmatig tussen jurisdicties verschuiven via verstoorde interne prijzen.",
            },
          },
          {
            q: { pt: "Grupos com faturação consolidada acima de €750 milhões têm que obrigação adicional?", en: "Groups with consolidated turnover above €750 million have which additional obligation?", nl: "Welke extra verplichting geldt voor groepen met een geconsolideerde omzet boven €750 miljoen?" },
            options: [
              { pt: "Reportar país-a-país (country-by-country reporting)", en: "Country-by-country reporting", nl: "Country-by-country reporting" },
              { pt: "Pagar Vpb à taxa de 40%", en: "Pay Vpb at a 40% rate", nl: "Vpb betalen tegen 40%" },
              { pt: "Deixar automaticamente de ter direito à innovatiebox", en: "Automatically lose the right to the innovation box", nl: "Automatisch het recht op de innovatiebox verliezen" },
            ], answer: 0,
            explain: {
              pt: "É um dos pilares do pacote BEPS da OCDE contra a erosão da base tributável: grandes multinacionais têm de mostrar às autoridades fiscais onde reportam lucro, país a país.",
              en: "This is one of the pillars of the OECD's BEPS package against tax base erosion: large multinationals must show tax authorities where they report profit, country by country.",
              nl: "Dit is een van de pijlers van het OESO BEPS-pakket tegen grondslaguitholling: grote multinationals moeten belastingdiensten laten zien waar zij winst rapporteren, land voor land.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "payroll", icon: Wallet, color: "orange",
    title: { pt: "Payroll Neerlandês", en: "Dutch Payroll", nl: "Nederlandse Loonadministratie" },
    lessons: [
      {
        title: { pt: "Loonheffing e tabelas", en: "Loonheffing & tax tables", nl: "Loonheffing & tabellen" },
        theory: {
          pt: "A 'loonheffing' agrega o imposto sobre o rendimento e as contribuições para a segurança social, retidos na fonte pelo empregador em cada pagamento salarial, com base em tabelas mensais/semanais da Belastingdienst. Em 2026, o escalão inferior do imposto sobre o rendimento (Box 1) situa-se entre 35,75% e 37,56% até cerca de €78.426, subindo para 49,5% acima disso.",
          en: "'Loonheffing' bundles income tax and social security contributions, withheld at source by the employer at each pay run, based on monthly/weekly Belastingdienst tables. In 2026, the lower Box 1 income tax band sits between 35.75% and 37.56% up to around €78,426, rising to 49.5% above that.",
          nl: "De loonheffing combineert loonbelasting en premies volksverzekeringen, ingehouden aan de bron door de werkgever bij elke loonbetaling, op basis van maandelijkse/wekelijkse Belastingdienst-tabellen. In 2026 ligt de eerste Box 1-schijf tussen 35,75% en 37,56% tot circa €78.426, en stijgt daarboven naar 49,5%.",
        },
        flashcard: {
          front: { pt: "O que agrega a 'loonheffing'?", en: "What does 'loonheffing' bundle together?", nl: "Wat combineert de loonheffing?" },
          back: { pt: "Imposto sobre o rendimento (Box 1) e contribuições para a segurança social.", en: "Income tax (Box 1) and social security contributions.", nl: "Loonbelasting (Box 1) en premies volksverzekeringen." },
        },
        quiz: {
          q: { pt: "Com base em quê o empregador calcula a retenção da loonheffing?", en: "What does the employer use to calculate the loonheffing withholding?", nl: "Waarop baseert de werkgever de inhouding van de loonheffing?" },
          options: [
            { pt: "Tabelas da Belastingdienst", en: "Belastingdienst tables", nl: "Belastingdienst-tabellen" },
            { pt: "Uma taxa fixa de 21%", en: "A flat 21% rate", nl: "Een vast tarief van 21%" },
            { pt: "O lucro anual da empresa", en: "The company's annual profit", nl: "De jaarwinst van het bedrijf" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "A regra dos 30%", en: "The 30% ruling", nl: "De 30%-regeling" },
        theory: {
          pt: "A regra dos 30% permite que trabalhadores estrangeiros altamente qualificados recebam até 30% do salário bruto isento de imposto, como reembolso de custos extraterritoriais, durante um período máximo de 5 anos. Em 2026 mantém-se em 30% (descendo para 27% a partir de 2027), com um teto salarial ('norma WNT') de €262.000 — acima deste valor, a isenção deixa de se aplicar à parte excedente — e um salário mínimo de referência de cerca de €48.013/ano (ou €36.497 para menores de 30 anos com mestrado).",
          en: "The 30% ruling lets highly skilled foreign employees receive up to 30% of gross salary tax-free, as a reimbursement of extraterritorial costs, for a maximum of 5 years. In 2026 it remains at 30% (dropping to 27% from 2027), with a salary cap (the 'WNT norm') of €262,000 — above this, the exemption no longer applies to the excess — and a minimum reference salary of around €48,013/year (or €36,497 for under-30s with a master's degree).",
          nl: "De 30%-regeling laat hooggekwalificeerde buitenlandse werknemers tot 30% van het brutosalaris onbelast ontvangen, als vergoeding voor extraterritoriale kosten, gedurende maximaal 5 jaar. In 2026 blijft dit 30% (vanaf 2027 naar 27%), met een salarisplafond (de WNT-norm) van €262.000 — daarboven geldt de vrijstelling niet meer over het meerdere — en een minimum referentiesalaris van circa €48.013/jaar (of €36.497 voor jongeren onder 30 met een master).",
        },
        flashcard: {
          front: { pt: "Qual é o teto salarial (norma WNT) para a regra dos 30% em 2026?", en: "What is the 2026 salary cap (WNT norm) for the 30% ruling?", nl: "Wat is de WNT-norm (salarisplafond) voor de 30%-regeling in 2026?" },
          back: { pt: "€262.000 por ano — acima disso a isenção de 30% não se aplica à parte excedente.", en: "€262,000 per year — above that, the 30% exemption doesn't apply to the excess.", nl: "€262.000 per jaar — daarboven geldt de 30%-vrijstelling niet over het meerdere." },
        },
        quiz: {
          q: { pt: "Para que taxa desce a regra dos 30% a partir de 2027?", en: "What rate does the 30% ruling drop to from 2027?", nl: "Naar welk percentage daalt de 30%-regeling vanaf 2027?" },
          options: ["20%", "27%", "15%"], answer: 1,
        },
      },
      {
        title: { pt: "Pensões e prémios sociais", en: "Pensions & social premiums", nl: "Pensioen & sociale premies" },
        theory: {
          pt: "Além da loonheffing, o salário está sujeito a prémios de seguros sociais que financiam benefícios como desemprego (WW), incapacidade (WIA) e cuidados de saúde (Zvw) — parte suportada pelo empregador, parte pelo trabalhador. Muitos setores têm um fundo de pensões setorial obrigatório ('bedrijfstakpensioenfonds'), para o qual empregador e trabalhador contribuem mensalmente, complementando a pensão estatal (AOW).",
          en: "Beyond the loonheffing, salary is subject to social insurance premiums funding benefits such as unemployment (WW), incapacity (WIA) and healthcare (Zvw) — partly borne by the employer, partly by the employee. Many sectors have a mandatory industry pension fund ('bedrijfstakpensioenfonds'), to which employer and employee contribute monthly, topping up the state pension (AOW).",
          nl: "Naast de loonheffing is het loon onderworpen aan sociale verzekeringspremies die uitkeringen financieren zoals werkloosheid (WW), arbeidsongeschiktheid (WIA) en zorg (Zvw) — deels gedragen door de werkgever, deels door de werknemer. Veel sectoren kennen een verplicht bedrijfstakpensioenfonds, waaraan werkgever en werknemer maandelijks bijdragen, als aanvulling op de AOW.",
        },
        flashcard: {
          front: { pt: "O que é o 'bedrijfstakpensioenfonds'?", en: "What is a 'bedrijfstakpensioenfonds'?", nl: "Wat is een bedrijfstakpensioenfonds?" },
          back: { pt: "Um fundo de pensões setorial obrigatório, complementar à pensão estatal AOW.", en: "A mandatory sector-wide pension fund, complementing the state AOW pension.", nl: "Een verplicht sectoraal pensioenfonds, als aanvulling op de AOW." },
        },
        quiz: {
          q: { pt: "O que financia o prémio WW?", en: "What does the WW premium fund?", nl: "Wat financiert de WW-premie?" },
          options: [
            { pt: "Subsídio de desemprego", en: "Unemployment benefits", nl: "Werkloosheidsuitkering" },
            { pt: "Reembolso de BTW", en: "VAT refunds", nl: "BTW-teruggave" },
            { pt: "Innovatiebox", en: "The innovation box", nl: "De innovatiebox" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Vakantiegeld (subsídio de férias)", en: "Vakantiegeld (holiday allowance)", nl: "Vakantiegeld" },
        theory: {
          pt: "A lei neerlandesa exige o pagamento de 'vakantiegeld', um subsídio de férias correspondente a, em regra, 8% do salário bruto anual, normalmente pago de uma só vez em maio (ou junho), independentemente de o trabalhador ainda gozar dias de férias. É calculado sobre o salário-base e outros elementos fixos de remuneração, e está sujeito a loonheffing como qualquer outro rendimento do trabalho.",
          en: "Dutch law requires payment of 'vakantiegeld', a holiday allowance generally equal to 8% of annual gross salary, typically paid as a lump sum in May (or June), regardless of whether the employee still has leave days to take. It's calculated on base salary and other fixed pay elements, and is subject to loonheffing like any other employment income.",
          nl: "De Nederlandse wet vereist betaling van vakantiegeld, doorgaans 8% van het jaarlijkse brutosalaris, meestal in mei (of juni) ineens uitbetaald, ongeacht of de werknemer nog vakantiedagen heeft. Het wordt berekend over het basissalaris en andere vaste looncomponenten, en is net als ander loon onderworpen aan loonheffing.",
        },
        flashcard: {
          front: { pt: "Que percentagem do salário bruto anual corresponde tipicamente ao vakantiegeld?", en: "What percentage of annual gross salary does vakantiegeld typically represent?", nl: "Welk percentage van het jaarsalaris is vakantiegeld doorgaans?" },
          back: { pt: "8% do salário bruto anual.", en: "8% of annual gross salary.", nl: "8% van het jaarlijkse brutosalaris." },
        },
        quiz: {
          q: { pt: "Quando é normalmente pago o vakantiegeld?", en: "When is vakantiegeld typically paid?", nl: "Wanneer wordt vakantiegeld doorgaans uitbetaald?" },
          options: [
            { pt: "Em maio ou junho, de uma só vez", en: "In May or June, as a lump sum", nl: "In mei of juni, ineens" },
            { pt: "Todos os meses, dividido em 12 partes", en: "Every month, split in 12", nl: "Elke maand, in 12 delen" },
            { pt: "Apenas no fim do contrato", en: "Only at the end of the contract", nl: "Alleen bij einde dienstverband" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Tipos de contrato e período experimental", en: "Contract types & probation period", nl: "Contractvormen en proeftijd" },
        theory: {
          pt: "Um contrato de trabalho neerlandês é 'bepaalde tijd' (termo certo) ou 'onbepaalde tijd' (sem termo). A 'ketenregeling' (regra da cadeia) limita o encadeamento de contratos a termo: após 3 contratos consecutivos, ou 3 anos de contratos a termo (o que ocorrer primeiro), com intervalos entre eles não superiores a 6 meses, o contrato seguinte passa automaticamente a sem termo. O período experimental ('proeftijd') também tem limites legais rígidos, ligados à duração do contrato: nenhum período experimental é permitido em contratos com menos de 6 meses; até 1 mês em contratos entre 6 meses e 2 anos; até 2 meses em contratos de 2 anos ou mais, ou sem termo. Durante o proeftijd, qualquer das partes pode terminar o contrato de imediato, sem justificação nem pré-aviso.",
          en: "A Dutch employment contract is either 'bepaalde tijd' (fixed-term) or 'onbepaalde tijd' (indefinite). The 'ketenregeling' (chain rule) limits how fixed-term contracts can be strung together: after 3 consecutive fixed-term contracts, or 3 years of fixed-term contracts (whichever comes first), with gaps between them no longer than 6 months, the next contract automatically becomes indefinite. The probation period ('proeftijd') also has strict legal limits tied to contract length: no probation period is allowed for contracts under 6 months; up to 1 month for contracts between 6 months and 2 years; up to 2 months for contracts of 2 years or more, or indefinite ones. During the proeftijd, either party can end the contract immediately, without justification or notice.",
          nl: "Een Nederlandse arbeidsovereenkomst is bepaalde tijd of onbepaalde tijd. De ketenregeling beperkt het aaneenschakelen van tijdelijke contracten: na 3 opeenvolgende tijdelijke contracten, of 3 jaar aan tijdelijke contracten (wat eerder komt), met tussenpozen van niet meer dan 6 maanden, wordt het volgende contract automatisch een vast contract. De proeftijd kent eveneens strikte wettelijke grenzen, gekoppeld aan de contractduur: geen proeftijd toegestaan bij contracten korter dan 6 maanden; maximaal 1 maand bij contracten tussen 6 maanden en 2 jaar; maximaal 2 maanden bij contracten van 2 jaar of langer, of onbepaalde tijd. Tijdens de proeftijd kan elke partij de overeenkomst direct beëindigen, zonder opgaaf van reden of opzegtermijn.",
        },
        flashcard: {
          front: { pt: "Após quantos contratos a termo consecutivos passa a valer a ketenregeling?", en: "After how many consecutive fixed-term contracts does the ketenregeling kick in?", nl: "Na hoeveel opeenvolgende tijdelijke contracten geldt de ketenregeling?" },
          back: { pt: "3 contratos consecutivos, ou 3 anos — o que ocorrer primeiro.", en: "3 consecutive contracts, or 3 years — whichever comes first.", nl: "3 opeenvolgende contracten, of 3 jaar — wat eerder komt." },
        },
        quizzes: [
          {
            q: { pt: "Que período experimental máximo é permitido num contrato sem termo?", en: "What's the maximum probation period allowed on an indefinite contract?", nl: "Wat is de maximale proeftijd bij een contract voor onbepaalde tijd?" },
            options: [
              { pt: "2 meses", en: "2 months", nl: "2 maanden" },
              { pt: "6 meses", en: "6 months", nl: "6 maanden" },
              { pt: "Não há limite", en: "There's no limit", nl: "Er is geen limiet" },
            ], answer: 0,
            explain: {
              pt: "2 meses é o teto legal para contratos de 2 anos ou mais e para contratos sem termo — nunca pode ser mais longo, seja qual for o acordo entre as partes.",
              en: "2 months is the legal ceiling for contracts of 2 years or more and for indefinite contracts — it can never be longer, whatever the parties agree.",
              nl: "2 maanden is het wettelijk maximum voor contracten van 2 jaar of langer en voor onbepaalde tijd — nooit langer, wat partijen ook afspreken.",
            },
          },
          {
            q: { pt: "Um contrato de 4 meses pode ter período experimental?", en: "Can a 4-month contract have a probation period?", nl: "Mag een contract van 4 maanden een proeftijd hebben?" },
            options: [
              { pt: "Não — contratos com menos de 6 meses não podem ter proeftijd", en: "No — contracts under 6 months cannot have a probation period", nl: "Nee — contracten korter dan 6 maanden mogen geen proeftijd hebben" },
              { pt: "Sim, até 2 meses", en: "Yes, up to 2 months", nl: "Ja, tot 2 maanden" },
              { pt: "Sim, sem qualquer limite", en: "Yes, with no limit at all", nl: "Ja, zonder enige limiet" },
            ], answer: 0,
            explain: {
              pt: "A lei protege especificamente os contratos muito curtos: seria desproporcionado ter período experimental num contrato de poucos meses.",
              en: "The law specifically protects very short contracts: a probation period on a contract of just a few months would be disproportionate.",
              nl: "De wet beschermt juist zeer korte contracten: een proeftijd bij een contract van enkele maanden zou disproportioneel zijn.",
            },
          },
        ],
      },
      {
        title: { pt: "Cessação do contrato e transitievergoeding", en: "Termination & transitievergoeding", nl: "Beëindiging en transitievergoeding" },
        theory: {
          pt: "Um contrato de trabalho neerlandês pode terminar de várias formas: por mútuo acordo (vaststellingsovereenkomst), por via do UWV (razões económicas ou doença prolongada), por decisão do tribunal do trabalho — kantonrechter (razões pessoais, como mau desempenho ou quebra de confiança), ou, em casos graves, por despedimento com efeito imediato ('ontslag op staande voet'). Salvo em despedimento por falta grave imputável ao trabalhador, este tem direito à 'transitievergoeding' (indemnização de transição) desde o primeiro dia de trabalho — não é preciso completar 2 anos, como acontecia antes da reforma de 2020. O cálculo aproxima-se de 1/3 do salário mensal por cada ano de serviço, com um teto legal atualizado anualmente (na ordem dos €94.000 em anos recentes, ou o salário anual se for mais elevado).",
          en: "A Dutch employment contract can end in several ways: by mutual agreement (vaststellingsovereenkomst), through the UWV (economic reasons or prolonged illness), by decision of the labour court — kantonrechter (personal reasons, such as poor performance or breakdown of trust), or, in serious cases, by summary dismissal ('ontslag op staande voet'). Except in dismissal for serious misconduct attributable to the employee, they're entitled to the 'transitievergoeding' (transition payment) from day one of employment — no need to complete 2 years, as was the case before the 2020 reform. The calculation works out to roughly 1/3 of monthly salary per year of service, with a statutory cap updated annually (around €94,000 in recent years, or annual salary if higher).",
          nl: "Een Nederlandse arbeidsovereenkomst kan op verschillende manieren eindigen: met wederzijds goedvinden (vaststellingsovereenkomst), via het UWV (bedrijfseconomische redenen of langdurige ziekte), via de kantonrechter (persoonlijke redenen, zoals disfunctioneren of verstoorde arbeidsverhouding), of, in ernstige gevallen, ontslag op staande voet. Behalve bij ontslag wegens ernstig verwijtbaar handelen van de werknemer, heeft deze recht op de transitievergoeding vanaf de eerste werkdag — geen 2 jaar meer nodig, zoals vóór de hervorming van 2020. De berekening komt neer op ongeveer 1/3 maandsalaris per dienstjaar, met een jaarlijks geïndexeerd wettelijk maximum (de laatste jaren rond €94.000, of het jaarsalaris als dat hoger is).",
        },
        flashcard: {
          front: { pt: "A partir de quando tem um trabalhador direito à transitievergoeding?", en: "From when is an employee entitled to the transitievergoeding?", nl: "Vanaf wanneer heeft een werknemer recht op transitievergoeding?" },
          back: { pt: "Desde o primeiro dia de trabalho — não é preciso completar 2 anos.", en: "From day one of employment — no need to complete 2 years.", nl: "Vanaf de eerste werkdag — geen 2 dienstjaren meer nodig." },
        },
        quizzes: [
          {
            q: { pt: "Em que via de cessação um trabalhador normalmente NÃO tem direito à transitievergoeding?", en: "In which type of termination does an employee normally NOT get the transitievergoeding?", nl: "Bij welke vorm van beëindiging heeft een werknemer doorgaans GEEN recht op transitievergoeding?" },
            options: [
              { pt: "Despedimento por falta grave imputável ao trabalhador", en: "Dismissal for serious misconduct attributable to the employee", nl: "Ontslag wegens ernstig verwijtbaar handelen van de werknemer" },
              { pt: "Cessação por via do UWV por razões económicas", en: "Termination via UWV for economic reasons", nl: "Beëindiging via UWV om bedrijfseconomische redenen" },
              { pt: "Fim de um contrato a termo por decisão do empregador", en: "End of a fixed-term contract by employer's decision", nl: "Einde van een tijdelijk contract op initiatief van de werkgever" },
            ], answer: 0,
            explain: {
              pt: "A exceção existe precisamente para não recompensar comportamento gravemente culposo do próprio trabalhador — nos outros casos, o direito à indemnização mantém-se.",
              en: "The exception exists precisely to avoid rewarding seriously culpable behaviour by the employee themselves — in other cases, the right to compensation remains.",
              nl: "De uitzondering bestaat juist om ernstig verwijtbaar gedrag van de werknemer zelf niet te belonen — in andere gevallen blijft het recht op vergoeding bestaan.",
            },
          },
          {
            q: { pt: "Aproximadamente quanto se calcula por cada ano de serviço na transitievergoeding?", en: "Roughly how much is calculated per year of service in the transitievergoeding?", nl: "Hoeveel wordt ongeveer per dienstjaar berekend in de transitievergoeding?" },
            options: [
              { pt: "1/3 do salário mensal", en: "1/3 of monthly salary", nl: "1/3 maandsalaris" },
              { pt: "Um salário mensal inteiro", en: "A full month's salary", nl: "Een volledig maandsalaris" },
              { pt: "8% do salário anual", en: "8% of annual salary", nl: "8% van het jaarsalaris" },
            ], answer: 0,
            explain: {
              pt: "8% do salário anual é o vakantiegeld, um conceito diferente — não confundir os dois na hora de calcular compensações.",
              en: "8% of annual salary is the vakantiegeld, a different concept entirely — don't mix the two up when calculating compensation.",
              nl: "8% van het jaarsalaris is het vakantiegeld, een heel ander begrip — verwar de twee niet bij het berekenen van vergoedingen.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "gaap", icon: BookOpen, color: "green",
    title: { pt: "Dutch GAAP (BW2 Titel 9)", en: "Dutch GAAP (BW2 Titel 9)", nl: "Nederlandse GAAP (BW2 Titel 9)" },
    lessons: [
      {
        title: { pt: "Princípios de reconhecimento", en: "Recognition principles", nl: "Verwerkingsprincipes" },
        theory: {
          pt: "O Título 9 do Livro 2 do Código Civil neerlandês (BW2 Titel 9) estabelece os requisitos para as demonstrações financeiras estatutárias, assentes nos princípios de continuidade (going concern), prudência e do 'true and fair view' — a imagem verdadeira e apropriada da posição financeira e dos resultados. As Raad voor de Jaarverslaggeving (RJ) publicam orientações detalhadas que complementam a lei.",
          en: "Book 2, Title 9 of the Dutch Civil Code (BW2 Titel 9) sets the requirements for statutory financial statements, grounded in the principles of going concern, prudence, and 'true and fair view' of the financial position and results. The Dutch Accounting Standards Board (Raad voor de Jaarverslaggeving, RJ) publishes detailed guidance that supplements the law.",
          nl: "Boek 2 Titel 9 van het Burgerlijk Wetboek (BW2 Titel 9) bevat de eisen voor de wettelijke jaarrekening, gebaseerd op continuïteit, voorzichtigheid en het 'getrouwe beeld' van de financiële positie en het resultaat. De Raad voor de Jaarverslaggeving (RJ) publiceert gedetailleerde richtlijnen die de wet aanvullen.",
        },
        flashcard: {
          front: { pt: "O que é a RJ?", en: "What is the RJ?", nl: "Wat is de RJ?" },
          back: { pt: "A Raad voor de Jaarverslaggeving — o órgão que emite orientações contabilísticas neerlandesas complementares à lei.", en: "The Dutch Accounting Standards Board, which issues guidance supplementing the statutory rules.", nl: "De Raad voor de Jaarverslaggeving, die richtlijnen uitgeeft ter aanvulling van de wettelijke regels." },
        },
        quiz: {
          q: { pt: "Qual destes NÃO é um princípio central do BW2 Titel 9?", en: "Which of these is NOT a core BW2 Titel 9 principle?", nl: "Welke is GEEN kernprincipe van BW2 Titel 9?" },
          options: [
            { pt: "Continuidade (going concern)", en: "Going concern", nl: "Continuïteit" },
            { pt: "Imagem verdadeira e apropriada", en: "True and fair view", nl: "Getrouw beeld" },
            { pt: "Tributação segundo o caixa (cash basis fiscal)", en: "Cash-basis taxation", nl: "Belasting op kasbasis" },
          ], answer: 2,
        },
      },
      {
        title: { pt: "Classificação por dimensão da empresa", en: "Company size classification", nl: "Groottecriteria" },
        theory: {
          pt: "O BW2 Titel 9 segue os critérios da Diretiva Contabilística da UE, classificando as empresas em micro, pequena, média e grande, com base em três indicadores — total do balanço, volume de negócios líquido e nº médio de trabalhadores. Uma empresa enquadra-se numa categoria quando não excede dois dos três limites: micro (≤€450.000 / ≤€900.000 / ≤10 trab.), pequena (≤€5M / ≤€10M / ≤50 trab.), média (≤€25M / ≤€50M / ≤250 trab.); acima disso é 'grande'. A categoria determina o nível de divulgação exigido.",
          en: "BW2 Titel 9 follows the EU Accounting Directive's criteria, classifying companies as micro, small, medium or large based on three indicators — balance sheet total, net turnover and average headcount. A company falls into a category when it doesn't exceed two of the three limits: micro (≤€450,000 / ≤€900,000 / ≤10 staff), small (≤€5M / ≤€10M / ≤50 staff), medium (≤€25M / ≤€50M / ≤250 staff); above that it's 'large'. The category determines the required level of disclosure.",
          nl: "BW2 Titel 9 volgt de criteria van de EU-Accountingrichtlijn en onderscheidt micro-, kleine, middelgrote en grote rechtspersonen op basis van drie indicatoren — balanstotaal, netto-omzet en gemiddeld aantal werknemers. Een onderneming valt in een categorie als zij twee van de drie grenzen niet overschrijdt: micro (≤€450.000 / ≤€900.000 / ≤10 werknemers), klein (≤€5 mln / ≤€10 mln / ≤50), middelgroot (≤€25 mln / ≤€50 mln / ≤250); daarboven is zij 'groot'. De categorie bepaalt het vereiste toelichtingsniveau.",
        },
        flashcard: {
          front: { pt: "Quantos dos três limites uma empresa pode exceder e ainda ficar na categoria?", en: "How many of the three limits can a company exceed and still stay in the category?", nl: "Hoeveel van de drie grenzen mag een onderneming overschrijden en toch in de categorie blijven?" },
          back: { pt: "Um — a classificação exige não exceder pelo menos dois dos três critérios.", en: "One — classification requires not exceeding at least two of the three criteria.", nl: "Eén — classificatie vereist dat minstens twee van de drie criteria niet worden overschreden." },
        },
        quiz: {
          q: { pt: "Quais os três critérios de classificação de dimensão?", en: "What are the three size-classification criteria?", nl: "Wat zijn de drie groottecriteria?" },
          options: [
            { pt: "Balanço, volume de negócios, nº de trabalhadores", en: "Balance sheet, turnover, headcount", nl: "Balans, omzet, personeel" },
            { pt: "Lucro, dividendos, ações", en: "Profit, dividends, shares", nl: "Winst, dividend, aandelen" },
            { pt: "Setor, localização, idade da empresa", en: "Sector, location, company age", nl: "Sector, locatie, leeftijd" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Demonstrações financeiras", en: "Financial statements", nl: "Jaarrekening" },
        theory: {
          pt: "A jaarrekening (demonstração financeira estatutária) inclui, no mínimo, o balanço, a demonstração de resultados e as notas explicativas; empresas médias e grandes devem ainda apresentar um relatório de gestão ('bestuursverslag'). Micro e pequenas empresas beneficiam de isenções — podem preparar contas abreviadas e ficam dispensadas do relatório de gestão e, em muitos casos, de auditoria obrigatória.",
          en: "The jaarrekening (statutory financial statements) includes, at minimum, the balance sheet, the income statement and the notes; medium and large companies must also present a management report ('bestuursverslag'). Micro and small companies benefit from exemptions — they may prepare abridged accounts and are exempt from the management report and, in many cases, from a mandatory audit.",
          nl: "De jaarrekening omvat ten minste de balans, de winst-en-verliesrekening en de toelichting; middelgrote en grote rechtspersonen moeten ook een bestuursverslag opstellen. Micro- en kleine rechtspersonen genieten vrijstellingen — zij mogen verkorte jaarrekeningen opstellen en zijn vrijgesteld van het bestuursverslag en, in veel gevallen, van de wettelijke controle.",
        },
        flashcard: {
          front: { pt: "Que rechtspersonen ficam geralmente dispensadas de auditoria obrigatória?", en: "Which companies are generally exempt from a mandatory audit?", nl: "Welke rechtspersonen zijn doorgaans vrijgesteld van wettelijke controle?" },
          back: { pt: "Micro e pequenas empresas.", en: "Micro and small companies.", nl: "Micro- en kleine rechtspersonen." },
        },
        quiz: {
          q: { pt: "Que documento adicional é exigido a empresas médias e grandes, mas não a micro/pequenas?", en: "What extra document is required for medium/large companies but not micro/small?", nl: "Welk extra document is vereist voor middelgrote/grote, maar niet voor micro/kleine rechtspersonen?" },
          options: [
            { pt: "Relatório de gestão (bestuursverslag)", en: "Management report (bestuursverslag)", nl: "Bestuursverslag" },
            { pt: "Balanço", en: "Balance sheet", nl: "Balans" },
            { pt: "Declaração de BTW", en: "VAT return", nl: "BTW-aangifte" },
          ], answer: 0,
        },
      },
      {
        title: { pt: "Notas e divulgações", en: "Notes & disclosures", nl: "Toelichting" },
        theory: {
          pt: "O nível de divulgação nas notas às demonstrações financeiras escala com a categoria de dimensão: micro-empresas divulgam o mínimo legal (por vezes até dispensadas de notas detalhadas), enquanto empresas grandes devem divulgar informação extensa sobre políticas contabilísticas, remuneração de administradores, partes relacionadas e compromissos fora de balanço. Este princípio de proporcionalidade equilibra transparência e encargo administrativo consoante a dimensão da empresa.",
          en: "The level of disclosure in the notes scales with the size category: micro-companies disclose the legal minimum (sometimes even exempt from detailed notes), while large companies must disclose extensive information on accounting policies, director remuneration, related parties and off-balance-sheet commitments. This proportionality principle balances transparency against administrative burden according to company size.",
          nl: "Het toelichtingsniveau schaalt met de groottecategorie: micro-ondernemingen lichten het wettelijk minimum toe (soms zelfs vrijgesteld van gedetailleerde toelichting), terwijl grote rechtspersonen uitgebreide informatie moeten verstrekken over grondslagen, bestuurdersbeloningen, verbonden partijen en niet in de balans opgenomen verplichtingen. Dit proportionaliteitsbeginsel balanceert transparantie tegen administratieve lasten naar gelang de omvang.",
        },
        flashcard: {
          front: { pt: "Que princípio equilibra transparência e encargo administrativo por dimensão?", en: "What principle balances transparency and administrative burden by size?", nl: "Welk beginsel balanceert transparantie en administratieve last naar omvang?" },
          back: { pt: "O princípio de proporcionalidade.", en: "The proportionality principle.", nl: "Het proportionaliteitsbeginsel." },
        },
        quiz: {
          q: { pt: "Que tipo de empresa tem, em regra, o nível mais elevado de divulgação exigida?", en: "Which type of company generally has the highest required level of disclosure?", nl: "Welk type onderneming heeft doorgaans het hoogste vereiste toelichtingsniveau?" },
          options: [
            { pt: "Micro-empresa", en: "Micro company", nl: "Micro-onderneming" },
            { pt: "Empresa grande", en: "Large company", nl: "Grote onderneming" },
            { pt: "Empresa em nome individual", en: "Sole proprietorship", nl: "Eenmanszaak" },
          ], answer: 1,
        },
      },
      {
        title: { pt: "Instrumentos financeiros e imparidade", en: "Financial instruments & impairment", nl: "Financiële instrumenten en bijzondere waardevermindering" },
        theory: {
          pt: "Sob o BW2 Titel 9 e as orientações da RJ, empréstimos concedidos, contas a receber e a maioria dos investimentos financeiros são geralmente mensurados ao custo (amortizado), salvo se a empresa optar explicitamente pelo justo valor. Sempre que exista evidência objetiva de imparidade — por exemplo, um cliente em dificuldades financeiras que atrasa pagamentos — a empresa deve reconhecer uma perda por imparidade, calculada como a diferença entre o valor contabilístico e o valor recuperável estimado. Ao contrário do modelo de perda esperada da IFRS 9 (que antecipa perdas antes mesmo de haver sinais de incumprimento), o Dutch GAAP tradicional segue sobretudo um modelo de perda incorrida — só se reconhece a perda quando já há evidência concreta do problema. A reversão de uma imparidade é geralmente permitida se as circunstâncias melhorarem, exceto nalguns instrumentos de capital próprio mensurados ao custo menos imparidade.",
          en: "Under BW2 Titel 9 and RJ guidance, loans granted, receivables and most financial investments are generally measured at (amortised) cost, unless the company explicitly elects fair value. Whenever there is objective evidence of impairment — for example, a customer in financial difficulty who is falling behind on payments — the company must recognise an impairment loss, calculated as the difference between carrying amount and estimated recoverable amount. Unlike the IFRS 9 expected-loss model (which anticipates losses even before signs of default appear), traditional Dutch GAAP mostly follows an incurred-loss model — a loss is only recognised once there's concrete evidence of a problem. Reversal of an impairment is generally allowed if circumstances improve, except for some equity instruments measured at cost less impairment.",
          nl: "Onder BW2 Titel 9 en de RJ-richtlijnen worden verstrekte leningen, vorderingen en de meeste financiële beleggingen doorgaans gewaardeerd tegen (geamortiseerde) kostprijs, tenzij de onderneming expliciet voor reële waarde kiest. Is er objectieve aanwijzing van bijzondere waardevermindering — bijvoorbeeld een klant in financiële moeilijkheden die achterloopt met betalen — dan moet een bijzondere waardeverminderingsverlies worden verwerkt, berekend als het verschil tussen boekwaarde en geschatte realiseerbare waarde. Anders dan het expected-loss-model van IFRS 9 (dat verliezen al anticipeert vóórdat er tekenen van wanbetaling zijn), volgt de traditionele Nederlandse GAAP grotendeels een incurred-loss-model — een verlies wordt pas verwerkt zodra er concreet bewijs van een probleem is. Terugname van een waardevermindering is doorgaans toegestaan als de omstandigheden verbeteren, behalve bij sommige eigenvermogensinstrumenten tegen kostprijs minus waardevermindering.",
        },
        flashcard: {
          front: { pt: "Qual o modelo de imparidade tradicionalmente seguido pelo Dutch GAAP?", en: "What impairment model does Dutch GAAP traditionally follow?", nl: "Welk waardeverminderingsmodel volgt de Nederlandse GAAP traditioneel?" },
          back: { pt: "O modelo de perda incorrida — só se reconhece a perda quando há evidência concreta do problema.", en: "The incurred-loss model — a loss is only recognised once there's concrete evidence of the problem.", nl: "Het incurred-loss-model — een verlies wordt pas verwerkt bij concreet bewijs van het probleem." },
        },
        quizzes: [
          {
            q: { pt: "Qual a principal diferença face ao modelo de perda esperada da IFRS 9?", en: "What is the main difference from the IFRS 9 expected-loss model?", nl: "Wat is het grootste verschil met het expected-loss-model van IFRS 9?" },
            options: [
              { pt: "O Dutch GAAP tradicional só reconhece a perda quando já há evidência concreta, não antecipadamente", en: "Traditional Dutch GAAP only recognises the loss once there's concrete evidence, not in advance", nl: "De traditionele Nederlandse GAAP verwerkt het verlies pas bij concreet bewijs, niet vooraf" },
              { pt: "O Dutch GAAP nunca permite reconhecer perdas por imparidade", en: "Dutch GAAP never allows recognising impairment losses", nl: "De Nederlandse GAAP staat nooit waardeverminderingen toe" },
              { pt: "São exatamente o mesmo modelo, só muda o nome", en: "They're exactly the same model, only the name differs", nl: "Het is precies hetzelfde model, alleen de naam verschilt" },
            ], answer: 0,
            explain: {
              pt: "A IFRS 9 obriga a antecipar perdas ainda antes de haver sinais de incumprimento; o modelo tradicional neerlandês espera por evidência objetiva e concreta.",
              en: "IFRS 9 requires anticipating losses even before signs of default appear; the traditional Dutch model waits for concrete, objective evidence.",
              nl: "IFRS 9 vereist het anticiperen op verliezen al vóór tekenen van wanbetaling; het traditionele Nederlandse model wacht op concreet, objectief bewijs.",
            },
          },
          {
            q: { pt: "Como se mensuram, em regra, empréstimos concedidos e contas a receber sob o BW2 Titel 9?", en: "How are loans granted and receivables generally measured under BW2 Titel 9?", nl: "Hoe worden verstrekte leningen en vorderingen doorgaans gewaardeerd onder BW2 Titel 9?" },
            options: [
              { pt: "Ao custo (amortizado), salvo opção explícita pelo justo valor", en: "At (amortised) cost, unless fair value is explicitly elected", nl: "Tegen (geamortiseerde) kostprijs, tenzij expliciet voor reële waarde gekozen" },
              { pt: "Sempre ao justo valor, sem exceção", en: "Always at fair value, without exception", nl: "Altijd tegen reële waarde, zonder uitzondering" },
              { pt: "Nunca são reconhecidos no balanço", en: "They are never recognised on the balance sheet", nl: "Ze worden nooit op de balans opgenomen" },
            ], answer: 0,
            explain: {
              pt: "O custo amortizado é a regra-base; o justo valor é uma opção que a empresa pode escolher, não a norma automática.",
              en: "Amortised cost is the baseline rule; fair value is an option the company may choose, not the automatic norm.",
              nl: "Geamortiseerde kostprijs is de basisregel; reële waarde is een keuze die de onderneming kan maken, niet de automatische norm.",
            },
          },
        ],
      },
      {
        title: { pt: "Consolidação de grupo e goodwill", en: "Group consolidation & goodwill", nl: "Groepsconsolidatie en goodwill" },
        theory: {
          pt: "Uma empresa-mãe que controla uma ou mais filiais é, em regra, obrigada a preparar demonstrações financeiras consolidadas — o teste de controlo assenta tipicamente na maioria dos direitos de voto, ou noutra forma de influência decisiva. Existem isenções, nomeadamente para grupos pequenos ou quando a própria mãe já está incluída na consolidação de um grupo maior a nível da UE. Numa aquisição, o 'goodwill' corresponde à diferença entre o preço pago e o justo valor dos ativos líquidos identificáveis adquiridos; é capitalizado no balanço e amortizado ao longo da sua vida útil. Quando essa vida útil não pode ser estimada com fiabilidade, o BW2 Titel 9 presume um período máximo de amortização de 10 anos — uma regra prática para evitar que o goodwill fique indefinidamente por amortizar no balanço.",
          en: "A parent company that controls one or more subsidiaries is, as a rule, required to prepare consolidated financial statements — the control test typically rests on majority voting rights, or another form of decisive influence. Exemptions exist, notably for small groups or when the parent itself is already included in a larger EU-level consolidation. On an acquisition, 'goodwill' is the difference between the price paid and the fair value of identifiable net assets acquired; it's capitalised on the balance sheet and amortised over its useful life. When that useful life cannot be reliably estimated, BW2 Titel 9 presumes a maximum amortisation period of 10 years — a practical rule to stop goodwill sitting indefinitely unamortised on the balance sheet.",
          nl: "Een moedermaatschappij die zeggenschap heeft over een of meer dochters, is in beginsel verplicht een geconsolideerde jaarrekening op te stellen — de zeggenschapstoets berust doorgaans op de meerderheid van stemrechten, of een andere vorm van beslissende invloed. Er bestaan vrijstellingen, met name voor kleine groepen of wanneer de moeder zelf al is opgenomen in een grotere EU-consolidatie. Bij een overname is goodwill het verschil tussen de betaalde prijs en de reële waarde van de verworven identificeerbare nettoactiva; het wordt geactiveerd op de balans en afgeschreven over de gebruiksduur. Kan die gebruiksduur niet betrouwbaar worden geschat, dan gaat BW2 Titel 9 uit van een maximale afschrijvingstermijn van 10 jaar — een praktische regel om te voorkomen dat goodwill onbeperkt onafgeschreven op de balans blijft staan.",
        },
        flashcard: {
          front: { pt: "Se a vida útil do goodwill não puder ser estimada com fiabilidade, que prazo se presume?", en: "If goodwill's useful life can't be reliably estimated, what period is presumed?", nl: "Als de gebruiksduur van goodwill niet betrouwbaar te schatten is, welke termijn wordt dan aangenomen?" },
          back: { pt: "Um máximo de 10 anos de amortização.", en: "A maximum 10-year amortisation period.", nl: "Een maximale afschrijvingstermijn van 10 jaar." },
        },
        quizzes: [
          {
            q: { pt: "O que determina se uma empresa-mãe deve consolidar uma filial?", en: "What determines whether a parent company must consolidate a subsidiary?", nl: "Wat bepaalt of een moedermaatschappij een dochter moet consolideren?" },
            options: [
              { pt: "O controlo — tipicamente maioria de direitos de voto ou influência decisiva", en: "Control — typically majority voting rights or decisive influence", nl: "Zeggenschap — doorgaans meerderheid van stemrechten of beslissende invloed" },
              { pt: "O setor de atividade da filial", en: "The subsidiary's industry sector", nl: "De sector van de dochter" },
              { pt: "A localização geográfica da filial", en: "The subsidiary's geographic location", nl: "De geografische locatie van de dochter" },
            ], answer: 0,
            explain: {
              pt: "A consolidação segue o critério de controlo, não o setor ou a localização — se há controlo, há, em regra, obrigação de consolidar.",
              en: "Consolidation follows the control criterion, not sector or location — if there's control, there's generally a duty to consolidate.",
              nl: "Consolidatie volgt het zeggenschapscriterium, niet sector of locatie — is er zeggenschap, dan geldt doorgaans een consolidatieplicht.",
            },
          },
          {
            q: { pt: "Como se calcula o goodwill numa aquisição?", en: "How is goodwill calculated in an acquisition?", nl: "Hoe wordt goodwill bij een overname berekend?" },
            options: [
              { pt: "Preço pago menos o justo valor dos ativos líquidos identificáveis adquiridos", en: "Price paid minus the fair value of identifiable net assets acquired", nl: "Betaalde prijs minus de reële waarde van de verworven identificeerbare nettoactiva" },
              { pt: "Sempre 10% do preço de compra, por convenção", en: "Always 10% of the purchase price, by convention", nl: "Altijd 10% van de aankoopprijs, standaard" },
              { pt: "O valor contabilístico da filial antes da compra", en: "The subsidiary's carrying amount before the purchase", nl: "De boekwaarde van de dochter vóór de aankoop" },
            ], answer: 0,
            explain: {
              pt: "O goodwill representa o que se pagou a mais (ou a menos) do que o valor justo dos ativos identificáveis — reflete sinergias, marca, know-how, etc., não capturados individualmente no balanço.",
              en: "Goodwill represents what was paid over (or under) the fair value of identifiable assets — reflecting synergies, brand, know-how etc. not individually captured on the balance sheet.",
              nl: "Goodwill weerspiegelt wat méér (of minder) is betaald dan de reële waarde van identificeerbare activa — synergieën, merk, knowhow enzovoort, niet individueel op de balans opgenomen.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "ib", icon: Calculator, color: "orange",
    title: { pt: "Inkomstenbelasting — ZZP e DGA", en: "Income Tax — ZZP & DGA", nl: "Inkomstenbelasting — ZZP & DGA" },
    lessons: [
      {
        title: { pt: "O sistema das três boxes", en: "The three-box system", nl: "Het boxenstelsel" },
        theory: {
          pt: "O imposto sobre o rendimento das pessoas singulares (inkomstenbelasting) divide-se em três 'boxes' estanques, cada uma com a sua taxa. Box 1 — rendimento do trabalho e habitação própria, incluindo o lucro de empresas em nome individual: em 2026, cerca de 35,75% até €38.883, 37,56% até €78.426 e 49,5% acima. Box 2 — rendimento de participação substancial (≥5% numa sociedade): 24,5% até €68.843 e 31% acima. Box 3 — poupança e investimento: taxa de 36% aplicada não ao rendimento real mas a um rendimento presumido ('forfaitair rendement'), com isenção de património até €59.357 por pessoa (€118.714 para parceiros fiscais). Um prejuízo numa box não pode, em regra, ser compensado com o rendimento de outra.",
          en: "Personal income tax (inkomstenbelasting) is split into three watertight 'boxes', each with its own rate. Box 1 — income from work and the main home, including profit from sole proprietorships: in 2026, roughly 35.75% up to €38,883, 37.56% up to €78,426 and 49.5% above. Box 2 — income from a substantial interest (≥5% in a company): 24.5% up to €68,843 and 31% above. Box 3 — savings and investments: a 36% rate applied not to actual income but to a deemed return ('forfaitair rendement'), with a wealth exemption of €59,357 per person (€118,714 for fiscal partners). A loss in one box generally cannot be offset against income in another.",
          nl: "De inkomstenbelasting kent drie gescheiden boxen, elk met een eigen tarief. Box 1 — inkomen uit werk en woning, inclusief winst uit onderneming: in 2026 circa 35,75% tot €38.883, 37,56% tot €78.426 en 49,5% daarboven. Box 2 — inkomen uit aanmerkelijk belang (≥5% in een vennootschap): 24,5% tot €68.843 en 31% daarboven. Box 3 — sparen en beleggen: een tarief van 36% over niet het werkelijke maar een forfaitair rendement, met een heffingsvrij vermogen van €59.357 per persoon (€118.714 voor fiscale partners). Een verlies in de ene box is in beginsel niet verrekenbaar met inkomen uit een andere box.",
        },
        flashcard: {
          front: { pt: "Qual o valor do 'heffingsvrij vermogen' em Box 3 (2026)?", en: "What is the Box 3 wealth exemption in 2026?", nl: "Hoe hoog is het heffingsvrij vermogen in box 3 (2026)?" },
          back: { pt: "€59.357 por pessoa; €118.714 para parceiros fiscais.", en: "€59,357 per person; €118,714 for fiscal partners.", nl: "€59.357 per persoon; €118.714 voor fiscale partners." },
        },
        quiz: {
          q: { pt: "Em que box é tributado o lucro de uma eenmanszaak?", en: "In which box is the profit of an eenmanszaak taxed?", nl: "In welke box wordt de winst van een eenmanszaak belast?" },
          options: ["Box 1", "Box 2", "Box 3"], answer: 0,
          explain: {
            pt: "O lucro de empresas sem personalidade jurídica própria é 'winst uit onderneming', que integra a Box 1 — juntamente com salários e habitação própria.",
            en: "Profit of unincorporated businesses is 'winst uit onderneming', which falls in Box 1 — alongside salaries and the main home.",
            nl: "Winst uit onderneming valt in box 1, samen met loon en eigen woning.",
          },
        },
      },
      {
        title: { pt: "Deduções do empresário (ondernemersaftrek)", en: "Entrepreneur deductions (ondernemersaftrek)", nl: "Ondernemersaftrek" },
        theory: {
          pt: "Quem é reconhecido como 'ondernemer' para efeitos de IB tem acesso a deduções específicas. A mais conhecida é a zelfstandigenaftrek, mas está a ser desmantelada: caiu de €7.280 em 2020 para apenas €1.200 em 2026. Exige o 'urencriterium' — pelo menos 1.225 horas por ano dedicadas à empresa, que devem ser documentadas. Nos primeiros anos pode acumular-se a startersaftrek. Depois de aplicadas estas deduções, ainda incide a MKB-winstvrijstelling, que isenta 12,7% do lucro remanescente. Atenção: sendo uma isenção percentual, também reduz proporcionalmente o benefício de um prejuízo.",
          en: "Anyone recognised as an 'ondernemer' for income tax gets access to specific deductions. The best known is the zelfstandigenaftrek, but it's being phased out: down from €7,280 in 2020 to just €1,200 in 2026. It requires the 'urencriterium' — at least 1,225 hours a year spent on the business, which must be documented. In the early years the startersaftrek can be added. After these deductions, the MKB-winstvrijstelling still applies, exempting 12.7% of the remaining profit. Note: being a percentage exemption, it also proportionally reduces the benefit of a loss.",
          nl: "Wie voor de inkomstenbelasting als ondernemer wordt aangemerkt, heeft recht op specifieke aftrekposten. De bekendste is de zelfstandigenaftrek, maar die wordt afgebouwd: van €7.280 in 2020 naar slechts €1.200 in 2026. Vereist is het urencriterium — minimaal 1.225 uur per jaar aan de onderneming besteed, aantoonbaar vastgelegd. In de startjaren komt daar de startersaftrek bij. Na deze aftrekposten geldt nog de MKB-winstvrijstelling, die 12,7% van de resterende winst vrijstelt. Let op: als procentuele vrijstelling verlaagt zij ook het voordeel van een verlies.",
        },
        flashcard: {
          front: { pt: "Quantas horas exige o 'urencriterium'?", en: "How many hours does the 'urencriterium' require?", nl: "Hoeveel uur vereist het urencriterium?" },
          back: { pt: "1.225 horas por ano dedicadas à empresa, documentadas.", en: "1,225 hours a year spent on the business, documented.", nl: "1.225 uur per jaar aan de onderneming, aantoonbaar." },
        },
        quiz: {
          q: { pt: "Que percentagem do lucro é isenta ao abrigo da MKB-winstvrijstelling?", en: "What share of profit is exempt under the MKB-winstvrijstelling?", nl: "Welk deel van de winst is vrijgesteld via de MKB-winstvrijstelling?" },
          options: ["12,7%", "30%", "9%"], answer: 0,
          explain: {
            pt: "A MKB-winstvrijstelling isenta 12,7% do lucro após as restantes deduções do empresário. Não confundir com a regra dos 30% (payroll) nem com a innovatiebox (9%).",
            en: "The MKB-winstvrijstelling exempts 12.7% of profit after the other entrepreneur deductions. Not to be confused with the 30% ruling (payroll) or the innovation box (9%).",
            nl: "De MKB-winstvrijstelling stelt 12,7% van de winst vrij na de overige ondernemersaftrek. Niet verwarren met de 30%-regeling of de innovatiebox (9%).",
          },
        },
      },
      {
        title: { pt: "Salário obrigatório do DGA (gebruikelijk loon)", en: "The DGA's customary salary (gebruikelijk loon)", nl: "Gebruikelijk loon van de DGA" },
        theory: {
          pt: "O DGA (directeur-grootaandeelhouder) é o sócio-gerente que detém participação substancial na sua própria BV. Como poderia optar por não receber salário e retirar tudo em dividendos, a lei impõe o 'gebruikelijk loon': um salário mínimo considerado usual, fixado em cerca de €58.000 em 2026 — ou o valor mais elevado entre esse montante, o salário do trabalhador mais bem pago da empresa, e o salário usual numa função comparável. Este salário é custo dedutível na BV e rendimento de Box 1 do DGA. A tributação global é em duas camadas: primeiro Vpb sobre o lucro (19%/25,8%), depois Box 2 na distribuição de dividendos (24,5%/31%) — combinadas, cerca de 38,5% no escalão inferior, ainda abaixo dos 49,5% do topo do IB.",
          en: "The DGA (directeur-grootaandeelhouder) is the managing shareholder holding a substantial interest in their own BV. Since they could choose to take no salary and extract everything as dividends, the law imposes the 'gebruikelijk loon': a minimum customary salary, set at around €58,000 in 2026 — or the highest of that amount, the salary of the company's best-paid employee, and the usual salary in a comparable role. This salary is a deductible cost in the BV and Box 1 income for the DGA. Overall taxation comes in two layers: first Vpb on profit (19%/25.8%), then Box 2 on dividend distribution (24.5%/31%) — combined, roughly 38.5% in the lower bracket, still below the 49.5% top income tax rate.",
          nl: "De DGA (directeur-grootaandeelhouder) houdt een aanmerkelijk belang in de eigen BV. Omdat hij zou kunnen afzien van loon en alles als dividend opnemen, schrijft de wet het gebruikelijk loon voor: een minimaal gebruikelijk salaris, in 2026 circa €58.000 — of het hoogste van dat bedrag, het loon van de best betaalde werknemer, en het loon in de meest vergelijkbare dienstbetrekking. Dit loon is aftrekbaar bij de BV en box 1-inkomen bij de DGA. De totale heffing kent twee lagen: eerst Vpb over de winst (19%/25,8%), daarna box 2 bij dividenduitkering (24,5%/31%) — samen circa 38,5% in de laagste schijf, nog altijd onder het toptarief van 49,5%.",
        },
        flashcard: {
          front: { pt: "Qual o valor de referência do gebruikelijk loon em 2026?", en: "What is the 2026 reference amount for the gebruikelijk loon?", nl: "Wat is het richtbedrag voor het gebruikelijk loon in 2026?" },
          back: { pt: "Cerca de €58.000 — ou mais, se o salário usual comparável ou o do melhor pago for superior.", en: "Around €58,000 — or more, if a comparable customary salary or the best-paid employee's is higher.", nl: "Circa €58.000 — of hoger, als het vergelijkbare gebruikelijke loon of dat van de best betaalde werknemer hoger is." },
        },
        quiz: {
          q: { pt: "Porque existe a regra do gebruikelijk loon?", en: "Why does the gebruikelijk loon rule exist?", nl: "Waarom bestaat de gebruikelijkloonregeling?" },
          options: [
            { pt: "Para impedir que o DGA evite Box 1 retirando tudo em dividendos", en: "To stop the DGA avoiding Box 1 by taking everything as dividends", nl: "Om te voorkomen dat de DGA box 1 ontwijkt door alles als dividend op te nemen" },
            { pt: "Para garantir um salário mínimo a todos os trabalhadores", en: "To guarantee a minimum wage to all employees", nl: "Om alle werknemers een minimumloon te garanderen" },
            { pt: "Para calcular a BTW sobre serviços de gestão", en: "To calculate VAT on management services", nl: "Om BTW over managementdiensten te berekenen" },
          ], answer: 0,
          explain: {
            pt: "Sem esta regra, o DGA poderia declarar salário zero e receber tudo via dividendos, tributados mais favoravelmente na Box 2 e sem contribuições sociais.",
            en: "Without the rule, the DGA could declare zero salary and take everything as dividends, taxed more favourably in Box 2 and free of social contributions.",
            nl: "Zonder deze regel zou de DGA nul loon kunnen opgeven en alles als dividend opnemen, gunstiger belast in box 2 en zonder premies.",
          },
        },
      },
      {
        title: { pt: "Eenmanszaak ou BV?", en: "Eenmanszaak or BV?", nl: "Eenmanszaak of BV?" },
        theory: {
          pt: "A escolha entre empresa em nome individual e BV é uma das conversas mais frequentes num escritório neerlandês. A eenmanszaak é simples e dá acesso à ondernemersaftrek e à MKB-winstvrijstelling, mas o empresário responde com o património pessoal e o lucro é tributado em Box 1 até 49,5%. A BV separa o património, permite reter lucros a 19% e planear a distribuição no tempo, mas obriga a gebruikelijk loon, contas depositadas na KvK e mais custos administrativos. Com a queda da zelfstandigenaftrek, o ponto de equilíbrio desceu — hoje discute-se a partir de lucros na ordem dos €80.000 a €100.000, embora dependa sempre do caso concreto.",
          en: "Choosing between a sole proprietorship and a BV is one of the most common conversations in a Dutch practice. The eenmanszaak is simple and gives access to the ondernemersaftrek and MKB-winstvrijstelling, but the owner is personally liable and profit is taxed in Box 1 up to 49.5%. The BV separates assets, allows profit to be retained at 19% and distributions to be timed, but requires a gebruikelijk loon, accounts filed with the KvK and higher administrative costs. With the zelfstandigenaftrek shrinking, the break-even point has fallen — it's now typically discussed from around €80,000–€100,000 of profit, though it always depends on the specific case.",
          nl: "De keuze tussen eenmanszaak en BV is een van de meest gestelde vragen op kantoor. De eenmanszaak is eenvoudig en geeft recht op ondernemersaftrek en MKB-winstvrijstelling, maar de ondernemer is privé aansprakelijk en de winst valt in box 1 tot 49,5%. De BV scheidt vermogen, laat winst tegen 19% inhouden en uitkeringen in de tijd plannen, maar vereist gebruikelijk loon, deponering bij de KvK en hogere administratieve lasten. Door de afbouw van de zelfstandigenaftrek is het omslagpunt gedaald — vaak besproken vanaf circa €80.000–€100.000 winst, altijd afhankelijk van de situatie.",
        },
        flashcard: {
          front: { pt: "Qual a principal desvantagem jurídica da eenmanszaak?", en: "What's the main legal drawback of an eenmanszaak?", nl: "Wat is het grootste juridische nadeel van een eenmanszaak?" },
          back: { pt: "Não há separação de património: o empresário responde pessoalmente pelas dívidas.", en: "No separation of assets: the owner is personally liable for the debts.", nl: "Geen vermogensscheiding: de ondernemer is privé aansprakelijk voor schulden." },
        },
        quiz: {
          q: { pt: "Que obrigação nasce ao converter uma eenmanszaak em BV?", en: "What obligation arises when converting an eenmanszaak into a BV?", nl: "Welke verplichting ontstaat bij omzetting van eenmanszaak naar BV?" },
          options: [
            { pt: "Pagar gebruikelijk loon ao DGA", en: "Paying the DGA a gebruikelijk loon", nl: "Gebruikelijk loon betalen aan de DGA" },
            { pt: "Cobrar 9% de BTW em todas as vendas", en: "Charging 9% VAT on all sales", nl: "9% BTW rekenen over alle omzet" },
            { pt: "Cumprir o urencriterium de 1.225 horas", en: "Meeting the 1,225-hour urencriterium", nl: "Voldoen aan het urencriterium van 1.225 uur" },
          ], answer: 0,
          explain: {
            pt: "O urencriterium e a ondernemersaftrek pertencem ao regime de IB da eenmanszaak — desaparecem na BV, onde surge o gebruikelijk loon.",
            en: "The urencriterium and ondernemersaftrek belong to the eenmanszaak's income tax regime — they disappear in a BV, where the gebruikelijk loon appears instead.",
            nl: "Urencriterium en ondernemersaftrek horen bij de eenmanszaak — die vervallen bij een BV, waar het gebruikelijk loon voor in de plaats komt.",
          },
        },
      },
    ],
  },
  {
    id: "vormen", icon: Building2, color: "green",
    title: { pt: "Formas jurídicas, KvK e prazos", en: "Legal forms, KvK & deadlines", nl: "Rechtsvormen, KvK & termijnen" },
    lessons: [
      {
        title: { pt: "As formas jurídicas neerlandesas", en: "Dutch legal forms", nl: "Nederlandse rechtsvormen" },
        theory: {
          pt: "As formas jurídicas dividem-se entre as que têm personalidade jurídica própria e as que não têm. Sem personalidade jurídica: eenmanszaak (empresário individual), VOF (sociedade em nome coletivo, com responsabilidade solidária dos sócios) e maatschap (usada por profissões liberais — médicos, advogados). Com personalidade jurídica: BV (a sociedade por quotas, de longe a mais comum), NV (sociedade anónima, para grandes empresas e cotadas), stichting (fundação, sem sócios, usada para fins não lucrativos e também como veículo de governação) e vereniging (associação). A escolha determina simultaneamente a responsabilidade pessoal e o imposto aplicável: IB nas primeiras, Vpb nas segundas.",
          en: "Dutch legal forms split between those with and without legal personality. Without: eenmanszaak (sole trader), VOF (general partnership, with partners jointly liable) and maatschap (used by liberal professions — doctors, lawyers). With legal personality: BV (private limited company, by far the most common), NV (public limited company, for large and listed businesses), stichting (foundation, with no members, used for non-profit purposes and also as a governance vehicle) and vereniging (association). The choice determines both personal liability and the applicable tax: income tax for the first group, Vpb for the second.",
          nl: "Rechtsvormen vallen uiteen in vormen met en zonder rechtspersoonlijkheid. Zonder: eenmanszaak, VOF (vennoten hoofdelijk aansprakelijk) en maatschap (vrije beroepen — artsen, advocaten). Met rechtspersoonlijkheid: BV (verreweg de meest voorkomende), NV (voor grote en beursgenoteerde ondernemingen), stichting (zonder leden, voor non-profit en als governance-vehikel) en vereniging. De keuze bepaalt tegelijk de privé-aansprakelijkheid en de belasting: inkomstenbelasting bij de eerste groep, vennootschapsbelasting bij de tweede.",
        },
        flashcard: {
          front: { pt: "Que forma jurídica não tem sócios nem membros?", en: "Which legal form has no shareholders or members?", nl: "Welke rechtsvorm heeft geen aandeelhouders of leden?" },
          back: { pt: "A stichting (fundação) — governada apenas por um conselho de administração.", en: "The stichting (foundation) — governed solely by a board.", nl: "De stichting — bestuurd door alleen een bestuur." },
        },
        quiz: {
          q: { pt: "Numa VOF, qual é a responsabilidade dos sócios pelas dívidas?", en: "In a VOF, what is the partners' liability for debts?", nl: "Wat is bij een VOF de aansprakelijkheid van de vennoten?" },
          options: [
            { pt: "Solidária e com o património pessoal", en: "Joint and several, with personal assets", nl: "Hoofdelijk, met het privévermogen" },
            { pt: "Limitada ao capital entrado", en: "Limited to the capital contributed", nl: "Beperkt tot de inbreng" },
            { pt: "Inexistente", en: "None", nl: "Geen" },
          ], answer: 0,
          explain: {
            pt: "A VOF não tem personalidade jurídica própria, pelo que cada vennoot responde pela totalidade das dívidas com o seu património pessoal.",
            en: "A VOF has no separate legal personality, so each partner is liable for the full debts with personal assets.",
            nl: "Een VOF heeft geen rechtspersoonlijkheid; elke vennoot is met privévermogen aansprakelijk voor het geheel.",
          },
        },
      },
      {
        title: { pt: "KvK e o Handelsregister", en: "KvK & the trade register", nl: "KvK en het Handelsregister" },
        theory: {
          pt: "Toda a empresa deve inscrever-se no Handelsregister da Kamer van Koophandel (KvK), obtendo um número KvK que a identifica publicamente. A inscrição gera automaticamente a comunicação à Belastingdienst, que atribui os números fiscais (incluindo o BTW-identificatienummer). As sociedades com personalidade jurídica têm ainda de 'deponeren' — depositar publicamente a jaarrekening na KvK, dentro de 12 meses após o fim do exercício. O incumprimento não é apenas uma coima: em caso de insolvência, a falta de depósito é indício legal de má gestão, podendo tornar os administradores pessoalmente responsáveis.",
          en: "Every business must register in the Kamer van Koophandel (KvK) trade register, receiving a KvK number that publicly identifies it. Registration automatically notifies the Belastingdienst, which issues the tax numbers (including the VAT identification number). Companies with legal personality must also 'deponeren' — publicly file the jaarrekening with the KvK, within 12 months of the financial year end. Failure isn't just a fine: in insolvency, missing filings are legal evidence of improper management, potentially making directors personally liable.",
          nl: "Elke onderneming moet zich inschrijven in het Handelsregister van de Kamer van Koophandel (KvK) en krijgt een KvK-nummer. De inschrijving gaat automatisch door naar de Belastingdienst, die de fiscale nummers toekent (waaronder het btw-identificatienummer). Rechtspersonen moeten daarnaast deponeren — de jaarrekening openbaar maken bij de KvK, binnen 12 maanden na afloop van het boekjaar. Verzuim levert niet alleen een boete op: bij faillissement geldt te laat deponeren als bewijs van onbehoorlijk bestuur, met mogelijke persoonlijke aansprakelijkheid van bestuurders.",
        },
        flashcard: {
          front: { pt: "Que risco corre um administrador que não deposita as contas?", en: "What risk does a director run by not filing the accounts?", nl: "Welk risico loopt een bestuurder die niet deponeert?" },
          back: { pt: "Em insolvência, presume-se má gestão — pode ser pessoalmente responsabilizado pelo défice.", en: "In insolvency, improper management is presumed — they can be held personally liable for the deficit.", nl: "Bij faillissement geldt dit als onbehoorlijk bestuur — persoonlijke aansprakelijkheid dreigt." },
        },
        quiz: {
          q: { pt: "Qual o prazo máximo para depositar a jaarrekening na KvK?", en: "What's the maximum deadline to file the jaarrekening with the KvK?", nl: "Wat is de uiterste termijn voor deponering bij de KvK?" },
          options: [
            { pt: "12 meses após o fim do exercício", en: "12 months after year-end", nl: "12 maanden na afloop van het boekjaar" },
            { pt: "3 meses após o fim do exercício", en: "3 months after year-end", nl: "3 maanden na afloop van het boekjaar" },
            { pt: "Não há prazo", en: "There is no deadline", nl: "Er is geen termijn" },
          ], answer: 0,
          explain: {
            pt: "O prazo-limite absoluto é 12 meses; na prática, a assembleia deve aprovar as contas antes, e o depósito segue-se à aprovação.",
            en: "The absolute deadline is 12 months; in practice the shareholders must adopt the accounts earlier, with filing following adoption.",
            nl: "De uiterste termijn is 12 maanden; in de praktijk stelt de AVA de jaarrekening eerder vast, waarna deponering volgt.",
          },
        },
      },
      {
        title: { pt: "O calendário fiscal", en: "The tax calendar", nl: "De fiscale kalender" },
        theory: {
          pt: "Gerir prazos é metade do trabalho num escritório. Os principais: a declaração de BTW e o respetivo pagamento vencem no último dia do mês seguinte ao período (mensal ou trimestral); a declaração de IB entrega-se até 1 de maio do ano seguinte, com prorrogação possível; a declaração de Vpb apresenta-se em regra dentro de 5 meses após o fim do exercício, prorrogável através do regime de prorrogação dos contabilistas ('uitstelregeling belastingconsulenten'); a jaarrekening deposita-se na KvK até 12 meses. Um princípio importante: o pedido de prorrogação suspende a coima por entrega tardia, mas não os juros sobre o imposto em falta.",
          en: "Managing deadlines is half the job in a practice. The main ones: the VAT return and payment fall due on the last day of the month following the period (monthly or quarterly); the income tax return is filed by 1 May of the following year, with extension possible; the Vpb return is generally filed within 5 months of the financial year end, extendable through the tax agents' extension scheme ('uitstelregeling belastingconsulenten'); the jaarrekening is filed with the KvK within 12 months. One key principle: requesting an extension suspends the late-filing penalty, but not the interest on unpaid tax.",
          nl: "Termijnbeheer is het halve werk op kantoor. De belangrijkste: BTW-aangifte en -betaling uiterlijk de laatste dag van de maand na het tijdvak (maand of kwartaal); de aangifte inkomstenbelasting vóór 1 mei van het volgende jaar, met mogelijk uitstel; de aangifte vennootschapsbelasting doorgaans binnen 5 maanden na afloop van het boekjaar, te verlengen via de uitstelregeling belastingconsulenten; de jaarrekening binnen 12 maanden deponeren bij de KvK. Belangrijk principe: uitstel voorkomt de verzuimboete, maar niet de belastingrente over nog verschuldigde belasting.",
        },
        flashcard: {
          front: { pt: "A prorrogação de prazo evita os juros de mora?", en: "Does an extension avoid interest on tax due?", nl: "Voorkomt uitstel de belastingrente?" },
          back: { pt: "Não — evita a coima por entrega tardia, mas os juros continuam a correr sobre o imposto em falta.", en: "No — it avoids the late-filing penalty, but interest keeps running on unpaid tax.", nl: "Nee — het voorkomt de verzuimboete, maar de belastingrente loopt door." },
        },
        quiz: {
          q: { pt: "Até quando se entrega, em regra, a declaração de IB?", en: "By when is the income tax return generally filed?", nl: "Wanneer moet de aangifte inkomstenbelasting doorgaans binnen zijn?" },
          options: [
            { pt: "1 de maio do ano seguinte", en: "1 May of the following year", nl: "1 mei van het volgende jaar" },
            { pt: "31 de dezembro do mesmo ano", en: "31 December of the same year", nl: "31 december van hetzelfde jaar" },
            { pt: "Dentro de 5 meses após o fim do exercício", en: "Within 5 months of year-end", nl: "Binnen 5 maanden na afloop van het boekjaar" },
          ], answer: 0,
          explain: {
            pt: "O prazo de 5 meses aplica-se ao Vpb das sociedades, não ao IB das pessoas singulares — confundir os dois é um erro clássico de quem vem de outro sistema.",
            en: "The 5-month deadline applies to corporate Vpb, not personal income tax — mixing the two is a classic mistake for those coming from another system.",
            nl: "De termijn van 5 maanden geldt voor de Vpb, niet voor de inkomstenbelasting — die twee verwisselen is een klassieke fout.",
          },
        },
      },
      {
        title: { pt: "SBR, Peppol e faturação eletrónica", en: "SBR, Peppol & e-invoicing", nl: "SBR, Peppol & e-facturering" },
        theory: {
          pt: "Os Países Baixos são dos países mais digitalizados no relato financeiro. O SBR (Standard Business Reporting) é o padrão obrigatório para submeter declarações e depositar contas por via eletrónica, usando a taxonomia nacional em XBRL — e é precisamente por isso que o RGS existe, para que os saldos do razão mapeiem diretamente nos elementos do relato. Na faturação, o standard europeu Peppol permite trocar faturas estruturadas entre sistemas; é obrigatório para fornecedores da administração central e cada vez mais adotado no privado. Combinado com o SEPA para pagamentos, permite automatizar quase toda a reconciliação bancária.",
          en: "The Netherlands is among the most digitalised countries in financial reporting. SBR (Standard Business Reporting) is the mandatory standard for filing returns and accounts electronically, using the national XBRL taxonomy — and that's precisely why RGS exists, so ledger balances map directly onto reporting elements. In invoicing, the European Peppol standard allows structured invoices to be exchanged between systems; it's mandatory for central government suppliers and increasingly adopted privately. Combined with SEPA for payments, it allows nearly all bank reconciliation to be automated.",
          nl: "Nederland loopt voorop in digitale financiële rapportage. SBR (Standard Business Reporting) is de verplichte standaard voor het elektronisch indienen van aangiften en het deponeren van jaarrekeningen, op basis van de Nederlandse XBRL-taxonomie — en precies daarom bestaat RGS, zodat grootboeksaldi direct op rapportage-elementen aansluiten. Bij facturatie maakt de Europese Peppol-standaard gestructureerde uitwisseling tussen systemen mogelijk; verplicht voor leveranciers van de rijksoverheid en steeds breder toegepast in het bedrijfsleven. In combinatie met SEPA voor betalingen is bankreconciliatie vrijwel volledig te automatiseren.",
        },
        flashcard: {
          front: { pt: "Que linguagem técnica está por trás do SBR?", en: "What technical language underpins SBR?", nl: "Welke techniek zit achter SBR?" },
          back: { pt: "XBRL, através da taxonomia nacional neerlandesa (NT).", en: "XBRL, via the Dutch national taxonomy (NT).", nl: "XBRL, via de Nederlandse Taxonomie (NT)." },
        },
        quiz: {
          q: { pt: "Qual a ligação entre o RGS e o SBR?", en: "What links RGS and SBR?", nl: "Wat is de link tussen RGS en SBR?" },
          options: [
            { pt: "O RGS uniformiza as contas para que mapeiem na taxonomia do SBR", en: "RGS standardises accounts so they map onto the SBR taxonomy", nl: "RGS uniformeert rekeningen zodat ze aansluiten op de SBR-taxonomie" },
            { pt: "São nomes diferentes para a mesma coisa", en: "They're different names for the same thing", nl: "Het zijn twee namen voor hetzelfde" },
            { pt: "Não têm relação", en: "They're unrelated", nl: "Ze staan los van elkaar" },
          ], answer: 0,
          explain: {
            pt: "O RGS foi criado justamente para resolver o problema de ligar planos de contas heterogéneos aos elementos padronizados do relato SBR.",
            en: "RGS was created precisely to solve the problem of linking heterogeneous charts of accounts to SBR's standardised reporting elements.",
            nl: "RGS is juist ontwikkeld om uiteenlopende rekeningschema's te koppelen aan de gestandaardiseerde SBR-rapportage-elementen.",
          },
        },
      },
    ],
  },
  {
    id: "fiscaal", icon: FileText, color: "orange",
    title: { pt: "Fiscal vs comercial e controlo", en: "Tax vs commercial accounts & assurance", nl: "Fiscaal vs commercieel & controle" },
    lessons: [
      {
        title: { pt: "Duas contas, um razão", en: "Two sets of accounts, one ledger", nl: "Twee jaarrekeningen, één grootboek" },
        theory: {
          pt: "Este é o conceito que separa um júnior de um accountant. A 'commerciële jaarrekening' segue o BW2 Titel 9 e as orientações da RJ, e destina-se a acionistas, bancos e ao público. A 'fiscale jaarrekening' segue a lei fiscal e o princípio do 'goed koopmansgebruik' (boa prática empresarial), e destina-se à Belastingdienst. Partem do mesmo razão, mas divergem: há diferenças permanentes (custos nunca dedutíveis, como parte das despesas de representação, ou proveitos isentos pela participation exemption) e diferenças temporárias (o mesmo montante é reconhecido, mas em anos diferentes).",
          en: "This is the concept that separates a junior from an accountant. The 'commerciële jaarrekening' follows BW2 Titel 9 and RJ guidance, and is aimed at shareholders, banks and the public. The 'fiscale jaarrekening' follows tax law and the 'goed koopmansgebruik' principle (sound business practice), and is aimed at the Belastingdienst. Both start from the same ledger but diverge: there are permanent differences (costs never deductible, such as part of entertainment expenses, or income exempt under the participation exemption) and temporary differences (the same amount is recognised, but in different years).",
          nl: "Dit onderscheid scheidt de junior van de accountant. De commerciële jaarrekening volgt BW2 Titel 9 en de RJ-richtlijnen, en is bedoeld voor aandeelhouders, banken en het publiek. De fiscale jaarrekening volgt de belastingwet en goed koopmansgebruik, en is bedoeld voor de Belastingdienst. Beide vertrekken vanuit hetzelfde grootboek maar lopen uiteen: er zijn permanente verschillen (nooit aftrekbare kosten, zoals een deel van de representatiekosten, of vrijgestelde baten door de deelnemingsvrijstelling) en tijdelijke verschillen (hetzelfde bedrag, maar in een ander jaar verantwoord).",
        },
        flashcard: {
          front: { pt: "O que é 'goed koopmansgebruik'?", en: "What is 'goed koopmansgebruik'?", nl: "Wat is goed koopmansgebruik?" },
          back: { pt: "O princípio orientador da determinação do lucro fiscal — prudência, realização e consistência.", en: "The guiding principle for determining taxable profit — prudence, realisation and consistency.", nl: "Het leidende beginsel voor de fiscale winstbepaling — voorzichtigheid, realisatie en bestendigheid." },
        },
        quiz: {
          q: { pt: "Um proveito isento pela participation exemption gera que tipo de diferença?", en: "Income exempt under the participation exemption creates which type of difference?", nl: "Een door de deelnemingsvrijstelling vrijgestelde bate geeft welk soort verschil?" },
          options: [
            { pt: "Permanente", en: "Permanent", nl: "Permanent" },
            { pt: "Temporária", en: "Temporary", nl: "Tijdelijk" },
            { pt: "Nenhuma", en: "None", nl: "Geen" },
          ], answer: 0,
          explain: {
            pt: "É permanente porque o proveito nunca será tributado — não é apenas um desfasamento temporal, ao contrário de uma diferença de depreciação.",
            en: "It's permanent because the income will never be taxed — it's not merely a timing difference, unlike a depreciation difference.",
            nl: "Permanent, omdat de bate nooit belast wordt — geen timingverschil, anders dan bij afschrijving.",
          },
        },
      },
      {
        title: { pt: "As divergências mais comuns", en: "The most common divergences", nl: "De meest voorkomende verschillen" },
        theory: {
          pt: "Na prática, quatro áreas geram quase todas as reconciliações. Depreciações: a lei fiscal impõe limites — nomeadamente prazos mínimos e, no caso de imóveis, um limite de depreciação em função do valor WOZ — que raramente coincidem com a vida útil comercial. Provisões (voorzieningen): a contabilidade comercial reconhece-as mais cedo do que o fisco permite. Herinvesteringsreserve: permite diferir a tributação da mais-valia na alienação de um ativo, se houver intenção de reinvestir. Willekeurige afschrijving: regimes de depreciação acelerada para certos investimentos, tipicamente ambientais ou de arranque, que só existem no plano fiscal.",
          en: "In practice, four areas generate almost all reconciliations. Depreciation: tax law imposes limits — minimum periods and, for real estate, a depreciation floor tied to the WOZ value — that rarely match commercial useful life. Provisions (voorzieningen): commercial accounting recognises them earlier than tax law allows. Herinvesteringsreserve: allows deferral of tax on a gain from disposing of an asset, where there's an intention to reinvest. Willekeurige afschrijving: accelerated depreciation regimes for certain investments, typically environmental or start-up related, that exist only for tax purposes.",
          nl: "In de praktijk veroorzaken vier gebieden vrijwel alle aansluitverschillen. Afschrijvingen: de fiscale wet stelt grenzen — minimumtermijnen en, bij vastgoed, een bodemwaarde gekoppeld aan de WOZ-waarde — die zelden samenvallen met de commerciële levensduur. Voorzieningen: commercieel eerder gevormd dan fiscaal toegestaan. Herinvesteringsreserve: uitstel van heffing over de boekwinst bij vervreemding, mits herinvesteringsvoornemen. Willekeurige afschrijving: versnelde afschrijving voor bepaalde investeringen, vaak milieu- of startersgerelateerd, uitsluitend fiscaal.",
        },
        flashcard: {
          front: { pt: "Para que serve a herinvesteringsreserve?", en: "What is the herinvesteringsreserve for?", nl: "Waarvoor dient de herinvesteringsreserve?" },
          back: { pt: "Diferir a tributação da mais-valia na venda de um ativo, quando há intenção de reinvestir.", en: "Deferring tax on a gain from selling an asset, where there's an intention to reinvest.", nl: "Uitstel van heffing over de boekwinst bij verkoop, mits herinvesteringsvoornemen." },
        },
        quiz: {
          q: { pt: "A que valor está ligado o limite de depreciação de imóveis?", en: "What value is the real-estate depreciation floor tied to?", nl: "Aan welke waarde is de bodemwaarde bij vastgoed gekoppeld?" },
          options: [
            { pt: "Ao valor WOZ", en: "The WOZ value", nl: "De WOZ-waarde" },
            { pt: "Ao valor de aquisição", en: "The acquisition cost", nl: "De aanschafwaarde" },
            { pt: "Ao valor de seguro", en: "The insured value", nl: "De verzekerde waarde" },
          ], answer: 0,
          explain: {
            pt: "O valor WOZ é a avaliação municipal do imóvel; funciona como piso abaixo do qual a depreciação fiscal deixa de ser aceite.",
            en: "The WOZ value is the municipal property valuation; it acts as a floor below which tax depreciation is no longer allowed.",
            nl: "De WOZ-waarde is de gemeentelijke waardering en fungeert als bodem waaronder fiscaal niet verder mag worden afgeschreven.",
          },
        },
      },
      {
        title: { pt: "Impostos diferidos (latente belastingen)", en: "Deferred tax (latente belastingen)", nl: "Latente belastingen" },
        theory: {
          pt: "Quando existe uma diferença temporária, a contabilidade comercial reconhece um imposto diferido para refletir o efeito fiscal futuro. Se o lucro comercial é maior do que o fiscal, nasce um passivo por imposto diferido — imposto que será pago mais tarde. Se acontece o contrário, ou se existem prejuízos reportáveis com expectativa razoável de utilização, nasce um ativo por imposto diferido. O ponto crítico do julgamento profissional é o reconhecimento de ativos por impostos diferidos: só devem ser inscritos se for provável que haverá lucro tributável futuro suficiente para os absorver.",
          en: "Where a temporary difference exists, commercial accounting recognises deferred tax to reflect the future tax effect. If commercial profit exceeds taxable profit, a deferred tax liability arises — tax that will be paid later. If the reverse happens, or where carried-forward losses are reasonably expected to be used, a deferred tax asset arises. The critical point of professional judgement is recognising deferred tax assets: they should only be recorded if it's probable that sufficient future taxable profit will absorb them.",
          nl: "Bij een tijdelijk verschil neemt de commerciële jaarrekening een latente belastingpost op om het toekomstige fiscale effect weer te geven. Is de commerciële winst hoger dan de fiscale, dan ontstaat een passieve belastinglatentie — later te betalen belasting. Andersom, of bij compensabele verliezen met redelijke gebruiksverwachting, ontstaat een actieve latentie. Het kernpunt van professionele oordeelsvorming is de actieve latentie: alleen opnemen als toekomstige fiscale winst waarschijnlijk toereikend is.",
        },
        flashcard: {
          front: { pt: "Quando se reconhece um ativo por imposto diferido?", en: "When is a deferred tax asset recognised?", nl: "Wanneer neem je een actieve belastinglatentie op?" },
          back: { pt: "Só quando for provável haver lucro tributável futuro suficiente para o utilizar.", en: "Only when sufficient future taxable profit is probable to use it.", nl: "Alleen als toekomstige fiscale winst waarschijnlijk toereikend is." },
        },
        quiz: {
          q: { pt: "Lucro comercial superior ao fiscal gera normalmente...", en: "Commercial profit above taxable profit normally creates...", nl: "Commerciële winst hoger dan fiscale winst geeft doorgaans..." },
          options: [
            { pt: "Um passivo por imposto diferido", en: "A deferred tax liability", nl: "Een passieve belastinglatentie" },
            { pt: "Um ativo por imposto diferido", en: "A deferred tax asset", nl: "Een actieve belastinglatentie" },
            { pt: "Uma diferença permanente", en: "A permanent difference", nl: "Een permanent verschil" },
          ], answer: 0,
          explain: {
            pt: "Se já reconheceste o lucro comercialmente mas ainda não o tributaste, o imposto correspondente está por pagar — logo, é um passivo.",
            en: "If you've recognised profit commercially but not yet been taxed on it, the corresponding tax is still owed — hence a liability.",
            nl: "Is de winst commercieel al verantwoord maar fiscaal nog niet belast, dan is de bijbehorende belasting nog verschuldigd — dus een verplichting.",
          },
        },
      },
      {
        title: { pt: "Níveis de garantia e controlo interno", en: "Assurance levels & internal control", nl: "Assurance-niveaus & interne beheersing" },
        theory: {
          pt: "Nem toda a intervenção de um contabilista tem o mesmo peso. Existem três níveis: a 'samenstellingsverklaring' (compilação — o profissional organiza e apresenta as contas com base na informação do cliente, sem garantia), a 'beoordelingsverklaring' (revisão limitada — garantia moderada, baseada sobretudo em análise e indagação) e a 'controleverklaring' (auditoria — garantia razoável, com testes substantivos e de controlo). Só empresas médias e grandes estão sujeitas a auditoria obrigatória. A qualidade do controlo interno do cliente determina diretamente o esforço de auditoria: quanto mais fiáveis os controlos, menos testes substantivos são necessários.",
          en: "Not every accountant's involvement carries the same weight. There are three levels: the 'samenstellingsverklaring' (compilation — the professional organises and presents the accounts from client information, with no assurance), the 'beoordelingsverklaring' (review — moderate assurance, mainly through analysis and enquiry) and the 'controleverklaring' (audit — reasonable assurance, with substantive and control testing). Only medium and large companies face a mandatory audit. The quality of the client's internal control directly drives audit effort: the more reliable the controls, the fewer substantive tests are needed.",
          nl: "Niet elke betrokkenheid van een accountant weegt even zwaar. Er zijn drie niveaus: de samenstellingsverklaring (samenstellen op basis van klantinformatie, zonder zekerheid), de beoordelingsverklaring (beperkte mate van zekerheid, vooral via cijferanalyse en inlichtingen) en de controleverklaring (redelijke mate van zekerheid, met gegevensgerichte en systeemgerichte werkzaamheden). Alleen middelgrote en grote rechtspersonen zijn controleplichtig. De kwaliteit van de interne beheersing bepaalt direct de controle-inspanning: betrouwbaardere controls betekenen minder gegevensgerichte werkzaamheden.",
        },
        flashcard: {
          front: { pt: "Que nível de garantia dá uma samenstellingsverklaring?", en: "What assurance does a samenstellingsverklaring give?", nl: "Welke zekerheid geeft een samenstellingsverklaring?" },
          back: { pt: "Nenhuma — o profissional compila as contas, não as verifica.", en: "None — the professional compiles the accounts, doesn't verify them.", nl: "Geen — de accountant stelt samen, maar controleert niet." },
        },
        quiz: {
          q: { pt: "Qual destes níveis dá garantia razoável?", en: "Which of these gives reasonable assurance?", nl: "Welke van deze geeft redelijke mate van zekerheid?" },
          options: [
            { pt: "Controleverklaring (auditoria)", en: "Controleverklaring (audit)", nl: "Controleverklaring" },
            { pt: "Beoordelingsverklaring", en: "Beoordelingsverklaring", nl: "Beoordelingsverklaring" },
            { pt: "Samenstellingsverklaring", en: "Samenstellingsverklaring", nl: "Samenstellingsverklaring" },
          ], answer: 0,
          explain: {
            pt: "A escala é: compilação (nenhuma garantia) → revisão limitada (garantia moderada) → auditoria (garantia razoável, o nível mais elevado possível).",
            en: "The scale runs: compilation (no assurance) → review (moderate assurance) → audit (reasonable assurance, the highest achievable level).",
            nl: "De schaal loopt: samenstellen (geen zekerheid) → beoordelen (beperkte zekerheid) → controleren (redelijke mate van zekerheid).",
          },
        },
      },
    ],
  },
  {
    id: "auditoria", icon: ClipboardList, color: "orange",
    title: { pt: "Auditoria e Compliance", en: "Audit & Compliance", nl: "Audit & Compliance" },
    lessons: [
      {
        title: { pt: "Materialidade, risco e evidência", en: "Materiality, risk & evidence", nl: "Materialiteit, risico en controle-informatie" },
        theory: {
          pt: "Uma auditoria não verifica cada transação — verifica o suficiente para dar uma opinião com garantia razoável. A 'materialidade' é o limiar acima do qual um erro passaria a influenciar a decisão de quem lê as contas; costuma calcular-se como uma percentagem de uma métrica de referência (por exemplo, 1% do volume de negócios ou 5% do resultado antes de impostos), ajustada ao julgamento profissional do auditor. O 'risco de auditoria' combina o risco de existir um erro material (risco inerente + risco de controlo) com o risco de o auditor não o detetar (risco de deteção) — quanto maior o risco combinado, mais testes substantivos são necessários. A 'evidência de auditoria' é a informação recolhida para sustentar as conclusões — pode vir de confirmações externas, inspeção de documentos, observação direta, ou recálculo — e deve ser suficiente e apropriada, não apenas abundante.",
          en: "An audit doesn't check every transaction — it checks enough to give an opinion with reasonable assurance. 'Materiality' is the threshold above which an error would start to influence the decisions of someone reading the accounts; it's typically calculated as a percentage of a benchmark metric (e.g. 1% of turnover or 5% of profit before tax), adjusted by the auditor's professional judgement. 'Audit risk' combines the risk that a material error exists (inherent risk + control risk) with the risk the auditor fails to detect it (detection risk) — the higher the combined risk, the more substantive testing is needed. 'Audit evidence' is the information gathered to support conclusions — it can come from external confirmations, document inspection, direct observation, or recalculation — and must be sufficient and appropriate, not merely abundant.",
          nl: "Een audit controleert niet elke transactie — hij controleert genoeg om een oordeel met redelijke mate van zekerheid te geven. Materialiteit is de drempel waarboven een fout de beslissingen van de lezer van de jaarrekening zou beïnvloeden; meestal berekend als een percentage van een benchmark (bijvoorbeeld 1% van de omzet of 5% van de winst vóór belasting), aangepast aan het professionele oordeel van de accountant. Controlerisico combineert het risico dat een materiële fout bestaat (inherent risico + controlerisico) met het risico dat de accountant deze niet ontdekt (ontdekkingsrisico) — hoe hoger het gecombineerde risico, hoe meer gegevensgerichte werkzaamheden nodig zijn. Controle-informatie is de verzamelde informatie ter onderbouwing van conclusies — via externe bevestigingen, documentinspectie, waarneming, of herberekening — en moet voldoende en geschikt zijn, niet slechts overvloedig.",
        },
        flashcard: {
          front: { pt: "Como se calcula tipicamente a materialidade?", en: "How is materiality typically calculated?", nl: "Hoe wordt materialiteit doorgaans berekend?" },
          back: { pt: "Como percentagem de uma métrica de referência (ex.: 1% do volume de negócios, 5% do resultado antes de impostos), ajustada ao julgamento profissional.", en: "As a percentage of a benchmark metric (e.g. 1% of turnover, 5% of profit before tax), adjusted by professional judgement.", nl: "Als percentage van een benchmark (bijv. 1% van de omzet, 5% van de winst vóór belasting), aangepast aan professioneel oordeel." },
        },
        quizzes: [
          {
            q: { pt: "O que é o 'risco de deteção'?", en: "What is 'detection risk'?", nl: "Wat is ontdekkingsrisico?" },
            options: [
              { pt: "O risco de o auditor não detetar um erro material que exista", en: "The risk the auditor fails to detect an existing material error", nl: "Het risico dat de accountant een bestaande materiële fout niet ontdekt" },
              { pt: "O risco de a empresa falir no próximo ano", en: "The risk the company goes bankrupt next year", nl: "Het risico dat het bedrijf volgend jaar failliet gaat" },
              { pt: "O risco de a fatura ter o BTW errado", en: "The risk the invoice has the wrong VAT", nl: "Het risico dat de factuur het verkeerde BTW-tarief heeft" },
            ], answer: 0,
            explain: {
              pt: "O risco de deteção é a parte do risco de auditoria que o próprio auditor controla, através da extensão e qualidade dos testes que realiza.",
              en: "Detection risk is the part of audit risk the auditor themselves controls, through the extent and quality of the tests performed.",
              nl: "Ontdekkingsrisico is het deel van het controlerisico dat de accountant zelf beheerst, via de omvang en kwaliteit van de uitgevoerde werkzaamheden.",
            },
          },
          {
            q: { pt: "Porque é que 'evidência abundante' não é o mesmo que 'evidência suficiente e apropriada'?", en: "Why isn't 'abundant evidence' the same as 'sufficient and appropriate evidence'?", nl: "Waarom is 'overvloedige controle-informatie' niet hetzelfde als 'voldoende en geschikte controle-informatie'?" },
            options: [
              { pt: "Porque a qualidade e relevância da evidência importam mais do que a quantidade", en: "Because the quality and relevance of evidence matters more than quantity", nl: "Omdat kwaliteit en relevantie van de informatie belangrijker zijn dan de hoeveelheid" },
              { pt: "Não há diferença nenhuma entre os dois conceitos", en: "There's no difference between the two concepts at all", nl: "Er is helemaal geen verschil tussen beide begrippen" },
              { pt: "Porque mais evidência é sempre pior para o auditor", en: "Because more evidence is always worse for the auditor", nl: "Omdat meer informatie altijd slechter is voor de accountant" },
            ], answer: 0,
            explain: {
              pt: "Muitos documentos pouco relevantes não substituem uma peça de evidência forte e diretamente ligada à afirmação que se está a testar.",
              en: "Many low-relevance documents don't substitute for one strong piece of evidence directly tied to the assertion being tested.",
              nl: "Veel weinig relevante documenten vervangen niet één sterk bewijsstuk dat direct aansluit op de te toetsen bewering.",
            },
          },
        ],
      },
      {
        title: { pt: "Amostragem e testes de auditoria", en: "Sampling & audit testing", nl: "Steekproeven en controlewerkzaamheden" },
        theory: {
          pt: "Como testar 100% das transações seria inviável na maioria das empresas, os auditores recorrem à amostragem — selecionar um subconjunto representativo para tirar conclusões sobre a totalidade. A amostragem pode ser estatística (com base em probabilidade e fórmulas, permitindo quantificar a margem de erro) ou não estatística (baseada em julgamento profissional, focando em itens de maior risco ou valor). Os testes dividem-se em dois grandes tipos: 'testes de controlo' (verificam se um controlo interno está a funcionar como desenhado — por exemplo, se todas as faturas acima de determinado valor têm duas assinaturas de aprovação) e 'testes substantivos' (verificam diretamente se os saldos e transações estão corretos — por exemplo, confirmar saldos de clientes diretamente com eles). Quanto mais fiáveis os controlos internos, menos testes substantivos são necessários.",
          en: "Since testing 100% of transactions would be unfeasible for most companies, auditors use sampling — selecting a representative subset to draw conclusions about the whole. Sampling can be statistical (based on probability and formulas, allowing the error margin to be quantified) or non-statistical (based on professional judgement, focusing on higher-risk or higher-value items). Tests fall into two broad types: 'tests of controls' (check whether an internal control is operating as designed — e.g. whether all invoices above a certain value have two approval signatures) and 'substantive tests' (directly check whether balances and transactions are correct — e.g. confirming customer balances directly with them). The more reliable the internal controls, the fewer substantive tests are needed.",
          nl: "Omdat 100% van de transacties testen voor de meeste bedrijven onhaalbaar zou zijn, gebruiken accountants steekproeven — een representatieve deelverzameling selecteren om conclusies over het geheel te trekken. Steekproeven kunnen statistisch zijn (gebaseerd op kansrekening, waarmee de foutmarge te kwantificeren is) of niet-statistisch (gebaseerd op professioneel oordeel, gericht op items met hoger risico of hogere waarde). Werkzaamheden vallen uiteen in twee hoofdtypen: systeemgerichte werkzaamheden (controleren of een interne beheersingsmaatregel werkt zoals bedoeld — bijvoorbeeld of alle facturen boven een bepaald bedrag twee goedkeuringshandtekeningen hebben) en gegevensgerichte werkzaamheden (controleren rechtstreeks of saldi en transacties correct zijn — bijvoorbeeld klantsaldi rechtstreeks bij hen bevestigen). Hoe betrouwbaarder de interne beheersing, hoe minder gegevensgerichte werkzaamheden nodig zijn.",
        },
        flashcard: {
          front: { pt: "Qual a diferença entre teste de controlo e teste substantivo?", en: "What's the difference between a test of controls and a substantive test?", nl: "Wat is het verschil tussen een systeemgerichte en een gegevensgerichte werkzaamheid?" },
          back: { pt: "O teste de controlo verifica se um processo funciona como desenhado; o teste substantivo verifica diretamente se um saldo ou transação está correto.", en: "A test of controls checks if a process works as designed; a substantive test directly checks if a balance or transaction is correct.", nl: "Een systeemgerichte werkzaamheid toetst of een proces werkt zoals bedoeld; een gegevensgerichte werkzaamheid toetst rechtstreeks of een saldo of transactie klopt." },
        },
        quizzes: [
          {
            q: { pt: "Se os controlos internos de uma empresa são muito fiáveis, o que tende a acontecer?", en: "If a company's internal controls are very reliable, what tends to happen?", nl: "Als de interne beheersing van een bedrijf zeer betrouwbaar is, wat gebeurt er dan doorgaans?" },
            options: [
              { pt: "São necessários menos testes substantivos", en: "Fewer substantive tests are needed", nl: "Er zijn minder gegevensgerichte werkzaamheden nodig" },
              { pt: "São necessários mais testes substantivos", en: "More substantive tests are needed", nl: "Er zijn meer gegevensgerichte werkzaamheden nodig" },
              { pt: "A auditoria deixa de ser necessária", en: "The audit is no longer necessary", nl: "De audit is niet meer nodig" },
            ], answer: 0,
            explain: {
              pt: "É precisamente essa relação inversa que torna a avaliação do controlo interno tão valiosa — controlos fortes reduzem o esforço de auditoria necessário.",
              en: "It's precisely this inverse relationship that makes evaluating internal control so valuable — strong controls reduce the audit effort needed.",
              nl: "Juist deze omgekeerde relatie maakt het beoordelen van interne beheersing zo waardevol — sterke controls verminderen de benodigde controle-inspanning.",
            },
          },
          {
            q: { pt: "Confirmar saldos de clientes diretamente com eles é um exemplo de que tipo de teste?", en: "Confirming customer balances directly with them is an example of which type of test?", nl: "Klantsaldi rechtstreeks bij hen bevestigen is een voorbeeld van welk type werkzaamheid?" },
            options: [
              { pt: "Teste substantivo", en: "Substantive test", nl: "Gegevensgerichte werkzaamheid" },
              { pt: "Teste de controlo", en: "Test of controls", nl: "Systeemgerichte werkzaamheid" },
              { pt: "Nenhum dos dois — não é evidência válida", en: "Neither — it's not valid evidence", nl: "Geen van beide — geen geldige controle-informatie" },
            ], answer: 0,
            explain: {
              pt: "É evidência direta sobre o saldo em si, obtida de uma fonte externa independente — a definição clássica de teste substantivo.",
              en: "It's direct evidence about the balance itself, obtained from an independent external source — the classic definition of a substantive test.",
              nl: "Het is directe informatie over het saldo zelf, verkregen van een onafhankelijke externe bron — de klassieke definitie van een gegevensgerichte werkzaamheid.",
            },
          },
        ],
      },
      {
        title: { pt: "AML, KYC e UBO", en: "AML, KYC & UBO", nl: "AML, KYC en UBO" },
        theory: {
          pt: "As regras de combate ao branqueamento de capitais ('AML', Anti-Money Laundering) obrigam profissionais financeiros — incluindo contabilistas — a identificar e verificar a identidade dos seus clientes antes de iniciar uma relação de negócio: é o processo de 'KYC' (Know Your Customer). Isto inclui confirmar quem são os beneficiários efetivos finais ('UBO', Ultimate Beneficial Owner) de uma empresa — ou seja, as pessoas singulares que, direta ou indiretamente, detêm mais de 25% do capital ou controlo. Os Países Baixos mantêm um registo UBO na KvK, onde as empresas são obrigadas a declarar essa informação. Sinais de alerta ('red flags') que obrigam a diligência reforçada incluem: estruturas societárias excessivamente complexas sem razão económica aparente, clientes relutantes em identificar o UBO real, ou transações sem lógica comercial evidente. A não deteção ou não reporte de suspeitas de branqueamento pode gerar responsabilidade pessoal do próprio profissional.",
          en: "Anti-Money Laundering ('AML') rules require financial professionals — including accountants — to identify and verify their clients' identity before starting a business relationship: this is the 'KYC' (Know Your Customer) process. This includes confirming who the ultimate beneficial owners ('UBO') of a company are — the natural persons who, directly or indirectly, hold more than 25% of the capital or control. The Netherlands maintains a UBO register at the KvK, where companies are required to declare this information. Red flags requiring enhanced due diligence include: excessively complex corporate structures with no apparent economic rationale, clients reluctant to identify the real UBO, or transactions with no evident commercial logic. Failing to detect or report suspected money laundering can create personal liability for the professional themselves.",
          nl: "Anti-witwasregels (AML) verplichten financiële professionals — waaronder accountants — om de identiteit van hun cliënten vast te stellen en te verifiëren vóór het aangaan van een zakelijke relatie: het KYC-proces (Know Your Customer). Dit omvat het vaststellen van de uiteindelijk belanghebbenden (UBO) van een onderneming — de natuurlijke personen die direct of indirect meer dan 25% van het kapitaal of de zeggenschap houden. Nederland houdt een UBO-register aan bij de KvK, waar bedrijven verplicht zijn deze informatie te melden. Waarschuwingssignalen die verscherpt cliëntenonderzoek vereisen zijn onder meer: buitensporig complexe concernstructuren zonder duidelijke economische reden, cliënten die terughoudend zijn de echte UBO te identificeren, of transacties zonder duidelijke zakelijke logica. Het niet signaleren of melden van vermoedelijk witwassen kan persoonlijke aansprakelijkheid van de professional zelf meebrengen.",
        },
        flashcard: {
          front: { pt: "Que percentagem de participação define, em regra, um UBO?", en: "What percentage holding generally defines a UBO?", nl: "Welk belangpercentage bepaalt doorgaans een UBO?" },
          back: { pt: "Mais de 25% do capital ou controlo, direta ou indiretamente.", en: "More than 25% of the capital or control, directly or indirectly.", nl: "Meer dan 25% van het kapitaal of de zeggenschap, direct of indirect." },
        },
        quizzes: [
          {
            q: { pt: "O que significa 'KYC'?", en: "What does 'KYC' stand for?", nl: "Wat betekent KYC?" },
            options: [
              { pt: "Know Your Customer — conhecer e verificar a identidade do cliente", en: "Know Your Customer — knowing and verifying the client's identity", nl: "Know Your Customer — de identiteit van de cliënt kennen en verifiëren" },
              { pt: "Keep Your Cash — guardar dinheiro em segurança", en: "Keep Your Cash — keeping money safe", nl: "Keep Your Cash — geld veilig bewaren" },
              { pt: "Key Yearly Compliance — relatório anual de conformidade", en: "Key Yearly Compliance — an annual compliance report", nl: "Key Yearly Compliance — een jaarlijks nalevingsrapport" },
            ], answer: 0,
            explain: {
              pt: "É o processo que precede qualquer relação de negócio: confirmar quem é realmente o cliente antes de aceitar trabalhar com ele.",
              en: "It's the process that precedes any business relationship: confirming who the client really is before agreeing to work with them.",
              nl: "Het is het proces vóór elke zakelijke relatie: vaststellen wie de cliënt werkelijk is voordat je ermee instemt samen te werken.",
            },
          },
          {
            q: { pt: "Qual destes é um sinal de alerta ('red flag') típico em AML?", en: "Which of these is a typical AML 'red flag'?", nl: "Wat is een typisch AML-waarschuwingssignaal?" },
            options: [
              { pt: "Estrutura societária muito complexa, sem razão económica aparente", en: "A very complex corporate structure with no apparent economic rationale", nl: "Een zeer complexe concernstructuur zonder duidelijke economische reden" },
              { pt: "Um cliente que responde rapidamente a pedidos de documentação", en: "A client who responds quickly to documentation requests", nl: "Een cliënt die snel reageert op verzoeken om documentatie" },
              { pt: "Uma empresa com poucos anos de existência", en: "A company that's only a few years old", nl: "Een bedrijf dat pas een paar jaar bestaat" },
            ], answer: 0,
            explain: {
              pt: "Complexidade sem justificação económica é um dos sinais clássicos de possível ocultação de titularidade real ou de origem de fundos.",
              en: "Complexity without economic justification is one of the classic signs of possible concealment of real ownership or the source of funds.",
              nl: "Complexiteit zonder economische rechtvaardiging is een van de klassieke signalen van mogelijke verhulling van werkelijk eigendom of herkomst van middelen.",
            },
          },
        ],
      },
    ],
  },
];

const CAREER_LEVELS = [
  { key: "intern", pt: "Intern", en: "Intern", nl: "Stagiair", req: { pt: "Onboarding + módulo básico de BTW", en: "Onboarding + basic BTW module", nl: "Onboarding + basismodule BTW" } },
  { key: "junior", pt: "Junior Accountant", en: "Junior Accountant", nl: "Junior Accountant", req: { pt: "Nível 5 · BTW e Payroll completos", en: "Level 5 · BTW & Payroll complete", nl: "Niveau 5 · BTW & Payroll voltooid" } },
  { key: "assistant", pt: "Assistant Accountant", en: "Assistant Accountant", nl: "Assistant Accountant", req: { pt: "Nível 10 · Fundamentos e formas jurídicas completos", en: "Level 10 · Foundations & legal forms complete", nl: "Niveau 10 · Basis & rechtsvormen voltooid" } },
  { key: "gl", pt: "GL Accountant", en: "GL Accountant", nl: "Grootboek Accountant", req: { pt: "Nível 16 · 10 tarefas do Modo Empresa concluídas", en: "Level 16 · 10 Company Mode tasks completed", nl: "Niveau 16 · 10 taken in Bedrijfsmodus voltooid" } },
  { key: "financial", pt: "Financial Accountant", en: "Financial Accountant", nl: "Financial Accountant", req: { pt: "Nível 22 · Dutch GAAP completo", en: "Level 22 · Dutch GAAP complete", nl: "Niveau 22 · Nederlandse GAAP voltooid" } },
  { key: "senior", pt: "Senior Accountant", en: "Senior Accountant", nl: "Senior Accountant", req: { pt: "Nível 30 · 5 month-end closes", en: "Level 30 · 5 month-end closes", nl: "Niveau 30 · 5 maandafsluitingen" } },
  { key: "controller", pt: "Financial Controller", en: "Financial Controller", nl: "Financial Controller", req: { pt: "Nível 38 · 1 year-end close + Auditoria completo", en: "Level 38 · 1 year-end close + Audit complete", nl: "Niveau 38 · 1 jaarafsluiting + Audit voltooid" } },
  { key: "manager", pt: "Finance Manager", en: "Finance Manager", nl: "Finance Manager", req: { pt: "Nível 46 · Gestão de equipa simulada", en: "Level 46 · Simulated team management", nl: "Niveau 46 · Gesimuleerd teammanagement" } },
  { key: "director", pt: "Finance Director", en: "Finance Director", nl: "Finance Director", req: { pt: "Nível 55 · Todos os módulos fiscais completos", en: "Level 55 · All tax modules complete", nl: "Niveau 55 · Alle fiscale modules voltooid" } },
  { key: "cfo", pt: "CFO", en: "CFO", nl: "CFO", req: { pt: "Nível 65 · Certificação total da plataforma", en: "Level 65 · Full platform certification", nl: "Niveau 65 · Volledige platformcertificering" } },
];

const COMPANY_TASKS = [
  {
    id: "t1", icon: FileText, xp: 25, status: "done",
    title: { pt: "Registar 12 faturas de venda", en: "Register 12 sales invoices", nl: "12 verkoopfacturen registreren" },
    brief: {
      pt: "Lança as 12 faturas de venda de julho no verkoopboek. Cada uma gera sempre três linhas.\n\nEXEMPLO CONCRETO — fatura de €1.000 + 21% BTW a um cliente holandês:\n• Debet Debiteuren ......... €1.210\n• Credit Omzet ............. €1.000\n• Credit Te betalen omzetbelasting ... €210\n(1.210 = 1.000 + 21% de 1.000. O total a debet tem sempre de bater certo com a soma dos dois créditos.)\n\nATENÇÃO — 2 das 12 faturas são para clientes belgas com número de BTW válido. Nessas, a lógica muda:\n• Debet Debiteuren ......... €1.000 (o valor total é igual ao líquido, sem BTW)\n• Credit Omzet .............. €1.000\n(Não há linha de BTW — a fatura sai com a menção 'BTW verlegd' e entra na declaração ICP, não na declaração de BTW normal.)",
      en: "Post July's 12 sales invoices in the verkoopboek. Each always produces three lines.\n\nCONCRETE EXAMPLE — a €1,000 + 21% VAT invoice to a Dutch customer:\n• Debet Debiteuren ......... €1,210\n• Credit Omzet .............. €1,000\n• Credit Te betalen omzetbelasting ... €210\n(1,210 = 1,000 + 21% of 1,000. The debit total must always match the sum of the two credits.)\n\nWATCH OUT — 2 of the 12 invoices are to Belgian customers with a valid VAT number. For those, the logic changes:\n• Debet Debiteuren ......... €1,000 (total equals net, no VAT)\n• Credit Omzet .............. €1,000\n(No VAT line — the invoice is marked 'BTW verlegd' and goes into the ICP listing, not the regular VAT return.)",
      nl: "Boek de 12 verkoopfacturen van juli in het verkoopboek. Elke factuur geeft altijd drie regels.\n\nCONCREET VOORBEELD — factuur van €1.000 + 21% BTW aan een Nederlandse klant:\n• Debet Debiteuren ......... €1.210\n• Credit Omzet .............. €1.000\n• Credit Te betalen omzetbelasting ... €210\n(1.210 = 1.000 + 21% van 1.000. Het debetbedrag moet altijd overeenkomen met de som van de twee creditposten.)\n\nLET OP — 2 van de 12 facturen zijn aan Belgische afnemers met geldig btw-nummer. Daar verandert de logica:\n• Debet Debiteuren ......... €1.000 (totaal is gelijk aan netto, geen BTW)\n• Credit Omzet .............. €1.000\n(Geen BTW-regel — de factuur krijgt de vermelding 'BTW verlegd' en hoort in de opgaaf ICP, niet in de gewone BTW-aangifte.)",
    },
  },
  {
    id: "t2", icon: Calculator, xp: 40, status: "done",
    title: { pt: "Calcular BTW do trimestre", en: "Calculate quarterly BTW", nl: "Kwartaal-BTW berekenen" },
    brief: {
      pt: "Apura a BTW do 2.º trimestre: soma a BTW liquidada nas vendas (21% e 9%), subtrai a voorbelasting das compras e verifica se o saldo bate certo com as contas do grootboek. Confirma ainda se há prestações intracomunitárias a declarar na ICP. Prazo de entrega e pagamento: 31 de julho.",
      en: "Work out Q2 VAT: total the output VAT on sales (21% and 9%), deduct input VAT on purchases, and check the balance ties to the ledger accounts. Also confirm whether there are intra-EU supplies to report in the ICP listing. Filing and payment deadline: 31 July.",
      nl: "Bereken de BTW over Q2: tel de af te dragen BTW over verkopen (21% en 9%), trek de voorbelasting op inkopen af, en controleer of het saldo aansluit op het grootboek. Ga ook na of er intracommunautaire prestaties in de opgaaf ICP horen. Uiterste indien- en betaaldatum: 31 juli.",
    },
  },
  {
    id: "t3", icon: Banknote, xp: 30, status: "pending",
    title: { pt: "Reconciliação bancária — conta corrente", en: "Bank reconciliation — current account", nl: "Bankreconciliatie — rekening-courant" },
    brief: {
      pt: "Concilia o extrato bancário de julho com a conta de banco no grootboek. Faz o matching dos recebimentos com as faturas em aberto em Debiteuren e dos pagamentos com Crediteuren. Há três movimentos que não correspondem a nenhuma fatura: identifica-os e lança-os no memoriaal com a contrapartida correta.",
      en: "Reconcile July's bank statement against the bank account in the ledger. Match receipts to open invoices in Debiteuren and payments to Crediteuren. Three movements don't correspond to any invoice: identify them and post them in the memoriaal with the correct counter-account.",
      nl: "Sluit het bankafschrift van juli aan op de bankrekening in het grootboek. Match ontvangsten met openstaande facturen in Debiteuren en betalingen met Crediteuren. Drie mutaties horen bij geen enkele factuur: zoek ze op en boek ze in het memoriaal met de juiste tegenrekening.",
    },
  },
  {
    id: "t4", icon: Wallet, xp: 45, status: "pending",
    title: { pt: "Processar payroll de julho", en: "Process July payroll", nl: "Loonadministratie juli verwerken" },
    brief: {
      pt: "Processa os salários de julho para os 8 trabalhadores. Calcula a loonheffing com base nas tabelas mensais, aplica a regra dos 30% aos dois trabalhadores estrangeiros elegíveis, e não te esqueças do vakantiegeld acumulado (8%). Lança a folha no memoriaal: debet custos com pessoal, credit líquidos a pagar e retenções a entregar.",
      en: "Run July's payroll for the 8 employees. Calculate loonheffing from the monthly tables, apply the 30% ruling to the two eligible foreign employees, and don't forget accrued vakantiegeld (8%). Post the payroll in the memoriaal: debet staff costs, credit net pay due and withholdings payable.",
      nl: "Verwerk de loonadministratie van juli voor de 8 werknemers. Bereken de loonheffing volgens de maandtabellen, pas de 30%-regeling toe bij de twee in aanmerking komende buitenlandse werknemers, en vergeet het opgebouwde vakantiegeld (8%) niet. Boek de loonjournaalpost in het memoriaal: debet personeelskosten, credit nettoloon en af te dragen inhoudingen.",
    },
  },
  {
    id: "t5", icon: ClipboardList, xp: 60, status: "locked",
    title: { pt: "Month-end close — acréscimos e diferimentos", en: "Month-end close — accruals & deferrals", nl: "Maandafsluiting — overlopende posten" },
    brief: {
      pt: "Fecha o mês de julho: lança as depreciações do período, regista os acréscimos de custos ainda não faturados (energia, seguros), difere as receitas faturadas relativas a agosto, e produz a kolommenbalans final. Verifica se alguma conta ficou com saldo anómalo antes de dar o mês por encerrado.",
      en: "Close July: post the period's depreciation, record accrued costs not yet invoiced (utilities, insurance), defer revenue invoiced but relating to August, and produce the final kolommenbalans. Check whether any account is left with an odd balance before signing the month off.",
      nl: "Sluit juli af: boek de afschrijvingen van de periode, verwerk nog niet gefactureerde kosten (energie, verzekeringen), schuif gefactureerde opbrengsten die op augustus zien door, en stel de definitieve kolommenbalans op. Controleer op afwijkende saldi voordat je de maand afsluit.",
    },
  },
  {
    id: "t6", icon: Building, xp: 80, status: "locked",
    title: { pt: "Preparar declaração de Corporate Tax", en: "Prepare Corporate Tax return", nl: "Aangifte vennootschapsbelasting voorbereiden" },
    brief: {
      pt: "Parte do resultado comercial do exercício e chega ao lucro tributável: acrescenta os custos não dedutíveis, retira os proveitos isentos pela participation exemption, ajusta as diferenças de depreciação face aos limites fiscais e aplica os prejuízos reportáveis dentro do limite. Calcula o Vpb devido (19% até €200.000, 25,8% acima) e reconcilia com os impostos diferidos.",
      en: "Start from the year's commercial result and work through to taxable profit: add back non-deductible costs, remove income exempt under the participation exemption, adjust depreciation differences against the tax limits, and apply carried-forward losses within the cap. Calculate the Vpb due (19% up to €200,000, 25.8% above) and reconcile with deferred tax.",
      nl: "Ga uit van het commerciële resultaat en werk toe naar de fiscale winst: tel niet-aftrekbare kosten bij, haal de door de deelnemingsvrijstelling vrijgestelde baten eruit, corrigeer afschrijvingsverschillen tegen de fiscale grenzen, en verreken compensabele verliezen binnen de grens. Bereken de verschuldigde Vpb (19% tot €200.000, 25,8% daarboven) en sluit aan op de latenties.",
    },
  },
];

const MISSIONS = {
  daily: [
    { title: { pt: "Rever 15 flashcards", en: "Review 15 flashcards", nl: "15 flashcards herzien" }, progress: 9, total: 15, xp: 15, coins: 5 },
    { title: { pt: "Completar 1 tarefa do Modo Empresa", en: "Complete 1 Company Mode task", nl: "1 taak in Bedrijfsmodus voltooien" }, progress: 1, total: 1, xp: 20, coins: 8 },
  ],
  weekly: [
    { title: { pt: "Terminar um módulo completo", en: "Finish a full module", nl: "Een volledige module afronden" }, progress: 2, total: 4, xp: 100, coins: 40 },
    { title: { pt: "Atingir 90% num quiz", en: "Score 90% on a quiz", nl: "90% scoren op een quiz" }, progress: 0, total: 1, xp: 60, coins: 20 },
  ],
  monthly: [
    { title: { pt: "Subir um nível de carreira", en: "Advance one career level", nl: "Eén carrièreniveau stijgen" }, progress: 0, total: 1, xp: 300, coins: 120 },
    { title: { pt: "Completar um fecho de mês inteiro", en: "Complete a full month-end close", nl: "Een volledige maandafsluiting voltooien" }, progress: 0, total: 1, xp: 250, coins: 100 },
  ],
};

/* ============================================================
   PROGRESS ENGINE
   O progresso é guardado no navegador (localStorage) e sobrevive
   a recargas e a fechar o separador. É por dispositivo: para
   sincronizar entre telemóvel e computador é preciso backend.
   ============================================================ */

const STORAGE_KEY = "daa-progress-v1";

const EMPTY_PROGRESS = {
  xp: 0,
  coins: 0,
  streak: 0,
  lastActive: null,
  lessons: [],      // ["btw-0", ...]
  tasks: {},        // { t3: "done" }
  flashcards: 0,    // cartões virados
  perfect: 0,       // quizzes certos à primeira
};

const BADGES = [
  { key: "firstlesson", label: { pt: "PRIMEIRA LIÇÃO", en: "FIRST LESSON", nl: "EERSTE LES" },
    hint: { pt: "Conclui a tua primeira lição", en: "Complete your first lesson", nl: "Rond je eerste les af" } },
  { key: "streak7", label: { pt: "7 DIAS SEGUIDOS", en: "7-DAY STREAK", nl: "7 DAGEN OP RIJ" },
    hint: { pt: "Usa a plataforma 7 dias seguidos", en: "Use the platform 7 days in a row", nl: "Gebruik 7 dagen op rij" } },
  { key: "perfectquiz", label: { pt: "QUIZ PERFEITO", en: "PERFECT QUIZ", nl: "PERFECTE QUIZ" },
    hint: { pt: "Acerta um quiz à primeira tentativa", en: "Ace a quiz on the first try", nl: "Quiz in één keer goed" } },
  { key: "btw", label: { pt: "MESTRE DO BTW", en: "BTW MASTER", nl: "BTW-MEESTER" },
    hint: { pt: "Termina o módulo de BTW", en: "Finish the BTW module", nl: "Rond de BTW-module af" } },
  { key: "payroll", label: { pt: "PAYROLL PRO", en: "PAYROLL PRO", nl: "PAYROLL PRO" },
    hint: { pt: "Termina o módulo de Payroll", en: "Finish the Payroll module", nl: "Rond de Payroll-module af" } },
  { key: "firsttask", label: { pt: "PRIMEIRA TAREFA", en: "FIRST TASK", nl: "EERSTE TAAK" },
    hint: { pt: "Conclui uma tarefa do Modo Empresa", en: "Complete a Company Mode task", nl: "Rond een bedrijfstaak af" } },
  { key: "monthclose", label: { pt: "FECHO DE MÊS", en: "MONTH-END CLOSE", nl: "MAANDAFSLUITING" },
    hint: { pt: "Conclui um month-end close", en: "Complete a month-end close", nl: "Rond een maandafsluiting af" } },
  { key: "junior", label: { pt: "JUNIOR ACCOUNTANT", en: "JUNIOR ACCOUNTANT", nl: "JUNIOR ACCOUNTANT" },
    hint: { pt: "Atinge o nível de carreira Junior", en: "Reach Junior career level", nl: "Bereik carrièreniveau Junior" } },
  { key: "allcourses", label: { pt: "CURRÍCULO COMPLETO", en: "FULL CURRICULUM", nl: "VOLLEDIG CURRICULUM" },
    hint: { pt: "Termina todos os módulos", en: "Finish every module", nl: "Rond alle modules af" } },
  { key: "cfo", label: { pt: "RUMO A CFO", en: "ROAD TO CFO", nl: "OP WEG NAAR CFO" },
    hint: { pt: "Alcança o cargo de CFO", en: "Reach the CFO role", nl: "Bereik de CFO-rol" } },
];

const CAREER_MIN_LEVEL = [1, 5, 10, 16, 22, 30, 38, 46, 55, 65];
const TASK_MIN_LEVEL = { t1: 1, t2: 1, t3: 1, t4: 1, t5: 3, t6: 5 };

const XP_PER_LESSON = 20;
const COINS_PER_LESSON = 5;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadProgress() {
  let base = { ...EMPTY_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) base = { ...base, ...JSON.parse(raw) };
  } catch (e) {
    // localStorage indisponível (modo privado, sandbox) — segue em memória
  }
  // atualiza a sequência de dias
  const today = todayKey();
  if (base.lastActive !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    base.streak = base.lastActive === yesterday ? base.streak + 1 : 1;
    base.lastActive = today;
  }
  return base;
}

function persistProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // silencioso: o progresso continua a funcionar durante a sessão
  }
}

/**
 * Junta o progresso local com o do servidor sem nunca perder nada:
 * listas (lições, tarefas) são unidas; contadores (XP, sequência, etc.)
 * ficam com o valor mais alto dos dois lados. Isto garante que fazer
 * login/registo nunca apaga progresso feito entretanto sem sessão.
 */
function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;

  const lessons = Array.from(new Set([...(a.lessons || []), ...(b.lessons || [])]));

  const tasks = { ...(a.tasks || {}) };
  Object.entries(b.tasks || {}).forEach(([id, status]) => {
    if (status === "done") tasks[id] = "done";
  });

  return {
    xp: Math.max(a.xp || 0, b.xp || 0),
    coins: Math.max(a.coins || 0, b.coins || 0),
    streak: Math.max(a.streak || 0, b.streak || 0),
    lastActive: (a.lastActive || "") > (b.lastActive || "") ? a.lastActive : b.lastActive,
    flashcards: Math.max(a.flashcards || 0, b.flashcards || 0),
    perfect: Math.max(a.perfect || 0, b.perfect || 0),
    lessons,
    tasks,
  };
}

function levelFromXP(xp) {
  return 1 + Math.floor(Math.pow(Math.max(0, xp) / 100, 2 / 3));
}

function careerIndexFromLevel(level) {
  let idx = 0;
  CAREER_MIN_LEVEL.forEach((min, i) => {
    if (level >= min) idx = i;
  });
  return idx;
}

function moduleIsComplete(course, lessons) {
  return course.lessons.every((_, i) => lessons.includes(`${course.id}-${i}`));
}

/* ============================================================
   PRIMITIVES
   ============================================================ */
function Stamp({ label, color, earned, size = "md", pal }) {
  const dims = size === "lg" ? { w: 128, h: 128, fs: 11 } : size === "sm" ? { w: 72, h: 72, fs: 8 } : { w: 96, h: 96, fs: 9.5 };
  const stampColor = color || pal.stampRed;
  return (
    <div style={{
      width: dims.w, height: dims.h, borderRadius: "50%",
      border: `3px solid ${earned ? stampColor : pal.muted}`,
      boxShadow: earned ? `0 0 0 3px ${pal.panel}, 0 0 0 4px ${stampColor}55` : "none",
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
      transform: earned ? "rotate(-7deg)" : "rotate(-4deg)", opacity: earned ? 1 : 0.35,
      color: earned ? stampColor : pal.muted, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
      fontSize: dims.fs, letterSpacing: "0.06em", textTransform: "uppercase", padding: 8, lineHeight: 1.25,
      flexShrink: 0, filter: earned ? "none" : "grayscale(1)",
    }}>{label}</div>
  );
}

function LedgerPanel({ children, pal, style, className = "" }) {
  return (
    <div style={{
      background: pal.panel, border: `1px solid ${pal.border}`, borderRadius: 6,
      backgroundImage: `repeating-linear-gradient(${pal.panel}, ${pal.panel} 27px, ${pal.ledgerLine}55 28px)`,
      ...style,
    }} className={`p-4 sm:p-5 ${className}`}>{children}</div>
  );
}

function XPBar({ value, max, pal }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: pal.bgAlt, border: `1px solid ${pal.border}` }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pal.orange }} />
    </div>
  );
}

function SectionEyebrow({ children, pal }) {
  return (
    <div className="text-xs font-semibold tracking-widest uppercase mb-2"
      style={{ color: pal.orange, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.12em" }}>
      {children}
    </div>
  );
}

/* ============================================================
   PAGES
   ============================================================ */
function DashboardPage({ t, pal, lang, progress, level, careerIndex, missions, onContinue }) {
  const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
  const nextCourse = COURSES.find((c) => !moduleIsComplete(c, progress.lessons)) || COURSES[0];
  const nextLessonIdx = nextCourse.lessons.findIndex((_, i) => !progress.lessons.includes(`${nextCourse.id}-${i}`));
  const doneLessons = progress.lessons.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{t.dashboard_title}</h1>
        <p className="text-sm mt-1" style={{ color: pal.muted }}>{t.dashboard_sub}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: t.level, value: String(level), icon: TrendingUp }, { label: t.xp, value: String(progress.xp), icon: Award },
          { label: t.streak, value: String(progress.streak), icon: Flame }, { label: t.coins, value: String(progress.coins), icon: Coins }].map((s, i) => (
          <LedgerPanel key={i} pal={pal}>
            <div className="flex items-center gap-2 mb-1" style={{ color: pal.muted }}>
              <s.icon size={15} /><span className="text-xs uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
            </div>
            <div className="text-2xl font-semibold" style={{ color: pal.ink, fontFamily: "'IBM Plex Mono', monospace" }}>{s.value}</div>
          </LedgerPanel>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <LedgerPanel pal={pal}>
            <SectionEyebrow pal={pal}>{t.continue_learning}</SectionEyebrow>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium" style={{ color: pal.ink }}>{nextCourse.title[lang]}</div>
                <div className="text-xs mt-1" style={{ color: pal.muted }}>
                  {nextLessonIdx >= 0 ? nextCourse.lessons[nextLessonIdx].title[lang] : nextCourse.lessons[0].title[lang]}
                </div>
              </div>
              <button
                onClick={() => onContinue(nextCourse.id, nextLessonIdx >= 0 ? nextLessonIdx : 0)}
                className="px-4 py-2 rounded-md text-sm font-medium self-start sm:self-auto shrink-0"
                style={{ background: pal.orange, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.continue} <ChevronRight size={14} className="inline -mt-0.5" />
              </button>
            </div>
            <div className="mt-3"><XPBar value={doneLessons} max={totalLessons} pal={pal} /></div>
            <div className="text-xs mt-1.5" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
              {doneLessons}/{totalLessons} {t.of_lessons}
            </div>
          </LedgerPanel>
          <LedgerPanel pal={pal}>
            <SectionEyebrow pal={pal}>{t.career_progress}</SectionEyebrow>
            <div className="flex items-center gap-4">
              <Stamp label={CAREER_LEVELS[careerIndex][lang]} color={pal.orange} earned size="sm" pal={pal} />
              <div className="text-sm" style={{ color: pal.inkSoft }}>{CAREER_LEVELS[careerIndex].req[lang]}</div>
            </div>
          </LedgerPanel>
        </div>
        <LedgerPanel pal={pal}>
          <SectionEyebrow pal={pal}>{t.todays_missions}</SectionEyebrow>
          <div className="space-y-3">
            {missions.daily.map((m, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1" style={{ color: pal.ink }}>
                  <span>{m.title[lang]}</span><span style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{m.progress}/{m.total}</span>
                </div>
                <XPBar value={m.progress} max={m.total} pal={pal} />
              </div>
            ))}
          </div>
        </LedgerPanel>
      </div>
    </div>
  );
}

function FlashcardWidget({ card, lang, t, pal, onFlip }) {
  const [flipped, setFlipped] = useState(false);
  const [counted, setCounted] = useState(false);
  const flip = () => {
    if (!flipped && !counted && onFlip) { onFlip(); setCounted(true); }
    setFlipped((f) => !f);
  };
  return (
    <div>
      <SectionEyebrow pal={pal}>{t.flashcards}</SectionEyebrow>
      <div onClick={flip}
        className="cursor-pointer rounded-lg p-6 min-h-[110px] flex items-center justify-center text-center transition-all select-none"
        style={{ background: flipped ? pal.orangeSoft : pal.bgAlt, border: `1px dashed ${pal.border}`, color: pal.ink }}>
        <span className="text-sm">{flipped ? card.back[lang] : card.front[lang]}</span>
      </div>
      <button onClick={flip} className="mt-2 text-xs font-medium uppercase tracking-wide"
        style={{ color: pal.orange, fontFamily: "'Space Grotesk', sans-serif" }}>{t.flip} ↻</button>
    </div>
  );
}

function QuizWidget({ quizzes, lang, t, pal, onCorrect, alreadyDone }) {
  const list = Array.isArray(quizzes) ? quizzes : [quizzes];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const quiz = list[index];
  const isLast = index === list.length - 1;
  const opts = quiz.options.map((o) => (typeof o === "string" ? o : o[lang]));

  const goNext = () => {
    setIndex((i) => Math.min(i + 1, list.length - 1));
    setSelected(null);
    setChecked(false);
    setAttempts(0);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <SectionEyebrow pal={pal}>{t.quiz}</SectionEyebrow>
        {list.length > 1 && (
          <span className="text-xs" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
            {index + 1}/{list.length}
          </span>
        )}
      </div>
      <div className="text-sm mb-3" style={{ color: pal.ink }}>{quiz.q[lang]}</div>
      <div className="space-y-2">
        {opts.map((opt, i) => {
          const isSelected = selected === i;
          const isAnswer = i === quiz.answer;
          let borderColor = pal.border;
          if (checked && isSelected) borderColor = isAnswer ? pal.green : pal.stampRed;
          return (
            <button key={i} onClick={() => { setSelected(i); setChecked(false); }}
              className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors"
              style={{ border: `1.5px solid ${borderColor}`, background: isSelected ? pal.bgAlt : "transparent", color: pal.ink }}>
              {opt}
              {checked && isSelected && (isAnswer ? <Check size={15} style={{ color: pal.green }} /> : <X size={15} style={{ color: pal.stampRed }} />)}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button disabled={selected === null}
          onClick={() => {
            setChecked(true);
            setAttempts((a) => a + 1);
            if (selected === quiz.answer && isLast && onCorrect) onCorrect(attempts === 0);
          }}
          className="px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-40"
          style={{ background: pal.ink, color: pal.panel, fontFamily: "'Space Grotesk', sans-serif" }}>
          {t.check_answer}
        </button>
        {checked && selected === quiz.answer && !isLast && (
          <button onClick={goNext}
            className="px-4 py-1.5 rounded-md text-sm font-medium"
            style={{ background: pal.orange, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.next_exercise}
          </button>
        )}
      </div>
      {checked && (
        <div className="mt-2 text-xs font-medium" style={{ color: selected === quiz.answer ? pal.green : pal.stampRed }}>
          {selected === quiz.answer ? t.correct : t.incorrect}
        </div>
      )}
      {checked && quiz.explain && (
        <div className="mt-2 text-xs leading-relaxed px-3 py-2 rounded-md"
          style={{ background: pal.bgAlt, color: pal.inkSoft, borderLeft: `2px solid ${pal.orange}` }}>
          {quiz.explain[lang]}
        </div>
      )}
      {alreadyDone && !checked && (
        <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: pal.green }}>
          <CheckCircle2 size={13} /> {t.mark_done}
        </div>
      )}
    </div>
  );
}

function CoursesPage({ t, pal, lang, progress, onLessonComplete, onFlashcard, pendingTarget, onConsumePending }) {
  const [openCourse, setOpenCourse] = useState(pendingTarget?.courseId || COURSES[0].id);
  const [selectedLesson, setSelectedLesson] = useState({
    [pendingTarget?.courseId || COURSES[0].id]: pendingTarget?.lessonIdx || 0,
  });
  const completed = useMemo(() => new Set(progress.lessons), [progress.lessons]);

  useEffect(() => {
    if (!pendingTarget) return;
    setOpenCourse(pendingTarget.courseId);
    setSelectedLesson((prev) => ({ ...prev, [pendingTarget.courseId]: pendingTarget.lessonIdx }));
    onConsumePending();
  }, [pendingTarget]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{t.courses_title}</h1>
        <p className="text-sm mt-1" style={{ color: pal.muted }}>{t.courses_sub}</p>
      </div>

      <div className="space-y-4">
        {COURSES.map((c) => {
          const isOpen = openCourse === c.id;
          const Icon = c.icon;
          const doneCount = c.lessons.filter((_, i) => completed.has(`${c.id}-${i}`)).length;
          const progressPct = Math.round((doneCount / c.lessons.length) * 100);
          const lessonIdx = selectedLesson[c.id] ?? 0;
          const activeLesson = c.lessons[lessonIdx];
          const isLessonDone = completed.has(`${c.id}-${lessonIdx}`);

          return (
            <LedgerPanel key={c.id} pal={pal}>
              <button className="w-full flex items-center justify-between" onClick={() => setOpenCourse(isOpen ? null : c.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: pal.bgAlt, color: pal.orange }}>
                    <Icon size={17} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium" style={{ color: pal.ink }}>{c.title[lang]}</div>
                    <div className="text-xs mt-0.5" style={{ color: pal.muted }}>{progressPct}% · {doneCount}/{c.lessons.length} {t.of_lessons}</div>
                  </div>
                </div>
                {isOpen ? <ChevronDown size={18} style={{ color: pal.muted }} /> : <ChevronRight size={18} style={{ color: pal.muted }} />}
              </button>
              <div className="mt-3"><XPBar value={doneCount} max={c.lessons.length} pal={pal} /></div>

              {isOpen && (
                <div className="mt-5 pt-5 grid md:grid-cols-3 gap-6" style={{ borderTop: `1px solid ${pal.border}` }}>
                  {/* Lesson list */}
                  <div className="space-y-1.5">
                    <SectionEyebrow pal={pal}>{t.lessons}</SectionEyebrow>
                    {c.lessons.map((l, i) => {
                      const done = completed.has(`${c.id}-${i}`);
                      const active = lessonIdx === i;
                      return (
                        <button key={i}
                          onClick={() => setSelectedLesson((prev) => ({ ...prev, [c.id]: i }))}
                          className="w-full flex items-center gap-2 text-left text-sm px-2.5 py-2 rounded-md transition-colors"
                          style={{ background: active ? pal.bgAlt : "transparent", color: done ? pal.ink : pal.inkSoft }}>
                          {done ? <CheckCircle2 size={15} style={{ color: pal.green, flexShrink: 0 }} /> : <Circle size={15} style={{ color: pal.muted, flexShrink: 0 }} />}
                          <span>{l.title[lang]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Lesson content */}
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <div className="text-sm font-semibold mb-2" style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {activeLesson.title[lang]}
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: pal.inkSoft }}>{activeLesson.theory[lang]}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6 pt-1">
                      <FlashcardWidget key={`${c.id}-${lessonIdx}-f`} card={activeLesson.flashcard} lang={lang} t={t} pal={pal} onFlip={onFlashcard} />
                      <QuizWidget
                        key={`${c.id}-${lessonIdx}-q`}
                        quizzes={activeLesson.quizzes || [activeLesson.quiz]}
                        lang={lang} t={t} pal={pal}
                        alreadyDone={isLessonDone}
                        onCorrect={(firstTry) => onLessonComplete(c.id, lessonIdx, firstTry)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </LedgerPanel>
          );
        })}
      </div>
    </div>
  );
}

function TaskModal({ task, lang, t, pal, onClose, onComplete, done }) {
  if (!task) return null;
  const Icon = task.icon;
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-lg p-5"
        style={{ background: pal.panel, border: `1px solid ${pal.border}` }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: pal.bgAlt, color: pal.orange }}>
              <Icon size={17} />
            </div>
            <h2 className="text-base font-semibold leading-snug"
              style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{task.title[lang]}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ color: pal.muted }} className="flex-shrink-0 p-1">
            <X size={18} />
          </button>
        </div>

        <SectionEyebrow pal={pal}>{t.briefing}</SectionEyebrow>
        <p className="text-sm leading-relaxed mb-5 whitespace-pre-line" style={{ color: pal.inkSoft, fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8rem", lineHeight: 1.7 }}>{task.brief[lang]}</p>

        <div className="text-xs mb-4 px-3 py-2 rounded-md" style={{ background: pal.bgAlt, color: pal.muted, borderLeft: `2px solid ${pal.orange}` }}>
          {t.demo_note}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>+{task.xp} {t.xp}</span>
          <button onClick={onComplete} disabled={done}
            className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-40"
            style={{ background: done ? pal.green : pal.orange, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
            {done ? t.completed : t.mark_task_done}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyPage({ t, pal, lang, progress, level, careerIndex, onTaskComplete }) {
  const [openTask, setOpenTask] = useState(null);

  const statusOf = (task) => {
    if (progress.tasks[task.id] === "done") return "done";
    return level >= (TASK_MIN_LEVEL[task.id] || 1) ? "pending" : "locked";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{t.company_title}</h1>
        <p className="text-sm mt-1" style={{ color: pal.muted }}>{t.company_sub}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <LedgerPanel pal={pal} className="md:col-span-2">
          <SectionEyebrow pal={pal}>{t.daily_tasks}</SectionEyebrow>
          <div className="space-y-2">
            {COMPANY_TASKS.map((task) => {
              const Icon = task.icon;
              const status = statusOf(task);
              const locked = status === "locked";
              const done = status === "done";
              return (
                <div key={task.id} className="px-3 py-3 rounded-md" style={{ background: pal.bgAlt, opacity: locked ? 0.55 : 1 }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: pal.panel, color: done ? pal.green : pal.orange }}>
                      {locked ? <Lock size={14} /> : <Icon size={14} />}
                    </div>
                    <span className="text-sm leading-snug flex-1" style={{ color: pal.ink }}>{task.title[lang]}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-2.5 pl-11">
                    <span className="text-xs" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>+{task.xp} {t.xp}</span>
                    {done ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: pal.green }}>
                        <CheckCircle2 size={15} /> {t.completed}
                      </span>
                    ) : (
                      <button disabled={locked} onClick={() => setOpenTask(task)}
                        className="text-xs font-medium px-3 py-1.5 rounded"
                        style={{ background: locked ? "transparent" : pal.orange, color: locked ? pal.muted : "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {locked ? t.locked : t.task_start}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </LedgerPanel>
        <LedgerPanel pal={pal}>
          <SectionEyebrow pal={pal}>{t.career_ladder}</SectionEyebrow>
          <div className="relative pl-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: pal.border }} />
            <div className="space-y-4">
              {CAREER_LEVELS.slice().reverse().map((lvl, ri) => {
                const idx = CAREER_LEVELS.length - 1 - ri;
                const state = idx < careerIndex ? "done" : idx === careerIndex ? "current" : "locked";
                return (
                  <div key={lvl.key} className="relative flex items-start gap-3">
                    <div className="absolute -left-4 top-1 w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ background: state === "locked" ? pal.bg : (state === "current" ? pal.orange : pal.green), border: `2px solid ${pal.panel}` }} />
                    <div className="ml-2">
                      <div className="text-sm font-medium" style={{ color: state === "locked" ? pal.muted : pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {lvl[lang]} {state === "current" && <span style={{ color: pal.orange }}>·</span>}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: pal.muted }}>{lvl.req[lang]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </LedgerPanel>
      </div>

      <TaskModal
        task={openTask} lang={lang} t={t} pal={pal}
        done={openTask ? progress.tasks[openTask.id] === "done" : false}
        onClose={() => setOpenTask(null)}
        onComplete={() => { if (openTask) { onTaskComplete(openTask); setOpenTask(null); } }}
      />
    </div>
  );
}

function MissionsPage({ t, pal, lang, missions }) {
  const groups = [
    { key: "daily", label: t.daily, items: missions.daily },
    { key: "weekly", label: t.weekly, items: missions.weekly },
    { key: "monthly", label: t.monthly, items: missions.monthly },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{t.missions_title}</h1>
        <p className="text-sm mt-1" style={{ color: pal.muted }}>{t.missions_sub}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {groups.map((g) => (
          <LedgerPanel key={g.key} pal={pal}>
            <SectionEyebrow pal={pal}>{g.label}</SectionEyebrow>
            <div className="space-y-4">
              {g.items.map((m, i) => (
                <div key={i}>
                  <div className="text-sm mb-1" style={{ color: pal.ink }}>{m.title[lang]}</div>
                  <XPBar value={m.progress} max={m.total} pal={pal} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span>{m.progress}/{m.total}</span><span>+{m.xp} XP · +{m.coins} <Coins size={10} className="inline -mt-0.5" /></span>
                  </div>
                </div>
              ))}
            </div>
          </LedgerPanel>
        ))}
      </div>
    </div>
  );
}

function AccountPanel({ t, pal, account }) {
  const { user, syncState, login, register, logout, error, busy } = account;
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const ok = mode === "login" ? await login(username, password) : await register(username, password);
    if (ok) { setUsername(""); setPassword(""); }
  };

  if (user) {
    return (
      <LedgerPanel pal={pal}>
        <SectionEyebrow pal={pal}>{t.account}</SectionEyebrow>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium" style={{ color: pal.ink }}>{user}</div>
            <div className="text-xs mt-0.5" style={{ color: syncState === "error" ? pal.stampRed : pal.green }}>
              {syncState === "saving" ? t.sync_saving : syncState === "error" ? t.sync_error : t.sync_ok}
            </div>
          </div>
          <button onClick={logout} className="px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ border: `1.5px solid ${pal.border}`, color: pal.inkSoft, fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.logout}
          </button>
        </div>
      </LedgerPanel>
    );
  }

  return (
    <LedgerPanel pal={pal}>
      <SectionEyebrow pal={pal}>{t.account}</SectionEyebrow>
      <p className="text-sm leading-relaxed mb-4" style={{ color: pal.inkSoft }}>{t.account_note}</p>

      <div className="flex gap-2 mb-3">
        {[["login", t.login], ["register", t.register]].map(([key, label]) => (
          <button key={key} onClick={() => setMode(key)}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{ background: mode === key ? pal.orange : pal.bgAlt, color: mode === key ? "#fff" : pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <input value={username} onChange={(e) => setUsername(e.target.value)}
          placeholder={t.username} autoComplete="username"
          className="w-full px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: pal.bgAlt, border: `1.5px solid ${pal.border}`, color: pal.ink }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t.password} type="password" autoComplete="current-password"
          className="w-full px-3 py-2 rounded-md text-sm outline-none"
          style={{ background: pal.bgAlt, border: `1.5px solid ${pal.border}`, color: pal.ink }} />
      </div>

      {error && <div className="mt-2 text-xs" style={{ color: pal.stampRed }}>{error}</div>}

      <button onClick={submit} disabled={busy || !username || !password}
        className="mt-3 w-full px-4 py-2 rounded-md text-sm font-medium disabled:opacity-40"
        style={{ background: pal.ink, color: pal.panel, fontFamily: "'Space Grotesk', sans-serif" }}>
        {busy ? "…" : mode === "login" ? t.login : t.register}
      </button>
    </LedgerPanel>
  );
}

function CertificateModal({ cert, pal, lang, t, onClose, holderName }) {
  if (!cert) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 print:p-0" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="print:shadow-none"
        style={{
          background: "#FFFFFF", color: "#0D1B3E", width: "100%", maxWidth: 640,
          border: "3px double #AE1C28", borderRadius: 4, padding: "48px 40px", position: "relative",
        }}>
        <button onClick={onClose} className="print:hidden absolute top-3 right-3" style={{ color: "#6E7E9F" }}>
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="w-10 h-10 rounded overflow-hidden flex flex-col mx-auto mb-4">
            <div style={{ background: "#AE1C28", flex: 1 }} />
            <div style={{ background: "#FFFFFF", flex: 1, border: "1px solid #eee" }} />
            <div style={{ background: "#21468B", flex: 1 }} />
          </div>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "#AE1C28", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.18em" }}>
            Dutch Accounting Academy
          </div>
          <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.certificate_title}</h1>
          <div className="text-sm mb-1" style={{ color: "#6E7E9F" }}>{t.certificate_awarded_to}</div>
          <div className="text-xl font-semibold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{holderName}</div>
          <div className="text-sm mb-1" style={{ color: "#6E7E9F" }}>{t.certificate_for}</div>
          <div className="text-lg font-medium mb-8">{cert.title}</div>
          <div className="text-xs" style={{ color: "#6E7E9F" }}>
            {t.certificate_date}: {new Date().toLocaleDateString(lang === "pt" ? "pt-PT" : lang === "nl" ? "nl-NL" : "en-GB")}
          </div>
        </div>
        <button onClick={() => window.print()} className="print:hidden mt-8 w-full px-4 py-2 rounded-md text-sm font-medium"
          style={{ background: "#AE1C28", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
          {t.certificate_print}
        </button>
      </div>
    </div>
  );
}

function CertificatePanel({ t, pal, lang, progress, account }) {
  const [openCert, setOpenCert] = useState(null);
  const completedCourses = COURSES.filter((c) => moduleIsComplete(c, progress.lessons));
  const allComplete = completedCourses.length === COURSES.length;
  const holderName = account.user || t.certificate_guest;

  const certs = [
    ...COURSES.map((c) => ({
      key: c.id, title: c.title[lang], earned: moduleIsComplete(c, progress.lessons),
    })),
    { key: "final", title: t.certificate_final_title, earned: allComplete, isFinal: true },
  ];

  return (
    <LedgerPanel pal={pal}>
      <div className="flex items-baseline justify-between mb-3">
        <SectionEyebrow pal={pal}>{t.certificates}</SectionEyebrow>
        <span className="text-xs" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
          {certs.filter((c) => c.earned).length}/{certs.length}
        </span>
      </div>
      <div className="space-y-2">
        {certs.map((c) => (
          <div key={c.key} className="flex items-center justify-between px-3 py-2.5 rounded-md"
            style={{ background: c.isFinal ? pal.orangeSoft : pal.bgAlt, opacity: c.earned ? 1 : 0.5 }}>
            <div className="flex items-center gap-2 min-w-0">
              {c.earned ? <CheckCircle2 size={15} style={{ color: pal.green, flexShrink: 0 }} /> : <Lock size={14} style={{ color: pal.muted, flexShrink: 0 }} />}
              <span className="text-sm truncate" style={{ color: pal.ink, fontWeight: c.isFinal ? 600 : 400 }}>{c.title}</span>
            </div>
            {c.earned ? (
              <button onClick={() => setOpenCert(c)} className="text-xs font-medium px-2.5 py-1 rounded flex-shrink-0"
                style={{ background: pal.orange, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.view_certificate}
              </button>
            ) : (
              <span className="text-xs flex-shrink-0" style={{ color: pal.muted }}>{t.locked}</span>
            )}
          </div>
        ))}
      </div>
      <CertificateModal cert={openCert} pal={pal} lang={lang} t={t} holderName={holderName} onClose={() => setOpenCert(null)} />
    </LedgerPanel>
  );
}

function ProfilePage({ t, pal, lang, theme, setTheme, setLang, onReset, account, badges, progress }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{t.profile_title}</h1>
        <p className="text-sm mt-1" style={{ color: pal.muted }}>{t.profile_sub}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <LedgerPanel pal={pal}>
          <SectionEyebrow pal={pal}>{t.theme}</SectionEyebrow>
          <div className="flex gap-2">
            <button onClick={() => setTheme("light")} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm"
              style={{ background: theme === "light" ? pal.orange : pal.bgAlt, color: theme === "light" ? "#fff" : pal.ink }}>
              <Sun size={14} /> {t.light_mode}
            </button>
            <button onClick={() => setTheme("dark")} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm"
              style={{ background: theme === "dark" ? pal.orange : pal.bgAlt, color: theme === "dark" ? "#fff" : pal.ink }}>
              <Moon size={14} /> {t.dark_mode}
            </button>
          </div>
        </LedgerPanel>
        <LedgerPanel pal={pal}>
          <SectionEyebrow pal={pal}>{t.language}</SectionEyebrow>
          <div className="flex gap-2">
            {["pt", "en", "nl"].map((l) => (
              <button key={l} onClick={() => setLang(l)} className="flex-1 px-3 py-2 rounded-md text-sm uppercase font-medium"
                style={{ background: lang === l ? pal.orange : pal.bgAlt, color: lang === l ? "#fff" : pal.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
                {l}
              </button>
            ))}
          </div>
        </LedgerPanel>
      </div>
      <AccountPanel t={t} pal={pal} account={account} />

      <CertificatePanel t={t} pal={pal} lang={lang} progress={progress} account={account} />

      <LedgerPanel pal={pal}>
        <div className="flex items-baseline justify-between mb-3">
          <SectionEyebrow pal={pal}>{t.badges_earned}</SectionEyebrow>
          <span className="text-xs" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
            {badges.filter((b) => b.earned).length}/{badges.length}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5 py-2">
          {badges.map((b) => (
            <div key={b.key} className="flex flex-col items-center text-center gap-2">
              <Stamp label={b.label[lang]} earned={b.earned} pal={pal} />
              {!b.earned && (
                <span className="text-[11px] leading-tight" style={{ color: pal.muted }}>{b.hint[lang]}</span>
              )}
            </div>
          ))}
        </div>
      </LedgerPanel>

      <LedgerPanel pal={pal}>
        <SectionEyebrow pal={pal}>{t.progress_title}</SectionEyebrow>
        <p className="text-sm leading-relaxed mb-4" style={{ color: pal.inkSoft }}>{t.progress_note}</p>
        <button
          onClick={() => { if (window.confirm(t.reset_confirm)) onReset(); }}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ border: `1.5px solid ${pal.stampRed}`, color: pal.stampRed, background: "transparent", fontFamily: "'Space Grotesk', sans-serif" }}>
          {t.reset_progress}
        </button>
      </LedgerPanel>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [pendingTarget, setPendingTarget] = useState(null);
  const handleContinue = (courseId, lessonIdx) => {
    setPendingTarget({ courseId, lessonIdx });
    setTab("courses");
  };
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("pt");
  const [progress, setProgress] = useState(loadProgress);

  // ---- conta e sincronização com o servidor ----------------------------
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [syncState, setSyncState] = useState("idle"); // idle | saving | error
  const skipNextSync = useRef(true);

  // ao arrancar, se houver sessão guardada, puxa o progresso do servidor
  useEffect(() => {
    if (!getToken()) return;
    api.getProgress()
      .then((data) => {
        setUser(data.username);
        if (data.progress) {
          skipNextSync.current = true;
          setProgress((current) => {
            const merged = mergeProgress(current, { ...EMPTY_PROGRESS, ...data.progress });
            api.putProgress(merged).catch(() => {});
            return merged;
          });
        }
      })
      .catch(() => setToken(null));
  }, []);

  // guarda sempre localmente; e no servidor, se houver sessão (com atraso)
  useEffect(() => {
    persistProgress(progress);
    if (!user) return;
    if (skipNextSync.current) { skipNextSync.current = false; return; }

    setSyncState("saving");
    const timer = setTimeout(() => {
      api.putProgress(progress)
        .then(() => setSyncState("idle"))
        .catch(() => setSyncState("error"));
    }, 800);
    return () => clearTimeout(timer);
  }, [progress, user]);

  const authenticate = async (fn, username, password) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const { token, username: name } = await fn(username, password);
      setToken(token);
      setUser(name);
      const remote = await api.getProgress();
      // Junta sempre o que já tens neste aparelho com o que está na conta —
      // nunca deita fora progresso, quer seja uma conta nova quer já exista.
      const merged = remote.progress
        ? mergeProgress(progress, { ...EMPTY_PROGRESS, ...remote.progress })
        : progress;
      skipNextSync.current = true;
      setProgress(merged);
      await api.putProgress(merged);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    } finally {
      setAuthBusy(false);
    }
  };

  const account = {
    user, error: authError, busy: authBusy, syncState,
    login: (u, p) => authenticate(api.login, u, p),
    register: (u, p) => authenticate(api.register, u, p),
    logout: async () => {
      try { await api.logout(); } catch { /* ignorado */ }
      setToken(null);
      setUser(null);
      setSyncState("idle");
    },
  };

  const pal = PALETTE[theme];
  const t = STR[lang];

  const level = levelFromXP(progress.xp);
  const careerIndex = careerIndexFromLevel(level);

  const handleLessonComplete = (courseId, idx, firstTry) => {
    const key = `${courseId}-${idx}`;
    setProgress((prev) => {
      if (prev.lessons.includes(key)) {
        return firstTry ? { ...prev, perfect: prev.perfect } : prev;
      }
      return {
        ...prev,
        lessons: [...prev.lessons, key],
        xp: prev.xp + XP_PER_LESSON,
        coins: prev.coins + COINS_PER_LESSON,
        perfect: firstTry ? prev.perfect + 1 : prev.perfect,
      };
    });
  };

  const handleTaskComplete = (task) => {
    setProgress((prev) => {
      if (prev.tasks[task.id] === "done") return prev;
      return {
        ...prev,
        tasks: { ...prev.tasks, [task.id]: "done" },
        xp: prev.xp + task.xp,
        coins: prev.coins + Math.round(task.xp / 2),
      };
    });
  };

  const handleFlashcard = () => setProgress((prev) => ({ ...prev, flashcards: prev.flashcards + 1 }));

  const handleReset = () => {
    const fresh = { ...EMPTY_PROGRESS, streak: 1, lastActive: todayKey() };
    setProgress(fresh);
    persistProgress(fresh);
  };

  // --- carimbos: começam todos bloqueados e acendem com o progresso -------
  const badges = useMemo(() => {
    const moduleDone = (id) => {
      const c = COURSES.find((x) => x.id === id);
      return c ? moduleIsComplete(c, progress.lessons) : false;
    };
    const allDone = COURSES.every((c) => moduleIsComplete(c, progress.lessons));
    const tasksDoneCount = Object.values(progress.tasks).filter((v) => v === "done").length;
    const earnedMap = {
      firstlesson: progress.lessons.length >= 1,
      streak7: progress.streak >= 7,
      perfectquiz: progress.perfect > 0,
      btw: moduleDone("btw"),
      payroll: moduleDone("payroll"),
      firsttask: tasksDoneCount >= 1,
      monthclose: progress.tasks.t5 === "done",
      junior: careerIndex >= 1,
      allcourses: allDone,
      cfo: careerIndex >= CAREER_LEVELS.length - 1,
    };
    return BADGES.map((b) => ({ ...b, earned: !!earnedMap[b.key] }));
  }, [progress, careerIndex]);

  // --- métricas derivadas -------------------------------------------------
  const tasksDone = Object.values(progress.tasks).filter((v) => v === "done").length;
  const modulesDone = COURSES.filter((c) => moduleIsComplete(c, progress.lessons)).length;

  const missions = useMemo(() => ({
    daily: [
      { ...MISSIONS.daily[0], progress: Math.min(progress.flashcards, 15), total: 15 },
      { ...MISSIONS.daily[1], progress: Math.min(tasksDone, 1), total: 1 },
    ],
    weekly: [
      { ...MISSIONS.weekly[0], progress: Math.min(modulesDone, 1), total: 1 },
      { ...MISSIONS.weekly[1], progress: Math.min(progress.perfect, 1), total: 1 },
    ],
    monthly: [
      { ...MISSIONS.monthly[0], progress: Math.min(careerIndex, 1), total: 1 },
      { ...MISSIONS.monthly[1], progress: progress.tasks.t5 === "done" ? 1 : 0, total: 1 },
    ],
  }), [progress, tasksDone, modulesDone, careerIndex]);


  const NAV = [
    { key: "dashboard", label: t.nav_dashboard, icon: LayoutGrid },
    { key: "courses", label: t.nav_courses, icon: BookOpen },
    { key: "company", label: t.nav_company, icon: Building2 },
    { key: "missions", label: t.nav_missions, icon: Target },
    { key: "profile", label: t.nav_profile, icon: User },
  ];

  const Page = useMemo(() => {
    switch (tab) {
      case "courses": return <CoursesPage t={t} pal={pal} lang={lang} progress={progress} onLessonComplete={handleLessonComplete} onFlashcard={handleFlashcard} pendingTarget={pendingTarget} onConsumePending={() => setPendingTarget(null)} />;
      case "company": return <CompanyPage t={t} pal={pal} lang={lang} progress={progress} level={level} careerIndex={careerIndex} onTaskComplete={handleTaskComplete} />;
      case "missions": return <MissionsPage t={t} pal={pal} lang={lang} missions={missions} />;
      case "profile": return <ProfilePage t={t} pal={pal} lang={lang} theme={theme} setTheme={setTheme} setLang={setLang} onReset={handleReset} account={account} badges={badges} progress={progress} />;
      default: return <DashboardPage t={t} pal={pal} lang={lang} progress={progress} level={level} careerIndex={careerIndex} missions={missions} onContinue={handleContinue} />;
    }
  }, [tab, lang, theme, progress, level, careerIndex, missions, badges, user, authError, authBusy, syncState, pendingTarget]);

  return (
    <div className="overflow-x-hidden" style={{ background: pal.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: pal.ink }}>
      <style>{FONTS}</style>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sticky top-0 z-20" style={{ background: pal.bgAlt, borderBottom: `1px solid ${pal.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded overflow-hidden flex flex-col flex-shrink-0" aria-hidden>
            <div style={{ background: pal.orange, flex: 1 }} />
            <div style={{ background: theme === "light" ? "#FFFFFF" : "#DCE3F2", flex: 1 }} />
            <div style={{ background: pal.green, flex: 1 }} />
          </div>
          <span className="font-semibold text-sm hidden sm:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Dutch Accounting Academy</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: pal.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
            <Flame size={13} style={{ color: pal.orange }} /> {progress.streak}<span className="mx-1.5">·</span><Coins size={13} style={{ color: pal.gold }} /> {progress.coins}
          </div>
          <div className="flex gap-1">
            {["pt", "en", "nl"].map((l) => (
              <button key={l} onClick={() => setLang(l)} className="text-xs px-1.5 py-0.5 rounded uppercase font-medium"
                style={{ background: lang === l ? pal.orange : "transparent", color: lang === l ? "#fff" : pal.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{ color: pal.muted }}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* faixa tricolor */}
      <div className="flex h-1 sticky top-[57px] z-10" aria-hidden>
        <div style={{ background: pal.orange, flex: 1 }} />
        <div style={{ background: theme === "light" ? "#FFFFFF" : "#C9D4E8", flex: 1 }} />
        <div style={{ background: pal.green, flex: 1 }} />
      </div>
      <div className="flex">
        <div className="hidden md:flex flex-col gap-1 py-6 pl-3 pr-1" style={{ minWidth: 168 }}>
          {NAV.map((n) => {
            const active = tab === n.key;
            const Icon = n.icon;
            return (
              <button key={n.key} onClick={() => setTab(n.key)} className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-all"
                style={{
                  color: active ? pal.orange : pal.inkSoft, background: active ? pal.panel : "transparent",
                  borderTopLeftRadius: 6, borderBottomLeftRadius: 6,
                  borderTop: active ? `1px solid ${pal.border}` : "1px solid transparent",
                  borderBottom: active ? `1px solid ${pal.border}` : "1px solid transparent",
                  borderLeft: active ? `1px solid ${pal.border}` : "1px solid transparent",
                  marginRight: active ? -1 : 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500,
                }}>
                <Icon size={16} />{n.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 min-w-0 p-4 sm:p-6 pb-24 md:pb-6" style={{ background: pal.panel, borderTop: `1px solid ${pal.border}`, minHeight: "calc(100vh - 57px)" }}>
          <div className="max-w-5xl">{Page}</div>
        </div>
      </div>

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex"
        style={{ background: pal.bgAlt, borderTop: `1px solid ${pal.border}`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV.map((n) => {
          const active = tab === n.key;
          const Icon = n.icon;
          return (
            <button key={n.key} onClick={() => setTab(n.key)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
              style={{ color: active ? pal.orange : pal.muted }}
              aria-label={n.label}>
              <Icon size={19} />
              <span className="text-[10px] leading-none font-medium text-center px-0.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

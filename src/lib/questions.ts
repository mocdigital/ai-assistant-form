export type Question = {
  id: string;
  n: number;
  text: string;
  hint?: string;
  type: "short" | "paragraph" | "multi" | "single" | "rating";
  options?: string[];
  other?: boolean;
  followUp?: string;
};
export type Section = { title: string; questions: Question[] };

const responsibilities = [
  "Leadership/management", "Meetings", "Communication", "Administration", "Project oversight",
  "Business development", "Ministry responsibilities", "Staff/people management",
  "Financial responsibilities", "Public engagements", "Travel", "Content/media", "Research",
];

let n = 0;
const q = (text: string, type: Question["type"], extra: Partial<Question> = {}): Question => {
  n += 1;
  const num = n >= 6 ? n + 1 : n; // original numbering skips 6
  return { id: `q${num}`, n: num, text, type, ...extra };
};

export const sections: Section[] = [
  { title: "Executive Profile", questions: [
    q("What title or name should your Executive Assistant use when addressing you?", "short"),
    q("What is your primary role?", "short"),
    q("What organizations, businesses, projects, or ventures are you currently responsible for or significantly involved in?", "paragraph"),
    q("What are your main responsibilities?", "multi", { options: responsibilities, other: true }),
    q("Which areas currently require the most of your attention?", "multi", { options: responsibilities, other: true }),
  ]},
  { title: "Your Typical Work", questions: [
    q("What does a typical working day look like for you?", "paragraph"),
    q("Which activities consume more of your time than you would like?", "multi", { other: true, options: ["Email/messages","Meetings","Scheduling","Following up with people","Reviewing documents","Giving instructions","Monitoring projects","Administrative tasks","Research","Travel arrangements","Communication/content"] }),
    q("What activities do you believe deserve more of your personal attention?", "paragraph"),
    q("What activities would you most like your EA to take off your plate?", "multi", { other: true, options: ["Scheduling","Email management","Drafting messages","Follow-ups","Reminders","Meeting preparation","Meeting follow-up","Document organization","Research","Travel/admin","Task tracking","Information gathering"] }),
  ]},
  { title: "Communication Style", questions: [
    q("How do you generally prefer communication to be presented to you?", "single", { options: ["Very brief — just the key point","Brief with important context","Detailed","Very detailed","Depends on the situation"] }),
    q("When communicating with you about a problem, what should the EA normally provide?", "single", { options: ["Just tell me there is a problem","Explain the problem and what caused it","Explain the problem and suggest a solution","Give me several possible solutions","Give me options with pros and cons","Depends on the situation"] }),
    q("What communication channels do you prefer for urgent matters?", "multi", { other: true, options: ["Phone call","WhatsApp","SMS","Email","Calendar notification"] }),
    q("How would you describe your preferred writing style for messages sent on your behalf?", "single", { options: ["Formal and professional","Warm and professional","Direct and concise","Friendly and conversational","Diplomatic and polished","Depends on the recipient"] }),
    q("Are there different communication styles you prefer for different groups?", "paragraph", { hint: "e.g. staff, senior leaders, clients, ministers, partners, family, government officials" }),
  ]},
  { title: "Decisions & Approvals", questions: [
    q("When the EA brings something requiring your decision, what format do you prefer?", "single", { options: ["Give me the recommended action","Give me the options","Give me options + pros/cons","Give me all relevant information and let me decide","Depends on the situation"] }),
    q("What information is most important to you when making a decision?", "multi", { other: true, options: ["Cost","Benefits","Risks","Alternatives","Timeline","People involved","Supporting documents","Expert opinion","Previous examples","Potential consequences"] }),
    q("Which things may your EA do without asking you first?", "multi", { other: true, options: ["Schedule meetings","Reschedule routine meetings","Send routine communications","Draft communications","Set reminders","Conduct research","Prepare documents","Organize files","Follow up with people","Make routine bookings","None"] }),
    q("Which things should always require your approval before the EA acts?", "paragraph"),
    q("Are there financial limits within which the EA may act without asking you?", "single", { options: ["Yes","No","Depends on the expense"], followUp: "If yes, please specify the limits or categories." }),
  ]},
  { title: "Calendar & Meetings", questions: [
    q("How open should your calendar be?", "single", { options: ["Keep it as open as possible","Protect specific blocks of time","Keep most meetings within defined working hours","Very structured calendar","Depends on the day"] }),
    q("How long do you generally prefer meetings to be?", "single", { options: ["15 minutes","30 minutes","45 minutes","60 minutes","Depends on the meeting"] }),
    q("What should your EA consider before accepting or scheduling a meeting for you?", "multi", { other: true, options: ["Purpose","Participants","Importance","Urgency","Duration","Location","Existing commitments","Whether you actually need to attend","Whether the matter can be handled another way","Preparation required"] }),
    q("What would you like prepared before important meetings?", "multi", { options: ["Meeting purpose","Agenda","Participants","Background information","Previous correspondence","Previous meeting notes","Relevant documents","Key questions","Decisions that may be required","Briefing summary","Nothing unless requested","Depends on the meeting"] }),
    q("After a meeting, what should the EA do?", "multi", { options: ["Nothing unless I provide instructions","Prepare a summary if a transcript/record exists","Extract decisions and action items","Track action items","Prepare follow-up messages","Schedule follow-up meetings","Remind responsible people","All applicable items","Depends on the meeting"] }),
    q("If there is no transcript, recording, official minutes, or reliable meeting notes, what should the EA do?", "multi", { other: true, hint: "The EA should never invent meeting outcomes.", options: ["Ask me for a brief debrief","Ask participants for notes","Wait until I provide information","Do not prepare a meeting summary"] }),
  ]},
  { title: "Tasks & Follow-up", questions: [
    q("How would you like your EA to track tasks and commitments?", "multi", { options: ["Simple task list","Priority-based task list","Deadlines and reminders","Status tracking","Track who is responsible","Track pending responses","Full task/commitment management","Depends on the task"] }),
    q("How persistent should the EA be with follow-ups?", "single", { options: ["Gentle","Moderate","Persistent","Very persistent","Depends on the person/situation"] }),
    q("When should the EA remind you about something?", "multi", { options: ["Only when the deadline is close","Several days before","At a specific time I set","Repeatedly until completed","Based on importance/urgency","Depends on the task"] }),
    q("Should the EA follow up with other people on your behalf?", "single", { options: ["Yes, routinely","Yes, but only for specific types of matters","Only with my approval","No"], followUp: "If yes, what types of matters?" }),
  ]},
  { title: "Information & Documents", questions: [
    q("When reviewing a long document, what would you prefer?", "single", { options: ["Very short summary","Executive summary + key points","Summary + important details","Detailed analysis","Extract only what requires my attention","Depends on the document"] }),
    q("What should the EA specifically look for when reviewing documents?", "multi", { other: true, options: ["Important decisions","Deadlines","Financial implications","Risks","Errors/inconsistencies","Responsibilities","Missing information","Action items","Opportunities"] }),
    q("Where do you currently keep important information and documents?", "multi", { other: true, options: ["Gmail","Kingscloud","Google Drive","Google Docs","Google Sheets","Microsoft Outlook","OneDrive","SharePoint","WhatsApp","Local computer","Other cloud storage"] }),
  ]},
  { title: "Proactivity", questions: [
    q("How proactive do you want your EA to be?", "rating", { hint: "1 = Only do exactly what I ask · 5 = Anticipate needs and proactively help" }),
    q("What would you like your EA to proactively identify?", "multi", { other: true, options: ["Upcoming deadlines","Scheduling conflicts","Important unanswered messages","People who need follow-up","Overdue tasks","Important documents requiring attention","Meeting preparation needs","Travel requirements","Potential problems","Missing information","Opportunities requiring my attention"] }),
    q("If the EA notices a problem you haven't mentioned, what should it do?", "single", { options: ["Tell me immediately","Investigate first, then tell me","Suggest a solution","Handle it if within its authority","Only mention it if it becomes important","Depends on the problem"] }),
    q("How should the EA balance being proactive with not interrupting you?", "paragraph"),
  ]},
  { title: "Personal Working Preferences", questions: [
    q("When are you normally most productive?", "multi", { options: ["Early morning","Morning","Afternoon","Evening","Late night","It varies"] }),
    q("Are there specific periods when you should generally not be interrupted?", "paragraph"),
    q("Are there recurring commitments the EA should always know about?", "paragraph", { hint: "e.g. weekly meetings, church/ministry activities, family, exercise, study, travel" }),
    q("Are there people who should receive special priority when they contact you?", "paragraph"),
    q("Are there people, subjects, communications, or situations that require special handling?", "paragraph"),
  ]},
  { title: "The EA You Actually Want", questions: [
    q("What is the single biggest thing you want your AI Executive Assistant to do for you?", "paragraph"),
    q("What is the biggest pain-point with your current way of managing your work?", "paragraph"),
    q("If this EA were working perfectly three months from now, what would be noticeably different about your work life?", "paragraph"),
    q("What should your EA never do without your explicit permission?", "paragraph"),
    q("What would you most like your EA to be able to anticipate for you?", "paragraph"),
    q("Is there anything else about you, your work, your preferences, or the way you operate that your EA should understand?", "paragraph"),
  ]},
];

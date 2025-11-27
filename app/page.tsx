"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time?: string;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Lightweight keyword detectors.
 * These are intentionally simple and deterministic (no external libs),
 * so behaviour is predictable for your demo. You can replace with
 * an ML or embedding-based classifier later.
 */
const MOOD_KEYWORDS: Record<string, string[]> = {
  happy: ["happy", "upbeat", "good", "great", "joy", "excited"],
  nostalgic: ["nostalgic", "nostalgia", "memories", "remember"],
  relaxed: ["relax", "relaxed", "chill", "calm", "laid back", "lazy"],
  sad: ["sad", "down", "depressed", "blue", "tear"],
  stressed: ["stress", "stressed", "anxious", "overwhelmed"],
  energetic: ["energetic", "hyped", "hyper"],
};

const CONTEXT_KEYWORDS: Record<string, string[]> = {
  alone: ["alone", "solo", "by myself"],
  friends: ["friends", "group", "with friends", "mates", "squad"],
  family: ["family", "parents", "siblings"],
  partner: ["partner", "girlfriend", "boyfriend", "date", "partner"],
  study_break: ["study", "exam", "break", "study break"],
};

function detectMood(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const [mood, keys] of Object.entries(MOOD_KEYWORDS)) {
    if (keys.some((k) => normalized.includes(k))) return mood;
  }
  return null;
}

function detectContext(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const [ctx, keys] of Object.entries(CONTEXT_KEYWORDS)) {
    if (keys.some((k) => normalized.includes(k))) return ctx;
  }
  return null;
}

/** Very small demo recommender — returns 3 sample picks by mood */
function recommendByMoodContext(mood: string | null, context: string | null) {
  // Default fallback picks (titles + one-line emotional reason)
  const library: Record<string, Array<{ title: string; type: string; short: string }>> = {
    happy: [
      { title: "The Intern", type: "Movie", short: "Warm, easygoing, and charming — gentle laughs." },
      { title: "Brooklyn Nine-Nine", type: "Series", short: "Light, silly, perfect to relax with friends." },
      { title: "Pitch Perfect", type: "Movie", short: "Catchy music, big laughs — great group watch." },
    ],
    nostalgic: [
      { title: "The Princess Bride", type: "Movie", short: "Classic romantic-adventure that warms the heart." },
      { title: "Cinema Paradiso", type: "Movie", short: "Tender, nostalgic ode to movies and memory." },
      { title: "The Wonder Years", type: "Series", short: "Coming-of-age warmth and nostalgia." },
    ],
    relaxed: [
      { title: "Chef", type: "Movie", short: "Slow, comforting, food + travel vibes." },
      { title: "Parks and Recreation", type: "Series", short: "Wholesome comedy with gentle humour." },
      { title: "About Time", type: "Movie", short: "Warm, reflective, low-pressure romance." },
    ],
    sad: [
      { title: "Manchester by the Sea", type: "Movie", short: "Heavy but emotionally honest; catharsis." },
      { title: "The Pursuit of Happyness", type: "Movie", short: "Heartfelt resilience and hope." },
      { title: "This Is Us", type: "Series", short: "Emotional family drama with depth." },
    ],
    stressed: [
      { title: "Brooklyn Nine-Nine", type: "Series", short: "Light, fast, and reliably funny." },
      { title: "The Grand Budapest Hotel", type: "Movie", short: "Stylish, visually pleasing — distracting delight." },
      { title: "How I Met Your Mother", type: "Series", short: "Comfort sitcom with short episodes." },
    ],
    energetic: [
      { title: "Baby Driver", type: "Movie", short: "High-energy, music-driven thrill ride." },
      { title: "Money Heist", type: "Series", short: "Adrenaline-packed, binge-friendly." },
      { title: "Scott Pilgrim vs. The World", type: "Movie", short: "Fast-paced, visually playful, infectious energy." },
    ],
    default: [
      { title: "The Good Place", type: "Series", short: "Quirky, uplifting, and clever." },
      { title: "La La Land", type: "Movie", short: "Musical, emotional, and visually lovely." },
      { title: "Chef", type: "Movie", short: "Comforting and pleasant for many moods." },
    ],
  };

  const pickKey = mood && library[mood] ? mood : "default";
  // If context is "friends", prefer lighter picks (just reorder for demo)
  const picks = [...library[pickKey]];
  if (context === "friends") {
    // move comedic picks up if present (naive)
    picks.sort((a, b) => (a.type === "Series" && a.short.toLowerCase().includes("comedy") ? -1 : 0));
  }
  return picks.slice(0, 3);
}

/** --- Component --- */
export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Hello! I'm Bingio — tell me how you feel and who you're watching with, and I'll recommend a film or series for your vibe.",
      time: nowTime(),
    },
  ]);

  // session state for the current chat (persist only for this session)
  const [mood, setMood] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);

  const [value, setValue] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      // scroll to bottom smoothly after small delay
      setTimeout(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight + 600;
      }, 50);
    }
  }, [messages]);

  function pushMessage(role: Msg["role"], text: string) {
    const m: Msg = { id: crypto.randomUUID(), role, text, time: nowTime() };
    setMessages((s) => [...s, m]);
    return m;
  }

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    pushMessage("user", trimmed);
    setValue("");
    handleUserInput(trimmed);
  }

  async function handleUserInput(text: string) {
    // quick utility questions
    const normalized = text.toLowerCase();
    if (normalized.includes("who is your owner") || normalized.includes("owner")) {
      // direct factual reply
      pushMessage("assistant", "I was created by Granth & Nikita for the BINGIO project.");
      return;
    }
    if (normalized.includes("help") || normalized.includes("what can you do")) {
      pushMessage(
        "assistant",
        "I recommend movies and series based on your current mood and who you're watching with. Tell me how you're feeling and who's watching with you."
      );
      return;
    }

    // detect mood/context from the user's message
    const foundMood = detectMood(text);
    const foundContext = detectContext(text);

    // Avoid repeating: we update state only if something new is found
    let updated = false;
    if (foundMood && foundMood !== mood) {
      setMood(foundMood);
      updated = true;
      pushMessage("assistant", `Got it — mood set to "${foundMood}".`);
    } else if (foundMood && foundMood === mood) {
      // acknowledge briefly but don't echo
      pushMessage("assistant", `Thanks — still registering a "${foundMood}" vibe.`);
      updated = true;
    }

    if (foundContext && foundContext !== context) {
      setContext(foundContext);
      updated = true;
      pushMessage("assistant", `Noted — you're watching ${foundContext}.`);
    } else if (foundContext && foundContext === context) {
      pushMessage("assistant", `Understood — still marked as "${foundContext}".`);
      updated = true;
    }

    // If we didn't detect either, ask for clarification (but avoid repeating the same question)
    if (!foundMood && !foundContext) {
      // If we already have both, that means the user entered free text; give suggestions instead
      if (mood && context) {
        // produce recommendations
        const picks = recommendByMoodContext(mood, context);
        const replyLines = [
          `Perfect — based on feeling "${mood}" and watching "${context}", here are a few picks:`,
          "",
          ...picks.map((p, idx) => `${idx + 1}. ${p.title} (${p.type}) — ${p.short}`),
          "",
          "Want one that's shorter/longer, or more of a comedy/drama?"
        ];
        pushMessage("assistant", replyLines.join("\n"));
        return;
      }

      // If we only have mood or only context, ask for the missing piece
      if (mood && !context) {
        pushMessage("assistant", "Nice. Who are you watching with — friends, family, partner, or alone?");
        return;
      }
      if (!mood && context) {
        pushMessage("assistant", "Great. How are you feeling right now — upbeat, nostalgic, relaxed, sad, etc.?");
        return;
      }

      // If neither present yet, ask for both but phrased friendly and not repeated
      pushMessage(
        "assistant",
        "Could you tell me (1) how you're feeling right now (happy, nostalgic, stressed, relaxed, etc.) and (2) who you're watching with (alone, friends, family, partner)?"
      );
      return;
    }

    // If we updated only mood/context above, and now we have both -> give recommendations
    const currentMood = foundMood || mood;
    const currentContext = foundContext || context;
    if (currentMood && currentContext) {
      // small delay to feel natural
      setTimeout(() => {
        const picks = recommendByMoodContext(currentMood, currentContext);
        const replyLines = [
          `Nice — I have a few suggestions for ${currentMood} (watching with ${currentContext}):`,
          "",
          ...picks.map((p, idx) => `${idx + 1}. ${p.title} (${p.type}) — ${p.short}`),
          "",
          "Tell me if you want something lighter, darker, older, or shorter."
        ];
        pushMessage("assistant", replyLines.join("\n"));
      }, 350);
      return;
    }

    // Fallback (shouldn't often hit)
    if (!updated) {
      pushMessage("assistant", "Thanks — noted. Do you want a movie or a series right now?");
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-avatar" title="Bingio">🎞️</div>
            <div>
              <div className="header-title">Chat with Bingio</div>
              <div className="header-sub">Emotion-aware movie & series recommendations</div>
            </div>
          </div>

          <div>
            <button
              style={{
                borderRadius: 10,
                padding: "8px 12px",
                border: "1px solid rgba(255,255,255,0.04)",
                background: "transparent",
                color: "var(--muted)",
              }}
            >
              + New
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="chat-column">
          <div
            ref={listRef}
            className="message-wall"
            role="list"
            aria-label="Messages"
            style={{ minHeight: 280 }}
          >
            {messages.map((m) => (
              <div key={m.id} className={`message-row ${m.role === "assistant" ? "assistant" : "user"}`} role="listitem">
                {m.role === "assistant" && <div className="message-avatar">B</div>}
                <div className="bubble">
                  <div>{m.text}</div>
                  <div className="meta">{m.time}</div>
                </div>
                {m.role === "user" && <div className="message-avatar">Y</div>}
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="input-sticky" aria-hidden={false}>
        <form className="input-bar" onSubmit={(e) => handleSend(e)}>
          <input
            type="text"
            placeholder="Describe your mood, who you're watching with, or ask anything..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Type your message"
          />
          <button type="submit" className="send-btn" aria-label="Send">
            <span style={{ fontSize: 18 }}>🎬</span>
          </button>
        </form>
      </div>

      <div style={{ height: 8 }} />
      <div className="footer-note">© 2025 Granth & Nikita · Terms of Use · Powered by Ringel.AI</div>
      <div style={{ height: 28 }} />
    </div>
  );
}

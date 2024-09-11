import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config.js";

type CreateCompletionProps = {
  topic: string;
  hook: string | null;
  retention: string | null;
  callToAction: string | null;
};

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const systemPrompt = `
  Develop a short-form video script utilizing the HRC (Hook, Retention, Call to Action) framework with the following guidelines:
  Hook: Start with the engaging and attention-grabbing hook. This should be a compelling question, a surprising statement, or an intriguing fact that immediately captures the viewer's interest. Ensure the hook is impactful and no more than 15 words. “If you decide is presented in this part you will creatively decide a hook”
  Retention: Provide captivating and dynamic content to keep the audience engaged. Depending on the style chosen (Educational, Entertainment, or Factual), include an interesting fact or detail that builds on the hook. Use lively and engaging language to maintain viewer interest. This section should be between 25-35 words.  “If you decide is presented in this part you will creatively decide a retention style”
  Call to Action: End with a creative and compelling call to action. Your call to action should encourage viewers to engage further with a unique and context-specific prompt. Avoid clichés and make the call to action memorable and relevant to the script's content. This should be between 10-15 words.  “If you decide is presented in this part you will creatively decide a ending”
  Example, 
  Topic, “the roman empire”
  Hook, “You decide”
  Retention: entertainment
  Call to action  “You decide”
  Hook: “Did you know the ancient Romans had a secret weapon that's rarely talked about?” Retention: 
  “The Roman Empire used concrete that's stronger than what we use today! Their secret? Volcanic ash, which made structures like the Pantheon nearly indestructible for over 2,000 years. Crazy, right?”
  Call to Action: “Crazy, right? Imagine if we still used their formula today!” Or “Curious about more ancient wonders? Follow for more ” 
  Additional Instructions: 
  You are really creative and a pro in everything in the world, give different answers every time always give a different answer!
  The entire script must be no more than 55 words. 
  Ensure the hook is concise and attention-grabbing, and the call to action is inventive and encourages viewer interaction. 
  Provide a polished, engaging script that captures attention quickly and leaves a strong impact. 
  Output Only: Provide the final script adhering to the word limit and guidelines.
  REALLY IMPORTANT: 
  Ensure that the output is a continuous, uninterrupted text—presented as a complete script without any divisions into segments or sections 
  Do not include quotation marks at the beginning or at the end!
  This a prime example of how structure should look:
  Ever wonder what made medieval castles so nearly invincible? Their secret wasn't just thick walls but a special kind of mortar mixed with horsehair! This mix made the walls flexible and more resistant to cracks. Pretty cool, right? Hit follow to dive into more amazing historical secrets
`;

export async function create({ topic, hook, retention, callToAction }: CreateCompletionProps): Promise<string | null> {
  return "Here are 3 quick facts about the Roman Empire: They had fast-food joints called thermopoliums, used urine for whitening clothes, and gladiators often lived to fight another day. Fascinating, right? Follow for more! Join us for more content like this!";
  // const completion = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [
  //     {
  //       role: "system",
  //       content: systemPrompt,
  //     },
  //     {
  //       role: "user",
  //       content: `Topic: ${topic}, Hook: ${hook}, Retention: ${retention}, Call to action: ${callToAction}`,
  //     },
  //   ],
  // });

  // return completion.choices[0].message.content;
}

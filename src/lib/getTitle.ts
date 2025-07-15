import { openai } from "./openai";

const generateTitle = async (content: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a concise title generator." },
        {
          role: "user",
          content: `Create a short title (2-4 words) that best summarizes the following content:\n\n"""${content}"""`,
        },
      ],
      max_tokens: 8,
      temperature: 0.3,
    });

    const title = completion.choices[0].message.content?.trim();
    if (!title) throw new Error("Empty title returned");

    if (title.charAt(0) === '"' && title.charAt(title.length - 1) === '"') {
      return title.slice(1, -1);
    }

    return title;
  } catch (err) {
    console.error("Title generation error:", err);
    return "Untitled";
  }
};

export default generateTitle;

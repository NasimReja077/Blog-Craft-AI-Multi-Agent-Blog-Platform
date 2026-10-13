/**
 * Multi-Agent Blog Generation Pipeline
 * Powered by Groq + LangChain
 * Agents: Research -> Planner -> SEO -> Writer -> Editor
 *
 * Rate-limit safe: retries on 429 (Groq free tier = 8000 TPM),
 * caps output tokens, and trims context passed between agents.
 */

import 'dotenv/config'; 
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import Blog from '../models/Blog.js';

const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: modelName,
  temperature: 0.7,
  maxTokens: 3500,
  // gpt-oss models spend tokens "thinking"; low effort saves a lot of TPM
  modelKwargs: { reasoning_effort: 'low' },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep prompts small so we stay under the per-minute token limit
const trim = (text = '', max = 2500) =>
  text.length > max ? text.slice(0, max) + '\n...[trimmed]' : text;

async function callAgent(systemPrompt, userPrompt, retries = 6) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ]);
      return typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);
    } catch (err) {
      const msg = err.message || '';
      const isRateLimit =
        err.status === 429 ||
        msg.includes('429') ||
        msg.includes('rate_limit_exceeded');

      if (!isRateLimit || attempt === retries) throw err;

      // Groq says e.g. "Please try again in 19.665s"
      const match = msg.match(/try again in ([\d.]+)\s?(ms|s)/i);
      let waitMs = 20000;
      if (match) {
        waitMs = parseFloat(match[1]) * (match[2].toLowerCase() === 'ms' ? 1 : 1000);
      }
      waitMs += 2000; // safety buffer

      console.warn(
        `Rate limited by Groq. Retrying in ${Math.round(waitMs / 1000)}s (attempt ${attempt + 1}/${retries})`
      );
      await sleep(waitMs);
    }
  }
}

async function generateBlogWithAgents(blogId) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error('Blog not found');

  const { topic, audience, tone } = blog;

  try {
    // ========== 1. RESEARCH AGENT ==========
    await Blog.findByIdAndUpdate(blogId, { status: 'researching' });
    console.log(`[${blogId}] Research Agent (Groq) started...`);

    const researchBrief = await callAgent(
      `You are a Senior Research Specialist. Produce a concise structured research brief (max ~600 words) with key facts, trends, benefits, challenges, and real-world examples. Use markdown headings. If you are not sure about a fact, say so instead of inventing it.`,
      `Research the topic: "${topic}" for the audience: "${audience}". Provide a clear research brief.`
    );

    await findByIdAndUpdate(blogId, { researchBrief });

    // ========== 2. PLANNER AGENT ==========
    await findByIdAndUpdate(blogId, { status: 'planning' });
    console.log(`[${blogId}] Planner Agent started...`);

    const outline = await callAgent(
      `You are a Content Strategist & Planner. Create a compact blog outline with title options, introduction strategy, 5-6 H2 sections with 2-3 key points each, and a conclusion with CTA. Keep it under 500 words.`,
      `Topic: "${topic}"\nAudience: "${audience}"\nTone: "${tone}"\n\nResearch Brief:\n${trim(researchBrief, 3000)}\n\nCreate the outline.`
    );

    await findByIdAndUpdate(blogId, { outline });

    // ========== 3. SEO AGENT ==========
    console.log(`[${blogId}] SEO Agent started...`);

    const seoRaw = await callAgent(
      `You are an expert SEO Specialist. Return ONLY a valid pure JSON object (no markdown, no code fences) with these exact keys:
{
  "primaryKeyword": "string",
  "secondaryKeywords": ["string"],
  "titleOptions": ["title1", "title2", "title3"],
  "metaDescription": "string under 160 chars",
  "slug": "url-friendly-slug"
}`,
      `Topic: "${topic}"\nOutline summary:\n${trim(outline, 1200)}\n\nProvide SEO recommendations as pure JSON.`
    );

    let seoData = {};
    try {
      // Extract the first {...} block in case the model adds extra text
      const cleaned = seoRaw.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      seoData = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (e) {
      console.warn('SEO JSON parse failed, using fallback');
      seoData = {
        primaryKeyword: topic.toLowerCase().split(' ').slice(0, 4).join(' '),
        secondaryKeywords: [],
        titleOptions: [topic],
        metaDescription: `A comprehensive guide about ${topic}`.slice(0, 160),
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
      };
    }

    await findByIdAndUpdate(blogId, { seoData });

    // ========== 4. WRITER AGENT ==========
    await findByIdAndUpdate(blogId, { status: 'writing' });
    console.log(`[${blogId}] Writer Agent started...`);

    const seoCompact = {
      primaryKeyword: seoData.primaryKeyword,
      secondaryKeywords: seoData.secondaryKeywords,
      titleOptions: seoData.titleOptions,
    };

    const draft = await callAgent(
      `You are an Expert Content Writer. Write a complete, engaging, well-structured blog post in Markdown. Follow the outline closely, use the research insights, integrate SEO keywords naturally, and match the requested tone. Aim for 1200-1500 words. Use proper H2/H3 headings. Do not invent statistics or facts that are not in the research.`,
      `Topic: "${topic}"
Tone: "${tone}"
Audience: "${audience}"

Outline:
${trim(outline, 3000)}

Research:
${trim(researchBrief, 2500)}

SEO Keywords: ${JSON.stringify(seoCompact)}

Write the full blog post in clean Markdown.`
    );

    // ========== 5. EDITOR AGENT ==========
    await findByIdAndUpdate(blogId, { status: 'editing' });
    console.log(`[${blogId}] Editor Agent started...`);

    const finalContent = await callAgent(
      `You are a Senior Editor with excellent taste. Polish the draft for clarity, flow, grammar, tone consistency, and natural SEO. Return ONLY the final polished Markdown content. Do not add any commentary or notes.`,
      `Polish this complete blog post draft:\n\n${draft}`
    );

    // Extract title
    const title =
      seoData.titleOptions?.[0] ||
      finalContent.match(/^#\s+(.+)$/m)?.[1] ||
      topic;

    // ========== COMPLETE ==========
    await findByIdAndUpdate(blogId, {
      status: 'completed',
      content: finalContent,
      title,
    });

    console.log(`[${blogId}] Multi-Agent generation completed with Groq + LangChain!`);
  } catch (error) {
    console.error(`[${blogId}] Generation error:`, error.message);
    await findByIdAndUpdate(blogId, {
      status: 'failed',
      errorMessage: error.message,
    });
    throw error;
  }
}

export default { generateBlogWithAgents };
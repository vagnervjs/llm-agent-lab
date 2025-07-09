import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({ model: "gpt-4.1" });

const systemTemplate = "Translate the following from English into {language}.";

const promptTemplate1 = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", "{text}"],
]);

// All three methods work the same way
const promptValue = await promptTemplate1.invoke({
  language: "portuguese",
  text: "Hello!",
});

const response = await model.invoke(promptValue);
console.log(`${response.content}`);

// const stream = await model.stream(promptValue);

// const chunks = [];
// for await (const chunk of stream) {
//   chunks.push(chunk);
//   console.log(`${chunk.content}`);
// }
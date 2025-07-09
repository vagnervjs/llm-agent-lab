import { runMemoryAgent, runAiSupportAgent } from './agents';

async function main() {
    const query = 'Explain how Agent Parallelization works';
    const chunks = await runMemoryAgent(query);

    const completion = await runAiSupportAgent({
        chunks,
        query,
    });

    console.log(completion);
}

main();
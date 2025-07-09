import 'dotenv/config';
import { Langbase } from 'langbase';
import { readFile } from 'fs/promises';
import path from 'path';

const langbase = new Langbase({
    apiKey: process.env.LANGBASE_API_KEY!,
});

async function main() {
    const cwd = process.cwd();
    const memoryName = 'knowledge-base';

    // Upload agent architecture document
    const agentArchitecture = await readFile(path.join(cwd, 'docs', 'agent-architectures.txt'));
    const agentResult = await langbase.memories.documents.upload({
        memoryName,
        contentType: 'text/plain',
        documentName: 'agent-architectures.txt',
        document: agentArchitecture,
        meta: { category: 'Examples', topic: 'Agent architecture' },
    });

    console.log(agentResult.ok ? '✓ Agent doc uploaded' : '✗ Agent doc failed');

    // Upload FAQ document
    const langbaseFaq = await readFile(path.join(cwd, 'docs', 'langbase-faq.txt'));
    const faqResult = await langbase.memories.documents.upload({
        memoryName,
        contentType: 'text/plain',
        documentName: 'langbase-faq.txt',
        document: langbaseFaq,
        meta: { category: 'Support', topic: 'Langbase FAQs' },
    });

    console.log(faqResult.ok ? '✓ FAQ doc uploaded' : '✗ FAQ doc failed');
}

main();
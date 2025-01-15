import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!, // Usa la clave de API de tu archivo .env
});

export async function POST(req: Request) {
    try {
        const { question } = await req.json(); // Extraemos la pregunta del body de la solicitud

        if (!question) {
            return new Response(
                JSON.stringify({ error: 'Question is required' }),
                { status: 400 }
            );
        }

        // Llamada a OpenAI para obtener la respuesta
        const openAIResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: question }],
        });

        const answer = openAIResponse.choices[0].message.content || ''; // Asegúrate de que siempre sea un string

        // Guardar la pregunta y la respuesta en la base de datos
        const query = await prisma.query.create({
            data: {
                question,
                answer,
                createdAt: new Date(),
            },
        });

        return new Response(
            JSON.stringify({ query }),
            { status: 200 }
        );
    } catch (error) {
        // Puedes loguear el error si lo necesitas, pero no es necesario retornarlo si no lo usas
        console.error(error);
        return new Response(
            JSON.stringify({ error: 'Error processing the request' }),
            { status: 500 }
        );
    }
}

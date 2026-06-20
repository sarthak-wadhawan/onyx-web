import { NextRequest, NextResponse } from 'next/server';
import { createEngine } from '@/lib/engine';
import { z } from 'zod';

const moveRequestSchema = z.object({
  fen: z.string().min(1),
  depth: z.number().int().positive().optional().default(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = moveRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { fen, depth } = result.data;

    const engine = createEngine();
    const engineResult = await engine.getMove(fen, { depth });

    return NextResponse.json({
      success: true,
      move: engineResult.move,
      score: engineResult.score,
      nodes: engineResult.nodes,
      time: engineResult.time,
    });
  } catch (error) {
    console.error('Engine error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Engine error' },
      { status: 500 }
    );
  }
}
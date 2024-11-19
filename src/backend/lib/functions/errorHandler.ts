import { NextResponse } from 'next/server';
import { z } from 'zod';

export function handleApiError(err: unknown) {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('handleApiError err:', err);
  }

  if (err instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: 'Validation failed, correct the form and please try again.',
        err: err.errors,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      message: 'Internal server error, sth is wrong.',
    },
    { status: 500 }
  );
}

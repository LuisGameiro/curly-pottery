import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@lib/auth/authOptions'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions)

        if (!session) {
          throw new Error(
            'Unauthenticated: You must be logged in to upload images.',
          )
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        }
      },
      // onUploadCompleted: async ({ blob, tokenPayload }) => {
      //   // Called by Vercel API on client upload completion
      //   // Use tools like ngrok if you want this to work locally

      //   try {
      //     // Run any logic after the file upload completed
      //     // const { userId } = JSON.parse(tokenPayload);
      //     // await db.update({ avatar: blob.url, userId });
      //   } catch {
      //     throw new Error('Could not update user')
      //   }
      // },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    )
  }
}

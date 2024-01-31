export async function POST(request) {
    console.log(request)
    return new Response('Hello, Next.js!', {
        status: 200,
        // headers: { 'Set-Cookie': `token=${token.value}` },
    })
}
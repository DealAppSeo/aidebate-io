import { NextResponse } from 'next/server'

const RAILWAY_API_TOKEN = process.env.RAILWAY_API_TOKEN

export async function POST(request: Request) {
    const { agentId } = await request.json()

    // Map agent to Railway service ID
    const serviceIds: Record<string, string | undefined> = {
        HDM: process.env.RAILWAY_HDM_SERVICE_ID,
        APM: process.env.RAILWAY_APM_SERVICE_ID,
        // ... other agents
    }

    const serviceId = serviceIds[agentId]
    if (!serviceId) {
        // If no service ID mapped (e.g. env vars missing), return error for now
        return NextResponse.json({ error: 'Unknown agent or missing service ID' }, { status: 400 })
    }

    // Call Railway restart API
    const response = await fetch('https://backboard.railway.app/graphql/v2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RAILWAY_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: `
        mutation {
          serviceInstanceRedeploy(serviceId: "${serviceId}")
        }
      `
        })
    })

    if (!response.ok) {
        return NextResponse.json({ error: 'Restart failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
